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
            <h3>📦 Product List</h3>
            <table style={tableStyle}>
                <thead>
                    <tr>
                        <th style={thTdStyle}>Name</th>
                        <th style={thTdStyle}>SKU</th>
                        <th style={thTdStyle}>Category</th>
                        <th style={thTdStyle}>Purchase</th>
                        <th style={thTdStyle}>Sale</th>
                        <th style={thTdStyle}>Stock</th>
                        <th style={thTdStyle}>Unit</th>
                        <th style={thTdStyle}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {list.map(p => (
                        <tr key={p.id}>
                            <td style={thTdStyle}>{p.name}</td>
                            <td style={thTdStyle}>{p.sku}</td>
                            <td style={thTdStyle}>{p.category_name}</td>
                            <td style={thTdStyle}>{p.purchase_price}</td>
                            <td style={thTdStyle}>{p.sale_price}</td>
                            <td style={thTdStyle}>{p.quantity_in_stock}</td>
                            <td style={thTdStyle}>{p.unit}</td>
                            <td style={thTdStyle}>
                                <button onClick={() => setEditProduct(p)}>✏️</button>
                                <button onClick={() => deleteProduct(p.id)}>🗑</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {editProduct && (
                <div style={modalOverlay}>
                    <div style={modalBox}>
                        <h3>Edit Product</h3>
                        <form onSubmit={handleEditSubmit} style={formStyle}>
                            <input name="name" value={editProduct.name} onChange={handleChange} placeholder="Name" style={inputStyle} />
                            <input name="sku" value={editProduct.sku} onChange={handleChange} placeholder="SKU" style={inputStyle} />
                            <select
                                name="category_id"
                                value={editProduct.category_id}
                                onChange={handleChange}
                                style={inputStyle}
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>

                            <input name="description" value={editProduct.description} onChange={handleChange} placeholder="Description" style={inputStyle} />
                            <input name="purchase_price" value={editProduct.purchase_price} onChange={handleChange} placeholder="Purchase Price" style={inputStyle} />
                            <input name="sale_price" value={editProduct.sale_price} onChange={handleChange} placeholder="Sale Price" style={inputStyle} />
                            <input name="quantity_in_stock" value={editProduct.quantity_in_stock} onChange={handleChange} placeholder="Stock" style={inputStyle} />
                            <input name="unit" value={editProduct.unit} onChange={handleChange} placeholder="Unit" style={inputStyle} />
                            <div style={{ gridColumn: '1 / span 2', display: 'flex', gap: '10px' }}>
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
    borderCollapse: 'collapse',
    marginTop: '10px',
    backgroundColor: '#575F6D',
    color: '#fff'
};

const thTdStyle = {
    padding: '10px 15px',
    borderBottom: '1px solid #000000',
    textAlign: 'left',
};

const modalOverlay = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999
};

const modalBox = {
    background: '#fff',
    padding: '30px',
    borderRadius: '10px',
    minWidth: '400px',
    color: '#000'
};

const formStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginTop: '10px'
};

const inputStyle = {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
};

const buttonStyle = {
    padding: '10px',
    backgroundColor: '#27ae60',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
};

const cancelButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#e74c3c'
};


export default ProductList;
