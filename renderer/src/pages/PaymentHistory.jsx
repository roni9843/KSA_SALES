import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaClipboardList, FaEye, FaFilter } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';

const PaymentHistory = () => {
    const [payments, setPayments] = useState([]);
    const [filters, setFilters] = useState({
        paymentDate: null,
        customerName: '',
    });
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchPaymentHistory() {
            const formattedFilters = {
                ...filters,
                paymentDate: filters.paymentDate ? format(filters.paymentDate, 'yyyy-MM-dd') : null,
            };
            const res = await window.electron.ipcRenderer.invoke('get-payment-history', formattedFilters);
            setPayments(res);
        }
        fetchPaymentHistory();
    }, [filters]);

    const handleViewReceipt = (invoiceId) => {
        navigate(`/due-receipt/${invoiceId}`);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };
    
    const handleDateChange = (date) => {
        setFilters(prev => ({ ...prev, paymentDate: date }));
    };

    const clearFilters = () => {
        setFilters({
            paymentDate: null,
            customerName: '',
        });
    };

    return (
        <div style={cardStyle}>
            <h2><FaClipboardList /> Payment History</h2>
            
            <fieldset style={fieldsetStyle}>
                <legend style={legendStyle}><FaFilter /> Filters</legend>
                <div style={filterContainerStyle}>
                    <div style={filterGroupStyle}>
                        <label style={labelStyle}>Payment Date</label>
                        <DatePicker
                            selected={filters.paymentDate}
                            onChange={handleDateChange}
                            dateFormat="yyyy-MM-dd"
                            customInput={<input style={inputStyle} />}
                            isClearable
                        />
                    </div>
                    <div style={filterGroupStyle}>
                        <label style={labelStyle}>Customer Name</label>
                        <input
                            type="text"
                            name="customerName"
                            value={filters.customerName}
                            onChange={handleFilterChange}
                            placeholder="Filter by customer name"
                            style={inputStyle}
                        />
                    </div>
                    <div style={{ ...filterGroupStyle, justifyContent: 'flex-end' }}>
                        <button onClick={clearFilters} style={clearButtonStyle}>Clear Filters</button>
                    </div>
                </div>
            </fieldset>

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

const filterContainerStyle = {
    display: 'flex',
    gap: '20px',
    alignItems: 'flex-end',
};

const filterGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
};

const inputStyle = {
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    width: '200px',
};

const fieldsetStyle = {
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
};

const legendStyle = {
    padding: '0 10px',
    fontWeight: '600',
    color: '#4a5568',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
};

const labelStyle = {
    marginBottom: '5px',
    fontWeight: '600',
    fontSize: '14px',
};

const clearButtonStyle = {
    padding: '8px 16px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    background: '#f7fafc',
    cursor: 'pointer',
    height: '35px',
};

export default PaymentHistory;