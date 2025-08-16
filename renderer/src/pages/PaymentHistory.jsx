import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaClipboardList, FaEye } from 'react-icons/fa';

const PaymentHistory = () => {
    const [payments, setPayments] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchPaymentHistory() {
            const res = await window.electron.ipcRenderer.invoke('get-payment-history');
            setPayments(res);
        }
        fetchPaymentHistory();
    }, []);

    const handleViewReceipt = (invoiceId) => {
        navigate(`/due-receipt/${invoiceId}`);
    };

    return (
        <div style={cardStyle}>
            <h2><FaClipboardList /> Payment History</h2>
            <table style={tableStyle}>
                <thead style={tableHeaderStyle}>
                    <tr>
                        <th style={{ ...thStyle, textAlign: 'left' }}>Payment ID</th>
                        <th style={{ ...thStyle, textAlign: 'left' }}>Invoice ID</th>
                        <th style={{ ...thStyle, textAlign: 'left' }}>Customer</th>
                        <th style={thStyle}>Paid Amount</th>
                        <th style={thStyle}>Due Amount</th>
                        <th style={{ ...thStyle, textAlign: 'left' }}>Payment Date</th>
                        <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.map((payment, index) => (
                        <tr key={payment.id} style={tableRowStyle(index)}>
                            <td style={{ ...tdStyle, textAlign: 'left' }}>#{payment.id}</td>
                            <td style={{ ...tdStyle, textAlign: 'left' }}>{payment.invoice_id}</td>
                            <td style={{ ...tdStyle, textAlign: 'left' }}>{payment.customer_name}</td>
                            <td style={tdStyle}>{payment.paid_amount.toFixed(2)}</td>
                            <td style={{ ...tdStyle, color: payment.due_amount > 0 ? '#E53E3E' : '#48BB78', fontWeight: 'bold' }}>{payment.due_amount.toFixed(2)}</td>
                            <td style={{ ...tdStyle, textAlign: 'left' }}>{new Date(payment.payment_date).toLocaleDateString()}</td>
                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                                <button onClick={() => handleViewReceipt(payment.invoice_id_pk)} className="action-button">
                                    <FaEye />
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
    background: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    color: '#333',
};

const tableStyle = {
    width: '100%',
    marginTop: '20px',
    borderCollapse: 'collapse',
    borderRadius: '8px',
    overflow: 'hidden',
};

const tableHeaderStyle = {
    backgroundColor: '#f7fafc',
    color: '#4a5568',
    borderBottom: '2px solid #e2e8f0',
};

const thStyle = {
    padding: '12px 15px',
    textAlign: 'right',
    textTransform: 'uppercase',
    fontSize: '12px',
    fontWeight: '600',
};

const tableRowStyle = (index) => ({
    backgroundColor: index % 2 === 0 ? '#fff' : '#f7fafc',
    borderBottom: '1px solid #e2e8f0',
});

const tdStyle = {
    padding: '12px 15px',
    textAlign: 'right',
};

export default PaymentHistory;