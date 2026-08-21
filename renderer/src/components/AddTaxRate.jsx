import { useState } from 'react';
import { FaMoneyBillAlt } from 'react-icons/fa';

const AddTaxRate = ({ onAdded }) => {
    const [form, setForm] = useState({
        tax_label: '',
        tax_percentage: ''
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await window.electron.ipcRenderer.invoke('add-tax', form);
        if (onAdded) onAdded();
        setForm({
            tax_label: '',
            tax_percentage: ''
        });
    };

    return (
        <div style={cardStyle}>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 mb-4 border-b border-slate-200 pb-3">
                <FaMoneyBillAlt className="text-blue-600" /> Add New Tax Rate
            </h2>
            <form onSubmit={handleSubmit} style={formStyle}>
                <fieldset style={fieldsetStyle}>
                    <legend style={legendStyle}>Tax Rate Details</legend>
                    <div style={detailsGridStyle}>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Tax Label</label>
                            <input name="tax_label" placeholder="e.g. VAT 15%" value={form.tax_label} onChange={handleChange} required style={inputStyle} />
                        </div>

                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Tax Percentage (%)</label>
                            <input type="number" name="tax_percentage" placeholder="15" value={form.tax_percentage} onChange={handleChange} required style={inputStyle} />
                        </div>
                    </div>
                </fieldset>

                <button
                    type="submit"
                    className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md transition-all"
                >
                    Add Tax Rate
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
    gridTemplateColumns: '1fr 1fr',
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

export default AddTaxRate;
