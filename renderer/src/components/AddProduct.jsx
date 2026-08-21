import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Switch from './common/Switch';
import { FaBox } from 'react-icons/fa';

const AddProduct = ({ onAdded }) => {
    const [form, setForm] = useState({
        name: '',
        sku: '',
        category_id: '',
        description: '',
        purchase_price: '',
        sale_price: '',
        quantity_in_stock: 0,
        unit: '',
        tax: '0',
        code: '',
        barcode: '',
        active: true,
        default_quantity: false
    });

    const [categories, setCategories] = useState([]);
    const [taxes, setTaxes] = useState([]);

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
                purchase_price: '',
                sale_price: '',
                quantity_in_stock: 0,
                unit: '',
                tax: '0',
                code: '',
                barcode: '',
                active: true,
                default_quantity: false
            });
        } catch (err) {
            toast.error(err.message || 'An error occurred while adding the product.');
        }
    };

    return (
        <div style={cardStyle}>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
                <FaBox className="text-blue-600" /> Add New Product
            </h2>
            <form onSubmit={handleSubmit} style={formStyle}>
                <fieldset style={fieldsetStyle}>
                    <legend style={legendStyle}>Product Details</legend>
                    <div style={detailsGridStyle}>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Product Name</label>
                            <input name="name" placeholder="Enter product name" value={form.name} onChange={handleChange} required style={inputStyle} />
                        </div>

                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>SKU</label>
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
                            <label style={labelStyle}>Unit</label>
                            <input name="unit" placeholder="e.g., pcs, box" value={form.unit} onChange={handleChange} style={inputStyle} />
                        </div>

                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Code</label>
                            <input name="code" placeholder="Enter product code" value={form.code} onChange={handleChange} style={inputStyle} />
                        </div>

                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Barcode</label>
                            <input name="barcode" placeholder="Enter barcode" value={form.barcode} onChange={handleChange} style={inputStyle} />
                        </div>

                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Active Status</label>
                            <Switch name="active" checked={form.active} onChange={handleChange} />
                        </div>

                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Default Quantity</label>
                            <Switch name="default_quantity" checked={form.default_quantity} onChange={handleChange} />
                        </div>

                        <div style={{ ...inputGroupStyle, gridColumn: '1 / span 2' }}>
                            <label style={labelStyle}>Description</label>
                            <textarea name="description" placeholder="Product Description" value={form.description} onChange={handleChange} style={{ ...inputStyle, height: '80px', resize: 'vertical' }} />
                        </div>
                    </div>
                </fieldset>

                <fieldset style={fieldsetStyle}>
                    <legend style={legendStyle}>Price & Tax</legend>
                    <div style={priceGridStyle}>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Purchase Price</label>
                            <input type="number" name="purchase_price" placeholder="0.00" value={form.purchase_price} onChange={handleChange} style={inputStyle} />
                        </div>

                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Tax</label>
                            <select name="tax" value={form.tax} onChange={handleChange} style={inputStyle}>
                                <option value="0">No Tax</option>
                                {taxes.map(t => <option key={t.id} value={t.tax_percentage}>{t.tax_label} ({t.tax_percentage}%)</option>)}
                            </select>
                        </div>

                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Markup (%)</label>
                            <input
                                type="text"
                                name="markup"
                                placeholder="0.00"
                                value={
                                    (form.purchase_price && form.sale_price && parseFloat(form.purchase_price) > 0)
                                        ? (((parseFloat(form.sale_price) - parseFloat(form.purchase_price)) / parseFloat(form.purchase_price)) * 100).toFixed(2)
                                        : ''
                                }
                                disabled
                                style={{ ...inputStyle, backgroundColor: '#f1f5f9' }}
                            />
                        </div>

                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Sale Price</label>
                            <input type="number" name="sale_price" placeholder="0.00" value={form.sale_price} onChange={handleChange} style={inputStyle} />
                        </div>

                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Stock Quantity</label>
                            <input type="number" name="quantity_in_stock" placeholder="0" value={form.quantity_in_stock} readOnly style={{ ...inputStyle, backgroundColor: '#f1f5f9' }} />
                        </div>
                    </div>
                </fieldset>

                <button
                    type="submit"
                    className="col-span-2 mt-4 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md text-sm transition-all"
                >
                    Add Product
                </button>
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

const formStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
};

const fieldsetStyle = {
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
    margin: '0',
    backgroundColor: '#fafafa',
};

const legendStyle = {
    padding: '0 10px',
    color: '#1e293b',
    fontWeight: '800',
    fontSize: '15px',
    marginLeft: '10px',
};

const detailsGridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
};

const priceGridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
};

const inputGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
};

const labelStyle = {
    marginBottom: '6px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569',
};

const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
};

export default AddProduct;