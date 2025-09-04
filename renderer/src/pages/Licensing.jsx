import React, { useEffect, useState } from 'react';
import { FaKey, FaCalendarAlt, FaInfoCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Licensing = () => {
    const [licenseInfo, setLicenseInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [remainingDays, setRemainingDays] = useState(null);
    const [licenseKey, setLicenseKey] = useState('');

    const fetchLicenseInfo = async () => {
        try {
            setLoading(true);
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
            } else {
                toast.error(res.message || 'Failed to fetch license info.');
            }
        } catch (error) {
            console.error('Error fetching license info:', error);
            toast.error('An error occurred while fetching license info.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLicenseInfo();
    }, []);

    const handleActivate = async () => {
        if (!licenseKey.trim()) {
            return toast.error('Please enter a license key.');
        }

        const loadingToast = toast.loading('Validating license key with server...');
        const validationUrl = 'https://araflogix.com/motopos_backend/api/license/validate.php';

        try {
            // Step 1: Validate with the remote server
            const response = await fetch(validationUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ licenseKey: licenseKey.trim() }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                toast.dismiss(loadingToast);
                return toast.error(result.message || 'Invalid license key.');
            }

            toast.dismiss(loadingToast);
            toast.loading('Saving license to device...');

            // Step 2: If server validation is successful, activate it locally
            const { status, subscriptionEndDate } = result.data;

            const localRes = await window.electron.ipcRenderer.invoke('activate-license', {
                licenseKey: licenseKey.trim(),
                subscriptionEndDate: subscriptionEndDate,
            });

            toast.dismiss(loadingToast);

            if (localRes.success && localRes.changes > 0) {
                toast.success('License activated successfully! Application will now restart.');
                setTimeout(() => window.location.reload(), 2000);
            } else {
                toast.error(localRes.message || 'Failed to save license locally.');
            }

        } catch (error) {
            toast.dismiss(loadingToast);
            console.error('Error during activation:', error);
            toast.error('Could not connect to the activation server. Please check your internet connection.');
        }
    };

    if (loading) {
        return <div style={cardStyle}>Loading license information...</div>;
    }

    if (!licenseInfo) {
        return <div style={cardStyle}>No license information available.</div>;
    }

    const isTrial = licenseInfo.license_status === 'unlicensed' && licenseInfo.trial_start_date;
    const isActive = licenseInfo.license_status === 'active';
    const isExpired = licenseInfo.license_status === 'expired' || (isTrial && remainingDays <= 0);

    return (
        <div style={cardStyle}>
            <h2><FaKey /> Licensing Information</h2>

            <div style={infoSectionStyle}>
                <p><strong>Status:</strong> 
                    <span style={{ color: isActive ? 'green' : (isExpired ? 'red' : 'orange'), fontWeight: 'bold' }}>
                        {isActive ? 'Active' : (isExpired ? 'Expired' : (isTrial ? 'Trial' : 'Unknown'))}
                    </span>
                </p>
                {isTrial && licenseInfo.trial_start_date && (
                    <p><FaCalendarAlt style={iconStyle} /> <strong>Trial Started:</strong> {new Date(licenseInfo.trial_start_date).toLocaleDateString()}</p>
                )}
                {isTrial && remainingDays !== null && (
                    <p><FaInfoCircle style={iconStyle} /> <strong>Remaining Trial Days:</strong> 
                        <span style={{ color: remainingDays <= 3 && remainingDays > 0 ? 'orange' : (remainingDays <= 0 ? 'red' : 'green'), fontWeight: 'bold' }}>
                            {remainingDays > 0 ? remainingDays : 'Trial Ended'}
                        </span>
                    </p>
                )}
                {isActive && licenseInfo.subscription_end_date && (
                    <p><FaCalendarAlt style={iconStyle} /> <strong>Subscription Ends:</strong> {new Date(licenseInfo.subscription_end_date).toLocaleDateString()}</p>
                )}
                {isActive && licenseInfo.license_key && (
                    <p><FaKey style={iconStyle} /> <strong>License Key:</strong> {licenseInfo.license_key}</p>
                )}
            </div>

            {!isActive && (
                <div style={actionSectionStyle}>
                    <h3>Activate Your License</h3>
                    <p>Enter your license key below to activate your full subscription.</p>
                    <input 
                        type="text" 
                        placeholder="Enter License Key" 
                        style={inputStyle} 
                        value={licenseKey}
                        onChange={(e) => setLicenseKey(e.target.value)}
                    />
                    <button style={buttonStyle} onClick={handleActivate}>Activate License</button>
                </div>
            )}

            {isExpired && (
                <div style={expiredMessageStyle}>
                    <p>Your license has expired. Please activate a new license to continue using the application.</p>
                </div>
            )}
        </div>
    );
};

const cardStyle = {
    background: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    color: '#333',
};

const infoSectionStyle = {
    marginBottom: '20px',
    padding: '15px',
    border: '1px solid #eee',
    borderRadius: '5px',
    backgroundColor: '#f9f9f9',
};

const iconStyle = {
    marginRight: '8px',
    color: '#3498db',
};

const actionSectionStyle = {
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '1px solid #eee',
};

const inputStyle = {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '14px',
    boxSizing: 'border-box',
};

const buttonStyle = {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '10px',
};

const expiredMessageStyle = {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#ffe0e0',
    color: '#cc0000',
    border: '1px solid #ffb3b3',
    borderRadius: '5px',
    fontWeight: 'bold',
};

export default Licensing;
