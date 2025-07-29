import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaEdit, FaTrash } from 'react-icons/fa';

const Switch = ({ checked, onChange, name }) => {
    const switchStyle = {
        position: 'relative',
        display: 'inline-block',
        width: '60px',
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
        backgroundColor: checked ? '#27ae60' : '#ccc',
        transition: '.4s',
        borderRadius: '24px',
    };

    const knobStyle = {
        position: 'absolute',
        height: '18px',
        width: '18px',
        left: '3px',
        bottom: '3px',
        backgroundColor: 'white',
        transition: '.4s',
        borderRadius: '50%',
        transform: checked ? 'translateX(36px)' : 'translateX(0)',
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

    const fetch = async () => {
        const products = await window.electron.ipcRenderer.invoke('get-products');
        setList(products);
    };

    useEffect(() => {
        fetch();
    }, [refresh]);

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

    const [categories, setCategories] = useState([]);

    useEffect(() => {
        async function fetchCategories() {
            const res = await window.electron.ipcRenderer.invoke('get-categories');
            setCategories(res);
        }
        fetchCategories();
    }, []);


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
            <h3 style={{ textAlign: 'center', fontSize: '24px', marginBottom: '20px' }}>📦 Product List</h3>
            <table style={tableStyle}>
                <thead style={tableHeaderStyle}>
                    <tr>
                        <th style={{ ...thStyle, textAlign: 'left' }}>Name</th>
                        <th style={thStyle}>SKU</th>
                        <th style={thStyle}>Category</th>
                        <th style={thStyle}>Purchase Price</th>
                        <th style={thStyle}>Sale Price</th>
                        <th style={thStyle}>Stock</th>
                        <th style={thStyle}>Unit</th>
                        <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {list.map((p, index) => (
                        <tr key={p.id} style={tableRowStyle(index)}>
                            <td style={{ ...tdStyle, textAlign: 'left' }}>{p.name}</td>
                            <td style={tdStyle}>{p.sku}</td>
                            <td style={tdStyle}>{p.category_name}</td>
                            <td style={tdStyle}>{p.purchase_price.toFixed(2)}</td>
                            <td style={tdStyle}>{p.sale_price.toFixed(2)}</td>
                            <td style={{ ...tdStyle, color: p.quantity_in_stock < 10 ? '#F56565' : 'inherit', fontWeight: p.quantity_in_stock < 10 ? 'bold' : 'normal' }}>{p.quantity_in_stock}</td>
                            <td style={tdStyle}>{p.unit}</td>
                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                                <button onClick={() => setEditProduct(p)} style={iconButtonStyle}><FaEdit /></button>
                                <button onClick={() => deleteProduct(p.id)} style={iconButtonStyle}><FaTrash /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {editProduct && (
                <div style={modalOverlay}>
                    <div style={modalBox}>
                        <h3 style={modalHeaderStyle}>Edit Product</h3>
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
                                        <label style={labelStyle}>Tax (%)</label>
                                        <input type="number" name="tax" placeholder="e.g., 5" value={editProduct.tax} onChange={handleChange} style={inputStyle} />
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
                                            style={{ ...inputStyle, backgroundColor: '#E2E8F0' }}
                                        />
                                    </div>

                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>Sale Price</label>
                                        <input type="number" name="sale_price" placeholder="0.00" value={editProduct.sale_price} onChange={handleChange} style={inputStyle} />
                                    </div>

                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>Stock Quantity</label>
                                        <input type="number" name="quantity_in_stock" placeholder="0" value={editProduct.quantity_in_stock} onChange={handleChange} style={inputStyle} />
                                    </div>
                                </div>
                            </fieldset>

                            <div style={{ gridColumn: '1 / span 2', display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="submit" style={buttonStyle}>💾 Update</button>
                                <button type="button" onClick={() => setEditProduct(null)} style={cancelButtonStyle}>❌ Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const cardStyle = {
    background: '#2D3748',
    padding: '20px',
    borderRadius: '10px',
    color: '#fff',
    marginTop: '20px'
};

const tableStyle = {
    width: '100%',
    marginTop: '20px',
    borderCollapse: 'collapse',
    borderRadius: '8px',
    overflow: 'hidden',
};

const tableHeaderStyle = {
    backgroundColor: '#4A5568',
    color: '#fff',
};

const thStyle = {
    padding: '12px 15px',
    textAlign: 'right',
    borderBottom: '1px solid #2D3748',
    textTransform: 'uppercase',
    fontSize: '12px',
};

const tableRowStyle = (index) => ({
    backgroundColor: index % 2 === 0 ? '#575F6D' : '#4A5568',
    borderBottom: '1px solid #2D3748',
});

const tdStyle = {
    padding: '12px 15px',
    textAlign: 'right',
};

const iconButtonStyle = {
    background: 'none',
    border: '1px solid',
    borderRadius: '5px',
    padding: '8px 12px',
    cursor: 'pointer',
    marginRight: '5px',
    transition: 'all 0.3s ease',
    color: '#fff',
};

const editButtonStyle = {
    ...iconButtonStyle,
    borderColor: '#2B6CB0',
    '&:hover': {
        backgroundColor: '#2B6CB0',
        color: '#fff',
    },
};

const deleteButtonStyle = {
    ...iconButtonStyle,
    borderColor: '#C53030',
    '&:hover': {
        backgroundColor: '#C53030',
        color: '#fff',
    },
};

const modalOverlay = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999
};

const modalBox = {
    background: '#2D3748',
    padding: '30px',
    borderRadius: '10px',
    width: 'clamp(800px, 70vw, 1000px)',
    color: '#fff',
    boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
};

const modalHeaderStyle = {
    textAlign: 'center',
    marginBottom: '20px',
    fontSize: '22px',
};

const formStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
};

const fieldsetStyle = {
    border: '1px solid #4A5568',
    borderRadius: '8px',
    padding: '20px',
    margin: '0',
};

const legendStyle = {
    padding: '0 10px',
    color: '#E2E8F0',
    fontWeight: 'bold',
    fontSize: '18px',
    marginLeft: '10px',
};

const detailsGridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
};

const priceGridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
};

const inputGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
};

const labelStyle = {
    marginBottom: '8px',
    fontSize: '14px',
    color: '#A0AEC0',
};

const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '5px',
    border: '1px solid #A0AEC0',
    backgroundColor: '#fff',
    color: '#333',
    fontSize: '14px',
    boxSizing: 'border-box',
};

const buttonStyle = {
    flex: 1,
    padding: '12px',
    backgroundColor: '#27ae60',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease',
};

const cancelButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#e74c3c'
};


export default ProductList;
