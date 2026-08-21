import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Switch from './common/Switch';
import { FaBox, FaLayerGroup, FaBarcode, FaCogs, FaPlus, FaTrash } from 'react-icons/fa';

const AddProduct = ({ onAdded }) => {
    const [activeTab, setActiveTab] = useState('basic'); // 'basic' | 'units' | 'tracking'
    const [form, setForm] = useState({
        name: '',
        sku: '',
        category_id: '',
        description: '',
        productType: 'STANDARD',
        purchase_price: '',
        sale_price: '',
        quantity_in_stock: 0,
        unit: 'PCS',
        subUnits: [],
        tax: '0',
        code: '',
        barcode: '',
        active: true,
        isSerialTracked: false,
        isBatchTracked: false
    });

    const [categories, setCategories] = useState([]);
    const [taxes, setTaxes] = useState([]);
    const [newSubUnit, setNewSubUnit] = useState({ unitName: 'Box', multiplier: 10 });

    useEffect(() => {
        async function fetchCategories() {
            const data = await window.electron.ipcRenderer.invoke('get-categories');
            setCategories(data || []);
        }
        async function fetchTaxes() {
            const res = await window.electron.ipcRenderer.invoke('get-taxes');
            setTaxes(res || []);
        }
        fetchCategories();
        fetchTaxes();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };

    const handleAddSubUnit = () => {
        if (!newSubUnit.unitName || !newSubUnit.multiplier) return;
        setForm({ ...form, subUnits: [...form.subUnits, newSubUnit] });
        setNewSubUnit({ unitName: 'Box', multiplier: 10 });
    };

    const handleRemoveSubUnit = (index) => {
        const updated = [...form.subUnits];
        updated.splice(index, 1);
        setForm({ ...form, subUnits: updated });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await window.electron.ipcRenderer.invoke('add-product', form);
            toast.success('Product added successfully');
            if (onAdded) onAdded();
            setForm({
                name: '',
                sku: '',
                category_id: '',
                description: '',
                productType: 'STANDARD',
                purchase_price: '',
                sale_price: '',
                quantity_in_stock: 0,
                unit: 'PCS',
                subUnits: [],
                tax: '0',
                code: '',
                barcode: '',
                active: true,
                isSerialTracked: false,
                isBatchTracked: false
            });
            setActiveTab('basic');
        } catch (err) {
            toast.error(err.message || 'An error occurred while adding the product.');
        }
    };

    return (
        <div style={cardStyle}>
            <div style={headerStyle}>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <FaBox className="text-blue-600" /> Add Product Master
                </h2>
                <div style={typeToggleStyle}>
                    <button
                        type="button"
                        onClick={() => setForm({ ...form, productType: 'STANDARD' })}
                        style={form.productType === 'STANDARD' ? activeTypeBtn : inactiveTypeBtn}
                    >
                        Standard Inventory Item
                    </button>
                    <button
                        type="button"
                        onClick={() => setForm({ ...form, productType: 'SERVICE' })}
                        style={form.productType === 'SERVICE' ? activeTypeBtn : inactiveTypeBtn}
                    >
                        Service Item
                    </button>
                    <button
                        type="button"
                        onClick={() => setForm({ ...form, productType: 'BUNDLE' })}
                        style={form.productType === 'BUNDLE' ? activeTypeBtn : inactiveTypeBtn}
                    >
                        Combo Bundle Kit
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div style={tabBarNav}>
                <button
                    type="button"
                    onClick={() => setActiveTab('basic')}
                    style={activeTab === 'basic' ? activeTabStyle : inactiveTabStyle}
                >
                    <FaBox className="mr-2" /> 1. Basic & Pricing
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('units')}
                    style={activeTab === 'units' ? activeTabStyle : inactiveTabStyle}
                >
                    <FaLayerGroup className="mr-2" /> 2. Units & Conversions ({form.subUnits.length})
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('tracking')}
                    style={activeTab === 'tracking' ? activeTabStyle : inactiveTabStyle}
                >
                    <FaBarcode className="mr-2" /> 3. Serial / Batch Tracking
                </button>
            </div>

            <form onSubmit={handleSubmit} style={formContainerStyle}>
                {/* TAB 1: BASIC & PRICING */}
                {activeTab === 'basic' && (
                    <div style={gridTwoCol}>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Product Name <span style={{ color: 'red' }}>*</span></label>
                            <input name="name" placeholder="Enter product name" value={form.name} onChange={handleChange} required style={inputStyle} />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>SKU Code <span style={{ color: 'red' }}>*</span></label>
                            <input name="sku" placeholder="Enter SKU" value={form.sku} onChange={handleChange} required style={inputStyle} />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Category</label>
                            <select name="category_id" value={form.category_id} onChange={handleChange} required style={inputStyle}>
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Primary Base Unit</label>
                            <input name="unit" placeholder="e.g. PCS, KG, Meter" value={form.unit} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Purchase Price (Cost)</label>
                            <input type="number" step="0.01" name="purchase_price" placeholder="0.00" value={form.purchase_price} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Sale Price (MSRP) <span style={{ color: 'red' }}>*</span></label>
                            <input type="number" step="0.01" name="sale_price" placeholder="0.00" value={form.sale_price} onChange={handleChange} required style={inputStyle} />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Tax Bracket</label>
                            <select name="tax" value={form.tax} onChange={handleChange} style={inputStyle}>
                                <option value="0">No Tax (0%)</option>
                                {taxes.map(t => <option key={t.id} value={t.tax_percentage}>{t.tax_label} ({t.tax_percentage}%)</option>)}
                            </select>
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Barcode Scan Code</label>
                            <input name="barcode" placeholder="Scan EAN/UPC barcode" value={form.barcode} onChange={handleChange} style={inputStyle} />
                        </div>
                    </div>
                )}

                {/* TAB 2: UNITS & MULTIPLIERS */}
                {activeTab === 'units' && (
                    <div>
                        <div style={addressBoxStyle}>
                            <h4 className="text-sm font-bold text-slate-800 mb-2">Define Sub-Unit Multipliers (e.g. 1 Box = 12 PCS)</h4>
                            <div className="flex gap-2">
                                <input placeholder="Unit Name (e.g. Box, Carton)" value={newSubUnit.unitName} onChange={e => setNewSubUnit({ ...newSubUnit, unitName: e.target.value })} style={inputStyle} />
                                <input type="number" placeholder="Multiplier (e.g. 12)" value={newSubUnit.multiplier} onChange={e => setNewSubUnit({ ...newSubUnit, multiplier: parseFloat(e.target.value) })} style={inputStyle} />
                                <button type="button" onClick={handleAddSubUnit} style={addAddrBtn}>
                                    <FaPlus className="mr-1" /> Add Sub-Unit
                                </button>
                            </div>
                        </div>

                        <div className="mt-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Configured Sub-Units</h4>
                            {form.subUnits.length === 0 ? (
                                <p className="text-xs text-slate-400 italic">No sub-units defined. Primary unit will be used exclusively.</p>
                            ) : (
                                form.subUnits.map((su, idx) => (
                                    <div key={idx} style={addressItemStyle}>
                                        <div>
                                            <strong className="text-sm text-slate-800">1 {su.unitName}:</strong> <span className="text-xs text-slate-600 font-bold">= {su.multiplier} {form.unit || 'PCS'}</span>
                                        </div>
                                        <button type="button" onClick={() => handleRemoveSubUnit(idx)} className="text-rose-500 hover:text-rose-700 text-xs">
                                            <FaTrash />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 3: TRACKING & SERIALS */}
                {activeTab === 'tracking' && (
                    <div style={gridTwoCol}>
                        <div style={addressBoxStyle}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800">Serial Number / IMEI Tracking</h4>
                                    <p className="text-xs text-slate-500">Require unique serial/IMEI scanning during billing & warranty.</p>
                                </div>
                                <Switch name="isSerialTracked" checked={form.isSerialTracked} onChange={handleChange} />
                            </div>
                        </div>

                        <div style={addressBoxStyle}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800">Batch & FEFO Expiry Tracking</h4>
                                    <p className="text-xs text-slate-500">Enforce First-Expired-First-Out batch selection on invoices.</p>
                                </div>
                                <Switch name="isBatchTracked" checked={form.isBatchTracked} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                )}

                <div style={submitRowStyle}>
                    <button type="submit" style={submitBtnStyle}>
                        Save Product Master
                    </button>
                </div>
            </form>
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '12px',
};

const typeToggleStyle = {
    display: 'flex',
    gap: '6px',
    background: '#f1f5f9',
    padding: '4px',
    borderRadius: '10px'
};

const activeTypeBtn = {
    padding: '6px 12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer'
};

const inactiveTypeBtn = {
    padding: '6px 12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748b',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer'
};

const tabBarNav = {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    borderBottom: '2px solid #e2e8f0'
};

const activeTabStyle = {
    padding: '10px 16px',
    border: 'none',
    borderBottom: '3px solid #2563eb',
    backgroundColor: 'transparent',
    color: '#2563eb',
    fontWeight: '800',
    fontSize: '13px',
    cursor: 'pointer'
};

const inactiveTabStyle = {
    padding: '10px 16px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748b',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer'
};

const formContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
};

const gridTwoCol = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '14px'
};

const inputGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
};

const labelStyle = {
    marginBottom: '6px',
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

const addAddrBtn = {
    padding: '8px 14px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
};

const addressItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    borderRadius: '8px',
    background: '#f1f5f9',
    marginBottom: '8px'
};

const submitRowStyle = {
    marginTop: '16px'
};

const submitBtnStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
};

export default AddProduct;