import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateInvoice = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [selectedId, setSelectedId] = useState('');
    const [qty, setQty] = useState(1);
    const [invoiceItems, setInvoiceItems] = useState([]);
    const [discount, setDiscount] = useState(0);
    const [tax, setTax] = useState(0);
    const [paid, setPaid] = useState(0);
    const [customerName, setCustomerName] = useState('');
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);

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
        if (product.quantity_in_stock < qty) return alert(`❌ Only ${product.quantity_in_stock} in stock`);
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
        setSearchText('');
    };

    const updateQty = (id, newQty) => {
        setInvoiceItems(items =>
            items.map(i => i.id === id ? {
                ...i,
                quantity: parseInt(newQty),
                total_price: parseInt(newQty) * i.unit_price
            } : i)
        );
    };

    const removeItem = (id) => {
        setInvoiceItems(invoiceItems.filter(i => i.id !== id));
    };

    const total = invoiceItems.reduce((sum, i) => sum + i.total_price, 0);
    const grandTotal = total + parseFloat(tax) - parseFloat(discount);
    const due = grandTotal - parseFloat(paid);

    const handleSave = async (print = false) => {
        if (parseFloat(paid) > grandTotal) return alert("❗ Paid amount can't be more than total");

        const invoice = {
            customer_name: customerName,
            total,
            tax,
            discount,
            paid,
            due,
            created_at: invoiceDate
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

                <input
                    type="text"
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    placeholder="Search product..."
                    style={inputStyle}
                />

                <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} style={inputStyle}>
                    <option value="">Select Product</option>
                    {products
                        .filter(p => p.name.toLowerCase().includes(searchText.toLowerCase()))
                        .map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                </select>

                <input type="number" value={qty} onChange={e => setQty(e.target.value)} style={inputStyle} placeholder="Qty" />
                <button onClick={addToInvoice} style={buttonStyle}>➕ Add</button>

                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thTdStyle}>Product</th>
                            <th style={thTdStyle}>Qty</th>
                            <th style={thTdStyle}>Rate</th>
                            <th style={thTdStyle}>Total</th>
                            <th style={thTdStyle}>❌</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoiceItems.map(i => (
                            <tr key={i.id}>
                                <td style={thTdStyle}>{i.name}</td>
                                <td style={thTdStyle}>
                                    <input
                                        type="number"
                                        value={i.quantity}
                                        min="1"
                                        onChange={(e) => updateQty(i.id, e.target.value)}
                                        style={{ width: '60px', backgroundColor: '#eeeeee', color: '#333' }}
                                    />
                                </td>
                                <td style={thTdStyle}>{i.unit_price}</td>
                                <td style={thTdStyle}>{i.total_price.toFixed(2)}</td>
                                <td style={thTdStyle}><button onClick={() => removeItem(i.id)}>❌</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={rightCol}>
                <h4>🧾 Summary</h4>
                <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} style={inputStyle} />

                <select value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={inputStyle}>
                    <option value="">Walk-in Customer</option>
                    <option value="Karim">Karim</option>
                    <option value="Rahim">Rahim</option>
                </select>

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
    background: '#2D3748',
    color: '#fff',
    padding: '20px',
    borderRadius: '10px'
};

const thTdStyle = {
    padding: '10px 15px',
    borderBottom: '1px solid #000000',
    textAlign: 'left',
};

const leftCol = { flex: 2 };
const rightCol = {
    flex: 1,
    background: '#575F6D',
    padding: '15px',
    borderRadius: '10px'
};

const inputStyle = {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: '#eeeeee',
    color: '#333',
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
    backgroundColor: '#575F6D',
    color: '#fff',
    borderCollapse: 'collapse'
};

export default CreateInvoice;
