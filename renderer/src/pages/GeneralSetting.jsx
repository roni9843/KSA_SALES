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
                if (fetchedSettings) {
                    setSettings(fetchedSettings);
                    if (fetchedSettings.shop_logo) {
                        setLogoPreview(fetchedSettings.shop_logo);
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
            <h2><FaCog /> General Settings</h2>
            <form onSubmit={handleSubmit} style={formStyle}>
                <fieldset style={fieldsetStyle}>
                    <legend style={legendStyle}>Shop & Language Settings</legend>
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
                                <option value="ltr">Left to Right</option>
                                <option value="rtl">Right to Left</option>
                            </select>
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Color Scheme</label>
                            <select name="color_scheme" value={settings.color_scheme} onChange={handleChange} style={inputStyle}>
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
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
                            <label style={labelStyle}>Shop Logo</label>
                            <input type="file" name="shop_logo_file" onChange={handleLogoChange} style={inputStyle} accept="image/*" />
                        </div>
                        {logoPreview && (
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Logo Preview</label>
                                <img src={logoPreview} alt="Shop Logo Preview" style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '5px', objectFit: 'contain' }} />
                            </div>
                        )}
                    </div>
                </fieldset>

                <button
                    type="submit"
                    className="default-button"
                >
                    Save Settings
                </button>
            </form>
        </div>
    );
};

const cardStyle = {
    background: '#2D3748',
    padding: '20px',
    borderRadius: '4px',
    color: '#fff',
};

const formStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '10px',
};

const fieldsetStyle = {
    border: '1px solid #4A5568',
    borderRadius: '8px',
    padding: '20px',
    margin: '0',
};

const legendStyle = {
    padding: '0 10px',
    color: '#E2E8F0',
    fontWeight: 'bold',
    fontSize: '18px',
    marginLeft: '10px',
};

const detailsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
};

const inputGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
};

const labelStyle = {
    marginBottom: '8px',
    fontSize: '14px',
    color: '#A0AEC0',
};

const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '5px',
    border: '1px solid #A0AEC0',
    backgroundColor: '#fff',
    color: '#333',
    fontSize: '14px',
    boxSizing: 'border-box',
};


export default GeneralSetting;