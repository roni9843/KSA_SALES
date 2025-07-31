import { useState } from 'react';

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
        onAdded();
        setForm({
            tax_label: '',
            tax_percentage: ''
        });
    };

    return (
        <div style={cardStyle}>
            <h3 style={headerStyle}>Add New Tax Rate</h3>
            <form onSubmit={handleSubmit} style={formStyle}>
                <fieldset style={fieldsetStyle}>
                    <legend style={legendStyle}>Tax Rate Details</legend>
                    <div style={detailsGridStyle}>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Tax Label</label>
                            <input name="tax_label" placeholder="Enter tax label" value={form.tax_label} onChange={handleChange} required style={inputStyle} />
                        </div>

                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Tax Percentage</label>
                            <input type="number" name="tax_percentage" placeholder="Enter tax percentage" value={form.tax_percentage} onChange={handleChange} required style={inputStyle} />
                        </div>
                    </div>
                </fieldset>

                <button
                    type="submit"
                    className="default-button"
                >
                    Add Tax Rate
                </button>
            </form>
        </div>
    );
};

const cardStyle = {
    background: '#2D3748',
    padding: '20px',
    borderRadius: '4px',
    color: '#fff'
};

const headerStyle = {
    textAlign: 'center',
    marginBottom: '25px',
    fontSize: '24px',
    color: '#E2E8F0',
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
    gridTemplateColumns: '1fr 1fr',
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


export default AddTaxRate;
