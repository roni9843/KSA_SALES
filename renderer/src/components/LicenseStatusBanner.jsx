import React, { useEffect, useState } from 'react';
import { FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';

const LicenseStatusBanner = () => {
    const [licenseInfo, setLicenseInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [remainingDays, setRemainingDays] = useState(null);

    useEffect(() => {
        const fetchLicenseInfo = async () => {
            try {
                const res = await window.electron.ipcRenderer.invoke('get-license-info');
                if (res.success) {
                    setLicenseInfo(res.data);
                    if (res.data.trial_start_date) {
                        const start = new Date(res.data.trial_start_date);
                        const now = new Date();
                        const diffTime = Math.abs(now - start);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        setRemainingDays(10 - diffDays); // Assuming 10-day trial
                    }
                }
            } catch (error) {
                console.error('Error fetching license info for banner:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLicenseInfo();

        // Set up a periodic check (e.g., every hour)
        const interval = setInterval(fetchLicenseInfo, 3600000); // 1 hour
        return () => clearInterval(interval);
    }, []);

    if (loading || !licenseInfo) {
        return null; // Don't render anything while loading or if no info
    }

    const isTrial = licenseInfo.license_status === 'unlicensed' && licenseInfo.trial_start_date;
    const isActive = licenseInfo.license_status === 'active';
    const isExpired = licenseInfo.license_status === 'expired' || (isTrial && remainingDays <= 0);

    let bannerMessage = null;
    let bannerStyle = {};

    if (isExpired) {
        bannerMessage = "Your license has expired. Please activate a new license.";
        bannerStyle = { backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' };
    } else if (isTrial && remainingDays <= 3 && remainingDays > 0) {
        bannerMessage = `Your free trial ends in ${remainingDays} day(s).`;
        bannerStyle = { backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffeeba' };
    } else if (isTrial && remainingDays > 3) {
        bannerMessage = `You have ${remainingDays} day(s) remaining in your free trial.`;
        bannerStyle = { backgroundColor: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' };
    } else if (isActive && licenseInfo.subscription_end_date) {
        const endDate = new Date(licenseInfo.subscription_end_date);
        const now = new Date();
        const diffTime = Math.abs(endDate - now);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 7) {
            bannerMessage = `Your subscription expires in ${diffDays} day(s). Please renew.`;
            bannerStyle = { backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffeeba' };
        } else {
            // No message for active and far-off expiry
            return null;
        }
    }

    if (!bannerMessage) {
        return null;
    }

    return (
        <div style={{ ...bannerBaseStyle, ...bannerStyle }}>
            {isExpired ? <FaExclamationTriangle style={{ marginRight: '8px' }} /> : <FaInfoCircle style={{ marginRight: '8px' }} />}
            {bannerMessage}
            {/* Optionally add a link to the licensing page */}
            <a href="#/licensing" style={{ marginLeft: '15px', color: bannerStyle.color, textDecoration: 'underline' }}>More Info</a>
        </div>
    );
};

const bannerBaseStyle = {
    padding: '10px 20px',
    marginBottom: '15px',
    borderRadius: '5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9em',
    fontWeight: 'bold',
    textAlign: 'center',
};

export default LicenseStatusBanner;
