import { useState } from 'react';

const AddSupplier = ({ onAdded }) => {
    const [form, setForm] = useState({
        name: '',
        phone: '',
        email: '',
        address: ''
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await window.electron.ipcRenderer.invoke('add-supplier', form);
        onAdded();
        setForm({
            name: '',
            phone: '',
            email: '',
            address: ''
        });
    };

    return (
        <div style={cardStyle}>
            <h3 style={headerStyle}>Add New Supplier</h3>
            <form onSubmit={handleSubmit} style={formStyle}>
                <fieldset style={fieldsetStyle}>
                    <legend style={legendStyle}>Supplier Details</legend>
                    <div style={detailsGridStyle}>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Name <span style={{color: 'red'}}>*</span></label>
                            <input name="name" placeholder="Enter supplier name" value={form.name} onChange={handleChange} required style={inputStyle} />
                        </div>

                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Phone <span style={{color: 'red'}}>*</span></label>
                            <input name="phone" placeholder="Enter phone number" value={form.phone} onChange={handleChange} required style={inputStyle} />
                        </div>

                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Email</label>
                            <input type="email" name="email" placeholder="Enter email" value={form.email} onChange={handleChange} style={inputStyle} />
                        </div>

                        <div style={{ ...inputGroupStyle, gridColumn: '1 / span 2' }}>
                            <label style={labelStyle}>Address</label>
                            <textarea name="address" placeholder="Supplier Address" value={form.address} onChange={handleChange} style={{ ...inputStyle, height: '80px', resize: 'vertical' }} />
                        </div>
                    </div>
                </fieldset>

                <button
                    type="submit"
                    style={buttonStyle}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2ecc71'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#27ae60'}
                >
                    Add Supplier
                </button>
            </form>
        </div>
    );
};

const cardStyle = {
    background: '#2D3748',
    padding: '30px',
    borderRadius: '10px',
    color: '#fff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
    maxWidth: '700px',
    margin: 'auto',
    marginBottom: '30px'
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

const buttonStyle = {
    padding: '15px',
    backgroundColor: '#27ae60',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    marginTop: '10px',
    transition: 'background-color 0.3s ease',
};


export default AddSupplier;
