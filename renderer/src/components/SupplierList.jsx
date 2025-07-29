import { useEffect, useState } from 'react';
import Switch from './common/Switch';
import { FaEdit, FaTrash } from 'react-icons/fa';

const SupplierList = ({ refresh }) => {
    const [list, setList] = useState([]);
    const [editSupplier, setEditSupplier] = useState(null);

    const fetch = async () => {
        const suppliers = await window.electron.ipcRenderer.invoke('get-suppliers');
        setList(suppliers);
    };

    useEffect(() => {
        fetch();
    }, [refresh]);

    const deleteSupplier = async (id) => {
        if (confirm('Delete this supplier?')) {
            await window.electron.ipcRenderer.invoke('delete-supplier', id);
            fetch();
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        await window.electron.ipcRenderer.invoke('update-supplier', editSupplier);
        setEditSupplier(null);
        fetch();
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditSupplier({ ...editSupplier, [name]: type === 'checkbox' ? checked : value });
    };

    return (
        <div style={cardStyle}>
            <h3 style={{ textAlign: 'center', fontSize: '24px', marginBottom: '20px' }}>🚚 Supplier List</h3>
            <table style={tableStyle}>
                <thead style={tableHeaderStyle}>
                    <tr>
                        <th style={{ ...thStyle, textAlign: 'left' }}>Name</th>
                        <th style={thStyle}>Phone</th>
                        <th style={thStyle}>Email</th>
                        <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {list.map((s, index) => (
                        <tr key={s.id} style={tableRowStyle(index)}>
                            <td style={{ ...tdStyle, textAlign: 'left' }}>{s.name}</td>
                            <td style={tdStyle}>{s.phone}</td>
                            <td style={tdStyle}>{s.email}</td>
                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                                <button onClick={() => setEditSupplier(s)} style={iconButtonStyle}><FaEdit /></button>
                                <button onClick={() => deleteSupplier(s.id)} style={iconButtonStyle}><FaTrash /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {editSupplier && (
                <div style={modalOverlay}>
                    <div style={modalBox}>
                        <h3 style={modalHeaderStyle}>Edit Supplier</h3>
                        <form onSubmit={handleEditSubmit} style={formStyle}>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Name <span style={{ color: 'red' }}>*</span></label>
                                <input name="name" value={editSupplier.name} onChange={handleChange} placeholder="Name" required style={inputStyle} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Code</label>
                                <input name="code" value={editSupplier.code} onChange={handleChange} placeholder="Code" style={inputStyle} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Phone <span style={{ color: 'red' }}>*</span></label>
                                <input name="phone" value={editSupplier.phone} onChange={handleChange} placeholder="Phone" required style={inputStyle} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Email</label>
                                <input type="email" name="email" value={editSupplier.email} onChange={handleChange} placeholder="Email" style={inputStyle} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Address</label>
                                <input name="address" value={editSupplier.address} onChange={handleChange} placeholder="Address" style={inputStyle} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Zip Code</label>
                                <input name="zip_code" value={editSupplier.zip_code} onChange={handleChange} placeholder="Zip Code" style={inputStyle} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>City</label>
                                <input name="city" value={editSupplier.city} onChange={handleChange} placeholder="City" style={inputStyle} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Country</label>
                                <input name="country" value={editSupplier.country} onChange={handleChange} placeholder="Country" style={inputStyle} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Tax Number</label>
                                <input name="tax_number" value={editSupplier.tax_number} onChange={handleChange} placeholder="Tax Number" style={inputStyle} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Status</label>
                                <Switch name="status" checked={editSupplier.status} onChange={handleChange} />
                            </div>

                            <div style={{ gridColumn: '1 / span 2', display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="submit" style={buttonStyle}>💾 Update</button>
                                <button type="button" onClick={() => setEditSupplier(null)} style={cancelButtonStyle}>❌ Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const cardStyle = {
    background: '#2D3748',
    padding: '20px',
    borderRadius: '4px',
    color: '#fff',
    marginTop: '20px'
};

const tableStyle = {
    width: '100%',
    marginTop: '20px',
    borderCollapse: 'collapse',
    borderRadius: '8px',
    overflow: 'hidden',
};

const tableHeaderStyle = {
    backgroundColor: '#4A5568',
    color: '#fff',
};

const thStyle = {
    padding: '12px 15px',
    textAlign: 'right',
    borderBottom: '1px solid #2D3748',
    textTransform: 'uppercase',
    fontSize: '12px',
};

const tableRowStyle = (index) => ({
    backgroundColor: index % 2 === 0 ? '#575F6D' : '#4A5568',
    borderBottom: '1px solid #2D3748',
});

const tdStyle = {
    padding: '12px 15px',
    textAlign: 'right',
};

const iconButtonStyle = {
    background: 'none',
    border: '1px solid',
    borderRadius: '5px',
    padding: '8px 12px',
    cursor: 'pointer',
    marginRight: '5px',
    transition: 'all 0.3s ease',
    color: '#fff',
};

const editButtonStyle = {
    ...iconButtonStyle,
    borderColor: '#2B6CB0',
    '&:hover': {
        backgroundColor: '#2B6CB0',
        color: '#fff',
    },
};

const deleteButtonStyle = {
    ...iconButtonStyle,
    borderColor: '#C53030',
    '&:hover': {
        backgroundColor: '#C53030',
        color: '#fff',
    },
};

const modalOverlay = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999
};

const modalBox = {
    background: '#2D3748',
    padding: '30px',
    borderRadius: '5px',
    width: 'clamp(400px, 50vw, 600px)',
    color: '#fff',
    boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
};

const modalHeaderStyle = {
    textAlign: 'center',
    marginBottom: '20px',
    fontSize: '22px',
};

const formStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
};

const inputGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
};

const labelStyle = {
    marginBottom: '5px',
    fontSize: '14px',
    color: '#A0AEC0',
};

const inputStyle = {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #A0AEC0',
    backgroundColor: '#fff',
    color: '#333',
    fontSize: '14px',
};

const buttonStyle = {
    flex: 1,
    padding: '12px',
    backgroundColor: '#27ae60',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease',
};

const cancelButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#e74c3c'
};

export default SupplierList;
