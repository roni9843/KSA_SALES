import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUndo, FaSearch, FaReceipt, FaHistory, FaCheckCircle, FaFileInvoice, FaPrint } from 'react-icons/fa';
import toast from 'react-hot-toast';

const SalesReturn = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('process'); // 'process' or 'history'

    // Process Return State
    const [invoiceSearchInput, setInvoiceSearchInput] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [invoiceItems, setInvoiceItems] = useState([]);
    const [returnQuantities, setReturnQuantities] = useState({});
    const [refundMethod, setRefundMethod] = useState('Cash');
    const [returnReason, setReturnReason] = useState('Customer Changed Mind');
    const [returnNotes, setReturnNotes] = useState('');
    const [loadingInvoice, setLoadingInvoice] = useState(false);
    const [submittingReturn, setSubmittingReturn] = useState(false);

    // History Log State
    const [returnsList, setReturnsList] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const fetchReturnsHistory = async () => {
        setLoadingHistory(true);
        try {
            const res = await window.electron.ipcRenderer.invoke('get-sales-returns');
            if (res?.returns) setReturnsList(res.returns);
        } catch (e) {
            console.error('Error fetching sales returns history:', e);
            toast.error('Failed to load sales returns history.');
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'history') {
            fetchReturnsHistory();
        }
    }, [activeTab]);

    const handleSearchInvoice = async (e) => {
        e.preventDefault();
        if (!invoiceSearchInput.trim()) {
            toast.error('Please enter an Invoice Number.');
            return;
        }

        setLoadingInvoice(true);
        try {
            const res = await window.electron.ipcRenderer.invoke('get-invoice', invoiceSearchInput.trim());
            if (!res?.invoice) {
                toast.error('Invoice not found.');
                setSelectedInvoice(null);
                setInvoiceItems([]);
                return;
            }

            setSelectedInvoice(res.invoice);
            setInvoiceItems(res.details || []);

            const initialQtys = {};
            (res.details || []).forEach((item, index) => {
                initialQtys[item.product_id || item.product || index] = 0;
            });
            setReturnQuantities(initialQtys);
            toast.success('Invoice loaded! Select items to return below.');
        } catch (error) {
            console.error('Error searching invoice:', error);
            toast.error('Failed to search invoice.');
        } finally {
            setLoadingInvoice(false);
        }
    };

    const handleQuantityChange = (key, maxQty, val) => {
        const parsed = parseInt(val) || 0;
        if (parsed < 0) return;
        if (parsed > maxQty) {
            toast.error(`Return quantity cannot exceed purchased quantity (${maxQty}).`);
            return;
        }
        setReturnQuantities(prev => ({ ...prev, [key]: parsed }));
    };

    // Calculate dynamic refund amount
    const calculateTotalRefund = () => {
        let total = 0;
        invoiceItems.forEach((item, index) => {
            const key = item.product_id || item.product || index;
            const qty = returnQuantities[key] || 0;
            if (qty > 0) {
                const subtotal = qty * item.unit_price;
                const discountAmount = item.discount || 0;
                const taxAmount = (subtotal - discountAmount) * ((item.tax || 0) / 100);
                total += (subtotal - discountAmount + taxAmount);
            }
        });
        return total;
    };

    const handleProcessReturn = async (e) => {
        e.preventDefault();
        if (!selectedInvoice) return;

        const returnItemsPayload = [];
        invoiceItems.forEach((item, index) => {
            const key = item.product_id || item.product || index;
            const qty = returnQuantities[key] || 0;
            if (qty > 0) {
                returnItemsPayload.push({
                    product_id: item.product_id || item.product || item.id,
                    returnedQuantity: qty,
                    price: item.unit_price,
                    tax: item.tax || 0,
                    discount: item.discount || 0
                });
            }
        });

        if (returnItemsPayload.length === 0) {
            toast.error('Please enter return quantity for at least one item.');
            return;
        }

        setSubmittingReturn(true);
        try {
            const payload = {
                invoice_id: selectedInvoice.raw_id || selectedInvoice.id,
                return_items: returnItemsPayload,
                refund_method: refundMethod,
                reason: returnReason,
                notes: returnNotes
            };

            const res = await window.electron.ipcRenderer.invoke('create-sales-return', payload);
            if (res.success && res.salesReturn) {
                toast.success('Sales Return & Refund processed! Product inventory restocked.');
                navigate(`/return-slip/${res.salesReturn._id}`);
            }
        } catch (error) {
            console.error('Error processing return:', error);
            toast.error(error.message || 'Failed to process sales return.');
        } finally {
            setSubmittingReturn(false);
        }
    };

    const totalRefundAmount = calculateTotalRefund();

    return (
        <div className="space-y-6">
            {/* Header with Navigation Tabs */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                        <FaUndo className="text-rose-600" /> Sales Return & Refund Management
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">Accept customer product returns, restock inventory automatically, and issue cash/card refunds.</p>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                        onClick={() => setActiveTab('process')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'process' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        <FaReceipt /> Process Return
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        <FaHistory /> Return History Log
                    </button>
                </div>
            </div>

            {/* TAB 1: PROCESS RETURN */}
            {activeTab === 'process' && (
                <div className="space-y-6">
                    {/* Invoice Search Panel */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
                            <FaSearch className="text-blue-600" /> Step 1: Search Sold Invoice
                        </h3>
                        <form onSubmit={handleSearchInvoice} className="flex gap-3">
                            <input
                                type="text"
                                placeholder="Enter Invoice ID (e.g. INV-178706...)"
                                value={invoiceSearchInput}
                                onChange={e => setInvoiceSearchInput(e.target.value)}
                                className="flex-1 p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-blue-500"
                            />
                            <button
                                type="submit"
                                disabled={loadingInvoice}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
                            >
                                <FaSearch /> {loadingInvoice ? 'Searching...' : 'Search Invoice'}
                            </button>
                        </form>
                    </div>

                    {/* Loaded Invoice Details & Returned Products Table */}
                    {selectedInvoice && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                            <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-4 gap-4 bg-slate-50 p-4 rounded-xl">
                                <div>
                                    <span className="text-xs text-slate-500 block">Invoice Number:</span>
                                    <span className="text-base font-extrabold text-blue-600">{selectedInvoice.id}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-500 block">Customer Name:</span>
                                    <span className="text-sm font-extrabold text-slate-900">{selectedInvoice.customer_name}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-500 block">Issue Date:</span>
                                    <span className="text-sm font-bold text-slate-700">{new Date(selectedInvoice.created_at).toLocaleDateString()}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-500 block">Payable Total:</span>
                                    <span className="text-sm font-black text-slate-900">৳{selectedInvoice.total.toFixed(2)}</span>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
                                    <FaFileInvoice className="text-rose-600" /> Step 2: Select Items & Return Quantity
                                </h3>
                                <div className="overflow-x-auto rounded-xl border border-slate-200">
                                    <table className="w-full border-collapse text-xs">
                                        <thead>
                                            <tr className="bg-slate-50 text-slate-500 uppercase font-extrabold border-b border-slate-200">
                                                <th className="p-3 text-left">Product Name</th>
                                                <th className="p-3 text-center">Purchased Qty</th>
                                                <th className="p-3 text-right">Unit Price</th>
                                                <th className="p-3 text-right">Tax (%)</th>
                                                <th className="p-3 text-right">Discount</th>
                                                <th className="p-3 text-center w-36">Return Qty</th>
                                                <th className="p-3 text-right">Refund Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invoiceItems.map((item, idx) => {
                                                const key = item.product_id || item.product || idx;
                                                const retQty = returnQuantities[key] || 0;
                                                const itemSubtotal = retQty * item.unit_price;
                                                const discountAmount = item.discount || 0;
                                                const taxAmount = (itemSubtotal - discountAmount) * ((item.tax || 0) / 100);
                                                const lineRefund = retQty > 0 ? itemSubtotal - discountAmount + taxAmount : 0;

                                                return (
                                                    <tr key={key} className={`border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                                        <td className="p-3 font-bold text-slate-900">{item.product_name}</td>
                                                        <td className="p-3 text-center font-bold text-slate-700">{item.quantity}</td>
                                                        <td className="p-3 text-right">৳{item.unit_price.toFixed(2)}</td>
                                                        <td className="p-3 text-right">{item.tax || 0}%</td>
                                                        <td className="p-3 text-right">৳{(item.discount || 0).toFixed(2)}</td>
                                                        <td className="p-3 text-center">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max={item.quantity}
                                                                value={retQty}
                                                                onChange={e => handleQuantityChange(key, item.quantity, e.target.value)}
                                                                className="w-20 p-1.5 border border-slate-300 rounded-lg text-center font-bold text-slate-900 outline-none focus:border-rose-500"
                                                            />
                                                        </td>
                                                        <td className="p-3 text-right font-black text-rose-600">
                                                            ৳{lineRefund.toFixed(2)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Step 3: Refund Method, Reason & Process Button */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                                <div>
                                    <label className="text-xs font-bold text-slate-700 block mb-1">Refund Method (ফেরত টাকা দেওয়া মেথড)</label>
                                    <select
                                        value={refundMethod}
                                        onChange={e => setRefundMethod(e.target.value)}
                                        className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-bold outline-none"
                                    >
                                        <option value="Cash">Cash Refund (নগদ ফেরত)</option>
                                        <option value="Card">Card Refund</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                        <option value="Store Credit">Store Credit (ভবিষ্যৎ ক্রয়ের ব্যালেন্স)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-700 block mb-1">Return Reason (ফেরতের কারণ)</label>
                                    <select
                                        value={returnReason}
                                        onChange={e => setReturnReason(e.target.value)}
                                        className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-bold outline-none"
                                    >
                                        <option value="Customer Changed Mind">Customer Changed Mind (পছন্দ হয়নি)</option>
                                        <option value="Defective / Damaged">Defective / Damaged (ত্রুটিপূর্ণ/নষ্ট)</option>
                                        <option value="Wrong Item Issued">Wrong Item Issued (ভুল প্রোডাক্ট দেওয়া হয়েছিল)</option>
                                        <option value="Expired Item">Expired Item (মেয়াদোত্তীর্ণ)</option>
                                        <option value="Other">Other Reason</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-700 block mb-1">Notes / Remarks</label>
                                    <input
                                        type="text"
                                        placeholder="Optional notes..."
                                        value={returnNotes}
                                        onChange={e => setReturnNotes(e.target.value)}
                                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                                <div>
                                    <span className="text-xs text-slate-500 block">Total Refund Amount:</span>
                                    <span className="text-2xl font-black text-rose-600">৳{totalRefundAmount.toFixed(2)}</span>
                                </div>

                                <button
                                    onClick={handleProcessReturn}
                                    disabled={submittingReturn || totalRefundAmount <= 0}
                                    className="px-8 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    <FaCheckCircle /> {submittingReturn ? 'Processing Refund...' : 'Process Return & Refund'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: RETURN HISTORY LOG */}
            {activeTab === 'history' && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
                        <FaHistory className="text-slate-500" /> Sales Returns & Refunds History Log
                    </h3>

                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 font-extrabold text-[11px] uppercase border-b border-slate-200">
                                    <th className="p-3 text-left">Return ID</th>
                                    <th className="p-3 text-left">Invoice #</th>
                                    <th className="p-3 text-left">Customer</th>
                                    <th className="p-3 text-left">Date</th>
                                    <th className="p-3 text-center">Items Count</th>
                                    <th className="p-3 text-right">Refund Amount</th>
                                    <th className="p-3 text-center">Refund Method</th>
                                    <th className="p-3 text-left">Reason</th>
                                    <th className="p-3 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingHistory ? (
                                    <tr>
                                        <td colSpan="9" className="p-8 text-center text-slate-400">Loading sales returns history...</td>
                                    </tr>
                                ) : returnsList.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="p-8 text-center text-slate-400">No sales return records found.</td>
                                    </tr>
                                ) : (
                                    returnsList.map((r, idx) => (
                                        <tr key={r._id || idx} className={`border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                            <td className="p-3 font-bold text-rose-600">{r.returnId}</td>
                                            <td className="p-3 font-bold text-blue-600">{r.invoiceNumber || r.invoice?.invoiceId}</td>
                                            <td className="p-3 font-bold text-slate-900">{r.customerName || r.customer?.name}</td>
                                            <td className="p-3 text-slate-600">{new Date(r.returnDate).toLocaleDateString()}</td>
                                            <td className="p-3 text-center font-bold">{r.items ? r.items.length : 0} items</td>
                                            <td className="p-3 text-right font-black text-rose-600">৳{r.totalRefundAmount.toFixed(2)}</td>
                                            <td className="p-3 text-center font-semibold text-slate-600">{r.refundMethod}</td>
                                            <td className="p-3 text-slate-500">{r.reason}</td>
                                            <td className="p-3 text-center">
                                                <button
                                                    onClick={() => navigate(`/return-slip/${r._id}`)}
                                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-sm transition-all flex items-center justify-center gap-1 mx-auto"
                                                >
                                                    <FaPrint /> Return Slip
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesReturn;
