import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaClipboardList, FaEdit, FaTrash } from 'react-icons/fa';

const PurchaseList = ({ refresh }) => {
    const [list, setList] = useState([]);
    const [editPurchase, setEditPurchase] = useState(null);

    const fetch = async () => {
        try {
            const purchases = await window.electron.ipcRenderer.invoke('get-purchases');
            setList(purchases || []);
        } catch (err) {
            console.error('Failed to fetch purchases:', err);
        }
    };

    useEffect(() => {
        fetch();
    }, [refresh]);

    const deletePurchase = async (id) => {
        if (confirm('Delete this purchase order?')) {
            try {
                await window.electron.ipcRenderer.invoke('delete-purchase', id);
                toast.success('Purchase deleted successfully');
                fetch();
            } catch (err) {
                toast.error(err.message || 'An error occurred while deleting the purchase.');
            }
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await window.electron.ipcRenderer.invoke('update-purchase', editPurchase);
            toast.success('Purchase updated successfully');
            setEditPurchase(null);
            fetch();
        } catch (err) {
            toast.error(err.message || 'An error occurred while updating the purchase.');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditPurchase({ ...editPurchase, [name]: value });
    };

    return (
        <div style={cardStyle}>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 mb-4 border-b border-slate-200 pb-3">
                <FaClipboardList className="text-blue-600" /> Stock Purchase Order Directory
            </h2>

            <div className="overflow-x-auto rounded-xl border border-slate-200 mt-4">
                <table style={tableStyle}>
                    <thead style={tableHeaderStyle}>
                        <tr>
                            <th style={{ ...thStyle, textAlign: 'left' }}>Purchase ID</th>
                            <th style={{ ...thStyle, textAlign: 'left' }}>Supplier</th>
                            <th style={thStyle}>Purchase Date</th>
                            <th style={thStyle}>Grand Total</th>
                            <th style={thStyle}>Tax Amount</th>
                            <th style={thStyle}>Discount</th>
                            <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="p-8 text-center text-slate-500 text-sm">No purchase orders found.</td>
                            </tr>
                        ) : (
                            list.map((p, index) => (
                                <tr key={p.id || index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                    <td style={{ ...tdStyle, textAlign: 'left', fontWeight: '700', color: '#2563eb' }}>{p.purchase_id}</td>
                                    <td style={{ ...tdStyle, textAlign: 'left', fontWeight: '700', color: '#0f172a' }}>{p.supplier_name}</td>
                                    <td style={tdStyle}>{p.purchase_date}</td>
                                    <td style={{ ...tdStyle, fontWeight: '700', color: '#0f172a' }}>৳{(p.grand_total || 0).toFixed(2)}</td>
                                    <td style={tdStyle}>৳{(p.tax_amount || 0).toFixed(2)}</td>
                                    <td style={tdStyle}>৳{(p.discount_amount || 0).toFixed(2)}</td>
                                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                                        <button onClick={() => setEditPurchase(p)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors mr-2"><FaEdit /></button>
                                        <button onClick={() => deletePurchase(p.id)} className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"><FaTrash /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {editPurchase && (
                <div style={modalOverlay}>
                    <div style={modalBox}>
                        <h3 style={modalHeaderStyle}>Edit Purchase Order</h3>
                        <form onSubmit={handleEditSubmit} style={formStyle}>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Purchase ID</label>
                                <input name="purchase_id" value={editPurchase.purchase_id} onChange={handleChange} readOnly style={{ ...inputStyle, backgroundColor: '#f1f5f9' }} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Supplier Invoice No</label>
                                <input name="supplier_invoice_no" value={editPurchase.supplier_invoice_no || ''} onChange={handleChange} style={inputStyle} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Supplier Invoice Date</label>
                                <input type="date" name="supplier_invoice_date" value={editPurchase.supplier_invoice_date || ''} onChange={handleChange} style={inputStyle} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Purchase Date</label>
                                <input type="date" name="purchase_date" value={editPurchase.purchase_date || ''} onChange={handleChange} style={inputStyle} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Grand Total</label>
                                <input type="number" name="grand_total" value={editPurchase.grand_total} onChange={handleChange} style={inputStyle} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Tax Amount</label>
                                <input type="number" name="tax_amount" value={editPurchase.tax_amount} onChange={handleChange} style={inputStyle} />
                            </div>

                            <div style={{ gridColumn: '1 / span 2', display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                                <button type="button" onClick={() => setEditPurchase(null)} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl text-sm transition-all">Cancel</button>
                                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md transition-all">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
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

const tdStyle = {
    padding: '12px 16px',
    borderBottom: '1px solid #e2e8f0',
    color: '#334155',
    fontSize: '14px',
};

const modalOverlay = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999
};

const modalBox = {
    background: '#ffffff',
    padding: '28px',
    borderRadius: '20px',
    width: 'clamp(600px, 60vw, 850px)',
    color: '#0f172a',
    border: '1px solid #e2e8f0',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};

const modalHeaderStyle = {
    textAlign: 'left',
    marginBottom: '16px',
    fontSize: '18px',
    fontWeight: '800',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '10px',
};

const formStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
};

const inputGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
};

const labelStyle = {
    marginBottom: '4px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
};

const inputStyle = {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontSize: '13px',
    outline: 'none',
};

export default PurchaseList;