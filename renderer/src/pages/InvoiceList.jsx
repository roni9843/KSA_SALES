import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const InvoiceList = () => {
    const [invoices, setInvoices] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchInvoices() {
            const res = await window.electron.ipcRenderer.invoke('get-invoices');
            setInvoices(res);
        }
        fetchInvoices();
    }, []);

    const handlePrint = (id) => {
        navigate(`/invoice/${id}`);
    };

    return (
        <div style={cardStyle}>
            <h2>🧾 Invoice List</h2>
            <table style={tableStyle}>
                <thead style={tableHeaderStyle}>
                    <tr>
                        <th style={{ ...thStyle, textAlign: 'left' }}>ID</th>
                        <th style={{ ...thStyle, textAlign: 'left' }}>Customer</th>
                        <th style={thStyle}>Total</th>
                        <th style={thStyle}>Paid</th>
                        <th style={thStyle}>Due</th>
                        <th style={{ ...thStyle, textAlign: 'left' }}>Date</th>
                        <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {invoices.map((inv, index) => (
                        <tr key={inv.id} style={tableRowStyle(index)}>
                            <td style={{ ...tdStyle, textAlign: 'left' }}>#{inv.id}</td>
                            <td style={{ ...tdStyle, textAlign: 'left' }}>{inv.customer_name || 'Walk-in Customer'}</td>
                            <td style={tdStyle}>{inv.total.toFixed(2)}</td>
                            <td style={tdStyle}>{inv.paid.toFixed(2)}</td>
                            <td style={{ ...tdStyle, color: inv.due > 0 ? '#E53E3E' : '#48BB78', fontWeight: 'bold' }}>{inv.due.toFixed(2)}</td>
                            <td style={{ ...tdStyle, textAlign: 'left' }}>{new Date(inv.created_at).toLocaleDateString()}</td>
                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                                <button onClick={() => handlePrint(inv.id)} style={viewButtonStyle}>
                                    🖨️ View
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const cardStyle = {
    background: '#2D3748',
    padding: '20px',
    borderRadius: '4px',
    color: '#fff'
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
});

const tdStyle = {
    padding: '12px 15px',
    textAlign: 'right',
    borderBottom: '1px solid #2D3748',
};

const viewButtonStyle = {
    padding: '8px 12px',
    backgroundColor: '#3182CE',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
};


export default InvoiceList;
