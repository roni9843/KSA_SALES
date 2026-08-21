import { useEffect, useState } from 'react';
import { FaIndustry, FaCogs, FaTools, FaPlus, FaCheckCircle, FaPlayCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ManufacturingManager = () => {
    const [activeTab, setActiveTab] = useState('boms'); // 'boms' | 'orders' | 'work_centers'
    const [boms, setBoms] = useState([]);
    const [orders, setOrders] = useState([]);
    const [workCenters, setWorkCenters] = useState([]);
    const [products, setProducts] = useState([]);
    const [warehouses, setWarehouses] = useState([]);

    // BOM Form
    const [bomForm, setBomForm] = useState({
        finishedGood: '',
        outputQuantity: 1,
        laborCost: 0,
        overheadCost: 0,
        rawMaterials: []
    });
    const [newRaw, setNewRaw] = useState({ productId: '', quantity: 1 });

    // MO Form
    const [moForm, setMoForm] = useState({ bomId: '', plannedQuantity: 1, targetWarehouse: '' });

    // WorkCenter Form
    const [wcForm, setWcForm] = useState({ code: '', name: '', hourlyRate: 50, capacityPerDay: 8 });

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
            if (wcData.success) setWorkCenters(wcData.centers || []);

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

    const handleAddRawMaterial = () => {
        if (!newRaw.productId) return;
        const prod = products.find(p => p._id === newRaw.productId);
        setBomForm({
            ...bomForm,
            rawMaterials: [
                ...bomForm.rawMaterials,
                {
                    productId: newRaw.productId,
                    productName: prod?.name || 'Raw Item',
                    quantity: parseFloat(newRaw.quantity),
                    unitCost: prod?.purchasePrice || 0
                }
            ]
        });
        setNewRaw({ productId: '', quantity: 1 });
    };

    const handleCreateBOM = async (e) => {
        e.preventDefault();
        if (bomForm.rawMaterials.length === 0) return toast.error('Add at least 1 raw material.');
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
                toast.success('BOM Recipe created successfully!');
                setBomForm({ finishedGood: '', outputQuantity: 1, laborCost: 0, overheadCost: 0, rawMaterials: [] });
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
                toast.success('Manufacturing Work Order issued!');
                setMoForm({ bomId: '', plannedQuantity: 1, targetWarehouse: '' });
                fetchData();
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleUpdateMOStatus = async (id, status) => {
        try {
            const res = await fetch(`http://localhost:5000/api/manufacturing-orders/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Work Order marked as ${status}! Raw stock deducted & finished goods updated.`);
                fetchData();
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleCreateWC = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/work-centers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(wcForm)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Work Center added!');
                setWcForm({ code: '', name: '', hourlyRate: 50, capacityPerDay: 8 });
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
                    <FaIndustry className="text-blue-600" /> Manufacturing, BOM & Work Centers
                </h2>
            </div>

            <div style={tabNav}>
                <button onClick={() => setActiveTab('boms')} style={activeTab === 'boms' ? activeTabBtn : tabBtn}>Bill of Materials (BOM Recipes: {boms.length})</button>
                <button onClick={() => setActiveTab('orders')} style={activeTab === 'orders' ? activeTabBtn : tabBtn}><FaCogs className="mr-1 inline text-xs" /> Work Orders ({orders.length})</button>
                <button onClick={() => setActiveTab('work_centers')} style={activeTab === 'work_centers' ? activeTabBtn : tabBtn}><FaTools className="mr-1 inline text-xs" /> Work Centers ({workCenters.length})</button>
            </div>

            {/* TAB 1: BOM RECIPES */}
            {activeTab === 'boms' && (
                <div>
                    <form onSubmit={handleCreateBOM} className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 space-y-3">
                        <div className="grid grid-cols-4 gap-3">
                            <div>
                                <label className="text-xs font-bold text-slate-600 block">Target Finished Good</label>
                                <select value={bomForm.finishedGood} onChange={e => setBomForm({ ...bomForm, finishedGood: e.target.value })} required style={inputStyle}>
                                    <option value="">Select Finished Product</option>
                                    {products.map(p => <option key={p._id} value={p._id}>{p.name} ({p.code})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600 block">Output Quantity</label>
                                <input type="number" value={bomForm.outputQuantity} onChange={e => setBomForm({ ...bomForm, outputQuantity: e.target.value })} required style={inputStyle} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600 block">Labor Cost (SAR)</label>
                                <input type="number" value={bomForm.laborCost} onChange={e => setBomForm({ ...bomForm, laborCost: e.target.value })} style={inputStyle} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600 block">Overhead Cost (SAR)</label>
                                <input type="number" value={bomForm.overheadCost} onChange={e => setBomForm({ ...bomForm, overheadCost: e.target.value })} style={inputStyle} />
                            </div>
                        </div>

                        {/* Raw items builder */}
                        <div className="flex gap-2 pt-2">
                            <select value={newRaw.productId} onChange={e => setNewRaw({ ...newRaw, productId: e.target.value })} style={inputStyle}>
                                <option value="">Select Raw Material Component</option>
                                {products.map(p => <option key={p._id} value={p._id}>{p.name} (Stock: {p.quantityInStock})</option>)}
                            </select>
                            <input type="number" placeholder="Qty" value={newRaw.quantity} onChange={e => setNewRaw({ ...newRaw, quantity: e.target.value })} style={{ ...inputStyle, width: '100px' }} />
                            <button type="button" onClick={handleAddRawMaterial} style={addBtnStyle}>+ Add Component</button>
                        </div>

                        {bomForm.rawMaterials.map((rm, idx) => (
                            <div key={idx} className="flex justify-between text-xs bg-white p-2 rounded border">
                                <span><strong>{rm.productName}:</strong> {rm.quantity} units @ {rm.unitCost} SAR</span>
                                <strong>= {rm.quantity * rm.unitCost} SAR</strong>
                            </div>
                        ))}

                        <button type="submit" style={addBtnStyle} className="w-full py-2.5">+ Save BOM Recipe Formulation</button>
                    </form>

                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table style={tableStyle}>
                            <thead style={tableHeaderStyle}>
                                <tr>
                                    <th style={thStyle}>BOM No</th>
                                    <th style={thStyle}>Finished Product</th>
                                    <th style={thStyle}>Raw Components</th>
                                    <th style={thStyle}>Total BOM Cost</th>
                                    <th style={thStyle}>Unit Cost</th>
                                </tr>
                            </thead>
                            <tbody>
                                {boms.map(b => (
                                    <tr key={b._id}>
                                        <td style={tdStyle}><strong>{b.bomNumber}</strong></td>
                                        <td style={tdStyle}>{b.finishedGood?.name || '-'}</td>
                                        <td style={tdStyle}>{b.rawMaterials?.length || 0} Raw Items</td>
                                        <td style={tdStyle}><strong>{b.totalBomCost} SAR</strong></td>
                                        <td style={tdStyle}><strong className="text-blue-600">{b.unitBomCost} SAR / unit</strong></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 2: WORK ORDERS */}
            {activeTab === 'orders' && (
                <div>
                    <form onSubmit={handleCreateMO} className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                        <select value={moForm.bomId} onChange={e => setMoForm({ ...moForm, bomId: e.target.value })} required style={inputStyle}>
                            <option value="">Select BOM Recipe</option>
                            {boms.map(b => <option key={b._id} value={b._id}>{b.bomNumber} - ({b.finishedGood?.name})</option>)}
                        </select>
                        <input type="number" placeholder="Planned Qty" value={moForm.plannedQuantity} onChange={e => setMoForm({ ...moForm, plannedQuantity: e.target.value })} required style={inputStyle} />
                        <select value={moForm.targetWarehouse} onChange={e => setMoForm({ ...moForm, targetWarehouse: e.target.value })} required style={inputStyle}>
                            <option value="">Select Target Warehouse</option>
                            {warehouses.map(w => <option key={w._id} value={w._id}>{w.name} ({w.code})</option>)}
                        </select>
                        <button type="submit" style={addBtnStyle}>+ Issue Work Order</button>
                    </form>

                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table style={tableStyle}>
                            <thead style={tableHeaderStyle}>
                                <tr>
                                    <th style={thStyle}>MO Number</th>
                                    <th style={thStyle}>Target Product</th>
                                    <th style={thStyle}>Planned Qty</th>
                                    <th style={thStyle}>Target Warehouse</th>
                                    <th style={thStyle}>Status</th>
                                    <th style={thStyle}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(o => (
                                    <tr key={o._id}>
                                        <td style={tdStyle}><strong>{o.moNumber}</strong></td>
                                        <td style={tdStyle}>{o.finishedGood?.name || '-'}</td>
                                        <td style={tdStyle}><strong>{o.plannedQuantity} Units</strong></td>
                                        <td style={tdStyle}>{o.targetWarehouse?.name || '-'}</td>
                                        <td style={tdStyle}>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${o.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {o.status}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            {o.status === 'DRAFT' && (
                                                <button onClick={() => handleUpdateMOStatus(o._id, 'IN_PROGRESS')} className="px-2 py-1 bg-blue-600 text-white rounded text-[10px]">Start Production</button>
                                            )}
                                            {o.status === 'IN_PROGRESS' && (
                                                <button onClick={() => handleUpdateMOStatus(o._id, 'COMPLETED')} className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold">Complete & Deduct Raw Stock</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 3: WORK CENTERS */}
            {activeTab === 'work_centers' && (
                <div>
                    <form onSubmit={handleCreateWC} className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                        <input placeholder="Code (e.g. WC-01)" value={wcForm.code} onChange={e => setWcForm({ ...wcForm, code: e.target.value })} required style={inputStyle} />
                        <input placeholder="Machine / Shop Name" value={wcForm.name} onChange={e => setWcForm({ ...wcForm, name: e.target.value })} required style={inputStyle} />
                        <input type="number" placeholder="Hourly Rate (SAR)" value={wcForm.hourlyRate} onChange={e => setWcForm({ ...wcForm, hourlyRate: e.target.value })} required style={inputStyle} />
                        <button type="submit" style={addBtnStyle}>+ Add Work Center</button>
                    </form>

                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table style={tableStyle}>
                            <thead style={tableHeaderStyle}>
                                <tr>
                                    <th style={thStyle}>Code</th>
                                    <th style={thStyle}>Work Center Name</th>
                                    <th style={thStyle}>Hourly Rate</th>
                                    <th style={thStyle}>Daily Capacity</th>
                                    <th style={thStyle}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {workCenters.map(wc => (
                                    <tr key={wc._id}>
                                        <td style={tdStyle}><strong>{wc.code}</strong></td>
                                        <td style={tdStyle}>{wc.name}</td>
                                        <td style={tdStyle}><strong>{wc.hourlyRate} SAR / hr</strong></td>
                                        <td style={tdStyle}>{wc.capacityPerDay} hours / day</td>
                                        <td style={tdStyle}><span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">{wc.status}</span></td>
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
