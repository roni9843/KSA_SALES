import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFileInvoice, FaArrowRight, FaClock } from 'react-icons/fa';
import toast from 'react-hot-toast';

const DraftInvoices = () => {
    const [drafts, setDrafts] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchDrafts = async () => {
        setLoading(true);
        try {
            const data = await window.electron.ipcRenderer.invoke('get-draft-invoices');
            setDrafts(data || []);
        } catch (error) {
            console.error('Failed to fetch draft invoices:', error);
            toast.error('Failed to load draft invoices.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrafts();
    }, []);

    return (
        <div style={styles.card}>
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <FaClock className="text-amber-500" /> Pending Draft Invoices
                </h2>
                <span className="px-3 py-1 bg-amber-100 text-amber-800 font-extrabold text-xs rounded-full border border-amber-300">
                    {drafts.length} Saved Drafts
                </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 mt-4">
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.thRow}>
                            <th style={{ ...styles.th, textAlign: 'left' }}>Draft ID</th>
                            <th style={{ ...styles.th, textAlign: 'left' }}>Customer</th>
                            <th style={styles.th}>Date</th>
                            <th style={styles.th}>Total Amount</th>
                            <th style={styles.th}>Due</th>
                            <th style={{ ...styles.th, textAlign: 'center' }}>Status</th>
                            <th style={{ ...styles.th, textAlign: 'center' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="7" className="p-8 text-center text-slate-500 text-sm">Loading saved drafts...</td>
                            </tr>
                        ) : drafts.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="p-8 text-center text-slate-400 text-sm">No saved draft invoices found. Create one from the POS screen!</td>
                            </tr>
                        ) : (
                            drafts.map((d, index) => (
                                <tr key={d.id || index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                    <td style={{ ...styles.td, textAlign: 'left', fontWeight: '700', color: '#2563eb' }}>{d.invoice_id || d.id}</td>
                                    <td style={{ ...styles.td, textAlign: 'left', fontWeight: '700', color: '#0f172a' }}>{d.customer_name}</td>
                                    <td style={styles.td}>{new Date(d.created_at).toLocaleDateString()}</td>
                                    <td style={{ ...styles.td, fontWeight: '700', color: '#0f172a' }}>৳{(d.total || 0).toFixed(2)}</td>
                                    <td style={{ ...styles.td, fontWeight: '700', color: d.due > 0 ? '#ef4444' : '#10b981' }}>৳{(d.due || 0).toFixed(2)}</td>
                                    <td style={{ ...styles.td, textAlign: 'center' }}>
                                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300">
                                            DRAFT
                                        </span>
                                    </td>
                                    <td style={{ ...styles.td, textAlign: 'center' }}>
                                        <button
                                            onClick={() => navigate(`/invoice/${d.id}`)}
                                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 mx-auto"
                                        >
                                            View & Finalize <FaArrowRight className="text-[10px]" />
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

const styles = {
    card: { background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thRow: { backgroundColor: '#f8fafc' },
    th: { color: '#475569', padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid #e2e8f0', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' },
    td: { padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#334155', fontSize: '14px' },
};

export default DraftInvoices;
