import { useEffect, useState } from 'react';
import { FaIndustry, FaCogs, FaBoxes, FaPlus, FaCheckCircle, FaTools } from 'react-icons/fa';
import toast from 'react-hot-toast';
import InfoTooltip from './common/InfoTooltip';

const ManufacturingManager = () => {
    const [activeTab, setActiveTab] = useState('boms'); // 'boms' | 'orders' | 'centers'
    const [boms, setBoms] = useState([]);
    const [orders, setOrders] = useState([]);
    const [workCenters, setWorkCenters] = useState([]);
    const [products, setProducts] = useState([]);
    const [warehouses, setWarehouses] = useState([]);

    // BOM Form
    const [bomForm, setBomForm] = useState({
        bomNumber: '',
        finishedGood: '',
        outputQuantity: 1,
        laborCost: 0,
        overheadCost: 0,
        rawMaterials: [{ productId: '', quantity: 1, unitCost: 0 }]
    });

    // MO Form
    const [moForm, setMoForm] = useState({
        bomId: '',
        plannedQuantity: 1,
        targetWarehouse: ''
    });

    const fetchData = async () => {
        try {
            const bomRes = await fetch('http://localhost:5000/api/boms', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const bomData = await bomRes.json();
            if (bomData.success) setBoms(bomData.boms || []);

            const moRes = await fetch('http://localhost:5000/api/manufacturing-orders', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const moData = await moRes.json();
            if (moData.success) setOrders(moData.orders || []);

            const wcRes = await fetch('http://localhost:5000/api/work-centers', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const wcData = await wcRes.json();
            if (wcData.success) setWorkCenters(wcData.workCenters || []);

            const prodRes = await fetch('http://localhost:5000/api/products', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const prodData = await prodRes.json();
            if (prodData.success) setProducts(prodData.products || []);

            const whRes = await fetch('http://localhost:5000/api/warehouses', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const whData = await whRes.json();
            if (whData.success) setWarehouses(whData.warehouses || []);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateBOM = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/boms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(bomForm)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('BOM Recipe formulation created!');
                setBomForm({
                    bomNumber: '',
                    finishedGood: '',
                    outputQuantity: 1,
                    laborCost: 0,
                    overheadCost: 0,
                    rawMaterials: [{ productId: '', quantity: 1, unitCost: 0 }]
                });
                fetchData();
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleCreateMO = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/manufacturing-orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(moForm)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Work Order issued!');
                setMoForm({ bomId: '', plannedQuantity: 1, targetWarehouse: '' });
                fetchData();
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleCompleteMO = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/manufacturing-orders/${id}/complete`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Work Order COMPLETED! Raw materials deducted & Finished Goods added to stock!');
                fetchData();
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div style={cardStyle}>
            <div style={headerStyle}>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <FaIndustry className="text-blue-600" /> Manufacturing Work Orders & BOM Engine
                    <InfoTooltip 
                        title="উৎপাদন রেসিপি (BOM) ও কস্টিং হিসাব" 
                        content="ফিনিশড গুডস তৈরি করতে কাঁচামালের খরচ, মেসিন খরচ ও শ্রমিক মজুরি যোগ করে রেসিপি দাম (Unit BOM Cost) নির্ধারণ করা হয়। ওয়ার্ক অর্ডার সম্পন্ন হলে র-ম্যাটেরিয়াল স্টক স্বয়ংক্রিয়ভাবে বিয়োগ হয় এবং উৎপাদিত পণ্যের স্টক যোগ হয়।" 
                        formula="Unit BOM Cost = [ Σ(Raw Material Qty × Unit Cost) + Labor + Overhead ] / Output Qty"
                    />
                </h2>
            </div>

            <div style={tabNav}>
                <button onClick={() => setActiveTab('boms')} style={activeTab === 'boms' ? activeTabBtn : tabBtn}>BOM Recipes ({boms.length})</button>
                <button onClick={() => setActiveTab('orders')} style={activeTab === 'orders' ? activeTabBtn : tabBtn}><FaCogs className="mr-1 inline text-xs" /> Work Orders ({orders.length})</button>
            </div>

            {/* TAB 1: BOMS */}
            {activeTab === 'boms' && (
                <div>
                    <form onSubmit={handleCreateBOM} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                        <div className="grid grid-cols-3 gap-3">
                            <input placeholder="BOM No (e.g. BOM-PANEL-01)" value={bomForm.bomNumber} onChange={e => setBomForm({ ...bomForm, bomNumber: e.target.value })} required style={inputStyle} />
                            <select value={bomForm.finishedGood} onChange={e => setBomForm({ ...bomForm, finishedGood: e.target.value })} required style={inputStyle}>
                                <option value="">Select Finished Product</option>
                                {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                            </select>
                            <input type="number" placeholder="Output Qty" value={bomForm.outputQuantity} onChange={e => setBomForm({ ...bomForm, outputQuantity: e.target.value })} required style={inputStyle} />
                        </div>
                        <button type="submit" style={addBtnStyle}>Save BOM Recipe</button>
                    </form>

                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table style={tableStyle}>
                            <thead style={tableHeaderStyle}>
                                <tr>
                                    <th style={thStyle}>BOM Code</th>
                                    <th style={thStyle}>Finished Good</th>
                                    <th style={thStyle}>Output Qty</th>
                                    <th style={thStyle}>Unit Production Cost</th>
                                </tr>
                            </thead>
                            <tbody>
                                {boms.map(b => (
                                    <tr key={b._id}>
                                        <td style={tdStyle}><strong>{b.bomNumber}</strong></td>
                                        <td style={tdStyle}>{b.finishedGood?.name || '-'}</td>
                                        <td style={tdStyle}>{b.outputQuantity} Pcs</td>
                                        <td style={tdStyle}><strong className="text-emerald-600">{b.unitBomCost} SAR / unit</strong></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 2: ORDERS */}
            {activeTab === 'orders' && (
                <div>
                    <form onSubmit={handleCreateMO} className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                        <select value={moForm.bomId} onChange={e => setMoForm({ ...moForm, bomId: e.target.value })} required style={inputStyle}>
                            <option value="">Select BOM Recipe</option>
                            {boms.map(b => <option key={b._id} value={b._id}>{b.bomNumber} ({b.finishedGood?.name})</option>)}
                        </select>
                        <input type="number" placeholder="Planned Qty" value={moForm.plannedQuantity} onChange={e => setMoForm({ ...moForm, plannedQuantity: e.target.value })} required style={inputStyle} />
                        <select value={moForm.targetWarehouse} onChange={e => setMoForm({ ...moForm, targetWarehouse: e.target.value })} required style={inputStyle}>
                            <option value="">Select Target Warehouse</option>
                            {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                        </select>
                        <button type="submit" style={addBtnStyle}>Issue Work Order</button>
                    </form>

                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table style={tableStyle}>
                            <thead style={tableHeaderStyle}>
                                <tr>
                                    <th style={thStyle}>MO Number</th>
                                    <th style={thStyle}>BOM Recipe</th>
                                    <th style={thStyle}>Planned Qty</th>
                                    <th style={thStyle}>Target Hub</th>
                                    <th style={thStyle}>Status</th>
                                    <th style={thStyle}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(o => (
                                    <tr key={o._id}>
                                        <td style={tdStyle}><strong>{o.moNumber}</strong></td>
                                        <td style={tdStyle}>{o.bom?.bomNumber || '-'}</td>
                                        <td style={tdStyle}>{o.plannedQuantity} Pcs</td>
                                        <td style={tdStyle}>{o.targetWarehouse?.name || '-'}</td>
                                        <td style={tdStyle}>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${o.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {o.status}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            {o.status !== 'COMPLETED' && (
                                                <button onClick={() => handleCompleteMO(o._id)} className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px]">Complete Work Order</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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

export default ManufacturingManager;
