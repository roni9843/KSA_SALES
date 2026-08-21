import { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaArrowDown, FaArrowUp, FaPlus, FaMinus, FaLock, FaUnlock, FaHistory, FaTrash, FaExchangeAlt, FaCreditCard, FaUniversity, FaFilter } from 'react-icons/fa';
import toast from 'react-hot-toast';

const CashFlow = () => {
    const [activeTab, setActiveTab] = useState('ledger'); // 'ledger' or 'register'
    const [summary, setSummary] = useState({ totalInflow: 0, totalOutflow: 0, netBalance: 0, cashInDrawer: 0, netCard: 0, netBank: 0 });
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [filterType, setFilterType] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterMethod, setFilterMethod] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Modal state for Add Entry
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [entryType, setEntryType] = useState('outflow'); // 'inflow' or 'outflow'
    const [formData, setFormData] = useState({
        category: 'Shop Rent',
        amount: '',
        paymentMethod: 'Cash',
        referenceNo: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    // Daily Register state
    const [activeShift, setActiveShift] = useState(null);
    const [systemExpectedCash, setSystemExpectedCash] = useState(0);
    const [openingBalanceInput, setOpeningBalanceInput] = useState('');
    const [physicalCashInput, setPhysicalCashInput] = useState('');
    const [closeNotes, setCloseNotes] = useState('');
    const [registerHistory, setRegisterHistory] = useState([]);

    const fetchSummary = async () => {
        try {
            const res = await window.electron.ipcRenderer.invoke('get-cashflow-summary');
            if (res?.summary) setSummary(res.summary);
        } catch (e) {
            console.error('Error fetching cashflow summary:', e);
        }
    };

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const queryParams = {};
            if (filterType) queryParams.type = filterType;
            if (filterCategory) queryParams.category = filterCategory;
            if (filterMethod) queryParams.paymentMethod = filterMethod;
            if (startDate) queryParams.startDate = startDate;
            if (endDate) queryParams.endDate = endDate;

            const res = await window.electron.ipcRenderer.invoke('get-cashflow', queryParams);
            if (res?.records) setRecords(res.records);
        } catch (e) {
            console.error('Error fetching cashflow records:', e);
            toast.error('Failed to load transaction ledger.');
        } finally {
            setLoading(false);
        }
    };

    const fetchCurrentRegister = async () => {
        try {
            const res = await window.electron.ipcRenderer.invoke('get-current-register');
            if (res) {
                setActiveShift(res.activeShift);
                setSystemExpectedCash(res.systemExpectedCash || 0);
            }
        } catch (e) {
            console.error('Error fetching active register:', e);
        }
    };

    const fetchRegisterHistory = async () => {
        try {
            const res = await window.electron.ipcRenderer.invoke('get-register-history');
            if (res?.history) setRegisterHistory(res.history);
        } catch (e) {
            console.error('Error fetching register history:', e);
        }
    };

    useEffect(() => {
        fetchSummary();
        fetchRecords();
        fetchCurrentRegister();
        fetchRegisterHistory();
    }, []);

    const handleApplyFilter = () => {
        fetchRecords();
    };

    const handleOpenAddModal = (type) => {
        setEntryType(type);
        setFormData({
            category: type === 'outflow' ? 'Shop Rent' : 'Other Income',
            amount: '',
            paymentMethod: 'Cash',
            referenceNo: `VOC-${Date.now().toString().slice(-6)}`,
            description: '',
            date: new Date().toISOString().split('T')[0]
        });
        setIsAddModalOpen(true);
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            toast.error('Please enter a valid amount.');
            return;
        }

        try {
            const payload = {
                type: entryType,
                category: formData.category,
                amount: parseFloat(formData.amount),
                paymentMethod: formData.paymentMethod,
                referenceNo: formData.referenceNo,
                description: formData.description,
                date: formData.date
            };

            await window.electron.ipcRenderer.invoke('add-cashflow-entry', payload);
            toast.success(`${entryType === 'inflow' ? 'Income' : 'Expense'} entry saved!`);
            setIsAddModalOpen(false);
            fetchSummary();
            fetchRecords();
            fetchCurrentRegister();
        } catch (error) {
            console.error('Error adding cashflow entry:', error);
            toast.error('Failed to save entry.');
        }
    };

    const handleDeleteRecord = async (id) => {
        if (!window.confirm('Are you sure you want to delete this record?')) return;
        try {
            await window.electron.ipcRenderer.invoke('delete-cashflow-entry', id);
            toast.success('Record deleted successfully.');
            fetchSummary();
            fetchRecords();
            fetchCurrentRegister();
        } catch (error) {
            console.error('Error deleting record:', error);
            toast.error('Failed to delete record.');
        }
    };

    const handleOpenRegister = async (e) => {
        e.preventDefault();
        const opening = parseFloat(openingBalanceInput || 0);
        try {
            const res = await window.electron.ipcRenderer.invoke('open-register', { openingBalance: opening });
            if (res.success) {
                toast.success('Register shift opened successfully!');
                setOpeningBalanceInput('');
                fetchCurrentRegister();
                fetchRegisterHistory();
            }
        } catch (error) {
            console.error('Error opening register:', error);
            toast.error('Failed to open shift.');
        }
    };

    const handleCloseRegister = async (e) => {
        e.preventDefault();
        if (physicalCashInput === '') {
            toast.error('Please enter the actual physical cash count from drawer.');
            return;
        }

        const physical = parseFloat(physicalCashInput);
        try {
            const res = await window.electron.ipcRenderer.invoke('close-register', {
                physicalActualCash: physical,
                notes: closeNotes
            });

            if (res.success) {
                const disc = res.discrepancy;
                if (disc === 0) {
                    toast.success('Shift closed! Register balanced perfectly (No discrepancy).');
                } else if (disc > 0) {
                    toast.success(`Shift closed! Surplus of ৳${disc.toFixed(2)} automatically adjusted.`);
                } else {
                    toast.error(`Shift closed! Shortage of ৳${Math.abs(disc).toFixed(2)} automatically adjusted.`);
                }

                setPhysicalCashInput('');
                setCloseNotes('');
                fetchCurrentRegister();
                fetchRegisterHistory();
                fetchSummary();
                fetchRecords();
            }
        } catch (error) {
            console.error('Error closing register:', error);
            toast.error('Failed to close shift.');
        }
    };

    const physicalCashNum = parseFloat(physicalCashInput || 0);
    const discrepancy = physicalCashInput !== '' ? physicalCashNum - systemExpectedCash : 0;

    return (
        <div className="space-y-6">
            {/* Header with Navigation Tabs */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                        <FaMoneyBillWave className="text-emerald-600" /> Cash Flow & Daily Register
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">Manage shop expenses, cash inflows, and daily register drawer closing reconciliation.</p>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                        onClick={() => setActiveTab('ledger')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'ledger' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        <FaExchangeAlt /> Cash Flow Ledger
                    </button>
                    <button
                        onClick={() => setActiveTab('register')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'register' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        <FaLock /> Daily Register Close
                    </button>
                </div>
            </div>

            {/* TAB 1: CASH FLOW LEDGER */}
            {activeTab === 'ledger' && (
                <div className="space-y-6">
                    {/* Financial Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/30">
                            <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1"><FaArrowUp /> Total Inflow</span>
                            <h3 className="text-lg font-black text-emerald-800 mt-1">৳{summary.totalInflow.toFixed(2)}</h3>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/30">
                            <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1"><FaArrowDown /> Total Outflow</span>
                            <h3 className="text-lg font-black text-rose-800 mt-1">৳{summary.totalOutflow.toFixed(2)}</h3>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/30">
                            <span className="text-[11px] font-bold text-blue-700">Net Cash Balance</span>
                            <h3 className="text-lg font-black text-blue-800 mt-1">৳{summary.netBalance.toFixed(2)}</h3>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/30">
                            <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1"><FaMoneyBillWave /> Cash In Drawer</span>
                            <h3 className="text-lg font-black text-amber-800 mt-1">৳{summary.cashInDrawer.toFixed(2)}</h3>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-indigo-200 bg-indigo-50/30">
                            <span className="text-[11px] font-bold text-indigo-700 flex items-center gap-1"><FaCreditCard /> Card Net</span>
                            <h3 className="text-lg font-black text-indigo-800 mt-1">৳{summary.netCard.toFixed(2)}</h3>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-cyan-200 bg-cyan-50/30">
                            <span className="text-[11px] font-bold text-cyan-700 flex items-center gap-1"><FaUniversity /> Bank Net</span>
                            <h3 className="text-lg font-black text-cyan-800 mt-1">৳{summary.netBank.toFixed(2)}</h3>
                        </div>
                    </div>

                    {/* Quick Action Buttons & Filters */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
                            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                                <FaFilter className="text-slate-400" /> Transaction Ledger & Filters
                            </h3>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleOpenAddModal('outflow')}
                                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                                >
                                    <FaMinus /> + Add Store Expense
                                </button>
                                <button
                                    onClick={() => handleOpenAddModal('inflow')}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                                >
                                    <FaPlus /> + Add Extra Income
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                            <div>
                                <label className="text-[11px] font-bold text-slate-500 block mb-1">Flow Type</label>
                                <select value={filterType} onChange={e => setFilterType(e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs outline-none">
                                    <option value="">All Types (Inflow & Outflow)</option>
                                    <option value="inflow">Inflow (Income / Collection)</option>
                                    <option value="outflow">Outflow (Expense / Payment)</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[11px] font-bold text-slate-500 block mb-1">Category</label>
                                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs outline-none">
                                    <option value="">All Categories</option>
                                    <option value="Sales Revenue">Sales Revenue</option>
                                    <option value="Customer Due Collection">Customer Due Collection</option>
                                    <option value="Supplier Purchase Payout">Supplier Purchase Payout</option>
                                    <option value="Shop Rent">Shop Rent</option>
                                    <option value="Electricity & Utilities">Electricity & Utilities</option>
                                    <option value="Employee Salary & Bonus">Employee Salary & Bonus</option>
                                    <option value="Maintenance & Repairs">Maintenance & Repairs</option>
                                    <option value="Cash Adjustment">Cash Adjustment</option>
                                    <option value="Other Expense">Other Expense</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[11px] font-bold text-slate-500 block mb-1">Payment Method</label>
                                <select value={filterMethod} onChange={e => setFilterMethod(e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs outline-none">
                                    <option value="">All Payment Methods</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Card">Card</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[11px] font-bold text-slate-500 block mb-1">Start Date</label>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs outline-none" />
                            </div>

                            <div className="flex items-end gap-2">
                                <div className="flex-1">
                                    <label className="text-[11px] font-bold text-slate-500 block mb-1">End Date</label>
                                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs outline-none" />
                                </div>
                                <button onClick={handleApplyFilter} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all h-[34px]">
                                    Filter
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Transaction Ledger Table */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase font-extrabold border-b border-slate-200">
                                        <th className="p-3 text-left">Date</th>
                                        <th className="p-3 text-left">Voucher #</th>
                                        <th className="p-3 text-left">Category</th>
                                        <th className="p-3 text-left">Description</th>
                                        <th className="p-3 text-center">Flow Type</th>
                                        <th className="p-3 text-center">Method</th>
                                        <th className="p-3 text-right">Amount</th>
                                        <th className="p-3 text-center">Created By</th>
                                        <th className="p-3 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="9" className="p-8 text-center text-slate-400 text-xs">Loading transaction ledger...</td>
                                        </tr>
                                    ) : records.length === 0 ? (
                                        <tr>
                                            <td colSpan="9" className="p-8 text-center text-slate-400 text-xs">No transaction records found for selected filters.</td>
                                        </tr>
                                    ) : (
                                        records.map((r, idx) => (
                                            <tr key={r._id || idx} className={`border-b border-slate-100 text-xs ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                                <td className="p-3 text-slate-600 font-semibold">{new Date(r.date).toLocaleDateString()}</td>
                                                <td className="p-3 font-bold text-blue-600">{r.referenceNo || 'N/A'}</td>
                                                <td className="p-3 font-bold text-slate-900">{r.category}</td>
                                                <td className="p-3 text-slate-500">{r.description || '-'}</td>
                                                <td className="p-3 text-center">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${r.type === 'inflow' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-800 border-rose-300'}`}>
                                                        {r.type === 'inflow' ? '▲ INFLOW' : '▼ OUTFLOW'}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-center font-semibold text-slate-600">{r.paymentMethod}</td>
                                                <td className={`p-3 text-right font-black ${r.type === 'inflow' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {r.type === 'inflow' ? '+' : '-'}৳{r.amount.toFixed(2)}
                                                </td>
                                                <td className="p-3 text-center text-slate-500">{r.createdBy?.username || 'Staff'}</td>
                                                <td className="p-3 text-center">
                                                    <button onClick={() => handleDeleteRecord(r._id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
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
                </div>
            )}

            {/* TAB 2: DAILY REGISTER CLOSING */}
            {activeTab === 'register' && (
                <div className="space-y-6">
                    {/* Active Shift Card & Closing Form */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Card: Active Shift Status */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                                    <FaLock className="text-amber-500" /> Current Register Shift Status
                                </h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-black border ${activeShift ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-600 border-slate-300'}`}>
                                    {activeShift ? '🟢 SHIFT OPEN' : '🔴 NO SHIFT OPEN'}
                                </span>
                            </div>

                            {activeShift ? (
                                <div className="space-y-3 text-xs">
                                    <div className="flex justify-between py-1 border-b border-slate-100">
                                        <span className="text-slate-500">Shift ID:</span>
                                        <span className="font-bold text-slate-900">{activeShift.shiftId}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-slate-100">
                                        <span className="text-slate-500">Opened At:</span>
                                        <span className="font-bold text-slate-900">{new Date(activeShift.openedAt).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-slate-100">
                                        <span className="text-slate-500">Cashier Staff:</span>
                                        <span className="font-bold text-slate-900">{activeShift.openedBy?.username || 'Staff'}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-slate-100">
                                        <span className="text-slate-500">Opening Cash (সকালের ক্যাশ):</span>
                                        <span className="font-bold text-slate-900">৳{activeShift.openingBalance.toFixed(2)}</span>
                                    </div>

                                    <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 mt-4 space-y-2">
                                        <div className="flex justify-between text-slate-700">
                                            <span>Expected Cash in Drawer (সফটওয়্যার হিসাব):</span>
                                            <span className="font-black text-amber-800 text-base">৳{systemExpectedCash.toFixed(2)}</span>
                                        </div>
                                        <p className="text-[11px] text-amber-700">Calculated as: Opening Cash + Today's Cash Sales - Cash Expenses.</p>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleOpenRegister} className="space-y-4 pt-2">
                                    <p className="text-xs text-slate-600">No shift is currently open. Set the starting cash balance in drawer to open today's shift.</p>
                                    <div>
                                        <label className="text-xs font-bold text-slate-700 block mb-1">Opening Cash Balance (সকালের শুরুর ক্যাশ ৳)</label>
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            value={openingBalanceInput}
                                            onChange={e => setOpeningBalanceInput(e.target.value)}
                                            className="w-full p-3 bg-white border border-slate-300 rounded-xl text-sm outline-none font-bold text-slate-900"
                                        />
                                    </div>
                                    <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2">
                                        <FaUnlock /> 🔓 Open New Register Shift
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Right Card: Daily Cash Register Closing & Reconciliation */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                            <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
                                <FaHistory className="text-blue-600" /> Close Register & Cash Discrepancy Adjustment
                            </h3>

                            {activeShift ? (
                                <form onSubmit={handleCloseRegister} className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-700 block mb-1">Physical Cash Count in Drawer (বাক্সে কয় টাকা গুনে পাওয়া গেছে ৳)</label>
                                        <input
                                            type="number"
                                            placeholder="Enter actual counted cash..."
                                            value={physicalCashInput}
                                            onChange={e => setPhysicalCashInput(e.target.value)}
                                            className="w-full p-3 bg-white border border-slate-300 rounded-xl text-sm outline-none font-black text-blue-600"
                                        />
                                    </div>

                                    {/* Discrepancy Calculation Preview */}
                                    {physicalCashInput !== '' && (
                                        <div className={`p-4 rounded-xl border space-y-1 ${discrepancy === 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : discrepancy > 0 ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold">Discrepancy (পার্থক্য):</span>
                                                <span className="text-base font-black">
                                                    {discrepancy === 0 ? '৳0.00 (Balanced)' : discrepancy > 0 ? `+৳${discrepancy.toFixed(2)} (Surplus / বেশি)` : `-৳${Math.abs(discrepancy).toFixed(2)} (Shortage / কম)`}
                                                </span>
                                            </div>
                                            <p className="text-[11px] opacity-80">
                                                {discrepancy === 0 ? 'Drawer matches software expected cash perfectly.' : 'System will automatically post a Cash Adjustment voucher to balance the drawer upon closing.'}
                                            </p>
                                        </div>
                                    )}

                                    <div>
                                        <label className="text-xs font-bold text-slate-700 block mb-1">Closing Notes / Discrepancy Reason</label>
                                        <input
                                            type="text"
                                            placeholder="Optional notes or discrepancy reason..."
                                            value={closeNotes}
                                            onChange={e => setCloseNotes(e.target.value)}
                                            className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs outline-none"
                                        />
                                    </div>

                                    <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2">
                                        <FaLock /> 🔒 Close Register & Auto-Adjust Cash
                                    </button>
                                </form>
                            ) : (
                                <div className="p-8 text-center text-slate-400 text-xs">
                                    Please open a register shift on the left card before closing daily cash.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Past Register Shift History Log */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
                            <FaHistory className="text-slate-500" /> Register Closing Shift History Log
                        </h3>
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                            <table className="w-full border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-500 font-extrabold text-[11px] uppercase border-b border-slate-200">
                                        <th className="p-3 text-left">Shift ID</th>
                                        <th className="p-3 text-left">Opened At</th>
                                        <th className="p-3 text-left">Closed At</th>
                                        <th className="p-3 text-right">Opening Cash</th>
                                        <th className="p-3 text-right">Expected Cash</th>
                                        <th className="p-3 text-right">Physical Cash</th>
                                        <th className="p-3 text-center">Discrepancy</th>
                                        <th className="p-3 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {registerHistory.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="p-6 text-center text-slate-400">No shift history logs recorded yet.</td>
                                        </tr>
                                    ) : (
                                        registerHistory.map((h, idx) => (
                                            <tr key={h._id || idx} className={`border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                                <td className="p-3 font-bold text-blue-600">{h.shiftId}</td>
                                                <td className="p-3 text-slate-600">{new Date(h.openedAt).toLocaleString()}</td>
                                                <td className="p-3 text-slate-600">{h.closedAt ? new Date(h.closedAt).toLocaleString() : 'Open'}</td>
                                                <td className="p-3 text-right font-bold text-slate-900">৳{h.openingBalance.toFixed(2)}</td>
                                                <td className="p-3 text-right font-bold text-slate-700">৳{h.systemExpectedCash.toFixed(2)}</td>
                                                <td className="p-3 text-right font-bold text-blue-700">৳{(h.physicalActualCash || 0).toFixed(2)}</td>
                                                <td className="p-3 text-center">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${h.discrepancy === 0 ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : h.discrepancy > 0 ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-rose-100 text-rose-800 border-rose-300'}`}>
                                                        {h.discrepancy === 0 ? '৳0.00' : h.discrepancy > 0 ? `+৳${h.discrepancy.toFixed(2)}` : `-৳${Math.abs(h.discrepancy).toFixed(2)}`}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-center">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${h.status === 'open' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-600 border-slate-300'}`}>
                                                        {h.status.toUpperCase()}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Add Expense / Add Income */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 w-full max-w-md shadow-2xl relative">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                                {entryType === 'outflow' ? <span className="text-rose-600 flex items-center gap-1"><FaMinus /> Add Store Expense</span> : <span className="text-emerald-600 flex items-center gap-1"><FaPlus /> Add Store Income</span>}
                            </h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-lg font-bold">✕</button>
                        </div>

                        <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
                            <div>
                                <label className="font-bold text-slate-700 block mb-1">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl outline-none"
                                >
                                    {entryType === 'outflow' ? (
                                        <>
                                            <option value="Shop Rent">Shop Rent</option>
                                            <option value="Electricity & Utilities">Electricity & Utilities</option>
                                            <option value="Employee Salary & Bonus">Employee Salary & Bonus</option>
                                            <option value="Maintenance & Repairs">Maintenance & Repairs</option>
                                            <option value="Marketing & Ads">Marketing & Ads</option>
                                            <option value="Office Supplies">Office Supplies</option>
                                            <option value="Other Expense">Other Expense</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="Other Income">Other Income</option>
                                            <option value="Sales Revenue">Sales Revenue</option>
                                            <option value="Customer Due Collection">Customer Due Collection</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="font-bold text-slate-700 block mb-1">Amount (৳)</label>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl outline-none font-bold text-slate-900 text-sm"
                                    min="0.01"
                                    step="0.01"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-slate-700 block mb-1">Payment Method</label>
                                <select
                                    value={formData.paymentMethod}
                                    onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl outline-none"
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="Card">Card</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                </select>
                            </div>

                            <div>
                                <label className="font-bold text-slate-700 block mb-1">Reference / Voucher No.</label>
                                <input
                                    type="text"
                                    value={formData.referenceNo}
                                    onChange={e => setFormData({ ...formData, referenceNo: e.target.value })}
                                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl outline-none font-bold text-blue-600"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-slate-700 block mb-1">Date</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl outline-none"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-slate-700 block mb-1">Description / Notes</label>
                                <input
                                    type="text"
                                    placeholder="Enter details..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl outline-none"
                                />
                            </div>

                            <div className="flex gap-2 pt-3 border-t border-slate-200">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-all">
                                    Cancel
                                </button>
                                <button type="submit" className={`flex-1 py-2.5 text-white font-bold rounded-xl shadow-md transition-all ${entryType === 'outflow' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                                    Save Entry
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CashFlow;
