import { useEffect, useState } from 'react';
import { FaShoppingCart, FaTruckLoading, FaPlus, FaCheckCircle, FaFileInvoiceDollar } from 'react-icons/fa';
import toast from 'react-hot-toast';

const PurchaseOrderManager = () => {
    const [activeTab, setActiveTab] = useState('list'); // 'list' | 'add_po'
    const [orders, setOrders] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [products, setProducts] = useState([]);

    const [poForm, setPoForm] = useState({
        supplier: '',
        warehouse: '',
        expectedDate: '',
        notes: '',
        items: []
    });

    const [newItem, setNewItem] = useState({ productId: '', quantity: 1, unitPrice: 0 });

    const fetchData = async () => {
        try {
            const poRes = await fetch('http://localhost:5000/api/purchase-orders', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const poData = await poRes.json();
            if (poData.success) setOrders(poData.orders || []);

            const supRes = await fetch('http://localhost:5000/api/suppliers', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const supData = await supRes.json();
            if (supData.success) setSuppliers(supData.suppliers || []);

            const whRes = await fetch('http://localhost:5000/api/warehouses', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const whData = await whRes.json();
            if (whData.success) setWarehouses(whData.warehouses || []);

            const prodRes = await fetch('http://localhost:5000/api/products', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const prodData = await prodRes.json();
            if (prodData.success) setProducts(prodData.products || []);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddItem = () => {
        if (!newItem.productId) return;
        const selectedProd = products.find(p => p._id === newItem.productId);
        setPoForm({
            ...poForm,
            items: [
                ...poForm.items,
                {
                    productId: newItem.productId,
                    productName: selectedProd?.name || 'Product',
                    quantity: parseFloat(newItem.quantity),
                    unitPrice: parseFloat(newItem.unitPrice)
                }
            ]
        });
        setNewItem({ productId: '', quantity: 1, unitPrice: 0 });
    };

    const handleCreatePO = async (e) => {
        e.preventDefault();
        if (poForm.items.length === 0) return toast.error('Please add at least 1 item to the PO.');
        try {
            const res = await fetch('http://localhost:5000/api/purchase-orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(poForm)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Purchase Order (PO) created successfully!');
                setPoForm({ supplier: '', warehouse: '', expectedDate: '', notes: '', items: [] });
                fetchData();
                setActiveTab('list');
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div style={cardStyle}>
            <div style={headerStyle}>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <FaShoppingCart className="text-blue-600" /> Purchase Orders & Landed Cost Manager
                </h2>
            </div>

            <div style={tabNav}>
                <button onClick={() => setActiveTab('list')} style={activeTab === 'list' ? activeTabBtn : tabBtn}>Purchase Orders ({orders.length})</button>
                <button onClick={() => setActiveTab('add_po')} style={activeTab === 'add_po' ? activeTabBtn : tabBtn}>+ Issue New PO</button>
            </div>

            {activeTab === 'list' && (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table style={tableStyle}>
                        <thead style={tableHeaderStyle}>
                            <tr>
                                <th style={thStyle}>PO Number</th>
                                <th style={thStyle}>Supplier</th>
                                <th style={thStyle}>Target Warehouse</th>
                                <th style={thStyle}>Items</th>
                                <th style={thStyle}>Total Amount</th>
                                <th style={thStyle}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr><td colSpan="6" className="p-4 text-center text-xs text-slate-400">No Purchase Orders issued yet.</td></tr>
                            ) : (
                                orders.map(o => (
                                    <tr key={o._id}>
                                        <td style={tdStyle}><strong>{o.poNumber}</strong></td>
                                        <td style={tdStyle}>{o.supplier?.name || '-'}</td>
                                        <td style={tdStyle}>{o.warehouse?.name || '-'}</td>
                                        <td style={tdStyle}>{o.items?.length || 0} Items</td>
                                        <td style={tdStyle}><strong>{o.totalAmount} SAR</strong></td>
                                        <td style={tdStyle}>
                                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-bold">{o.status}</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'add_po' && (
                <form onSubmit={handleCreatePO} style={formStyle}>
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Supplier <span style={{ color: 'red' }}>*</span></label>
                        <select value={poForm.supplier} onChange={e => setPoForm({ ...poForm, supplier: e.target.value })} required style={inputStyle}>
                            <option value="">Select Supplier</option>
                            {suppliers.map(s => <option key={s._id || s.id} value={s._id || s.id}>{s.name} ({s.phone})</option>)}
                        </select>
                    </div>

                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Target Receiving Warehouse <span style={{ color: 'red' }}>*</span></label>
                        <select value={poForm.warehouse} onChange={e => setPoForm({ ...poForm, warehouse: e.target.value })} required style={inputStyle}>
                            <option value="">Select Target Warehouse</option>
                            {warehouses.map(w => <option key={w._id} value={w._id}>{w.name} ({w.code})</option>)}
                        </select>
                    </div>

                    {/* Items Builder */}
                    <div style={addressBoxStyle} className="col-span-2">
                        <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">Add Items to PO</h4>
                        <div className="flex gap-2 mb-3">
                            <select value={newItem.productId} onChange={e => {
                                const prod = products.find(p => p._id === e.target.value);
                                setNewItem({ ...newItem, productId: e.target.value, unitPrice: prod?.purchasePrice || 0 });
                            }} style={inputStyle}>
                                <option value="">Select Product</option>
                                {products.map(p => <option key={p._id} value={p._id}>{p.name} (Cost: {p.purchasePrice} SAR)</option>)}
                            </select>
                            <input type="number" placeholder="Qty" value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: e.target.value })} style={{ ...inputStyle, width: '90px' }} />
                            <input type="number" step="0.01" placeholder="Unit Cost" value={newItem.unitPrice} onChange={e => setNewItem({ ...newItem, unitPrice: e.target.value })} style={{ ...inputStyle, width: '120px' }} />
                            <button type="button" onClick={handleAddItem} style={addBtnStyle}><FaPlus /> Add</button>
                        </div>

                        {poForm.items.map((it, idx) => (
                            <div key={idx} style={itemRowStyle}>
                                <span><strong>{it.productName}:</strong> {it.quantity} units @ {it.unitPrice} SAR</span>
                                <strong>= {it.quantity * it.unitPrice} SAR</strong>
                            </div>
                        ))}
                    </div>

                    <button type="submit" style={submitBtnStyle} className="col-span-2">Issue Purchase Order (PO)</button>
                </form>
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

const headerStyle = {
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '12px',
    marginBottom: '16px'
};

const tabNav = {
    display: 'flex',
    gap: '8px',
    borderBottom: '2px solid #e2e8f0',
    marginBottom: '16px'
};

const activeTabBtn = {
    padding: '8px 14px',
    border: 'none',
    borderBottom: '3px solid #2563eb',
    backgroundColor: 'transparent',
    color: '#2563eb',
    fontWeight: '800',
    fontSize: '13px',
    cursor: 'pointer'
};

const tabBtn = {
    padding: '8px 14px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748b',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer'
};

const formStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px'
};

const inputGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
};

const labelStyle = {
    marginBottom: '4px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#334155',
};

const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontSize: '13px',
    outline: 'none',
};

const addressBoxStyle = {
    background: '#f8fafc',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0'
};

const addBtnStyle = {
    padding: '8px 14px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '12px',
    cursor: 'pointer'
};

const itemRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 12px',
    background: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    marginBottom: '6px',
    fontSize: '12px'
};

const submitBtnStyle = {
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontWeight: '800',
    fontSize: '13px',
    cursor: 'pointer'
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
    padding: '10px 14px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: '700',
};

const tdStyle = {
    padding: '10px 14px',
    borderBottom: '1px solid #e2e8f0',
    fontSize: '13px',
};

export default PurchaseOrderManager;
