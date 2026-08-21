import { useEffect, useState } from 'react';
import { FaWarehouse, FaExchangeAlt, FaPlus, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const WarehouseManager = () => {
    const [activeTab, setActiveTab] = useState('list'); // 'list' | 'add' | 'transfer'
    const [warehouses, setWarehouses] = useState([]);
    const [transfers, setTransfers] = useState([]);
    const [products, setProducts] = useState([]);

    const [whForm, setWhForm] = useState({ name: '', code: '', location: '', phone: '' });
    const [trfForm, setTrfForm] = useState({
        sourceWarehouse: '',
        destinationWarehouse: '',
        productId: '',
        quantity: 1,
        notes: ''
    });

    const fetchData = async () => {
        try {
            const whRes = await fetch('http://localhost:5000/api/warehouses', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const whData = await whRes.json();
            if (whData.success) setWarehouses(whData.warehouses || []);

            const trfRes = await fetch('http://localhost:5000/api/warehouses/transfers', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const trfData = await trfRes.json();
            if (trfData.success) setTransfers(trfData.transfers || []);

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

    const handleAddWarehouse = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/warehouses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(whForm)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Warehouse created successfully');
                setWhForm({ name: '', code: '', location: '', phone: '' });
                fetchData();
                setActiveTab('list');
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleCreateTransfer = async (e) => {
        e.preventDefault();
        if (trfForm.sourceWarehouse === trfForm.destinationWarehouse) {
            return toast.error('Source and Destination Warehouses cannot be the same!');
        }
        try {
            const res = await fetch('http://localhost:5000/api/warehouses/transfers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    sourceWarehouse: trfForm.sourceWarehouse,
                    destinationWarehouse: trfForm.destinationWarehouse,
                    items: [{ productId: trfForm.productId, quantity: parseFloat(trfForm.quantity) }],
                    notes: trfForm.notes
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Stock Transfer order created!');
                setTrfForm({ sourceWarehouse: '', destinationWarehouse: '', productId: '', quantity: 1, notes: '' });
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
                    <FaWarehouse className="text-blue-600" /> Multi-Warehouse & Stock Transfers
                </h2>
            </div>

            <div style={tabNav}>
                <button onClick={() => setActiveTab('list')} style={activeTab === 'list' ? activeTabBtn : tabBtn}>Warehouse Directory ({warehouses.length})</button>
                <button onClick={() => setActiveTab('add')} style={activeTab === 'add' ? activeTabBtn : tabBtn}>+ Add New Warehouse</button>
                <button onClick={() => setActiveTab('transfer')} style={activeTab === 'transfer' ? activeTabBtn : tabBtn}><FaExchangeAlt className="mr-1 text-xs inline" /> Inter-Warehouse Transfer</button>
            </div>

            {activeTab === 'list' && (
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {warehouses.length === 0 ? (
                            <p className="text-xs text-slate-400 italic col-span-2">No warehouses added yet. Default central warehouse active.</p>
                        ) : (
                            warehouses.map(w => (
                                <div key={w._id} style={whCardStyle}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-extrabold text-slate-900 text-sm">{w.name}</h4>
                                            <span className="text-[11px] text-slate-400 font-bold">Code: {w.code}</span>
                                        </div>
                                        {w.isDefault && <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">DEFAULT</span>}
                                    </div>
                                    <p className="text-xs text-slate-600 mt-2">{w.location || 'Central Location'}</p>
                                </div>
                            ))
                        )}
                    </div>

                    <h3 className="text-sm font-extrabold text-slate-800 mb-3 flex items-center gap-1.5 border-t border-slate-200 pt-4">
                        <FaExchangeAlt className="text-blue-600" /> Inter-Warehouse Stock Transfer History ({transfers.length})
                    </h3>
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table style={tableStyle}>
                            <thead style={tableHeaderStyle}>
                                <tr>
                                    <th style={thStyle}>Transfer Order No</th>
                                    <th style={thStyle}>From Warehouse</th>
                                    <th style={thStyle}>To Warehouse</th>
                                    <th style={thStyle}>Items</th>
                                    <th style={thStyle}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transfers.length === 0 ? (
                                    <tr><td colSpan="5" className="p-4 text-center text-xs text-slate-400">No stock transfer orders recorded.</td></tr>
                                ) : (
                                    transfers.map(t => (
                                        <tr key={t._id}>
                                            <td style={tdStyle}><strong>{t.transferNo}</strong></td>
                                            <td style={tdStyle}>{t.sourceWarehouse?.name || '-'}</td>
                                            <td style={tdStyle}>{t.destinationWarehouse?.name || '-'}</td>
                                            <td style={tdStyle}>{t.items?.length || 0} Products</td>
                                            <td style={tdStyle}>
                                                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[11px] font-bold">{t.status}</span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'add' && (
                <form onSubmit={handleAddWarehouse} style={formStyle}>
                    <input placeholder="Warehouse Name (e.g. Dammam Store)" value={whForm.name} onChange={e => setWhForm({ ...whForm, name: e.target.value })} required style={inputStyle} />
                    <input placeholder="Warehouse Code (e.g. WH-002)" value={whForm.code} onChange={e => setWhForm({ ...whForm, code: e.target.value })} required style={inputStyle} />
                    <input placeholder="Location Address" value={whForm.location} onChange={e => setWhForm({ ...whForm, location: e.target.value })} style={inputStyle} />
                    <input placeholder="Contact Phone" value={whForm.phone} onChange={e => setWhForm({ ...whForm, phone: e.target.value })} style={inputStyle} />
                    <button type="submit" style={submitBtnStyle}>Create Warehouse</button>
                </form>
            )}

            {activeTab === 'transfer' && (
                <form onSubmit={handleCreateTransfer} style={formStyle}>
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Source Warehouse (From)</label>
                        <select value={trfForm.sourceWarehouse} onChange={e => setTrfForm({ ...trfForm, sourceWarehouse: e.target.value })} required style={inputStyle}>
                            <option value="">Select Source Warehouse</option>
                            {warehouses.map(w => <option key={w._id} value={w._id}>{w.name} ({w.code})</option>)}
                        </select>
                    </div>
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Destination Warehouse (To)</label>
                        <select value={trfForm.destinationWarehouse} onChange={e => setTrfForm({ ...trfForm, destinationWarehouse: e.target.value })} required style={inputStyle}>
                            <option value="">Select Destination Warehouse</option>
                            {warehouses.map(w => <option key={w._id} value={w._id}>{w.name} ({w.code})</option>)}
                        </select>
                    </div>
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Product Item</label>
                        <select value={trfForm.productId} onChange={e => setTrfForm({ ...trfForm, productId: e.target.value })} required style={inputStyle}>
                            <option value="">Select Product</option>
                            {products.map(p => <option key={p._id} value={p._id}>{p.name} (SKU: {p.sku})</option>)}
                        </select>
                    </div>
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Transfer Quantity</label>
                        <input type="number" value={trfForm.quantity} onChange={e => setTrfForm({ ...trfForm, quantity: e.target.value })} required style={inputStyle} />
                    </div>
                    <button type="submit" style={submitBtnStyle} className="col-span-2">Dispatch Stock Transfer Order</button>
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

const whCardStyle = {
    background: '#f8fafc',
    padding: '14px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0'
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

export default WarehouseManager;
