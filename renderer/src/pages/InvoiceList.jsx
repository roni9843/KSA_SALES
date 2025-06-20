import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const InvoiceList = () => {
    const [invoices, setInvoices] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchInvoices() {
            const result = await window.electron.ipcRenderer.invoke('get-invoices');
            setInvoices(result);
        }
        fetchInvoices();
    }, []);

    return (
        <div>
            <h2>🧾 Invoice List</h2>
            {invoices.length === 0 ? (
                <p>No invoices found.</p>
            ) : (
                <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Customer</th>
                            <th>Total</th>
                            <th>Paid</th>
                            <th>Due</th>
                            <th>Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map(inv => (
                            <tr key={inv.id}>
                                <td>{inv.id}</td>
                                <td>{inv.customer_name}</td>
                                <td>{inv.total}</td>
                                <td>{inv.paid}</td>
                                <td>{inv.total - inv.paid}</td>
                                <td>{inv.created_at}</td>
                                <td>
                                    <button onClick={() => navigate(`/invoice/${inv.id}`)}>👁️ View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default InvoiceList;
