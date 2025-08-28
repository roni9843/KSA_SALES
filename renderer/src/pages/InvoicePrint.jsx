import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function InvoicePrint() {
    const { id } = useParams();
    const [invoice, setInvoice] = useState(null);
    const [details, setDetails] = useState([]);
    const [settings, setSettings] = useState(null);
    const [logoDataUrl, setLogoDataUrl] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await window.electron.ipcRenderer.invoke('get-invoice', parseInt(id));
                setInvoice(res.invoice);
                setDetails(res.details);
                const settingsData = await window.electron.ipcRenderer.invoke('get-settings');
                setSettings(settingsData);

                if (settingsData && settingsData.shop_logo) {
                    setLogoDataUrl(settingsData.shop_logo);
                }
            } catch (e) {
                console.error('Error fetching invoice:', e);
            }
        }
        fetchData();
    }, [id]);

    const handlePrint = () => {
        window.print();
        setTimeout(() => {
            navigate('/invoices');
        }, 1000);
    };

    const handleCancel = () => {
        navigate('/invoices');
    };

    if (!invoice || !settings) return <div style={{ padding: '20px' }}>Loading...</div>;

    const dueDate = new Date(invoice.created_at);
    dueDate.setDate(dueDate.getDate() + 7); // Assuming due date is 7 days after issue

    return (
        <div style={{ maxWidth: '800px', margin: 'auto', padding: '20px', fontFamily: 'sans-serif', color: '#333' }}>
            {/* Header */}
            <div style={{ backgroundColor: '#003366', color: 'white', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: '48px', margin: 0 }}>Invoice</h1>
                    <div style={{ border: '1px solid white', padding: '20px', marginTop: '10px', width: '150px', textAlign: 'center', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {logoDataUrl ? (
                            <img src={logoDataUrl} alt="Company Logo" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                        ) : (
                            'Your Company Logo'
                        )}
                    </div>
                </div>
                <div style={{ textAlign: 'right', flex: 1 }}>
                    <h2>{settings.shop_name}</h2>
                    <p>{settings.shop_address}</p>
                    <p>{settings.shop_phone}</p>
                    <p>{settings.shop_email}</p>
                </div>
            </div>

            {/* Invoice Details & Bill To */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #ccc' }}>
                <div>
                    <h3 style={{ margin: '0 0 10px 0' }}>INVOICE DETAILS:</h3>
                    <p><strong>Invoice #:</strong> {invoice.id}</p>
                    <p><strong>Date of Issue:</strong> {new Date(invoice.created_at).toLocaleDateString()}</p>
                    <p><strong>Due Date:</strong> {dueDate.toLocaleDateString()}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>BILL TO:</h3>
                    <p>{invoice.customer_name}</p>
                    {invoice.customer_address && <p>{invoice.customer_address}</p>}
                    {invoice.customer_tax_number && <p>Tax No: {invoice.customer_tax_number}</p>}
                    {invoice.customer_Uakam_no && <p>Uakam No: {invoice.customer_Uakam_no}</p>}
                </div>
            </div>

            {/* Items Table */}
            <table width="100%" style={{ marginTop: '10px', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #333' }}>
                        <th style={{ textAlign: 'left', padding: '8px' }}>ITEM/SERVICE</th>
                        <th style={{ textAlign: 'right', padding: '8px' }}>QTY</th>
                        <th style={{ textAlign: 'right', padding: '8px' }}>RATE</th>
                        <th style={{ textAlign: 'right', padding: '8px' }}>DISCOUNT</th>
                        <th style={{ textAlign: 'right', padding: '8px' }}>TAX</th>
                        <th style={{ textAlign: 'right', padding: '8px' }}>AMOUNT</th>
                    </tr>
                </thead>
                <tbody>
                    {details.map((item, i) => {
                        const itemSubtotal = item.quantity * item.unit_price;
                        const discountAmount = itemSubtotal * (item.discount / 100);
                        const taxAmount = (itemSubtotal - discountAmount) * (item.tax / 100);

                        return (
                            <tr key={i} style={{ borderBottom: '1px solid #ccc' }}>
                                <td style={{ padding: '8px' }}>{item.product_name}</td>
                                <td style={{ textAlign: 'right', padding: '8px' }}>{item.quantity}</td>
                                <td style={{ textAlign: 'right', padding: '8px' }}>{item.unit_price.toFixed(2)}</td>
                                <td style={{ textAlign: 'right', padding: '8px' }}>{discountAmount.toFixed(2)}</td>
                                <td style={{ textAlign: 'right', padding: '8px' }}>{taxAmount.toFixed(2)}</td>
                                <td style={{ textAlign: 'right', padding: '8px' }}>{item.total_price.toFixed(2)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* Totals Section */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <div style={{ width: '250px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                        <span>Subtotal</span>
                        <span>{invoice.sub_total.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                        <span>Item Discount</span>
                        <span>-{invoice.item_discount.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                        <span>Item Tax</span>
                        <span>{invoice.item_tax.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                        <span>Cart Discount</span>
                        <span>-{invoice.cart_discount.toFixed(2)}</span>
                    </div>
                    <div style={{ borderTop: '2px solid #333', marginTop: '10px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px' }}>
                        <span>TOTAL</span>
                        <span>{invoice.total.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                        <span>Paid</span>
                        <span>{invoice.paid.toFixed(2)}</span>
                    </div>
                    {invoice.paid_amount_cash > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 8px', fontSize: '14px' }}>
                            <span>&nbsp;&nbsp;↳ by Cash</span>
                            <span>{invoice.paid_amount_cash.toFixed(2)}</span>
                        </div>
                    )}
                    {invoice.paid_amount_card > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 8px', fontSize: '14px' }}>
                            <span>&nbsp;&nbsp;↳ by Card</span>
                            <span>{invoice.paid_amount_card.toFixed(2)}</span>
                        </div>
                    )}
                    {invoice.paid_amount_bank > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 8px', fontSize: '14px' }}>
                            <span>&nbsp;&nbsp;↳ by Bank</span>
                            <span>{invoice.paid_amount_bank.toFixed(2)}</span>
                        </div>
                    )}
                    {(invoice.paid - invoice.total > 0) &&
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                            <span>Change</span>
                            <span>{(invoice.paid - invoice.total).toFixed(2)}</span>
                        </div>
                    }
                    {invoice.due > 0 &&
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontWeight: 'bold' }}>
                            <span>Due</span>
                            <span>{invoice.due.toFixed(2)}</span>
                        </div>
                    }
                </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: '20px' }}>
                <h3>TERMS</h3>
                <p>Please pay the invoice by the due date.</p>
                <h3>CONDITIONS/INSTRUCTIONS</h3>
                <p>Payment can be made via bank transfer or cash.</p>
            </div>

            <div style={{ marginTop: '10px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button onClick={handlePrint} style={{ padding: '10px 20px', cursor: 'pointer', border: 'none', backgroundColor: '#007bff', color: 'white', fontSize: '16px' }}>
                    🖨️ Print
                </button>
                <button onClick={handleCancel} style={{ padding: '10px 20px', cursor: 'pointer', border: 'none', backgroundColor: '#6c757d', color: 'white', fontSize: '16px' }}>
                    Cancel
                </button>
            </div>

            <div style={{ position: 'fixed', bottom: '0', left: '0', right: '0', backgroundColor: '#003366', height: '40px' }}></div>
        </div>
    );
}

export default InvoicePrint;
