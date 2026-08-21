import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AsyncSelect from 'react-select/async';
import toast from 'react-hot-toast';
import { FaTrash, FaPlus, FaMoneyBillWave, FaCreditCard, FaUniversity, FaFileInvoice, FaSave, FaCashRegister, FaPrint } from 'react-icons/fa';
import AddCustomer from '../components/AddCustomer';
import PosShiftModal from '../components/PosShiftModal';
import InvoicePrintModal from '../components/InvoicePrintModal';

const CreateInvoice = () => {
    const navigate = useNavigate();
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [customer, setCustomer] = useState(null);
    const [cartDiscount, setCartDiscount] = useState('');
    const [paidByCash, setPaidByCash] = useState('');
    const [paidByCard, setPaidByCard] = useState('');
    const [paidByBank, setPaidByBank] = useState('');
    const [invoiceItems, setInvoiceItems] = useState([]);
    
    // Modals state
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
    const [createdInvoiceToPrint, setCreatedInvoiceToPrint] = useState(null);
    const [activeShift, setActiveShift] = useState(null);
    
    const [selectKey, setSelectKey] = useState(0);
    const [loading, setLoading] = useState(false);
    const selectRef = useRef(null);

    const checkShift = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/pos-shifts/current', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.success) setActiveShift(data.shift);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        checkShift();
    }, []);

    const loadProductOptions = async (inputValue) => {
        if (inputValue.length < 2) return [];
        try {
            const results = await window.electron.ipcRenderer.invoke('search-products-for-invoice', inputValue);
            return results.map(p => ({
                value: p.id,
                label: `${p.name} - ${p.sale_price} SAR (Stock: ${p.quantity_in_stock})`,
                product: p
            }));
        } catch (error) {
            console.error('Error searching products:', error);
            return [];
        }
    };

    const loadCustomerOptions = async (inputValue) => {
        if (inputValue.length < 2) return [];
        try {
            const results = await window.electron.ipcRenderer.invoke('search-customers', inputValue);
            return results.map(c => ({
                value: c.id,
                label: `${c.name} (${c.phone || 'No Phone'})`,
                customer: c
            }));
        } catch (error) {
            console.error('Error searching customers:', error);
            return [];
        }
    };

    const handleProductSelect = (selectedOption) => {
        if (!selectedOption) return;

        const product = selectedOption.product;
        const existingItem = invoiceItems.find(item => item.id === product.id);

        if (existingItem) {
            handleItemChange(product.id, 'quantity', existingItem.quantity + 1);
        } else {
            const newItem = {
                id: product.id,
                name: product.name,
                quantity: 1,
                sale_price: product.sale_price,
                tax: product.tax || 0,
                discount: 0,
                total_price: product.sale_price * (1 + (product.tax || 0) / 100)
            };
            setInvoiceItems([...invoiceItems, newItem]);
        }
        setSelectKey(prevKey => prevKey + 1);
        if (selectRef.current) {
            selectRef.current.clearValue();
        }
    };

    const handleCustomerSelect = (selectedOption) => {
        if (selectedOption) {
            setCustomer(selectedOption.customer);
        } else {
            setCustomer(null);
        }
    };

    const handleItemChange = (id, field, value) => {
        const updatedItems = invoiceItems.map(item => {
            if (item.id === id) {
                const newItem = { ...item, [field]: parseFloat(value) || 0 };
                const subtotal = newItem.quantity * newItem.sale_price;
                const discountAmount = newItem.discount || 0;
                const taxAmount = (subtotal - discountAmount) * (newItem.tax / 100);
                newItem.total_price = subtotal - discountAmount + taxAmount;
                return newItem;
            }
            return item;
        });
        setInvoiceItems(updatedItems);
    };

    const removeItem = (id) => {
        setInvoiceItems(invoiceItems.filter(item => item.id !== id));
    };

    const subtotal = invoiceItems.reduce((acc, item) => acc + (item.quantity * item.sale_price), 0);
    const itemDiscount = invoiceItems.reduce((acc, item) => acc + (item.discount || 0), 0);
    const itemTax = invoiceItems.reduce((acc, item) => {
        const itemSubtotal = item.quantity * item.sale_price;
        const discountAmount = item.discount || 0;
        return acc + ((itemSubtotal - discountAmount) * (item.tax / 100));
    }, 0);

    const total = subtotal - itemDiscount + itemTax - parseFloat(cartDiscount || 0);
    const paid = parseFloat(paidByCash || 0) + parseFloat(paidByCard || 0) + parseFloat(paidByBank || 0);
    const due = total - paid;
    const change = paid > total ? paid - total : 0;

    const buildInvoicePayload = (statusType = 'final') => ({
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
        status: statusType,
        created_by: 'user',
        invoice_items: invoiceItems.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            price: item.sale_price,
            tax: item.tax,
            discount: item.discount,
            total_price: item.total_price
        }))
    });

    const handleCreateFinalInvoice = async () => {
        if (invoiceItems.length === 0) {
            return toast.error('Please add products to checkout.');
        }

        setLoading(true);
        try {
            const invoiceData = buildInvoicePayload('final');
            const res = await fetch('http://localhost:5000/api/invoices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(invoiceData)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('ZATCA Tax Invoice Generated Successfully!');
                setCreatedInvoiceToPrint(data.invoice || {
                    invoiceId: 'INV-' + Date.now(),
                    invoiceDate,
                    customer,
                    items: invoiceItems,
                    subTotal: subtotal,
                    itemTax,
                    payableTotal: total,
                    zatcaQrCode: data.invoice?.zatcaQrCode
                });
            } else {
                toast.error(data.message || 'Failed to create invoice');
            }
        } catch (error) {
            console.error('Error creating invoice:', error);
            toast.error('Failed to checkout invoice.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={formContainer}>
            {/* Shift Status Header Banner */}
            <div className="w-full bg-slate-900 text-white p-3 rounded-xl flex justify-between items-center mb-2 col-span-2">
                <div className="flex items-center gap-3">
                    <FaCashRegister className="text-xl text-blue-400" />
                    <div>
                        <span className="text-xs font-semibold text-slate-300">POS Cashier Counter Shift:</span>
                        <h4 className="text-sm font-extrabold">{activeShift ? `Active Shift (${activeShift.shiftNumber}) - Opening Float: ${activeShift.openingFloat} SAR` : 'No Active Shift Opened'}</h4>
                    </div>
                </div>
                <button onClick={() => setIsShiftModalOpen(true)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs">
                    {activeShift ? 'Manage / Close Shift' : 'Open Shift Drawer'}
                </button>
            </div>

            {/* Left Column: Product Selection & Cart Items */}
            <div style={leftCol}>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 mb-4 border-b border-slate-200 pb-3">
                    <FaFileInvoice className="text-blue-600" /> Create POS Tax Invoice
                </h2>
                <AsyncSelect
                    key={selectKey}
                    ref={selectRef}
                    cacheOptions
                    defaultOptions
                    loadOptions={loadProductOptions}
                    onChange={handleProductSelect}
                    placeholder="Type product name or scan barcode..."
                    isClearable
                    styles={selectStyles}
                />

                <div className="overflow-x-auto rounded-xl border border-slate-200 mt-4">
                    <table style={tableStyle}>
                        <thead style={tableHeaderStyle}>
                            <tr>
                                <th style={{ ...thStyle, textAlign: 'left' }}>Product Name</th>
                                <th style={thStyle}>Qty</th>
                                <th style={thStyle}>Price</th>
                                <th style={thStyle}>Tax (%)</th>
                                <th style={thStyle}>Discount (SAR)</th>
                                <th style={thStyle}>Total</th>
                                <th style={{ ...thStyle, textAlign: 'center' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceItems.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-slate-400 text-sm">Select products above or scan barcode to add items to cart.</td>
                                </tr>
                            ) : (
                                invoiceItems.map((i, index) => (
                                    <tr key={i.id} style={tableRowStyle(index)}>
                                        <td style={{ ...tdStyle, textAlign: 'left', fontWeight: '700', color: '#0f172a' }}>{i.name}</td>
                                        <td style={tdStyle}>
                                            <input
                                                type="number"
                                                value={i.quantity}
                                                onChange={(e) => handleItemChange(i.id, 'quantity', e.target.value)}
                                                style={qtyInputStyle}
                                                min="1"
                                            />
                                        </td>
                                        <td style={tdStyle}>{i.sale_price.toFixed(2)} SAR</td>
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
                                        <td style={{ ...tdStyle, fontWeight: '700', color: '#2563eb' }}>{i.total_price.toFixed(2)} SAR</td>
                                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                                            <button onClick={() => removeItem(i.id)} className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors">
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Right Column: Checkout Summary & Payment */}
            <div style={rightCol}>
                <h4 className="text-base font-extrabold text-slate-900 mb-4 border-b border-slate-200 pb-2">🧾 Checkout Summary</h4>
                <div className="space-y-3">
                    <div>
                        <label style={labelStyle}>Invoice Date</label>
                        <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>Select Customer</label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <div style={{ flex: 1 }}>
                                <AsyncSelect
                                    cacheOptions
                                    defaultOptions
                                    loadOptions={loadCustomerOptions}
                                    onChange={handleCustomerSelect}
                                    placeholder="Search customer..."
                                    isClearable
                                    styles={selectStyles}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsCustomerModalOpen(true)}
                                className="px-3 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-sm"
                            >
                                <FaPlus />
                            </button>
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Cart Discount (SAR)</label>
                        <input type="number" placeholder="0.00" value={cartDiscount} onChange={(e) => setCartDiscount(e.target.value)} style={inputStyle} />
                    </div>

                    <div className="pt-2">
                        <label style={labelStyle}>Split Payment Breakdown</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                            <div style={paymentGroupStyle}>
                                <label style={paymentLabelStyle}><FaMoneyBillWave className="text-emerald-600" /> Cash</label>
                                <input type="number" placeholder="0.00" value={paidByCash} onChange={(e) => setPaidByCash(e.target.value)} style={{ ...inputStyle, marginBottom: 0 }} />
                            </div>
                            <div style={paymentGroupStyle}>
                                <label style={paymentLabelStyle}><FaCreditCard className="text-blue-600" /> Card</label>
                                <input type="number" placeholder="0.00" value={paidByCard} onChange={(e) => setPaidByCard(e.target.value)} style={{ ...inputStyle, marginBottom: 0 }} />
                            </div>
                            <div style={paymentGroupStyle}>
                                <label style={paymentLabelStyle}><FaUniversity className="text-indigo-600" /> Bank</label>
                                <input type="number" placeholder="0.00" value={paidByBank} onChange={(e) => setPaidByBank(e.target.value)} style={{ ...inputStyle, marginBottom: 0 }} />
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="border-slate-200 my-4" />
                <div style={summaryRow} className="text-sm font-semibold text-slate-600">
                    <span>Subtotal</span>
                    <span>{subtotal.toFixed(2)} SAR</span>
                </div>
                <div style={summaryRow} className="text-sm font-semibold text-slate-600">
                    <span>VAT Total (15%)</span>
                    <span>{itemTax.toFixed(2)} SAR</span>
                </div>
                <div style={summaryRow} className="text-sm font-semibold text-slate-600">
                    <span>Cart Discount</span>
                    <span>{cartDiscount || '0.00'} SAR</span>
                </div>
                <hr className="border-slate-200 my-3" />
                <div style={summaryRow} className="text-base font-extrabold text-slate-900">
                    <span>Payable Total</span>
                    <span className="text-blue-600">{total.toFixed(2)} SAR</span>
                </div>

                <div className="flex flex-col gap-2 mt-5">
                    <button disabled={loading} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2" onClick={handleCreateFinalInvoice}>
                        <FaFileInvoice /> Complete POS Invoice & Print ZATCA QR
                    </button>
                </div>
            </div>

            {/* Modals */}
            {isCustomerModalOpen && (
                <div style={modalOverlay}>
                    <div style={modalBox}>
                        <AddCustomer onAdded={() => setIsCustomerModalOpen(false)} />
                        <button onClick={() => setIsCustomerModalOpen(false)} style={{ ...closeButtonStyle, position: 'absolute', top: '15px', right: '15px' }}>✕</button>
                    </div>
                </div>
            )}

            {isShiftModalOpen && (
                <PosShiftModal isOpen={isShiftModalOpen} onClose={() => setIsShiftModalOpen(false)} onShiftUpdated={setActiveShift} />
            )}

            {createdInvoiceToPrint && (
                <InvoicePrintModal invoice={createdInvoiceToPrint} onClose={() => setCreatedInvoiceToPrint(null)} />
            )}
        </div>
    );
};

const formContainer = {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '24px',
    background: '#ffffff',
    color: '#0f172a',
    padding: '24px',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
};

const leftCol = {};
const rightCol = {
    background: '#f8fafc',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
};

const labelStyle = {
    marginBottom: '6px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
    display: 'block',
};

const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    marginBottom: '10px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontSize: '13px',
    boxSizing: 'border-box',
    outline: 'none',
};

const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
};

const tableHeaderStyle = {
    backgroundColor: '#f8fafc',
    color: '#475569',
};

const thStyle = {
    padding: '10px 12px',
    textAlign: 'right',
    borderBottom: '1px solid #e2e8f0',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
};

const tableRowStyle = (index) => ({
    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc',
});

const tdStyle = {
    padding: '10px 12px',
    borderBottom: '1px solid #e2e8f0',
    color: '#334155',
    fontSize: '13px',
};

const qtyInputStyle = {
    width: '60px',
    padding: '4px 8px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    textAlign: 'right',
    fontSize: '13px',
    outline: 'none',
};

const readOnlyInputStyle = {
    width: '50px',
    padding: '4px 8px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#f1f5f9',
    textAlign: 'right',
    fontSize: '13px',
    color: '#64748b',
};

const summaryRow = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '4px 0',
};

const paymentGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
};

const paymentLabelStyle = {
    fontSize: '11px',
    fontWeight: '700',
    color: '#475569',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
};

const modalOverlay = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999
};

const modalBox = {
    background: '#ffffff',
    padding: '24px',
    borderRadius: '20px',
    width: 'clamp(400px, 50vw, 600px)',
    color: '#0f172a',
    border: '1px solid #e2e8f0',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    position: 'relative',
};

const closeButtonStyle = {
    border: 'none',
    background: 'transparent',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#64748b',
};

const selectStyles = {
    control: (provided) => ({
        ...provided,
        backgroundColor: '#ffffff',
        color: '#0f172a',
        border: '1px solid #cbd5e1',
        borderRadius: '10px',
        fontSize: '13px',
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: '#ffffff',
        color: '#0f172a',
        borderRadius: '10px',
        border: '1px solid #cbd5e1',
        zIndex: 100,
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? '#2563eb' : state.isFocused ? '#f1f5f9' : '#ffffff',
        color: state.isSelected ? '#ffffff' : '#0f172a',
        fontSize: '13px',
    }),
    singleValue: (provided) => ({
        ...provided,
        color: '#0f172a',
        fontSize: '13px',
    }),
};

export default CreateInvoice;