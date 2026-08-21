import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { generateZatcaTlvBase64 } from '../utils/zatcaEncoder';

function InvoicePrint() {
    const { id } = useParams();
    const [invoice, setInvoice] = useState(null);
    const [details, setDetails] = useState([]);
    const [settings, setSettings] = useState(null);
    const [logoDataUrl, setLogoDataUrl] = useState('');
    const [finalizing, setFinalizing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await window.electron.ipcRenderer.invoke('get-invoice', id);
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

    const handleFinalize = async () => {
        setFinalizing(true);
        try {
            const targetId = invoice.raw_id || invoice.id || id;
            await window.electron.ipcRenderer.invoke('finalize-invoice', targetId);
            toast.success('Invoice finalized & inventory stock updated!');
            setInvoice(prev => ({ ...prev, status: 'final' }));
            setTimeout(() => {
                window.print();
            }, 300);
        } catch (error) {
            console.error('Error finalizing invoice:', error);
            toast.error('Failed to finalize invoice.');
        } finally {
            setFinalizing(false);
        }
    };

    const handleDeleteDraft = async () => {
        if (!window.confirm('Are you sure you want to delete this draft invoice?')) return;
        try {
            const targetId = invoice.raw_id || invoice.id || id;
            await window.electron.ipcRenderer.invoke('delete-invoice', targetId);
            toast.success('Draft invoice deleted successfully!');
            navigate('/draft-invoices');
        } catch (error) {
            console.error('Error deleting draft invoice:', error);
            toast.error('Failed to delete draft invoice.');
        }
    };

    const handleCancel = () => {
        if (invoice?.status === 'draft') {
            navigate('/draft-invoices');
        } else {
            navigate('/invoices');
        }
    };

    if (!invoice || !settings) return <div style={{ padding: '20px' }}>Loading Invoice...</div>;

    const dueDate = new Date(invoice.created_at);
    dueDate.setDate(dueDate.getDate() + 7);
    const isDraft = invoice.status === 'draft';

    // Calculate ZATCA Phase 2 TLV Base64 QR String
    const zatcaQrBase64 = generateZatcaTlvBase64({
        sellerName: settings?.shop_name || 'Moto POS Merchant',
        vatNumber: settings?.tax_number || '310123456700003',
        timestamp: invoice?.created_at,
        totalAmount: invoice?.total,
        vatAmount: invoice?.item_tax
    });

    return (
        <div style={{ maxWidth: '800px', margin: 'auto', padding: '20px', fontFamily: 'sans-serif', color: '#333' }}>
            {/* Draft Alert Banner */}
            {isDraft && (
                <div style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', padding: '12px 16px', borderRadius: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 'bold' }}>
                    <div>
                        <span>💾 DRAFT INVOICE: </span>
                        <span style={{ fontWeight: 'normal', fontSize: '13px' }}>This invoice is saved as a Draft. Closing this page will keep the draft saved. Click "Delete Draft" if you want to remove it.</span>
                    </div>
                </div>
            )}

            {/* Header */}
            <div style={{ backgroundColor: '#003366', color: 'white', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: '44px', margin: 0 }}>Invoice</h1>
                    <div style={{ border: '1px solid white', padding: '10px', marginTop: '10px', width: '140px', textAlign: 'center', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {logoDataUrl ? (
                            <img src={logoDataUrl} alt="Company Logo" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                        ) : (
                            'Company Logo'
                        )}
                    </div>
                </div>
                <div style={{ textAlign: 'right', flex: 1 }}>
                    <h2>{settings.shop_name}</h2>
                    <p style={{ margin: '4px 0' }}>{settings.shop_address}</p>
                    <p style={{ margin: '4px 0' }}>{settings.shop_phone}</p>
                    <p style={{ margin: '4px 0' }}>{settings.shop_email}</p>
                    {settings.tax_number && <p style={{ margin: '4px 0', fontWeight: 'bold' }}>VAT ID: {settings.tax_number}</p>}
                </div>
            </div>

            {/* Invoice Details & Bill To */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #ccc' }}>
                <div>
                    <h3 style={{ margin: '0 0 10px 0' }}>INVOICE DETAILS:</h3>
                    <p style={{ margin: '4px 0' }}><strong>Invoice #:</strong> {invoice.id} {isDraft && <span style={{ color: '#d97706', fontWeight: 'bold' }}>(DRAFT)</span>}</p>
                    <p style={{ margin: '4px 0' }}><strong>Date of Issue:</strong> {new Date(invoice.created_at).toLocaleDateString()}</p>
                    <p style={{ margin: '4px 0' }}><strong>Due Date:</strong> {dueDate.toLocaleDateString()}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>BILL TO:</h3>
                    <p style={{ margin: '4px 0', fontWeight: 'bold' }}>{invoice.customer_name}</p>
                    {invoice.customer_address && <p style={{ margin: '4px 0' }}>{invoice.customer_address}</p>}
                    {invoice.customer_tax_number && <p style={{ margin: '4px 0' }}>Tax No: {invoice.customer_tax_number}</p>}
                    {invoice.customer_Uakam_no && <p style={{ margin: '4px 0' }}>Iqama No: {invoice.customer_Uakam_no}</p>}
                </div>
            </div>

            {/* Items Table */}
            <table width="100%" style={{ marginTop: '15px', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #333', backgroundColor: '#f8fafc' }}>
                        <th style={{ textAlign: 'left', padding: '10px' }}>ITEM/SERVICE</th>
                        <th style={{ textAlign: 'right', padding: '10px' }}>QTY</th>
                        <th style={{ textAlign: 'right', padding: '10px' }}>RATE</th>
                        <th style={{ textAlign: 'right', padding: '10px' }}>DISCOUNT</th>
                        <th style={{ textAlign: 'right', padding: '10px' }}>TAX</th>
                        <th style={{ textAlign: 'right', padding: '10px' }}>AMOUNT</th>
                    </tr>
                </thead>
                <tbody>
                    {details.map((item, i) => {
                        const itemSubtotal = item.quantity * item.unit_price;
                        const discountAmount = item.discount || 0;
                        const taxAmount = (itemSubtotal - discountAmount) * (item.tax / 100);

                        return (
                            <tr key={i} style={{ borderBottom: '1px solid #ccc' }}>
                                <td style={{ padding: '10px', fontWeight: '600' }}>{item.product_name}</td>
                                <td style={{ textAlign: 'right', padding: '10px' }}>{item.quantity}</td>
                                <td style={{ textAlign: 'right', padding: '10px' }}>{item.unit_price.toFixed(2)}</td>
                                <td style={{ textAlign: 'right', padding: '10px' }}>{discountAmount.toFixed(2)}</td>
                                <td style={{ textAlign: 'right', padding: '10px' }}>{taxAmount.toFixed(2)}</td>
                                <td style={{ textAlign: 'right', padding: '10px', fontWeight: 'bold' }}>{item.total_price.toFixed(2)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* Totals & ZATCA QR Code Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '15px' }}>
                {/* ZATCA Phase 2 E-Invoice QR Code */}
                <div style={{ textAlign: 'center', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '12px', backgroundColor: '#f8fafc', width: '150px' }}>
                    {zatcaQrBase64 ? (
                        <QRCodeSVG value={zatcaQrBase64} size={120} level="M" includeMargin={false} />
                    ) : (
                        <div style={{ width: '120px', height: '120px', backgroundColor: '#eee' }} />
                    )}
                    <p style={{ fontSize: '10px', fontWeight: 'bold', margin: '6px 0 0 0', color: '#003366' }}>ZATCA E-INVOICE QR</p>
                    <p style={{ fontSize: '9px', margin: 0, color: '#64748b' }}>رمز الاستجابة السريعة</p>
                    <div style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px dashed #cbd5e1' }}>
                        <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#15803d', display: 'block' }}>🟢 REPORTED TO SAUDI ZATCA</span>
                        <span style={{ fontSize: '8px', color: '#166534', display: 'block' }}>مقدم لهيئة الزكاة والضريبة والجمارك</span>
                    </div>
                </div>

                <div style={{ width: '280px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                        <span>Subtotal</span>
                        <span>{invoice.sub_total.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                        <span>Item Discount</span>
                        <span>-{invoice.item_discount.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                        <span>Item Tax</span>
                        <span>{invoice.item_tax.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                        <span>Cart Discount</span>
                        <span>-{invoice.cart_discount.toFixed(2)}</span>
                    </div>
                    <div style={{ borderTop: '2px solid #333', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px' }}>
                        <span>TOTAL</span>
                        <span>{invoice.total.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                        <span>Paid</span>
                        <span>{invoice.paid.toFixed(2)}</span>
                    </div>
                    {invoice.paid_amount_cash > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 8px', fontSize: '13px', color: '#64748b' }}>
                            <span>&nbsp;&nbsp;↳ Cash</span>
                            <span>{invoice.paid_amount_cash.toFixed(2)}</span>
                        </div>
                    )}
                    {invoice.paid_amount_card > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 8px', fontSize: '13px', color: '#64748b' }}>
                            <span>&nbsp;&nbsp;↳ Card</span>
                            <span>{invoice.paid_amount_card.toFixed(2)}</span>
                        </div>
                    )}
                    {invoice.paid_amount_bank > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 8px', fontSize: '13px', color: '#64748b' }}>
                            <span>&nbsp;&nbsp;↳ Bank</span>
                            <span>{invoice.paid_amount_bank.toFixed(2)}</span>
                        </div>
                    )}
                    {invoice.due > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontWeight: 'bold', color: '#dc2626' }}>
                            <span>Due Amount</span>
                            <span>{invoice.due.toFixed(2)}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                <h4 style={{ margin: '0 0 5px 0' }}>TERMS & CONDITIONS</h4>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Thank you for your business! Please keep this invoice receipt for any warranty claims.</p>
            </div>

            {/* Action Buttons */}
            <div style={{ marginTop: '24px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '12px' }}>
                {isDraft ? (
                    <>
                        <button
                            onClick={handleFinalize}
                            disabled={finalizing}
                            style={{ padding: '12px 24px', cursor: 'pointer', border: 'none', backgroundColor: '#10b981', color: 'white', fontSize: '14px', fontWeight: 'bold', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                        >
                            {finalizing ? 'Finalizing...' : '✅ Finalize & Print Invoice'}
                        </button>
                        <button
                            onClick={handleDeleteDraft}
                            style={{ padding: '12px 20px', cursor: 'pointer', border: 'none', backgroundColor: '#ef4444', color: 'white', fontSize: '14px', fontWeight: 'bold', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                        >
                            🗑️ Delete Draft
                        </button>
                        <button
                            onClick={handleCancel}
                            style={{ padding: '12px 20px', cursor: 'pointer', border: 'none', backgroundColor: '#64748b', color: 'white', fontSize: '14px', fontWeight: 'bold', borderRadius: '12px' }}
                        >
                            Close (Keep Draft)
                        </button>
                    </>
                ) : (
                    <>
                        <button onClick={handlePrint} style={{ padding: '12px 24px', cursor: 'pointer', border: 'none', backgroundColor: '#2563eb', color: 'white', fontSize: '15px', fontWeight: 'bold', borderRadius: '12px' }}>
                            🖨️ Print Invoice
                        </button>
                        <button onClick={handleCancel} style={{ padding: '12px 20px', cursor: 'pointer', border: 'none', backgroundColor: '#64748b', color: 'white', fontSize: '15px', fontWeight: 'bold', borderRadius: '12px' }}>
                            Close
                        </button>
                    </>
                )}
            </div>

            <div style={{ position: 'fixed', bottom: '0', left: '0', right: '0', backgroundColor: '#003366', height: '12px' }}></div>
        </div>
    );
}

export default InvoicePrint;
