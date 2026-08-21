import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaClipboardList, FaEdit, FaTrash } from 'react-icons/fa';

const Switch = ({ checked, onChange, name }) => {
    const switchStyle = {
        position: 'relative',
        display: 'inline-block',
        width: '50px',
        height: '24px',
    };

    const inputStyle = {
        opacity: 0,
        width: 0,
        height: 0,
    };

    const sliderStyle = {
        position: 'absolute',
        cursor: 'pointer',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: checked ? '#10b981' : '#cbd5e1',
        transition: '.3s',
        borderRadius: '24px',
    };

    const knobStyle = {
        position: 'absolute',
        height: '18px',
        width: '18px',
        left: '3px',
        bottom: '3px',
        backgroundColor: 'white',
        transition: '.3s',
        borderRadius: '50%',
        transform: checked ? 'translateX(26px)' : 'translateX(0)',
    };

    return (
        <label style={switchStyle}>
            <input type="checkbox" name={name} checked={checked} onChange={onChange} style={inputStyle} />
            <span style={sliderStyle}>
                <span style={knobStyle}></span>
            </span>
        </label>
    );
};

const ProductList = ({ refresh }) => {
    const [list, setList] = useState([]);
    const [editProduct, setEditProduct] = useState(null);
    const [categories, setCategories] = useState([]);
    const [taxes, setTaxes] = useState([]);

    const fetch = async () => {
        const products = await window.electron.ipcRenderer.invoke('get-products');
        setList(products || []);
    };

    useEffect(() => {
        fetch();
    }, [refresh]);

    useEffect(() => {
        async function fetchCategories() {
            const res = await window.electron.ipcRenderer.invoke('get-categories');
            setCategories(res || []);
        }
        async function fetchTaxes() {
            const res = await window.electron.ipcRenderer.invoke('get-taxes');
            setTaxes(res || []);
        }
        fetchCategories();
        fetchTaxes();
    }, []);

    const deleteProduct = async (id) => {
        if (confirm('Delete this product?')) {
            try {
                await window.electron.ipcRenderer.invoke('delete-product', id);
                toast.success('Product deleted successfully');
                fetch();
            } catch (err) {
                toast.error(err.message || 'An error occurred while deleting the product.');
            }
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await window.electron.ipcRenderer.invoke('update-product', editProduct);
            toast.success('Product updated successfully');
            setEditProduct(null);
            fetch();
        } catch (err) {
            toast.error(err.message || 'An error occurred while updating the product.');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditProduct({ ...editProduct, [name]: type === 'checkbox' ? checked : value });
    };

    return (
        <div style={cardStyle}>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 mb-4 border-b border-slate-200 pb-3">
                <FaClipboardList className="text-blue-600" /> Product Inventory List
            </h2>

            <div className="overflow-x-auto rounded-xl border border-slate-200 mt-4">
                <table style={tableStyle}>
                    <thead style={tableHeaderStyle}>
                        <tr>
                            <th style={{ ...thStyle, textAlign: 'left' }}>Product Name</th>
                            <th style={thStyle}>SKU</th>
                            <th style={thStyle}>Category</th>
                            <th style={thStyle}>Purchase Price</th>
                            <th style={thStyle}>Sale Price</th>
                            <th style={thStyle}>Stock</th>
                            <th style={thStyle}>Tax</th>
                            <th style={thStyle}>Unit</th>
                            <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="p-8 text-center text-slate-500 text-sm">No products in inventory yet.</td>
                            </tr>
                        ) : (
                            list.map((p, index) => (
                                <tr key={p.id} style={tableRowStyle(index)}>
                                    <td style={{ ...tdStyle, textAlign: 'left', fontWeight: '700', color: '#0f172a' }}>{p.name}</td>
                                    <td style={tdStyle}>{p.sku}</td>
                                    <td style={tdStyle}>{p.category_name || '-'}</td>
                                    <td style={tdStyle}>৳{Number(p.purchase_price).toFixed(2)}</td>
                                    <td style={{ ...tdStyle, fontWeight: '700', color: '#2563eb' }}>৳{Number(p.sale_price).toFixed(2)}</td>
                                    <td style={{ ...tdStyle, color: p.quantity_in_stock < 10 ? '#ef4444' : '#10b981', fontWeight: '700' }}>
                                        {p.quantity_in_stock}
                                    </td>
                                    <td style={tdStyle}>{p.tax}%</td>
                                    <td style={tdStyle}>{p.unit || '-'}</td>
                                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                                        <button onClick={() => setEditProduct(p)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors mr-2"><FaEdit /></button>
                                        <button onClick={() => deleteProduct(p.id)} className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"><FaTrash /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {editProduct && (
                <div style={modalOverlay}>
                    <div style={modalBox}>
                        <h3 style={modalHeaderStyle}>Edit Product Details</h3>
                        <form onSubmit={handleEditSubmit} style={formStyle}>
                            <fieldset style={fieldsetStyle}>
                                <legend style={legendStyle}>Product Details</legend>
                                <div style={detailsGridStyle}>
                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>Product Name</label>
                                        <input name="name" placeholder="Enter product name" value={editProduct.name} onChange={handleChange} required style={inputStyle} />
                                    </div>

                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>SKU</label>
                                        <input name="sku" placeholder="Enter SKU" value={editProduct.sku} onChange={handleChange} required style={inputStyle} />
                                    </div>

                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>Category</label>
                                        <select name="category_id" value={editProduct.category_id} onChange={handleChange} required style={inputStyle}>
                                            <option value="">Select Category</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>

                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>Unit</label>
                                        <input name="unit" placeholder="e.g., pcs, box" value={editProduct.unit} onChange={handleChange} style={inputStyle} />
                                    </div>

                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>Code</label>
                                        <input name="code" placeholder="Enter product code" value={editProduct.code} onChange={handleChange} style={inputStyle} />
                                    </div>

                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>Barcode</label>
                                        <input name="barcode" placeholder="Enter barcode" value={editProduct.barcode} onChange={handleChange} style={inputStyle} />
                                    </div>

                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>Active</label>
                                        <Switch name="active" checked={editProduct.active} onChange={handleChange} />
                                    </div>

                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>Default Quantity</label>
                                        <Switch name="default_quantity" checked={editProduct.default_quantity} onChange={handleChange} />
                                    </div>

                                    <div style={{ ...inputGroupStyle, gridColumn: '1 / span 2' }}>
                                        <label style={labelStyle}>Description</label>
                                        <textarea name="description" placeholder="Product Description" value={editProduct.description} onChange={handleChange} style={{ ...inputStyle, height: '80px', resize: 'vertical' }} />
                                    </div>
                                </div>
                            </fieldset>

                            <fieldset style={fieldsetStyle}>
                                <legend style={legendStyle}>Price & Tax</legend>
                                <div style={priceGridStyle}>
                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>Purchase Price</label>
                                        <input type="number" name="purchase_price" placeholder="0.00" value={editProduct.purchase_price} onChange={handleChange} style={inputStyle} />
                                    </div>

                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>Tax</label>
                                        <select name="tax" value={editProduct.tax} onChange={handleChange} style={inputStyle}>
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
                                                (editProduct.purchase_price && editProduct.sale_price && parseFloat(editProduct.purchase_price) > 0)
                                                    ? (((parseFloat(editProduct.sale_price) - parseFloat(editProduct.purchase_price)) / parseFloat(editProduct.purchase_price)) * 100).toFixed(2)
                                                    : ''
                                            }
                                            disabled
                                            style={{ ...inputStyle, backgroundColor: '#f1f5f9' }}
                                        />
                                    </div>

                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>Sale Price</label>
                                        <input type="number" name="sale_price" placeholder="0.00" value={editProduct.sale_price} onChange={handleChange} style={inputStyle} />
                                    </div>

                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>Stock Quantity</label>
                                        <input type="number" name="quantity_in_stock" placeholder="0" value={editProduct.quantity_in_stock} readOnly style={{ ...inputStyle, backgroundColor: '#f1f5f9' }} />
                                    </div>
                                </div>
                            </fieldset>

                            <div style={{ gridColumn: '1 / span 2', display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                                <button type="button" onClick={() => setEditProduct(null)} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl text-sm transition-all">Cancel</button>
                                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md transition-all">Save Changes</button>
                            </div>
                        </form>
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

const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
};

const tableHeaderStyle = {
    backgroundColor: '#f8fafc',
    color: '#475569',
};

const thStyle = {
    padding: '12px 16px',
    textAlign: 'left',
    borderBottom: '1px solid #e2e8f0',
    textTransform: 'uppercase',
    fontSize: '11px',
    fontWeight: '700',
};

const tableRowStyle = (index) => ({
    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc',
});

const tdStyle = {
    padding: '12px 16px',
    borderBottom: '1px solid #e2e8f0',
    color: '#334155',
    fontSize: '14px',
};

const modalOverlay = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999
};

const modalBox = {
    background: '#ffffff',
    padding: '28px',
    borderRadius: '20px',
    width: 'clamp(800px, 70vw, 1000px)',
    color: '#0f172a',
    border: '1px solid #e2e8f0',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};

const modalHeaderStyle = {
    textAlign: 'left',
    marginBottom: '20px',
    fontSize: '20px',
    fontWeight: '800',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '12px',
};

const formStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
};

const fieldsetStyle = {
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '16px',
    backgroundColor: '#f8fafc',
};

const legendStyle = {
    padding: '0 8px',
    color: '#0f172a',
    fontWeight: '800',
    fontSize: '14px',
};

const detailsGridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
};

const priceGridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
};

const inputGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
};

const labelStyle = {
    marginBottom: '4px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
};

const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontSize: '13px',
    boxSizing: 'border-box',
    outline: 'none',
};

export default ProductList;