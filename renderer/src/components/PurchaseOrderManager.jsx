import { useEffect, useState } from 'react';
import { FaShoppingCart, FaTruck, FaCalculator, FaPlus, FaCheckCircle, FaFilePdf } from 'react-icons/fa';
import toast from 'react-hot-toast';
import InfoTooltip from './common/InfoTooltip';

const PurchaseOrderManager = () => {
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [activeTab, setActiveTab] = useState('list'); // 'list' | 'create'

    // PO Form
    const [poForm, setPoForm] = useState({
        supplierId: '',
        shippingCost: 0,
        customsFee: 0,
        notes: '',
        items: [{ productId: '', quantity: 1, unitPrice: 0 }]
    });

    const fetchData = async () => {
        try {
            const poRes = await fetch('http://localhost:5000/api/purchase-orders', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const poData = await poRes.json();
            if (poData.success) setPurchaseOrders(poData.pos || []);

            const suppRes = await fetch('http://localhost:5000/api/suppliers', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const suppData = await suppRes.json();
            if (suppData.success) setSuppliers(suppData.suppliers || []);

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

    const handleAddItemRow = () => {
        setPoForm({
            ...poForm,
            items: [...poForm.items, { productId: '', quantity: 1, unitPrice: 0 }]
        });
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...poForm.items];
        updatedItems[index][field] = value;

        if (field === 'productId') {
            const selProd = products.find(p => p._id === value);
            if (selProd) {
                updatedItems[index].unitPrice = selProd.purchasePrice || 0;
            }
        }
        setPoForm({ ...poForm, items: updatedItems });
    };

    const handleCreatePO = async (e) => {
        e.preventDefault();
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
                toast.success('Purchase Order issued with Landed Cost allocations!');
                setPoForm({
                    supplierId: '',
                    shippingCost: 0,
                    customsFee: 0,
                    notes: '',
                    items: [{ productId: '', quantity: 1, unitPrice: 0 }]
                });
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
                    <FaShoppingCart className="text-blue-600" /> Purchase Orders & Landed Cost Unit Allocation
                    <InfoTooltip 
                        title="ল্যান্ডেড কস্ট (Landed Cost) ইউনিট বণ্টন সূত্র" 
                        content="বিদেশ থেকে আমদানিকৃত কাঁচামাল বা পণ্যের জাহাজ ভাড়া (Freight Shipping) এবং কাস্টমস ফি (Customs Fees) মোট অর্ডারের সমস্ত পণ্যের এককের ওপর সমানভাবে বণ্টন করা হয়। এতে প্রতিটি পণ্যের প্রকৃত কেনা দাম (Effective Unit Cost) নিখুঁতভাবে নির্ধারিত হয়।" 
                        formula="Landed Cost per Unit = (Freight + Customs) / Total Bill Quantity"
                    />
                </h2>
            </div>

            <div style={tabNav}>
                <button onClick={() => setActiveTab('list')} style={activeTab === 'list' ? activeTabBtn : tabBtn}>Issued Purchase Orders ({purchaseOrders.length})</button>
                <button onClick={() => setActiveTab('create')} style={activeTab === 'create' ? activeTabBtn : tabBtn}>+ Issue New Purchase Order (PO)</button>
            </div>

            {/* TAB 1: LIST */}
            {activeTab === 'list' && (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table style={tableStyle}>
                        <thead style={tableHeaderStyle}>
                            <tr>
                                <th style={thStyle}>PO Number</th>
                                <th style={thStyle}>Supplier Name</th>
                                <th style={thStyle}>Total Bill</th>
                                <th style={thStyle}>Landed Cost (Freight+Customs)</th>
                                <th style={thStyle}>Effective Unit Price</th>
                                <th style={thStyle}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchaseOrders.map(po => (
                                <tr key={po._id}>
                                    <td style={tdStyle}><strong>{po.poNumber}</strong></td>
                                    <td style={tdStyle}>{po.supplier?.name || '-'}</td>
                                    <td style={tdStyle}>{po.totalAmount} SAR</td>
                                    <td style={tdStyle}><span className="text-amber-700 font-bold">{po.shippingCost + po.customsFee} SAR</span></td>
                                    <td style={tdStyle}>
                                        <div className="text-xs">
                                            {po.items?.map((it, i) => (
                                                <div key={i} className="text-emerald-700 font-bold">
                                                    {it.productName}: {it.effectiveUnitPrice?.toFixed(2)} SAR/unit
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-bold text-[10px]">{po.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* TAB 2: CREATE */}
            {activeTab === 'create' && (
                <form onSubmit={handleCreatePO} className="space-y-4 max-w-2xl bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <div>
                        <label className="block text-xs font-extrabold mb-1">Select Overseas / Local Supplier</label>
                        <select required value={poForm.supplierId} onChange={e => setPoForm({ ...poForm, supplierId: e.target.value })} style={inputStyle}>
                            <option value="">-- Choose Supplier --</option>
                            {suppliers.map(s => <option key={s._id} value={s._id}>{s.name} ({s.crNumber || 'Supplier'})</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-extrabold mb-1">Freight Shipping Cost (SAR)</label>
                            <input type="number" value={poForm.shippingCost} onChange={e => setPoForm({ ...poForm, shippingCost: e.target.value })} style={inputStyle} />
                        </div>
                        <div>
                            <label className="block text-xs font-extrabold mb-1">Customs Clearance Duty (SAR)</label>
                            <input type="number" value={poForm.customsFee} onChange={e => setPoForm({ ...poForm, customsFee: e.target.value })} style={inputStyle} />
                        </div>
                    </div>

                    {/* ITEMS ROW */}
                    <div className="space-y-3 pt-2">
                        <label className="block text-xs font-extrabold text-slate-700">Order Items & Base Unit Cost</label>
                        {poForm.items.map((row, idx) => (
                            <div key={idx} className="grid grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-slate-200">
                                <select required value={row.productId} onChange={e => handleItemChange(idx, 'productId', e.target.value)} style={inputStyle}>
                                    <option value="">Select Item</option>
                                    {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                </select>
                                <input type="number" min="1" placeholder="Qty" value={row.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} style={inputStyle} />
                                <input type="number" placeholder="Base Unit Price (SAR)" value={row.unitPrice} onChange={e => handleItemChange(idx, 'unitPrice', e.target.value)} style={inputStyle} />
                            </div>
                        ))}
                        <button type="button" onClick={handleAddItemRow} className="text-xs text-blue-600 font-bold hover:underline">+ Add Another Product Item</button>
                    </div>

                    <button type="submit" style={addBtnStyle}>Issue Purchase Order & Allocate Landed Cost</button>
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

export default PurchaseOrderManager;
