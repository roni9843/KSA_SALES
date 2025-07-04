import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateInvoice = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [qty, setQty] = useState(1);
    const [invoiceItems, setInvoiceItems] = useState([]);
    const [discount, setDiscount] = useState(0);
    const [tax, setTax] = useState(0);
    const [paid, setPaid] = useState(0);
    const [customerName, setCustomerName] = useState('');

    useEffect(() => {
        async function fetchProducts() {
            const list = await window.electron.ipcRenderer.invoke('get-products');
            setProducts(list);
        }
        fetchProducts();
    }, []);

    const addToInvoice = () => {
        const product = products.find(p => p.id === parseInt(selectedId));
        if (!product) return;
        const exists = invoiceItems.find(i => i.id === product.id);
        if (exists) return alert("Already added!");

        setInvoiceItems([
            ...invoiceItems,
            {
                id: product.id,
                name: product.name,
                unit_price: product.sale_price,
                quantity: qty,
                total_price: qty * product.sale_price
            }
        ]);
        setQty(1);
        setSelectedId('');
    };

    const removeItem = (id) => {
        setInvoiceItems(invoiceItems.filter(i => i.id !== id));
    };

    const total = invoiceItems.reduce((sum, i) => sum + i.total_price, 0);
    const grandTotal = total + parseFloat(tax) - parseFloat(discount);
    const due = grandTotal - parseFloat(paid);

    const handleSave = async (print = false) => {
        const invoice = {
            customer_name: customerName,
            total,
            tax,
            discount,
            paid,
            due
        };
        const details = invoiceItems.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price
        }));

        const newId = await window.electron.ipcRenderer.invoke('create-invoice', {
            invoice,
            details
        });

        if (print) {
            navigate(`/invoice/${newId}`);
        } else {
            alert("✅ Invoice Saved");
            setInvoiceItems([]);
            setCustomerName('');
        }
    };

    return (
        <div style={formContainer}>
            <div style={leftCol}>
                <h3>🧾 Create Invoice</h3>

                <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} style={inputStyle}>
                    <option value="">Select Product</option>
                    {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
                <input type="number" value={qty} onChange={e => setQty(e.target.value)} style={inputStyle} placeholder="Qty" />
                <button onClick={addToInvoice} style={buttonStyle}>➕ Add</button>

                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Qty</th>
                            <th>Rate</th>
                            <th>Total</th>
                            <th>❌</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoiceItems.map(i => (
                            <tr key={i.id}>
                                <td>{i.name}</td>
                                <td>{i.quantity}</td>
                                <td>{i.unit_price}</td>
                                <td>{i.total_price.toFixed(2)}</td>
                                <td><button onClick={() => removeItem(i.id)}>❌</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={rightCol}>
                <h4>🧾 Summary</h4>
                <input placeholder="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={inputStyle} />
                <input placeholder="Discount" value={discount} onChange={(e) => setDiscount(e.target.value)} style={inputStyle} />
                <input placeholder="Tax" value={tax} onChange={(e) => setTax(e.target.value)} style={inputStyle} />
                <input placeholder="Paid" value={paid} onChange={(e) => setPaid(e.target.value)} style={inputStyle} />
                <p><strong>Total:</strong> {total.toFixed(2)}</p>
                <p><strong>Due:</strong> {due.toFixed(2)}</p>
                <button style={buttonStyle} onClick={() => handleSave(false)}>💾 Save</button>
                <button style={buttonStyle} onClick={() => handleSave(true)}>🖨️ Save & Print</button>
            </div>
        </div>
    );
};

const formContainer = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '30px',
    marginTop: '20px',
    background: '#2c3e50',
    color: '#fff',
    padding: '20px',
    borderRadius: '10px'
};

const leftCol = {
    flex: 2
};

const rightCol = {
    flex: 1,
    background: '#34495e',
    padding: '15px',
    borderRadius: '10px'
};

const inputStyle = {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '5px',
    border: 'none'
};

const buttonStyle = {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    backgroundColor: '#27ae60',
    color: '#fff',
    border: 'none',
    borderRadius: '5px'
};

const tableStyle = {
    width: '100%',
    marginTop: '15px',
    backgroundColor: '#34495e',
    color: '#fff',
    borderCollapse: 'collapse'
};

export default CreateInvoice;
