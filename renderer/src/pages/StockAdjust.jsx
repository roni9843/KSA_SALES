import React, { useState, useEffect, useRef } from 'react';
import { FaPlus, FaMinus, FaTrash, FaBox } from 'react-icons/fa';
import toast from 'react-hot-toast';
import AsyncSelect from 'react-select/async';
import { useAuth } from '../context/AuthContext';

const StockAdjust = () => {
    const { user } = useAuth();
    const [adjustmentId, setAdjustmentId] = useState('');
    const [adjustmentDate, setAdjustmentDate] = useState(new Date());
    const [items, setItems] = useState([]);
    const [selectKey, setSelectKey] = useState(0);
    const selectRef = useRef(null);

    useEffect(() => {
        const generateId = async () => {
            const id = await window.electron.ipcRenderer.invoke('generate-stock-adjustment-id');
            setAdjustmentId(id);
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
            type: 'add', // 'add' or 'subtract'
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
            adjusted_by: user.id,
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
            <h2><FaBox /> Stock Adjustment</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                <fieldset style={styles.fieldset}>
                    <legend style={styles.legend}>Adjustment Details</legend>
                    <div style={styles.grid}>
                        <div>
                            <label style={styles.label}>Adjustment No</label>
                            <input type="text" value={adjustmentId} readOnly style={{...styles.input, backgroundColor: '#E2E8F0'}} />
                        </div>
                        <div>
                            <label style={styles.label}>Date</label>
                            <input type="text" value={adjustmentDate.toLocaleDateString()} readOnly style={{...styles.input, backgroundColor: '#E2E8F0'}} />
                        </div>
                    </div>
                </fieldset>

                <fieldset style={styles.fieldset}>
                    <legend style={styles.legend}>Products</legend>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={styles.label}>Search and Add Product</label>
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
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Product</th>
                                <th style={styles.th}>Current Stock</th>
                                <th style={styles.th}>Type</th>
                                <th style={styles.th}>Quantity</th>
                                <th style={styles.th}>New Stock</th>
                                <th style={styles.th}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={index}>
                                    <td style={styles.td}>{item.name}</td>
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
                                            style={styles.input}
                                            min="1"
                                        />
                                    </td>
                                    <td style={styles.td}>{item.new_stock}</td>
                                    <td style={styles.td}>
                                        <button type="button" onClick={() => removeItem(index)} className="action-button">
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </fieldset>

                <button type="submit" className="default-button">Save Adjustment</button>
            </form>
        </div>
    );
};

const styles = {
    card: { background: '#2D3748', padding: '20px', borderRadius: '4px', color: '#fff' },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    fieldset: { border: '1px solid #4A5568', borderRadius: '8px', padding: '20px' },
    legend: { padding: '0 10px', color: '#E2E8F0', fontWeight: 'bold' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    label: { marginBottom: '8px', fontSize: '14px', color: '#A0AEC0', display: 'block' },
    input: { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #A0AEC0', backgroundColor: '#fff', color: '#333', boxSizing: 'border-box' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '12px', textAlign: 'left', borderBottom: '1px solid #4A5568', textTransform: 'uppercase', fontSize: '12px' },
    td: { padding: '12px', borderBottom: '1px solid #4A5568' },
};

export default StockAdjust;
