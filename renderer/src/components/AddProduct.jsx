import { useEffect, useState } from 'react';

const AddProduct = ({ onAdded }) => {
    const [form, setForm] = useState({
        name: '',
        sku: '',
        category_id: '',
        description: '',
        purchase_price: '',
        sale_price: '',
        quantity_in_stock: '',
        unit: ''
    });

    const [categories, setCategories] = useState([]);

    useEffect(() => {
        async function fetchCategories() {
            const data = await window.electron.ipcRenderer.invoke('get-categories');
            setCategories(data);
        }
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await window.electron.ipcRenderer.invoke('add-product', form);
        onAdded();
        setForm({
            name: '',
            sku: '',
            category_id: '',
            description: '',
            purchase_price: '',
            sale_price: '',
            quantity_in_stock: '',
            unit: ''
        });
    };

    return (
        <div style={cardStyle}>
            <h3>Add Product</h3>
            <form onSubmit={handleSubmit} style={formStyle}>
                <input name="name" placeholder="Product Name" value={form.name} onChange={handleChange} required style={inputStyle} />
                <input name="sku" placeholder="SKU" value={form.sku} onChange={handleChange} required style={inputStyle} />

                <select name="category_id" value={form.category_id} onChange={handleChange} required style={inputStyle}>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>

                <input name="description" placeholder="Description" value={form.description} onChange={handleChange} style={inputStyle} />
                <input name="unit" placeholder="Unit (e.g. pcs, box)" value={form.unit} onChange={handleChange} style={inputStyle} />
                <input name="purchase_price" placeholder="Purchase Price" value={form.purchase_price} onChange={handleChange} style={inputStyle} />
                <input name="sale_price" placeholder="Sale Price" value={form.sale_price} onChange={handleChange} style={inputStyle} />
                <input name="quantity_in_stock" placeholder="Stock Quantity" value={form.quantity_in_stock} onChange={handleChange} style={inputStyle} />

                <button type="submit" style={buttonStyle}>Add Product</button>
            </form>
        </div>
    );
};

const cardStyle = {
    background: '#2c3e50',
    padding: '20px',
    borderRadius: '10px',
    color: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    maxWidth: '700px',
    margin: 'auto',
    marginBottom: '30px'
};

const formStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
};

const inputStyle = {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '14px'
};

const buttonStyle = {
    gridColumn: '1 / span 2',
    padding: '12px',
    backgroundColor: '#27ae60',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '10px'
};


export default AddProduct;
