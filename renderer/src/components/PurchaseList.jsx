import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaEdit, FaTrash } from 'react-icons/fa';

const PurchaseList = ({ refresh }) => {
    const [list, setList] = useState([]);
    const [editPurchase, setEditPurchase] = useState(null);

    const fetch = async () => {
        const purchases = await window.electron.ipcRenderer.invoke('get-purchases');
        setList(purchases);
    };

    useEffect(() => {
        fetch();
    }, [refresh]);

    const deletePurchase = async (id) => {
        if (confirm('Delete this purchase?')) {
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
            <h3 style={{ textAlign: 'center', fontSize: '24px', marginBottom: '20px' }}>🛒 Purchase List</h3>
            <table style={tableStyle}>
                <thead style={tableHeaderStyle}>
                    <tr>
                        <th style={{ ...thStyle, textAlign: 'left' }}>Purchase ID</th>
                        <th style={thStyle}>Supplier</th>
                        <th style={thStyle}>Purchase Date</th>
                        <th style={thStyle}>Grand Total</th>
                        <th style={thStyle}>Tax Amount</th>
                        <th style={thStyle}>Discount Amount</th>
                        <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {list.map((p, index) => (
                        <tr key={p.id} style={tableRowStyle(index)}>
                            <td style={{ ...tdStyle, textAlign: 'left' }}>{p.purchase_id}</td>
                            <td style={tdStyle}>{p.supplier_name}</td>
                            <td style={tdStyle}>{p.purchase_date}</td>
                            <td style={tdStyle}>{p.grand_total.toFixed(2)}</td>
                            <td style={tdStyle}>{p.tax_amount.toFixed(2)}</td>
                            <td style={tdStyle}>{p.discount_amount.toFixed(2)}</td>
                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                                <button onClick={() => setEditPurchase(p)} className="action-button"><FaEdit /></button>
                                <button onClick={() => deletePurchase(p.id)} className="action-button"><FaTrash /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {editPurchase && (
                <div style={modalOverlay}>
                    <div style={modalBox}>
                        <h3 style={modalHeaderStyle}>Edit Purchase</h3>
                        <form onSubmit={handleEditSubmit} style={formStyle}>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Purchase ID</label>
                                <input name="purchase_id" value={editPurchase.purchase_id} onChange={handleChange} readOnly style={{ ...inputStyle, backgroundColor: '#E2E8F0' }} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Supplier Invoice No</label>
                                <input name="supplier_invoice_no" value={editPurchase.supplier_invoice_no} onChange={handleChange} style={inputStyle} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Supplier Invoice Date</label>
                                <input type="date" name="supplier_invoice_date" value={editPurchase.supplier_invoice_date} onChange={handleChange} style={inputStyle} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Purchase Date</label>
                                <input type="date" name="purchase_date" value={editPurchase.purchase_date} onChange={handleChange} style={inputStyle} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Supplier ID</label>
                                <input name="supplier_id" value={editPurchase.supplier_id} onChange={handleChange} style={inputStyle} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Grand Total</label>
                                <input type="number" name="grand_total" value={editPurchase.grand_total} onChange={handleChange} style={inputStyle} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Grand Total Before Tax</label>
                                <input type="number" name="grand_total_before_tax" value={editPurchase.grand_total_before_tax} onChange={handleChange} style={inputStyle} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Tax Amount</label>
                                <input type="number" name="tax_amount" value={editPurchase.tax_amount} onChange={handleChange} style={inputStyle} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Discount Amount</label>
                                <input type="number" name="discount_amount" value={editPurchase.discount_amount} onChange={handleChange} style={inputStyle} />
                            </div>

                            <div style={{ gridColumn: '1 / span 2', display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="submit" className="default-button">Update</button>
                                <button type="button" onClick={() => setEditPurchase(null)} className="default-button">Cancel</button>
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
    width: 'clamp(800px, 70vw, 1000px)',
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
    gap: '20px',
};



const inputGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
};

const labelStyle = {
    marginBottom: '8px',
    fontSize: '14px',
    color: '#A0AEC0',
};

const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '5px',
    border: '1px solid #A0AEC0',
    backgroundColor: '#fff',
    color: '#333',
    fontSize: '14px',
    boxSizing: 'border-box',
};

export default PurchaseList;