import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ReturnSlipPrint() {
    const { id } = useParams();
    const [salesReturn, setSalesReturn] = useState(null);
    const [settings, setSettings] = useState(null);
    const [logoDataUrl, setLogoDataUrl] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await window.electron.ipcRenderer.invoke('get-sales-return-details', id);
                setSalesReturn(res.salesReturn);
                const settingsData = await window.electron.ipcRenderer.invoke('get-settings');
                setSettings(settingsData);

                if (settingsData && settingsData.shop_logo) {
                    setLogoDataUrl(settingsData.shop_logo);
                }
            } catch (e) {
                console.error('Error fetching sales return details:', e);
            }
        }
        fetchData();
    }, [id]);

    const handlePrint = () => {
        window.print();
        setTimeout(() => {
            navigate('/sales-return');
        }, 1000);
    };

    const handleCancel = () => {
        navigate('/sales-return');
    };

    if (!salesReturn || !settings) return <div style={{ padding: '20px' }}>Loading Return Slip...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: 'auto', padding: '20px', fontFamily: 'sans-serif', color: '#333' }}>
            {/* Credit Note Header */}
            <div style={{ backgroundColor: '#991b1b', color: 'white', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: '36px', margin: 0 }}>CREDIT NOTE</h1>
                    <p style={{ margin: '4px 0', fontSize: '13px', fontWeight: 'bold' }}>SALES RETURN & REFUND RECEIPT</p>
                    <div style={{ border: '1px solid white', padding: '10px', marginTop: '10px', width: '140px', textAlign: 'center', height: '65px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                </div>
            </div>

            {/* Return Details & Customer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #ccc' }}>
                <div>
                    <h3 style={{ margin: '0 0 10px 0', color: '#991b1b' }}>RETURN DETAILS:</h3>
                    <p style={{ margin: '4px 0' }}><strong>Return ID:</strong> {salesReturn.returnId}</p>
                    <p style={{ margin: '4px 0' }}><strong>Original Invoice #:</strong> {salesReturn.invoiceNumber}</p>
                    <p style={{ margin: '4px 0' }}><strong>Return Date:</strong> {new Date(salesReturn.returnDate).toLocaleString()}</p>
                    <p style={{ margin: '4px 0' }}><strong>Reason:</strong> {salesReturn.reason}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>CUSTOMER:</h3>
                    <p style={{ margin: '4px 0', fontWeight: 'bold' }}>{salesReturn.customerName}</p>
                    <p style={{ margin: '4px 0' }}><strong>Refund Method:</strong> {salesReturn.refundMethod}</p>
                    {salesReturn.notes && <p style={{ margin: '4px 0' }}><strong>Notes:</strong> {salesReturn.notes}</p>}
                </div>
            </div>

            {/* Returned Items Table */}
            <table width="100%" style={{ marginTop: '15px', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #333', backgroundColor: '#f8fafc' }}>
                        <th style={{ textAlign: 'left', padding: '10px' }}>RETURNED PRODUCT</th>
                        <th style={{ textAlign: 'right', padding: '10px' }}>RETURN QTY</th>
                        <th style={{ textAlign: 'right', padding: '10px' }}>UNIT PRICE</th>
                        <th style={{ textAlign: 'right', padding: '10px' }}>REFUND AMOUNT</th>
                    </tr>
                </thead>
                <tbody>
                    {salesReturn.items.map((item, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #ccc' }}>
                            <td style={{ padding: '10px', fontWeight: '600' }}>{item.productName}</td>
                            <td style={{ textAlign: 'right', padding: '10px', fontWeight: 'bold' }}>{item.returnedQuantity}</td>
                            <td style={{ textAlign: 'right', padding: '10px' }}>{item.unitPrice.toFixed(2)}</td>
                            <td style={{ textAlign: 'right', padding: '10px', fontWeight: 'bold', color: '#dc2626' }}>{item.refundAmount.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Total Refund Summary */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
                <div style={{ width: '300px', borderTop: '2px solid #991b1b', paddingTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'black', fontSize: '20px', color: '#991b1b' }}>
                        <span>TOTAL REFUND</span>
                        <span>৳{salesReturn.totalRefundAmount.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: '300px', borderTop: '1px solid #eee', paddingTop: '10px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
                <p>This credit note confirms the product return and financial refund. Customer copy.</p>
            </div>

            {/* Action Buttons */}
            <div style={{ marginTop: '24px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <button onClick={handlePrint} style={{ padding: '12px 24px', cursor: 'pointer', border: 'none', backgroundColor: '#dc2626', color: 'white', fontSize: '15px', fontWeight: 'bold', borderRadius: '12px' }}>
                    🖨️ Print Credit Note Slip
                </button>
                <button onClick={handleCancel} style={{ padding: '12px 20px', cursor: 'pointer', border: 'none', backgroundColor: '#64748b', color: 'white', fontSize: '15px', fontWeight: 'bold', borderRadius: '12px' }}>
                    Close
                </button>
            </div>

            <div style={{ position: 'fixed', bottom: '0', left: '0', right: '0', backgroundColor: '#991b1b', height: '12px' }}></div>
        </div>
    );
}

export default ReturnSlipPrint;
