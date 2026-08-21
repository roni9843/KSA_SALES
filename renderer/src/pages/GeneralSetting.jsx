import { useState, useEffect } from 'react';
import { FaCog } from 'react-icons/fa';
import toast from 'react-hot-toast';

const GeneralSetting = () => {
    const [settings, setSettings] = useState({
        language: 'en',
        writing_direction: 'ltr',
        color_scheme: 'light',
        shop_name: '',
        shop_address: '',
        shop_phone: '',
        shop_email: '',
        shop_logo: ''
    });
    const [logoPreview, setLogoPreview] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const fetchedSettings = await window.electron.ipcRenderer.invoke('get-settings');
                const localConnected = localStorage.getItem('zatca_connected') === 'true';
                const localOtp = localStorage.getItem('zatca_otp') || '';
                const localEnv = localStorage.getItem('zatca_environment') || 'sandbox';

                if (fetchedSettings || localConnected) {
                    const isZatcaActive = Boolean(
                        fetchedSettings?.zatcaConnected ||
                        fetchedSettings?.zatca_connected ||
                        fetchedSettings?.zatcaBinaryToken ||
                        fetchedSettings?.zatca_binary_token ||
                        localConnected
                    );
                    setSettings({
                        ...(fetchedSettings || {}),
                        shop_name: fetchedSettings?.shopName || fetchedSettings?.shop_name || '',
                        shop_address: fetchedSettings?.shopAddress || fetchedSettings?.shop_address || '',
                        shop_phone: fetchedSettings?.shopPhone || fetchedSettings?.shop_phone || '',
                        shop_email: fetchedSettings?.shopEmail || fetchedSettings?.shop_email || '',
                        shop_logo: fetchedSettings?.shopLogo || fetchedSettings?.shop_logo || '',
                        tax_number: fetchedSettings?.taxNumber || fetchedSettings?.tax_number || '310123456700003',
                        zatca_environment: fetchedSettings?.zatcaEnvironment || fetchedSettings?.zatca_environment || localEnv,
                        zatca_otp: fetchedSettings?.zatcaOtp || fetchedSettings?.zatca_otp || localOtp,
                        zatcaConnected: isZatcaActive,
                        zatca_connected: isZatcaActive
                    });
                    if (fetchedSettings?.shop_logo || fetchedSettings?.shopLogo) {
                        setLogoPreview(fetchedSettings.shop_logo || fetchedSettings.shopLogo);
                    }
                }
            } catch (error) {
                toast.error('Failed to fetch settings.');
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prevSettings => ({
            ...prevSettings,
            [name]: value
        }));
    };

    const handleLogoChange = async (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const dataUrl = event.target.result;
                setLogoPreview(dataUrl);
                setSettings(prev => ({ ...prev, shop_logo: dataUrl }));
                toast.success('Logo selected. Click "Save Settings" to apply.');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await window.electron.ipcRenderer.invoke('update-settings', settings);
            toast.success('Settings updated successfully!');
        } catch (error) {
            toast.error('Failed to update settings.');
        }
    };

    return (
        <div style={cardStyle}>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 mb-4 border-b border-slate-200 pb-3">
                <FaCog className="text-blue-600" /> General Store Settings
            </h2>
            <form onSubmit={handleSubmit} style={formStyle}>
                <fieldset style={fieldsetStyle}>
                    <legend style={legendStyle}>Shop & Language Preferences</legend>
                    <div style={detailsGridStyle}>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Language</label>
                            <select name="language" value={settings.language} onChange={handleChange} style={inputStyle}>
                                <option value="en">English</option>
                                <option value="bn">Bengali</option>
                                <option value="ar">Arabic</option>
                            </select>
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Writing Direction</label>
                            <select name="writing_direction" value={settings.writing_direction} onChange={handleChange} style={inputStyle}>
                                <option value="ltr">Left to Right (LTR)</option>
                                <option value="rtl">Right to Left (RTL)</option>
                            </select>
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Color Theme Preference</label>
                            <select name="color_scheme" value={settings.color_scheme} onChange={handleChange} style={inputStyle}>
                                <option value="light">Light Theme (White Mode)</option>
                                <option value="dark">Dark Theme</option>
                            </select>
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Shop Name</label>
                            <input type="text" name="shop_name" placeholder="Enter shop name" value={settings.shop_name} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Shop Address</label>
                            <input type="text" name="shop_address" placeholder="Enter shop address" value={settings.shop_address} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Shop Phone</label>
                            <input type="text" name="shop_phone" placeholder="Enter shop phone" value={settings.shop_phone} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Shop Email</label>
                            <input type="email" name="shop_email" placeholder="Enter shop email" value={settings.shop_email} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>VAT Registration No. (الرقم الضريبي 15-Digit)</label>
                            <input type="text" name="tax_number" placeholder="e.g. 310123456700003" value={settings.tax_number || ''} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Shop Logo Upload</label>
                            <input type="file" name="shop_logo_file" onChange={handleLogoChange} style={inputStyle} accept="image/*" />
                        </div>
                        {logoPreview && (
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Logo Preview</label>
                                <img src={logoPreview} alt="Shop Logo Preview" style={{ maxWidth: '160px', maxHeight: '160px', borderRadius: '12px', objectFit: 'contain', border: '1px solid #cbd5e1', padding: '8px' }} />
                            </div>
                        )}
                    </div>
                </fieldset>

                {/* ZATCA Phase 2 Saudi Government Server Integration Section */}
                <fieldset style={{ ...fieldsetStyle, borderColor: '#3b82f6', backgroundColor: '#eff6ff' }}>
                    <legend style={{ ...legendStyle, color: '#1d4ed8' }}>🇸🇦 Saudi ZATCA Government Live Integration (Phase 2)</legend>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ display: 'flex', itemsCenter: 'center', justifyContent: 'space-between', borderBottom: '1px solid #bfdbfe', paddingBottom: '10px' }}>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#1e3a8a' }}>ZATCA Fatoora Portal Connection</h4>
                                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#3b82f6' }}>Connect merchant device directly to Saudi Arabia ZATCA server for real-time invoice reporting.</p>
                            </div>
                            <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '900', border: '1px solid', backgroundColor: (settings.zatcaConnected || settings.zatca_connected) ? '#dcfce7' : '#fef3c7', color: (settings.zatcaConnected || settings.zatca_connected) ? '#15803d' : '#b45309', borderColor: (settings.zatcaConnected || settings.zatca_connected) ? '#86efac' : '#fde68a' }}>
                                {(settings.zatcaConnected || settings.zatca_connected) ? '🟢 CONNECTED TO SAUDI ZATCA' : '🟡 NOT CONNECTED'}
                            </span>
                        </div>

                        <div style={detailsGridStyle}>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Environment (البيئة)</label>
                                <select name="zatca_environment" value={settings.zatca_environment || 'sandbox'} onChange={handleChange} style={inputStyle}>
                                    <option value="sandbox">Developer Sandbox (تجريبي)</option>
                                    <option value="production">Live Production Server (حقيقي)</option>
                                </select>
                            </div>

                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>ZATCA Fatoora OTP Key (رمز التحقق 6-Digit)</label>
                                <input
                                    type="text"
                                    name="zatca_otp"
                                    placeholder="Enter 6-digit OTP from ZATCA Portal"
                                    value={settings.zatca_otp || ''}
                                    onChange={handleChange}
                                    style={{ ...inputStyle, fontWeight: 'bold', color: '#1d4ed8' }}
                                />
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={async () => {
                                if (!settings.zatca_otp) {
                                    toast.error('Please enter ZATCA Portal OTP.');
                                    return;
                                }
                                try {
                                    const res = await window.electron.ipcRenderer.invoke('connect-zatca-portal', {
                                        otp: settings.zatca_otp,
                                        environment: settings.zatca_environment || 'sandbox'
                                    });
                                    if (res?.success) {
                                        toast.success('Registered & Connected with Saudi ZATCA Server!');
                                        localStorage.setItem('zatca_connected', 'true');
                                        localStorage.setItem('zatca_otp', settings.zatca_otp || '');
                                        localStorage.setItem('zatca_environment', settings.zatca_environment || 'sandbox');
                                        setSettings(prev => ({
                                            ...prev,
                                            ...(res.settings || {}),
                                            zatcaConnected: true,
                                            zatca_connected: true
                                        }));
                                    }
                                } catch (err) {
                                    console.error('Error connecting to ZATCA:', err);
                                    toast.error('Failed to connect to ZATCA server.');
                                }
                            }}
                            style={{ padding: '10px 18px', backgroundColor: '#1d4ed8', color: '#ffffff', fontWeight: 'bold', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '13px', alignSelf: 'flex-start', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                        >
                            🔑 Connect & Register Device with Saudi ZATCA Server
                        </button>
                    </div>
                </fieldset>

                <button
                    type="submit"
                    className="w-full mt-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md transition-all"
                >
                    Save Store Settings
                </button>
            </form>
        </div>
    );
};

const cardStyle = {
    background: '#ffffff',
    padding: '24px',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    color: '#0f172a',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
};

const formStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '12px',
};

const fieldsetStyle = {
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
    margin: '0',
    backgroundColor: '#f8fafc',
};

const legendStyle = {
    padding: '0 10px',
    color: '#0f172a',
    fontWeight: '800',
    fontSize: '15px',
    marginLeft: '10px',
};

const detailsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px',
};

const inputGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
};

const labelStyle = {
    marginBottom: '6px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569',
};

const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
};

export default GeneralSetting;