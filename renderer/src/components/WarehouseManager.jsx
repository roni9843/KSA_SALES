import { useEffect, useState } from 'react';
import { FaWarehouse, FaExchangeAlt, FaPlus, FaBoxes, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import InfoTooltip from './common/InfoTooltip';

const WarehouseManager = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [products, setProducts] = useState([]);
    const [activeTab, setActiveTab] = useState('list'); // 'list' | 'create' | 'transfer'
    
    // Create Warehouse Form
    const [whForm, setWhForm] = useState({ code: '', name: '', address: '', managerName: '', phone: '' });

    // Transfer Stock Form
    const [transferForm, setTransferForm] = useState({
        productId: '',
        fromWarehouse: '',
        toWarehouse: '',
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

    const handleCreateWarehouse = async (e) => {
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
                toast.success('Warehouse created successfully!');
                setWhForm({ code: '', name: '', address: '', managerName: '', phone: '' });
                fetchData();
                setActiveTab('list');
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleTransferStock = async (e) => {
        e.preventDefault();
        if (transferForm.fromWarehouse === transferForm.toWarehouse) {
            return toast.error('Source and Destination Warehouses must be different!');
        }

        try {
            const res = await fetch('http://localhost:5000/api/warehouses/transfer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(transferForm)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Stock transfer completed successfully!');
                setTransferForm({ productId: '', fromWarehouse: '', toWarehouse: '', quantity: 1, notes: '' });
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
                    <FaWarehouse className="text-blue-600" /> Multi-Warehouse & Inter-Stock Transfer Engine
                    <InfoTooltip 
                        title="মাল্টি-ওয়্যারহাউস ও ইনভেন্টরি ট্রান্সফার লজিক" 
                        content="এই মডিউলের মাধ্যমে একাধিক গুদাম/শাখা পরিচালনা করা যায় এবং এক গুদাম থেকে অন্য গুদামে পণ্যের রিয়েল-টাইম স্টক স্থানান্তর করা হয়। ট্রান্সফার সফল হলে উৎস গুদামের স্টক কমে এবং গন্তব্য গুদামে যোগ হয়।" 
                        formula="Destination Stock = Previous Stock + Transferred Qty"
                    />
                </h2>
            </div>

            <div style={tabNav}>
                <button onClick={() => setActiveTab('list')} style={activeTab === 'list' ? activeTabBtn : tabBtn}>Warehouses List ({warehouses.length})</button>
                <button onClick={() => setActiveTab('create')} style={activeTab === 'create' ? activeTabBtn : tabBtn}>+ Add Warehouse</button>
                <button onClick={() => setActiveTab('transfer')} style={activeTab === 'transfer' ? activeTabBtn : tabBtn}><FaExchangeAlt className="mr-1 inline text-xs" /> Inter-Warehouse Stock Transfer</button>
            </div>

            {/* TAB 1: LIST */}
            {activeTab === 'list' && (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table style={tableStyle}>
                        <thead style={tableHeaderStyle}>
                            <tr>
                                <th style={thStyle}>Code</th>
                                <th style={thStyle}>Warehouse Name</th>
                                <th style={thStyle}>Location Address</th>
                                <th style={thStyle}>Manager</th>
                                <th style={thStyle}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {warehouses.map(w => (
                                <tr key={w._id}>
                                    <td style={tdStyle}><strong>{w.code}</strong></td>
                                    <td style={tdStyle}>{w.name}</td>
                                    <td style={tdStyle}>{w.address || '-'}</td>
                                    <td style={tdStyle}>{w.managerName} ({w.phone})</td>
                                    <td style={tdStyle}>
                                        {w.isDefault ? (
                                            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-extrabold text-[10px]">DEFAULT HUB</span>
                                        ) : (
                                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-extrabold text-[10px]">ACTIVE</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* TAB 2: CREATE */}
            {activeTab === 'create' && (
                <form onSubmit={handleCreateWarehouse} className="space-y-4 max-w-xl">
                    <div>
                        <label className="block text-xs font-extrabold mb-1">Warehouse Code</label>
                        <input required placeholder="e.g. WH-RUH-01" value={whForm.code} onChange={e => setWhForm({ ...whForm, code: e.target.value })} style={inputStyle} />
                    </div>
                    <div>
                        <label className="block text-xs font-extrabold mb-1">Warehouse Name</label>
                        <input required placeholder="e.g. Riyadh Central Logistics Hub" value={whForm.name} onChange={e => setWhForm({ ...whForm, name: e.target.value })} style={inputStyle} />
                    </div>
                    <div>
                        <label className="block text-xs font-extrabold mb-1">Location Address</label>
                        <input placeholder="e.g. Exit 18, Industrial Area, Riyadh" value={whForm.address} onChange={e => setWhForm({ ...whForm, address: e.target.value })} style={inputStyle} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-extrabold mb-1">Manager Name</label>
                            <input placeholder="Manager Name" value={whForm.managerName} onChange={e => setWhForm({ ...whForm, managerName: e.target.value })} style={inputStyle} />
                        </div>
                        <div>
                            <label className="block text-xs font-extrabold mb-1">Contact Phone</label>
                            <input placeholder="+966 50 123 4567" value={whForm.phone} onChange={e => setWhForm({ ...whForm, phone: e.target.value })} style={inputStyle} />
                        </div>
                    </div>
                    <button type="submit" style={addBtnStyle}>Save Warehouse</button>
                </form>
            )}

            {/* TAB 3: TRANSFER */}
            {activeTab === 'transfer' && (
                <form onSubmit={handleTransferStock} className="space-y-4 max-w-xl bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <div>
                        <label className="block text-xs font-extrabold mb-1">Select Product to Transfer</label>
                        <select required value={transferForm.productId} onChange={e => setTransferForm({ ...transferForm, productId: e.target.value })} style={inputStyle}>
                            <option value="">-- Choose Product --</option>
                            {products.map(p => (
                                <option key={p._id} value={p._id}>{p.name} (In Stock: {p.quantityInStock} {p.unit})</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-extrabold mb-1">Source Warehouse (From)</label>
                            <select required value={transferForm.fromWarehouse} onChange={e => setTransferForm({ ...transferForm, fromWarehouse: e.target.value })} style={inputStyle}>
                                <option value="">-- Select Source --</option>
                                {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-extrabold mb-1">Destination Warehouse (To)</label>
                            <select required value={transferForm.toWarehouse} onChange={e => setTransferForm({ ...transferForm, toWarehouse: e.target.value })} style={inputStyle}>
                                <option value="">-- Select Destination --</option>
                                {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-extrabold mb-1">Quantity to Transfer</label>
                        <input type="number" min="1" required value={transferForm.quantity} onChange={e => setTransferForm({ ...transferForm, quantity: e.target.value })} style={inputStyle} />
                    </div>

                    <div>
                        <label className="block text-xs font-extrabold mb-1">Transfer Memo / Remarks</label>
                        <textarea placeholder="e.g. Urgently needed for Neom Project site" value={transferForm.notes} onChange={e => setTransferForm({ ...transferForm, notes: e.target.value })} style={{ ...inputStyle, height: '70px' }} />
                    </div>

                    <button type="submit" style={addBtnStyle}>Execute Stock Transfer</button>
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

const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontSize: '13px',
    outline: 'none',
};

const addBtnStyle = {
    padding: '8px 14px',
    borderRadius: '8px',
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
