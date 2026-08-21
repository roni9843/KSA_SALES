import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { generateZatcaTlvBase64 } from '../utils/zatcaEncoder';

function QuotationPrint() {
    const location = useLocation();
    const navigate = useNavigate();
    const { quotation } = location.state || {};
    const [settings, setSettings] = useState(null);
    const [logoDataUrl, setLogoDataUrl] = useState('');

    useEffect(() => {
        async function fetchSettings() {
            try {
                const settingsData = await window.electron.ipcRenderer.invoke('get-settings');
                setSettings(settingsData);

                if (settingsData && settingsData.shop_logo) {
                    setLogoDataUrl(settingsData.shop_logo);
                }
            } catch (e) {
                console.error('Error fetching settings:', e);
            }
        }
        fetchSettings();
    }, []);

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

    if (!settings) {
        return (
            <div style={{ padding: '20px' }}>
                <p>Loading...</p>
            </div>
        );
    }

    const { customer, items, subtotal, itemDiscount, itemTax, cartDiscount, total, date } = quotation;

    const zatcaQrBase64 = generateZatcaTlvBase64({
        sellerName: settings?.shop_name || 'Moto POS Merchant',
        vatNumber: settings?.tax_number || '310123456700003',
        timestamp: date,
        totalAmount: total,
        vatAmount: itemTax
    });

    return (
        <div style={{ maxWidth: '800px', margin: 'auto', padding: '20px', fontFamily: 'sans-serif', color: '#333' }}>
            {/* Header */}
            <div style={{ backgroundColor: '#003366', color: 'white', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: '48px', margin: 0 }}>Quotation</h1>
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

            {/* Quotation Details & Bill To */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #ccc' }}>
                <div>
                    <h3 style={{ margin: '0 0 10px 0' }}>QUOTATION DETAILS:</h3>
                    <p><strong>Quotation #:</strong> Q-{Date.now()}</p>
                    <p><strong>Date of Issue:</strong> {new Date(date).toLocaleDateString()}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>BILL TO:</h3>
                    <p>{customer ? customer.name : 'Walk-in Customer'}</p>
                    {customer && customer.address && <p>{customer.address}</p>}
                    {customer && customer.tax_number && <p>Tax No: {customer.tax_number}</p>}
                    {customer && customer.Uakam_no && <p>Uakam No: {customer.Uakam_no}</p>}
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

            {/* Totals & ZATCA QR Code Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '10px' }}>
                <div style={{ textAlign: 'center', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '12px', backgroundColor: '#f8fafc', width: '150px' }}>
                    {zatcaQrBase64 ? (
                        <QRCodeSVG value={zatcaQrBase64} size={120} level="M" includeMargin={false} />
                    ) : (
                        <div style={{ width: '120px', height: '120px', backgroundColor: '#eee' }} />
                    )}
                    <p style={{ fontSize: '10px', fontWeight: 'bold', margin: '6px 0 0 0', color: '#003366' }}>ZATCA E-INVOICE QR</p>
                    <p style={{ fontSize: '9px', margin: 0, color: '#64748b' }}>رمز الاستجابة السريعة</p>
                </div>

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
            <div style={{ marginTop: '20px' }}>
                <h3>TERMS & CONDITIONS</h3>
                <p>This quotation is valid for 30 days. Prices are subject to change.</p>
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

export default QuotationPrint;
