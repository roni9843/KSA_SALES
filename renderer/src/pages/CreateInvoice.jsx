import { useState, useEffect, useRef } from 'react';
import { FaFileInvoice, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import AsyncSelect from 'react-select/async';
import toast from 'react-hot-toast';

const CreateInvoice = () => {
    const navigate = useNavigate();
    const [invoiceItems, setInvoiceItems] = useState([]);
    const [paid, setPaid] = useState(0);
    const [customerName, setCustomerName] = useState('');
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectKey, setSelectKey] = useState(0);
    const selectRef = useRef(null);


    const loadProductOptions = async (inputValue) => {
        if (inputValue.length < 2) return [];
        try {
            const results = await window.electron.ipcRenderer.invoke('search-products-for-invoice', inputValue);
            return results.map(p => ({
                value: p.id,
                label: `${p.name} (Stock: ${p.quantity_in_stock})`,
                product: p
            }));
        } catch (error) {
            console.error('Error searching products:', error);
            toast.error('Failed to search for products.');
            return [];
        }
    };

    const handleProductSelect = (selectedOption) => {
        if (!selectedOption) return;

        const product = selectedOption.product;
        const existingItem = invoiceItems.find(item => item.id === product.id);

        if (existingItem) {
            toast.error('Product already added.');
            return;
        }

        const newItem = {
            id: product.id,
            name: product.name,
            quantity: 1,
            sale_price: product.sale_price,
            tax: 0,
            discount: 0,
            total_price: product.sale_price,
        };

        setInvoiceItems([...invoiceItems, newItem]);
        setSelectKey(prevKey => prevKey + 1);
        if (selectRef.current) {
            selectRef.current.clearValue();
        }
    };

    const handleItemChange = (id, field, value) => {
        setInvoiceItems(items =>
            items.map(item => {
                if (item.id === id) {
                    const newItem = { ...item, [field]: parseFloat(value) || 0 };
                    const priceAfterDiscount = newItem.sale_price * (1 - newItem.discount / 100);
                    newItem.total_price = priceAfterDiscount * (1 + newItem.tax / 100) * newItem.quantity;
                    return newItem;
                }
                return item;
            })
        );
    };


    const removeItem = (id) => {
        setInvoiceItems(invoiceItems.filter(i => i.id !== id));
    };

    const total = invoiceItems.reduce((sum, i) => sum + i.total_price, 0);
    const grandTotal = total;
    const due = grandTotal - parseFloat(paid);

    const handleSave = async (print = false) => {
        if (parseFloat(paid) > grandTotal) return alert("❗ Paid amount can't be more than total");

        const invoice = {
            customer_name: customerName,
            total: grandTotal,
            tax: 0, // Overall tax is no longer used
            discount: 0, // Overall discount is no longer used
            paid,
            due,
            created_at: invoiceDate
        };

        const details = invoiceItems.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            unit_price: item.sale_price,
            tax: item.tax,
            discount: item.discount,
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
                <h2><FaFileInvoice /> Create Invoice</h2>
                <AsyncSelect
                    key={selectKey}
                    ref={selectRef}
                    cacheOptions
                    defaultOptions
                    loadOptions={loadProductOptions}
                    onChange={handleProductSelect}
                    placeholder="Type to search for a product..."
                    isClearable
                />

                <table style={tableStyle}>
                    <thead style={tableHeaderStyle}>
                        <tr>
                            <th style={{ ...thStyle, textAlign: 'left' }}>Product</th>
                            <th style={{ ...thStyle, textAlign: 'center' }}>Qty</th>
                            <th style={thStyle}>Rate</th>
                            <th style={thStyle}>Tax (%)</th>
                            <th style={thStyle}>Discount (%)</th>
                            <th style={thStyle}>Total</th>
                            <th style={{ ...thStyle, textAlign: 'center' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoiceItems.map((i, index) => (
                            <tr key={i.id} style={tableRowStyle(index)}>
                                <td style={{ ...tdStyle, textAlign: 'left' }}>{i.name}</td>
                                <td style={{ ...tdStyle, textAlign: 'center' }}>
                                    <input
                                        type="number"
                                        value={i.quantity}
                                        min="1"
                                        onChange={(e) => handleItemChange(i.id, 'quantity', e.target.value)}
                                        style={qtyInputStyle}
                                    />
                                </td>
                                <td style={tdStyle}>{i.sale_price.toFixed(2)}</td>
                                <td style={tdStyle}>
                                    <input
                                        type="number"
                                        value={i.tax}
                                        onChange={(e) => handleItemChange(i.id, 'tax', e.target.value)}
                                        style={qtyInputStyle}
                                    />
                                </td>
                                <td style={tdStyle}>
                                    <input
                                        type="number"
                                        value={i.discount}
                                        onChange={(e) => handleItemChange(i.id, 'discount', e.target.value)}
                                        style={qtyInputStyle}
                                    />
                                </td>
                                <td style={tdStyle}>{i.total_price.toFixed(2)}</td>
                                <td style={{ ...tdStyle, textAlign: 'center' }}>
                                    <button onClick={() => removeItem(i.id)} className="action-button">
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={rightCol}>
                <h4>🧾 Summary</h4>
                <div>
                    <label style={labelStyle}>Invoice Date</label>
                    <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} style={inputStyle} />
                </div>
                <div>
                    <label style={labelStyle}>Customer</label>
                    <select value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={inputStyle}>
                        <option value="">Walk-in Customer</option>
                        <option value="Karim">Karim</option>
                        <option value="Rahim">Rahim</option>
                    </select>
                </div>

                <div>
                    <label style={labelStyle}>Paid Amount</label>
                    <input placeholder="Paid" value={paid} onChange={(e) => setPaid(e.target.value)} style={inputStyle} />
                </div>
                <p><strong>Total:</strong> {total.toFixed(2)}</p>
                <p><strong>Due:</strong> {due.toFixed(2)}</p>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="default-button" onClick={() => handleSave(false)}>Save</button>
                    <button className="default-button" onClick={() => handleSave(true)}>Save & Print</button>
                </div>
            </div>
        </div>
    );
};

const formContainer = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '30px',
    background: '#2D3748',
    color: '#fff',
    padding: '20px',
    borderRadius: '4px'
};



const leftCol = { flex: 2 };
const rightCol = {
    flex: 1,
    background: '#575F6D',
    padding: '15px',
    borderRadius: '5px'
};

const labelStyle = {
    marginBottom: '5px',
    display: 'block',
};

const inputStyle = {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: '#eeeeee',
    color: '#333',
    boxSizing: 'border-box'
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
};

const tableRowStyle = (index) => ({
    backgroundColor: index % 2 === 0 ? '#575F6D' : '#4A5568',
});

const tdStyle = {
    padding: '12px 15px',
    textAlign: 'right',
    borderBottom: '1px solid #2D3748',
};

const qtyInputStyle = {
    width: '60px',
    padding: '5px',
    borderRadius: '5px',
    border: '1px solid #A0AEC0',
    backgroundColor: '#E2E8F0',
    color: '#2D3748',
    textAlign: 'center',
};

export default CreateInvoice;
