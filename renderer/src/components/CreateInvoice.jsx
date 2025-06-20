import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateInvoice() {
    const [products, setProducts] = useState([]);
    const [items, setItems] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [tax, setTax] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [paid, setPaid] = useState(0);
    const [message, setMessage] = useState('');


    const navigate = useNavigate();

    useEffect(() => {
        async function fetchProducts() {
            const result = await window.electron.ipcRenderer.invoke('get-products');
            setProducts(result);
        }
        fetchProducts();
    }, []);

    const addItem = () => {
        setItems([...items, { product_id: '', quantity: 1, unit_price: 0, total_price: 0 }]);
    };

    const updateItem = (index, key, value) => {
        const updated = [...items];
        updated[index][key] = key === 'quantity' || key === 'unit_price' ? parseFloat(value) : value;

        if (key === 'product_id') {
            const prod = products.find(p => p.id === parseInt(value));
            if (prod) updated[index].unit_price = prod.sale_price;
        }

        updated[index].total_price = updated[index].quantity * updated[index].unit_price;
        setItems(updated);
    };

    const getTotal = () => {
        const subtotal = items.reduce((sum, i) => sum + i.total_price, 0);
        return subtotal + parseFloat(tax || 0) - parseFloat(discount || 0);
    };

    const handleSubmit = async () => {
        const data = {
            customer_name: customerName,
            items,
            tax: parseFloat(tax),
            discount: parseFloat(discount),
            paid: parseFloat(paid),
            total: getTotal()
        };

        try {
            const result = await window.electron.ipcRenderer.invoke('create-invoice', data);
            if (result.success) {
                setMessage(`Invoice Created! ID: ${result.invoice_id}`);
                setItems([]);
                setCustomerName('');
                setTax(0);
                setDiscount(0);
                setPaid(0);

                navigate(`/invoice/${result.invoice_id}`);
            }
        } catch (err) {
            setMessage('Error: ' + err);
        }
    };

    return (
        <div style={{ marginTop: '30px' }}>
            <h2>Create Invoice</h2>
            <input type="text" placeholder="Customer Name" value={customerName} onChange={e => setCustomerName(e.target.value)} /><br />
            <button onClick={addItem}>+ Add Item</button>
            <table border="1" width="100%" style={{ marginTop: '10px' }}>
                <thead>
                    <tr>
                        <th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, idx) => (
                        <tr key={idx}>
                            <td>
                                <select value={item.product_id} onChange={e => updateItem(idx, 'product_id', e.target.value)}>
                                    <option value="">Select</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </td>
                            <td><input type="number" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} /></td>
                            <td><input type="number" value={item.unit_price} onChange={e => updateItem(idx, 'unit_price', e.target.value)} /></td>
                            <td>{item.total_price.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={{ marginTop: '10px' }}>
                <label>Tax: <input type="number" value={tax} onChange={e => setTax(e.target.value)} /></label><br />
                <label>Discount: <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} /></label><br />
                <label>Paid: <input type="number" value={paid} onChange={e => setPaid(e.target.value)} /></label><br />
                <p><strong>Total: {getTotal().toFixed(2)}</strong></p>
                <button onClick={handleSubmit}>Submit Invoice</button>
                <p>{message}</p>
            </div>
        </div>
    );
}

export default CreateInvoice;
