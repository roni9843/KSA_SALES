import { useEffect, useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

const TaxList = ({ refresh }) => {
    const [list, setList] = useState([]);
    const [editTax, setEditTax] = useState(null);

    const fetch = async () => {
        const taxes = await window.electron.ipcRenderer.invoke('get-taxes');
        setList(taxes);
    };

    useEffect(() => {
        fetch();
    }, [refresh]);

    const deleteTax = async (id) => {
        if (confirm('Delete this tax rate?')) {
            await window.electron.ipcRenderer.invoke('delete-tax', id);
            fetch();
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        await window.electron.ipcRenderer.invoke('update-tax', editTax);
        setEditTax(null);
        fetch();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditTax({ ...editTax, [name]: value });
    };

    return (
        <div style={cardStyle}>
            <h3 style={{ textAlign: 'center', fontSize: '24px', marginBottom: '20px' }}>💰 Tax List</h3>
            <table style={tableStyle}>
                <thead style={tableHeaderStyle}>
                    <tr>
                        <th style={{ ...thStyle, textAlign: 'left' }}>Tax Label</th>
                        <th style={thStyle}>Tax Percentage</th>
                        <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {list.map((t, index) => (
                        <tr key={t.id} style={tableRowStyle(index)}>
                            <td style={{ ...tdStyle, textAlign: 'left' }}>{t.tax_label}</td>
                            <td style={tdStyle}>{t.tax_percentage}%</td>
                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                                <button onClick={() => setEditTax(t)} style={iconButtonStyle}><FaEdit /></button>
                                <button onClick={() => deleteTax(t.id)} style={iconButtonStyle}><FaTrash /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {editTax && (
                <div style={modalOverlay}>
                    <div style={modalBox}>
                        <h3 style={modalHeaderStyle}>Edit Tax Rate</h3>
                        <form onSubmit={handleEditSubmit} style={formStyle}>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Tax Label</label>
                                <input name="tax_label" value={editTax.tax_label} onChange={handleChange} placeholder="Tax Label" style={inputStyle} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Tax Percentage</label>
                                <input type="number" name="tax_percentage" value={editTax.tax_percentage} onChange={handleChange} placeholder="Tax Percentage" style={inputStyle} />
                            </div>

                            <div style={{ gridColumn: '1 / span 2', display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="submit" style={buttonStyle}>💾 Update</button>
                                <button type="button" onClick={() => setEditTax(null)} style={cancelButtonStyle}>❌ Cancel</button>
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

export default TaxList;
