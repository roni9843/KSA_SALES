import { useState, useEffect, useRef } from 'react';
import { FaTrash, FaBox } from 'react-icons/fa';
import toast from 'react-hot-toast';
import AsyncSelect from 'react-select/async';
import { useAuthStore } from '../store/authStore';

const StockAdjust = () => {
    const { user } = useAuthStore();
    const [adjustmentId, setAdjustmentId] = useState('');
    const [adjustmentDate] = useState(new Date());
    const [items, setItems] = useState([]);
    const [selectKey, setSelectKey] = useState(0);
    const selectRef = useRef(null);

    useEffect(() => {
        const generateId = async () => {
            const id = await window.electron.ipcRenderer.invoke('generate-stock-adjustment-id');
            setAdjustmentId(id || '');
        };
        generateId();
    }, []);

    const loadProductOptions = async (inputValue) => {
        if (inputValue.length < 2) return [];
        try {
            const results = await window.electron.ipcRenderer.invoke('search-products', inputValue);
            return results.map(p => ({
                value: p.id,
                label: `${p.name} (SKU: ${p.sku}) - Stock: ${p.quantity_in_stock}`,
                product: p
            }));
        } catch (error) {
            toast.error('Failed to search for products.');
            return [];
        }
    };

    const handleProductSelect = (selectedOption) => {
        if (!selectedOption) return;

        const product = selectedOption.product;
        if (items.find(item => item.product_id === product.id)) {
            toast.error('Product already added.');
            return;
        }

        const newItem = {
            product_id: product.id,
            name: product.name,
            current_stock: product.quantity_in_stock,
            type: 'add',
            quantity: 1,
            new_stock: product.quantity_in_stock + 1
        };

        setItems([...items, newItem]);
        setSelectKey(prevKey => prevKey + 1);
        if (selectRef.current) {
            selectRef.current.clearValue();
        }
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...items];
        const item = updatedItems[index];
        item[field] = value;

        const qty = parseInt(item.quantity, 10) || 0;
        if (item.type === 'add') {
            item.new_stock = item.current_stock + qty;
        } else {
            item.new_stock = item.current_stock - qty;
        }

        setItems(updatedItems);
    };

    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (items.length === 0) {
            toast.error('Please add at least one product.');
            return;
        }

        const adjustmentData = {
            adjustment_no: adjustmentId,
            adjustment_date: adjustmentDate.toISOString().slice(0, 10),
            adjusted_by: user?.id || 'user',
            items: items.map(i => ({ ...i, quantity: parseInt(i.quantity, 10) }))
        };

        try {
            await window.electron.ipcRenderer.invoke('add-stock-adjustment', adjustmentData);
            toast.success('Stock adjustment saved successfully');
            const newId = await window.electron.ipcRenderer.invoke('generate-stock-adjustment-id');
            setAdjustmentId(newId);
            setItems([]);
        } catch (err) {
            toast.error(err.message || 'Failed to save stock adjustment.');
        }
    };

    return (
        <div style={styles.card}>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 mb-4 border-b border-slate-200 pb-3">
                <FaBox className="text-blue-600" /> Inventory Stock Adjustment
            </h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                <fieldset style={styles.fieldset}>
                    <legend style={styles.legend}>Adjustment Details</legend>
                    <div style={styles.grid}>
                        <div>
                            <label style={styles.label}>Adjustment No</label>
                            <input type="text" value={adjustmentId} readOnly style={{...styles.input, backgroundColor: '#f1f5f9'}} />
                        </div>
                        <div>
                            <label style={styles.label}>Date</label>
                            <input type="text" value={adjustmentDate.toLocaleDateString()} readOnly style={{...styles.input, backgroundColor: '#f1f5f9'}} />
                        </div>
                    </div>
                </fieldset>

                <fieldset style={styles.fieldset}>
                    <legend style={styles.legend}>Products to Adjust</legend>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={styles.label}>Search & Add Product</label>
                        <AsyncSelect
                            key={selectKey}
                            ref={selectRef}
                            cacheOptions
                            defaultOptions
                            loadOptions={loadProductOptions}
                            onChange={handleProductSelect}
                            placeholder="Type to search for a product..."
                            isClearable
                        />
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-slate-200 mt-3">
                        <table style={styles.table}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8fafc' }}>
                                    <th style={styles.th}>Product Name</th>
                                    <th style={styles.th}>Current Stock</th>
                                    <th style={styles.th}>Adjustment Type</th>
                                    <th style={styles.th}>Quantity</th>
                                    <th style={styles.th}>New Stock</th>
                                    <th style={{ ...styles.th, textAlign: 'center' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-slate-500 text-sm">Search and add products above to adjust stock.</td>
                                    </tr>
                                ) : (
                                    items.map((item, index) => (
                                        <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                            <td style={{ ...styles.td, fontWeight: '700', color: '#0f172a' }}>{item.name}</td>
                                            <td style={styles.td}>{item.current_stock}</td>
                                            <td style={styles.td}>
                                                <select value={item.type} onChange={(e) => handleItemChange(index, 'type', e.target.value)} style={styles.input}>
                                                    <option value="add">Add (+)</option>
                                                    <option value="subtract">Subtract (-)</option>
                                                </select>
                                            </td>
                                            <td style={styles.td}>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                    style={{ ...styles.input, width: '80px' }}
                                                    min="1"
                                                />
                                            </td>
                                            <td style={{ ...styles.td, fontWeight: '700', color: item.type === 'add' ? '#10b981' : '#ef4444' }}>{item.new_stock}</td>
                                            <td style={{ ...styles.td, textAlign: 'center' }}>
                                                <button type="button" onClick={() => removeItem(index)} className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors">
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </fieldset>

                <button type="submit" className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md transition-all">Save Stock Adjustment</button>
            </form>
        </div>
    );
};

const styles = {
    card: { background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    fieldset: { border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', backgroundColor: '#f8fafc' },
    legend: { padding: '0 10px', color: '#0f172a', fontWeight: '800', fontSize: '15px' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    label: { marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#475569', display: 'block' },
    input: { width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '14px', boxSizing: 'border-box', outline: 'none' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', textTransform: 'uppercase', fontSize: '11px', fontWeight: '700', color: '#475569' },
    td: { padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#334155', fontSize: '14px' },
};

export default StockAdjust;
