import { useState, useEffect, useRef } from 'react';
import { FaFileInvoice, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import AsyncSelect from 'react-select/async';
import toast from 'react-hot-toast';

const CreateInvoice = () => {
    const navigate = useNavigate();
    const [invoiceItems, setInvoiceItems] = useState([]);
    const [paid, setPaid] = useState(0);
    const [cartDiscount, setCartDiscount] = useState(0);
    const [customer, setCustomer] = useState(null);
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectKey, setSelectKey] = useState(0);
    const selectRef = useRef(null);

    useEffect(() => {
        if (selectRef.current) {
            selectRef.current.focus();
        }
    }, [selectKey]);


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

    const loadCustomerOptions = async (inputValue) => {
        if (inputValue.length < 2) return [];
        try {
            const results = await window.electron.ipcRenderer.invoke('search-customers', inputValue);
            return results.map(c => ({
                value: c.id,
                label: `${c.name} (${c.phone})`,
                customer: c
            }));
        } catch (error) {
            console.error('Error searching customers:', error);
            toast.error('Failed to search for customers.');
            return [];
        }
    };

    const handleCustomerSelect = (selectedOption) => {
        if (!selectedOption) {
            setCustomer(null);
            return;
        }
        setCustomer(selectedOption.customer);
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
            quantity_in_stock: product.quantity_in_stock,
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
        const parsedValue = parseFloat(value) || 0;

        if (field === 'tax' || field === 'discount') {
            if (parsedValue < 0) {
                toast.error(`${field.charAt(0).toUpperCase() + field.slice(1)} cannot be negative.`);
                return;
            }
        }

        setInvoiceItems(items =>
            items.map(item => {
                if (item.id === id) {
                    if (field === 'quantity' && parsedValue > item.quantity_in_stock) {
                        toast.error(`Only ${item.quantity_in_stock} in stock.`);
                        return item; // Keep the old value
                    }
                    const newItem = { ...item, [field]: parsedValue };
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

    const subtotal = invoiceItems.reduce((sum, i) => sum + i.sale_price * i.quantity, 0);
    const itemDiscount = invoiceItems.reduce((sum, i) => sum + (i.sale_price * i.quantity * i.discount / 100), 0);
    const itemTax = invoiceItems.reduce((sum, i) => sum + (i.sale_price * i.quantity * (1 - i.discount / 100) * i.tax / 100), 0);
    const total = subtotal - itemDiscount + itemTax - parseFloat(cartDiscount || 0);
    const due = total - parseFloat(paid || 0);
    const change = parseFloat(paid || 0) > total ? parseFloat(paid || 0) - total : 0;

    const handleSave = async (print = false) => {
        if (invoiceItems.length === 0) {
            toast.error('Please add products to the invoice.');
            return;
        }

        // if (parseFloat(paid) > total) {
        //     toast.error("Paid amount can't be more than total");
        //     return;
        // }

        const invoiceData = {
            customer_id: customer ? customer.id : null,
            invoice_date: invoiceDate,
            sub_total: subtotal,
            item_discount: itemDiscount,
            item_tax: itemTax,
            cart_discount: parseFloat(cartDiscount || 0),
            payable_total: total,
            paid_amount: parseFloat(paid || 0),
            due_amount: due,
            change_amount: change,
            created_by: 'user', // Replace with actual user if available
            invoice_items: invoiceItems.map(item => ({
                product_id: item.id,
                quantity: item.quantity,
                price: item.sale_price,
                tax: item.tax,
                discount: item.discount,
                total_price: item.total_price
            }))
        };

        try {
            const newId = await window.electron.ipcRenderer.invoke('create-invoice', invoiceData);

            if (print) {
                navigate(`/invoice/${newId}`);
            } else {
                toast.success("Invoice Saved");
                setInvoiceItems([]);
                setCustomer(null);
                setPaid(0);
                setCartDiscount(0);
                // Reset customer async select if possible, or just rely on setCustomer(null)
            }
        } catch (error) {
            console.error('Error creating invoice:', error);
            toast.error('Failed to create invoice.');
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
                    styles={selectStyles}
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
                    <AsyncSelect
                        cacheOptions
                        defaultOptions
                        loadOptions={loadCustomerOptions}
                        onChange={handleCustomerSelect}
                        placeholder="Search for a customer..."
                        isClearable
                        styles={selectStyles}
                    />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Paid Amount</label>
                        <input type="number" placeholder="Paid" value={paid} onChange={(e) => setPaid(e.target.value)} style={inputStyle} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Cart Discount</label>
                        <input type="number" placeholder="Cart Discount" value={cartDiscount} onChange={(e) => setCartDiscount(e.target.value)} style={inputStyle} />
                    </div>
                </div>

                <hr />
                <div style={summaryRow}>
                    <span>Subtotal</span>
                    <span>{subtotal.toFixed(2)}</span>
                </div>
                <div style={summaryRow}>
                    <span>Item Discount</span>
                    <span>{itemDiscount.toFixed(2)}</span>
                </div>
                <div style={summaryRow}>
                    <span>Item Tax</span>
                    <span>{itemTax.toFixed(2)}</span>
                </div>
                <div style={summaryRow}>
                    <span>Cart Discount</span>
                    <span>{cartDiscount}</span>
                </div>
                <hr />
                <div style={summaryRow}>
                    <strong>Total</strong>
                    <strong>{total.toFixed(2)}</strong>
                </div>
                {change > 0 && (
                    <div style={summaryRow}>
                        <span>Change</span>
                        <span>{change.toFixed(2)}</span>
                    </div>
                )}
                {due > 0 && (
                    <div style={summaryRow}>
                        <span>Due</span>
                        <span>{due.toFixed(2)}</span>
                    </div>
                )}

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

const selectStyles = {
    control: (provided) => ({
        ...provided,
        backgroundColor: '#fff',
        color: '#333',
        border: '1px solid #A0AEC0',
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: '#fff',
        color: '#333',
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? '#27ae60' : state.isFocused ? '#f0f0f0' : '#fff',
        color: state.isSelected ? '#fff' : '#333',
    }),
    singleValue: (provided) => ({
        ...provided,
        color: '#333',
    }),
};

const summaryRow = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
};

export default CreateInvoice;
