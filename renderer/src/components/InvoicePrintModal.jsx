import { useEffect, useRef } from 'react';
import { FaPrint, FaTimes, FaQrcode } from 'react-icons/fa';
import QRCode from 'qrcode';

const InvoicePrintModal = ({ invoice, onClose }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (invoice && invoice.zatcaQrCode && canvasRef.current) {
            QRCode.toCanvas(canvasRef.current, invoice.zatcaQrCode, { width: 140, margin: 1 }, (err) => {
                if (err) console.error('QR Render Error:', err);
            });
        }
    }, [invoice]);

    if (!invoice) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div style={modalOverlay}>
            <div style={modalBox} id="printable-invoice">
                {/* Print Controls Header */}
                <div style={headerStyle} className="no-print">
                    <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                        Saudi Arabia Tax Invoice (فاتورة ضريبية)
                    </h3>
                    <div className="flex gap-2">
                        <button onClick={handlePrint} style={printBtnStyle}>
                            <FaPrint className="mr-1 text-xs inline" /> Print PDF / Receipt
                        </button>
                        <button onClick={onClose} style={closeBtnStyle}><FaTimes /></button>
                    </div>
                </div>

                {/* INVOICE LAYOUT */}
                <div style={invoiceContainer}>
                    <div className="flex justify-between items-start border-b pb-4 mb-4">
                        <div>
                            <h2 className="text-xl font-extrabold text-slate-900">KSA ENTERPRISE ERP</h2>
                            <p className="text-xs text-slate-500">Commercial Registration: 1010123456</p>
                            <p className="text-xs text-slate-500">VAT Registration No: 310123456700003</p>
                            <p className="text-xs text-slate-500">Riyadh, Saudi Arabia</p>
                        </div>
                        <div className="text-right">
                            <h3 className="text-lg font-extrabold text-blue-600">TAX INVOICE</h3>
                            <p className="text-xs font-bold text-slate-800">Invoice No: {invoice.invoiceId}</p>
                            <p className="text-xs text-slate-500">Date: {new Date(invoice.invoiceDate || Date.now()).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Customer & ZATCA Header */}
                    <div className="grid grid-cols-2 gap-4 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Customer Details</span>
                            <h4 className="text-sm font-extrabold text-slate-900">{invoice.customer?.name || 'Walk-in Customer'}</h4>
                            <p className="text-xs text-slate-600">Phone: {invoice.customer?.phone || '-'}</p>
                            <p className="text-xs text-slate-600">VAT No: {invoice.customer?.taxNumber || '-'}</p>
                        </div>
                        <div className="flex justify-end items-center">
                            <canvas ref={canvasRef} />
                        </div>
                    </div>

                    {/* Items Table */}
                    <table style={tableStyle} className="mb-4">
                        <thead style={tableHeaderStyle}>
                            <tr>
                                <th style={thStyle}>Item</th>
                                <th style={thStyle}>Qty</th>
                                <th style={thStyle}>Price</th>
                                <th style={thStyle}>Tax (15%)</th>
                                <th style={thStyle}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(invoice.items || []).map((item, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={tdStyle}>
                                        <div className="font-bold text-slate-800 text-xs">{item.productName}</div>
                                        {item.serialNumber && <span className="text-[10px] text-slate-400">S/N: {item.serialNumber}</span>}
                                    </td>
                                    <td style={tdStyle}>{item.quantity}</td>
                                    <td style={tdStyle}>{item.price} SAR</td>
                                    <td style={tdStyle}>{item.tax} SAR</td>
                                    <td style={tdStyle}><strong>{item.totalPrice} SAR</strong></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals Breakdown */}
                    <div className="flex justify-end border-t pt-3">
                        <div className="w-64 space-y-1 text-xs">
                            <div className="flex justify-between text-slate-600">
                                <span>Sub Total:</span>
                                <span>{invoice.subTotal} SAR</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>VAT Total (15%):</span>
                                <span>{invoice.itemTax || 0} SAR</span>
                            </div>
                            <div className="flex justify-between font-extrabold text-sm text-slate-900 border-t pt-1">
                                <span>Payable Total:</span>
                                <span>{invoice.payableTotal} SAR</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const modalOverlay = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999
};

const modalBox = {
    background: '#ffffff',
    padding: '24px',
    borderRadius: '20px',
    width: 'clamp(500px, 55vw, 750px)',
    color: '#0f172a',
    border: '1px solid #e2e8f0',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};

const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '12px',
    marginBottom: '16px'
};

const closeBtnStyle = {
    border: 'none',
    background: '#f1f5f9',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#64748b'
};

const printBtnStyle = {
    padding: '6px 12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer'
};

const invoiceContainer = {
    background: '#ffffff',
    padding: '16px'
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
    padding: '8px 10px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: '700',
};

const tdStyle = {
    padding: '8px 10px',
    fontSize: '12px',
};

export default InvoicePrintModal;
