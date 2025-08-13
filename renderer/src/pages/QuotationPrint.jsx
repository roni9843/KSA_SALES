import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function QuotationPrint() {
    const location = useLocation();
    const navigate = useNavigate();
    const { quotation } = location.state || {};

    const handlePrint = () => {
        window.print();
    };

    const handleCancel = () => {
        navigate('/'); // Go back to the create invoice page
    };

    if (!quotation) {
        return (
            <div style={{ padding: '20px' }}>
                <p>No quotation data provided.</p>
                <button onClick={handleCancel}>Go Back</button>
            </div>
        );
    }

    const { customer, items, subtotal, itemDiscount, itemTax, cartDiscount, total, date } = quotation;

    return (
        <div style={{ maxWidth: '800px', margin: 'auto', padding: '20px', fontFamily: 'sans-serif', color: '#333' }}>
            {/* Header */}
            <div style={{ backgroundColor: '#003366', color: 'white', padding: '40px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: '48px', margin: 0 }}>Quotation</h1>
                    <div style={{ border: '1px solid white', padding: '20px', marginTop: '20px', width: '150px', textAlign: 'center' }}>
                        Your Company Logo
                    </div>
                </div>
                <div style={{ textAlign: 'right', flex: 1 }}>
                    <h2>Business Name</h2>
                    <p>Street Address Line 01</p>
                    <p>Street Address Line 02</p>
                    <p>+1 (999)-999-9999</p>
                    <p>Email Address</p>
                    <p>Website</p>
                </div>
            </div>

            {/* Quotation Details & Bill To */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid #ccc' }}>
                <div>
                    <h3 style={{ margin: '0 0 10px 0' }}>QUOTATION DETAILS:</h3>
                    <p><strong>Quotation #:</strong> Q-{Date.now()}</p>
                    <p><strong>Date of Issue:</strong> {new Date(date).toLocaleDateString()}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>BILL TO:</h3>
                    <p>{customer ? customer.name : 'Walk-in Customer'}</p>
                    {customer && <p>{customer.address}</p>}
                </div>
            </div>

            {/* Items Table */}
            <table width="100%" style={{ marginTop: '20px', borderCollapse: 'collapse' }}>
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
                    {items.map((item, i) => {
                        const itemSubtotal = item.quantity * item.sale_price;
                        const discountAmount = itemSubtotal * (item.discount / 100);
                        const taxAmount = (itemSubtotal - discountAmount) * (item.tax / 100);

                        return (
                            <tr key={i} style={{ borderBottom: '1px solid #ccc' }}>
                                <td style={{ padding: '8px' }}>{item.name}</td>
                                <td style={{ textAlign: 'right', padding: '8px' }}>{item.quantity}</td>
                                <td style={{ textAlign: 'right', padding: '8px' }}>{item.sale_price.toFixed(2)}</td>
                                <td style={{ textAlign: 'right', padding: '8px' }}>{discountAmount.toFixed(2)}</td>
                                <td style={{ textAlign: 'right', padding: '8px' }}>{taxAmount.toFixed(2)}</td>
                                <td style={{ textAlign: 'right', padding: '8px' }}>{item.total_price.toFixed(2)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* Totals Section */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <div style={{ width: '250px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                        <span>Subtotal</span>
                        <span>{subtotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                        <span>Item Discount</span>
                        <span>-{itemDiscount.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                        <span>Item Tax</span>
                        <span>{itemTax.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                        <span>Cart Discount</span>
                        <span>-{cartDiscount.toFixed(2)}</span>
                    </div>
                    <div style={{ borderTop: '2px solid #333', marginTop: '10px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px' }}>
                        <span>TOTAL</span>
                        <span>{total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: '40px' }}>
                <h3>TERMS & CONDITIONS</h3>
                <p>This quotation is valid for 30 days. Prices are subject to change.</p>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '10px' }}>
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

export default QuotationPrint;
