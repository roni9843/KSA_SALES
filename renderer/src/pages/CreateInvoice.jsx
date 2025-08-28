import { useState, useEffect, useRef } from 'react';
import { FaFileInvoice, FaTrash, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import AsyncSelect from 'react-select/async';
import toast from 'react-hot-toast';
import AddCustomer from '../components/AddCustomer';

const CreateInvoice = () => {
    const navigate = useNavigate();
    const [invoiceItems, setInvoiceItems] = useState([]);
    const [paidByCash, setPaidByCash] = useState(0);
    const [paidByCard, setPaidByCard] = useState(0);
    const [paidByBank, setPaidByBank] = useState(0);
    const [cartDiscount, setCartDiscount] = useState(0);
    const [customer, setCustomer] = useState(null);
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectKey, setSelectKey] = useState(0);
    const selectRef = useRef(null);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);


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
            tax: product.tax,
            discount: 0,
            total_price: product.sale_price * (1 + product.tax / 100),
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
    const paid = parseFloat(paidByCash || 0) + parseFloat(paidByCard || 0) + parseFloat(paidByBank || 0);
    const due = total - paid;
    const change = paid > total ? paid - total : 0;

    const handleSave = async () => {
        if (invoiceItems.length === 0) {
            toast.error('Please add products to the invoice.');
            return;
        }

        const invoiceData = {
            customer_id: customer ? customer.id : null,
            invoice_date: invoiceDate,
            sub_total: subtotal,
            item_discount: itemDiscount,
            item_tax: itemTax,
            cart_discount: parseFloat(cartDiscount || 0),
            payable_total: total,
            paid_amount: paid,
            paid_amount_cash: parseFloat(paidByCash || 0),
            paid_amount_card: parseFloat(paidByCard || 0),
            paid_amount_bank: parseFloat(paidByBank || 0),
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
            navigate(`/invoice/${newId}`);
        } catch (error) {
            console.error('Error creating invoice:', error);
            toast.error('Failed to create invoice.');
        }
    };

    const handleQuotation = () => {
        if (invoiceItems.length === 0) {
            toast.error('Please add products to the quotation.');
            return;
        }

        const quotationData = {
            customer: customer,
            items: invoiceItems,
            subtotal: subtotal,
            itemDiscount: itemDiscount,
            itemTax: itemTax,
            cartDiscount: parseFloat(cartDiscount || 0),
            total: total,
            date: invoiceDate,
        };

        navigate('/quotation', { state: { quotation: quotationData } });
    };

    const handleCustomerAdded = () => {
        setIsCustomerModalOpen(false);
        toast.success('Customer added successfully! You can now search for them.');
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
                                        readOnly
                                        style={readOnlyInputStyle}
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
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
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
                        <button
                            type="button"
                            onClick={() => setIsCustomerModalOpen(true)}
                            className="default-button"
                            style={{
                                flex: "0 0 auto",
                                width: "100px", // 👈 fixed width
                                padding: "10px",
                            }}
                        >
                            <FaPlus />
                        </button>
                    </div>
                </div>

                <div style={{ marginTop: '10px' }}>
                    <label style={labelStyle}>Cart Discount</label>
                    <input type="number" placeholder="Cart Discount" value={cartDiscount} onChange={(e) => setCartDiscount(e.target.value)} style={inputStyle} />
                </div>

                <div style={{ marginTop: '10px' }}>
                    <label style={labelStyle}>Payment Details</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input type="number" placeholder="Paid by Cash" value={paidByCash} onChange={(e) => setPaidByCash(e.target.value)} style={{ ...inputStyle, marginBottom: 0 }} />
                        <input type="number" placeholder="Paid by Card" value={paidByCard} onChange={(e) => setPaidByCard(e.target.value)} style={{ ...inputStyle, marginBottom: 0 }} />
                        <input type="number" placeholder="Paid by Bank" value={paidByBank} onChange={(e) => setPaidByBank(e.target.value)} style={{ ...inputStyle, marginBottom: 0 }} />
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
                    <button className="default-button" onClick={handleQuotation}>Print Quotation</button>
                    <button className="default-button" onClick={handleSave}>Create Invoice & Print</button>
                </div>
            </div>
            {isCustomerModalOpen && (
                <div style={modalOverlay}>
                    <div style={modalBox}>
                        <AddCustomer onAdded={handleCustomerAdded} />
                        <button onClick={() => setIsCustomerModalOpen(false)} style={{ ...closeButtonStyle, position: 'absolute', top: '10px', right: '10px' }}>X</button>
                    </div>
                </div>
            )}
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

const readOnlyInputStyle = {
    ...qtyInputStyle,
    backgroundColor: '#CBD5E0',
    cursor: 'not-allowed',
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

const modalOverlay = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
};

const modalBox = {
    background: '#4A5568',
    padding: '20px',
    borderRadius: '8px',
    position: 'relative',
    width: '80%',
    maxWidth: '800px'
};

const closeButtonStyle = {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '20px',
    cursor: 'pointer'
};

export default CreateInvoice;