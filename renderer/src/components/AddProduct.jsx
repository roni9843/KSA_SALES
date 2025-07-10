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
            <h3 style={headerStyle}>Add New Product</h3>
            <form onSubmit={handleSubmit} style={formStyle}>
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

                <div style={{ ...inputGroupStyle, gridColumn: '1 / span 2' }}>
                    <label style={labelStyle}>Description</label>
                    <textarea name="description" placeholder="Product Description" value={form.description} onChange={handleChange} style={{ ...inputStyle, height: '80px', resize: 'vertical' }} />
                </div>

                <div style={inputGroupStyle}>
                    <label style={labelStyle}>Purchase Price</label>
                    <input type="number" name="purchase_price" placeholder="0.00" value={form.purchase_price} onChange={handleChange} style={inputStyle} />
                </div>

                <div style={inputGroupStyle}>
                    <label style={labelStyle}>Sale Price</label>
                    <input type="number" name="sale_price" placeholder="0.00" value={form.sale_price} onChange={handleChange} style={inputStyle} />
                </div>

                <div style={inputGroupStyle}>
                    <label style={labelStyle}>Stock Quantity</label>
                    <input type="number" name="quantity_in_stock" placeholder="0" value={form.quantity_in_stock} onChange={handleChange} style={inputStyle} />
                </div>

                <button 
                    type="submit" 
                    style={buttonStyle}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2ecc71'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#27ae60'}
                >
                    Add Product
                </button>
            </form>
        </div>
    );
};

const cardStyle = {
    background: '#2D3748',
    padding: '30px',
    borderRadius: '10px',
    color: '#fff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
    maxWidth: '700px',
    margin: 'auto',
    marginBottom: '30px'
};

const headerStyle = {
    textAlign: 'center',
    marginBottom: '25px',
    fontSize: '24px',
    color: '#E2E8F0',
};

const formStyle = {
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
    gridColumn: '1 / span 2',
    padding: '15px',
    backgroundColor: '#27ae60',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    marginTop: '10px',
    transition: 'background-color 0.3s ease',
};


export default AddProduct;
