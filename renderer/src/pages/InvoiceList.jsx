import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaClipboardList, FaEye } from 'react-icons/fa';

const InvoiceList = () => {
    const [invoices, setInvoices] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchInvoices() {
            const res = await window.electron.ipcRenderer.invoke('get-invoices');
            setInvoices(res || []);
        }
        fetchInvoices();
    }, []);

    const handlePrint = (id) => {
        navigate(`/invoice/${id}`);
    };

    return (
        <div style={cardStyle}>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 mb-4 border-b border-slate-200 pb-3">
                <FaClipboardList className="text-blue-600" /> Sales Invoice History
            </h2>
            
            <div className="overflow-x-auto rounded-xl border border-slate-200 mt-4">
                <table style={tableStyle}>
                    <thead style={tableHeaderStyle}>
                        <tr>
                            <th style={{ ...thStyle, textAlign: 'left' }}>#</th>
                            <th style={{ ...thStyle, textAlign: 'left' }}>Invoice ID</th>
                            <th style={{ ...thStyle, textAlign: 'left' }}>Customer</th>
                            <th style={thStyle}>Total</th>
                            <th style={thStyle}>Paid</th>
                            <th style={thStyle}>Due</th>
                            <th style={{ ...thStyle, textAlign: 'left' }}>Date</th>
                            <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="p-8 text-center text-slate-500 text-sm">No sales invoices found yet.</td>
                            </tr>
                        ) : (
                            invoices.map((inv, index) => (
                                <tr key={inv.id} style={tableRowStyle(index)}>
                                    <td style={{ ...tdStyle, textAlign: 'left', fontWeight: '700' }}>#{inv.id}</td>
                                    <td style={{ ...tdStyle, textAlign: 'left', color: '#2563eb', fontWeight: '600' }}>{inv.invoice_id}</td>
                                    <td style={{ ...tdStyle, textAlign: 'left', fontWeight: '600' }}>{inv.customer_name || 'Walk-in Customer'}</td>
                                    <td style={{ ...tdStyle, fontWeight: '700', color: '#0f172a' }}>৳{Number(inv.total).toFixed(2)}</td>
                                    <td style={tdStyle}>৳{Number(inv.paid).toFixed(2)}</td>
                                    <td style={{ ...tdStyle, color: inv.due > 0 ? '#ef4444' : '#10b981', fontWeight: '700' }}>
                                        ৳{Number(inv.due).toFixed(2)}
                                    </td>
                                    <td style={{ ...tdStyle, textAlign: 'left' }}>{new Date(inv.created_at).toLocaleDateString()}</td>
                                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                                        <button onClick={() => handlePrint(inv.id)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                                            <FaEye />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
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

const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
};

const tableHeaderStyle = {
    backgroundColor: '#f8fafc',
    color: '#475569',
};

const thStyle = {
    padding: '12px 16px',
    textAlign: 'right',
    borderBottom: '1px solid #e2e8f0',
    textTransform: 'uppercase',
    fontSize: '11px',
    fontWeight: '700',
};

const tableRowStyle = (index) => ({
    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc',
});

const tdStyle = {
    padding: '12px 16px',
    textAlign: 'right',
    borderBottom: '1px solid #e2e8f0',
    color: '#334155',
    fontSize: '14px',
};

export default InvoiceList;
