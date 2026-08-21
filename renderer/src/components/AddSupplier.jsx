import { useState } from 'react';
import Switch from './common/Switch';
import { FaTruck } from 'react-icons/fa';

const AddSupplier = ({ onAdded }) => {
    const [form, setForm] = useState({
        name: '',
        code: '',
        phone: '',
        email: '',
        address: '',
        zip_code: '',
        city: '',
        country: '',
        tax_number: '',
        status: 1
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await window.electron.ipcRenderer.invoke('add-supplier', form);
        if (onAdded) onAdded();
        setForm({
            name: '',
            code: '',
            phone: '',
            email: '',
            address: '',
            zip_code: '',
            city: '',
            country: '',
            tax_number: '',
            status: 1
        });
    };

    return (
        <div style={cardStyle}>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 mb-4 border-b border-slate-200 pb-3">
                <FaTruck className="text-blue-600" /> Add New Supplier
            </h2>
            <form onSubmit={handleSubmit} style={formStyle}>
                <fieldset style={fieldsetStyle}>
                    <legend style={legendStyle}>Supplier Details</legend>
                    <div style={detailsGridStyle}>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Name <span style={{ color: 'red' }}>*</span></label>
                            <input name="name" placeholder="Enter supplier name" value={form.name} onChange={handleChange} required style={inputStyle} />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Code</label>
                            <input name="code" placeholder="Enter supplier code" value={form.code} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Phone <span style={{ color: 'red' }}>*</span></label>
                            <input name="phone" placeholder="Enter phone number" value={form.phone} onChange={handleChange} required style={inputStyle} />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Email</label>
                            <input type="email" name="email" placeholder="Enter email" value={form.email} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Address</label>
                            <input name="address" placeholder="Enter address" value={form.address} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Zip Code</label>
                            <input name="zip_code" placeholder="Enter zip code" value={form.zip_code} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>City</label>
                            <input name="city" placeholder="Enter city" value={form.city} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Country</label>
                            <input name="country" placeholder="Enter country" value={form.country} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Tax Number</label>
                            <input name="tax_number" placeholder="Enter tax number" value={form.tax_number} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Status</label>
                            <Switch name="status" checked={form.status} onChange={handleChange} />
                        </div>
                    </div>
                </fieldset>

                <button
                    type="submit"
                    className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md transition-all"
                >
                    Add Supplier
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

export default AddSupplier;
