import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function DueCollectionReceipt() {
    const { invoiceId } = useParams();
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [settings, setSettings] = useState(null);
    const [logoDataUrl, setLogoDataUrl] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await window.electron.ipcRenderer.invoke('get-last-payment-details', parseInt(invoiceId));
                setPaymentDetails(res);

                const settingsData = await window.electron.ipcRenderer.invoke('get-settings');
                setSettings(settingsData);

                if (settingsData && settingsData.shop_logo) {
                    setLogoDataUrl(settingsData.shop_logo);
                }
            } catch (e) {
                console.error('Error fetching data:', e);
            }
        }
        fetchData();
    }, [invoiceId]);

    const handlePrint = () => {
        window.print();
        setTimeout(() => {
            navigate('/collect-due');
        }, 1000);
    };

    const handleCancel = () => {
        navigate('/collect-due');
    };

    if (!paymentDetails || !settings) return <div style={{ padding: '20px' }}>Loading...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: 'auto', padding: '20px', fontFamily: 'sans-serif', color: '#333' }}>
            {/* Header */}
            <div style={{ backgroundColor: '#003366', color: 'white', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: '48px', margin: 0 }}>Payment Receipt</h1>
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

            {/* Receipt Details */}
            <div style={{ borderTop: '2px solid #333', paddingTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span><strong>Receipt No:</strong> {`PAY-${Date.now()}`}</span>
                    <span><strong>Date:</strong> {new Date(paymentDetails.payment_date).toLocaleString()}</span>
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <h3>Customer Details</h3>
                    <p><strong>Name:</strong> {paymentDetails.customer_name}</p>
                    <p><strong>Phone:</strong> {paymentDetails.customer_phone}</p>
                    <p><strong>Address:</strong> {paymentDetails.customer_address}</p>
                    {paymentDetails.customer_tax_number && <p><strong>Tax No:</strong> {paymentDetails.customer_tax_number}</p>}
                    {paymentDetails.customer_Uakam_no && <p><strong>Uakam No:</strong> {paymentDetails.customer_Uakam_no}</p>}
                </div>

                <h3>Payment Summary for Invoice: {paymentDetails.invoice_id}</h3>
                <table width="100%" style={{ marginTop: '20px', borderCollapse: 'collapse' }}>
                    <tbody>
                        <tr style={{ borderBottom: '1px solid #ccc' }}>
                            <td style={{ padding: '8px' }}>Previous Due Amount</td>
                            <td style={{ textAlign: 'right', padding: '8px' }}>{paymentDetails.pre_due_amount.toFixed(2)}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #ccc' }}>
                            <td style={{ padding: '8px' }}>Amount Paid</td>
                            <td style={{ textAlign: 'right', padding: '8px' }}>{paymentDetails.paid_amount.toFixed(2)}</td>
                        </tr>
                        {paymentDetails.paid_amount_cash > 0 && (
                            <tr style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '5px 8px 5px 20px', fontSize: '14px' }}>↳ by Cash</td>
                                <td style={{ textAlign: 'right', padding: '5px 8px', fontSize: '14px' }}>{paymentDetails.paid_amount_cash.toFixed(2)}</td>
                            </tr>
                        )}
                        {paymentDetails.paid_amount_card > 0 && (
                            <tr style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '5px 8px 5px 20px', fontSize: '14px' }}>↳ by Card</td>
                                <td style={{ textAlign: 'right', padding: '5px 8px', fontSize: '14px' }}>{paymentDetails.paid_amount_card.toFixed(2)}</td>
                            </tr>
                        )}
                        {paymentDetails.paid_amount_bank > 0 && (
                            <tr style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '5px 8px 5px 20px', fontSize: '14px' }}>↳ by Bank</td>
                                <td style={{ textAlign: 'right', padding: '5px 8px', fontSize: '14px' }}>{paymentDetails.paid_amount_bank.toFixed(2)}</td>
                            </tr>
                        )}
                        <tr style={{ borderBottom: '1px solid #ccc', fontWeight: 'bold' }}>
                            <td style={{ padding: '8px' }}>New Due Amount</td>
                            <td style={{ textAlign: 'right', padding: '8px' }}>{paymentDetails.due_amount.toFixed(2)}</td>
                        </tr>
                        {paymentDetails.change_amount > 0 && (
                            <tr style={{ borderBottom: '1px solid #ccc' }}>
                                <td style={{ padding: '8px' }}>Change Amount</td>
                                <td style={{ textAlign: 'right', padding: '8px' }}>{paymentDetails.change_amount.toFixed(2)}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div style={{ marginTop: '40px', textAlign: 'center' }}>
                <p>Thank you for your payment!</p>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button onClick={handlePrint} style={{ padding: '10px 20px', cursor: 'pointer', border: 'none', backgroundColor: '#007bff', color: 'white', fontSize: '16px' }}>
                    🖨️ Print
                </button>
                <button onClick={handleCancel} style={{ padding: '10px 20px', cursor: 'pointer', border: 'none', backgroundColor: '#6c757d', color: 'white', fontSize: '16px' }}>
                    Cancel
                </button>
            </div>
        </div>
    );
}

export default DueCollectionReceipt;
