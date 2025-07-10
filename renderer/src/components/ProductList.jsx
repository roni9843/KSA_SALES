import { useEffect, useState } from 'react';

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
            await window.electron.ipcRenderer.invoke('delete-product', id);
            fetch();
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
        await window.electron.ipcRenderer.invoke('update-product', editProduct);
        setEditProduct(null);
        fetch();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // category_id হলে সংখ্যা করে দাও
        setEditProduct({
            ...editProduct,
            [name]: name === 'category_id' ? parseInt(value) : value
        });
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
                                <button onClick={() => setEditProduct(p)} style={editButtonStyle}>✏️ Edit</button>
                                <button onClick={() => deleteProduct(p.id)} style={deleteButtonStyle}>🗑️ Delete</button>
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
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Name</label>
                                <input name="name" value={editProduct.name} onChange={handleChange} placeholder="Name" style={inputStyle} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>SKU</label>
                                <input name="sku" value={editProduct.sku} onChange={handleChange} placeholder="SKU" style={inputStyle} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Category</label>
                                <select name="category_id" value={editProduct.category_id} onChange={handleChange} style={inputStyle}>
                                    <option value="">Select Category</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Unit</label>
                                <input name="unit" value={editProduct.unit} onChange={handleChange} placeholder="Unit" style={inputStyle} />
                            </div>
                            <div style={{ ...inputGroupStyle, gridColumn: '1 / span 2' }}>
                                <label style={labelStyle}>Description</label>
                                <textarea name="description" value={editProduct.description} onChange={handleChange} placeholder="Description" style={{ ...inputStyle, height: '60px', resize: 'vertical' }} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Purchase Price</label>
                                <input type="number" name="purchase_price" value={editProduct.purchase_price} onChange={handleChange} placeholder="Purchase Price" style={inputStyle} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Sale Price</label>
                                <input type="number" name="sale_price" value={editProduct.sale_price} onChange={handleChange} placeholder="Sale Price" style={inputStyle} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Stock</label>
                                <input type="number" name="quantity_in_stock" value={editProduct.quantity_in_stock} onChange={handleChange} placeholder="Stock" style={inputStyle} />
                            </div>

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

const editButtonStyle = {
    padding: '8px 12px',
    backgroundColor: '#2B6CB0',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginRight: '5px',
    transition: 'background-color 0.3s ease',
};

const deleteButtonStyle = {
    padding: '8px 12px',
    backgroundColor: '#C53030',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
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
    width: 'clamp(400px, 50vw, 600px)',
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
    gap: '15px',
};

const inputGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
};

const labelStyle = {
    marginBottom: '5px',
    fontSize: '14px',
    color: '#A0AEC0',
};

const inputStyle = {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #A0AEC0',
    backgroundColor: '#fff',
    color: '#333',
    fontSize: '14px',
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
