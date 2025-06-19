import React, { useEffect, useState } from 'react';

function AddProduct() {
    const [form, setForm] = useState({
        name: '',
        sku: '',
        category_id: '',
        description: '',
        purchase_price: '',
        sale_price: '',
        quantity_in_stock: '',
        unit: '',
    });

    const [categories, setCategories] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        async function fetchCategories() {
            const result = await window.electron.ipcRenderer.invoke('get-categories');
            setCategories(result);
        }
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!form.name || !form.sku || !form.category_id) {
            setMessage('Name, SKU and Category are required');
            return;
        }
        try {
            const result = await window.electron.ipcRenderer.invoke('add-product', form);
            if (result.success) {
                setMessage('Product added successfully');
                setForm({
                    name: '',
                    sku: '',
                    category_id: '',
                    description: '',
                    purchase_price: '',
                    sale_price: '',
                    quantity_in_stock: '',
                    unit: '',
                });
            }
        } catch (err) {
            setMessage('Error: ' + err);
        }
    };

    return (
        <div style={{ marginTop: '20px' }}>
            <h2>Add Product</h2>
            <input type="text" name="name" placeholder="Name" value={form.name} onChange={handleChange} /><br />
            <input type="text" name="sku" placeholder="SKU" value={form.sku} onChange={handleChange} /><br />
            <select name="category_id" value={form.category_id} onChange={handleChange}>
                <option value="">Select Category</option>
                {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </select><br />
            <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} /><br />
            <input type="number" name="purchase_price" placeholder="Purchase Price" value={form.purchase_price} onChange={handleChange} /><br />
            <input type="number" name="sale_price" placeholder="Sale Price" value={form.sale_price} onChange={handleChange} /><br />
            <input type="number" name="quantity_in_stock" placeholder="Stock Quantity" value={form.quantity_in_stock} onChange={handleChange} /><br />
            <input type="text" name="unit" placeholder="Unit (e.g., pcs)" value={form.unit} onChange={handleChange} /><br />
            <button onClick={handleSubmit}>Add Product</button>
            <p>{message}</p>
        </div>
    );
}

export default AddProduct;
