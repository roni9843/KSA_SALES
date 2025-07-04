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
                <thead>
                    <tr>
                        <th style={thTdStyle}>ID</th>
                        <th style={thTdStyle}>Customer</th>
                        <th style={thTdStyle}>Total</th>
                        <th style={thTdStyle}>Paid</th>
                        <th style={thTdStyle}>Due</th>
                        <th style={thTdStyle}>Date</th>
                        <th style={thTdStyle}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {invoices.map(inv => (
                        <tr key={inv.id}>
                            <td style={thTdStyle}>{inv.id}</td>
                            <td style={thTdStyle}>{inv.customer_name}</td>
                            <td style={thTdStyle}>{inv.total}</td>
                            <td style={thTdStyle}>{inv.paid}</td>
                            <td style={thTdStyle}>{inv.due}</td>
                            <td style={thTdStyle}>{new Date(inv.created_at).toLocaleString()}</td>
                            <td style={thTdStyle}>
                                <button onClick={() => handlePrint(inv.id)}>🖨️ View</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const cardStyle = {
    background: '#2c3e50',
    padding: '20px',
    borderRadius: '10px',
    color: '#fff',
    marginTop: '20px'
};

const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#34495e',
    color: '#fff',
    marginTop: '10px'
};

const thTdStyle = {
    padding: '10px 15px',
    borderBottom: '1px solid #2c3e50',
    textAlign: 'left',
};

export default InvoiceList;
