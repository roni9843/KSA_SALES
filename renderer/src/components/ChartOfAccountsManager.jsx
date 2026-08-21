import { useEffect, useState } from 'react';
import { FaBook, FaBalanceScale, FaMoneyCheckAlt, FaPlus, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ChartOfAccountsManager = () => {
    const [activeTab, setActiveTab] = useState('coa'); // 'coa' | 'jv' | 'cheque' | 'pnl'
    const [accounts, setAccounts] = useState([]);
    const [cheques, setCheques] = useState([]);
    const [statements, setStatements] = useState(null);

    // Account Form
    const [accForm, setAccForm] = useState({ code: '', name: '', accountType: 'ASSET', balance: 0 });

    // JV Form
    const [jvForm, setJvForm] = useState({
        description: '',
        entries: [
            { accountId: '', debit: 0, credit: 0, memo: '' },
            { accountId: '', debit: 0, credit: 0, memo: '' }
        ]
    });

    // Cheque Form
    const [chequeForm, setChequeForm] = useState({
        chequeNumber: '', chequeType: 'RECEIVED', partyName: '', bankName: '', amount: 0, dueDate: ''
    });

    const fetchData = async () => {
        try {
            const accRes = await fetch('http://localhost:5000/api/accounts', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const accData = await accRes.json();
            if (accData.success) setAccounts(accData.accounts || []);

            const chkRes = await fetch('http://localhost:5000/api/cheques', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const chkData = await chkRes.json();
            if (chkData.success) setCheques(chkData.cheques || []);

            const stRes = await fetch('http://localhost:5000/api/accounts/financial-statements', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const stData = await stRes.json();
            if (stData.success) setStatements(stData.statements);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateAccount = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/accounts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(accForm)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('COA Account created!');
                setAccForm({ code: '', name: '', accountType: 'ASSET', balance: 0 });
                fetchData();
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handlePostJV = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/journal-vouchers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(jvForm)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Journal Voucher Posted!');
                setJvForm({
                    description: '',
                    entries: [
                        { accountId: '', debit: 0, credit: 0, memo: '' },
                        { accountId: '', debit: 0, credit: 0, memo: '' }
                    ]
                });
                fetchData();
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleCreateCheque = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/cheques', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(chequeForm)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Cheque added to portfolio!');
                setChequeForm({ chequeNumber: '', chequeType: 'RECEIVED', partyName: '', bankName: '', amount: 0, dueDate: '' });
                fetchData();
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleChequeStatus = async (id, status) => {
        try {
            const res = await fetch(`http://localhost:5000/api/cheques/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Cheque status updated to ${status}`);
                fetchData();
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div style={cardStyle}>
            <div style={headerStyle}>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <FaBook className="text-blue-600" /> Double-Entry Accounting & Financial Hub
                </h2>
            </div>

            <div style={tabNav}>
                <button onClick={() => setActiveTab('coa')} style={activeTab === 'coa' ? activeTabBtn : tabBtn}>Chart of Accounts ({accounts.length})</button>
                <button onClick={() => setActiveTab('jv')} style={activeTab === 'jv' ? activeTabBtn : tabBtn}><FaBalanceScale className="mr-1 inline text-xs" /> Journal Vouchers (JV)</button>
                <button onClick={() => setActiveTab('cheque')} style={activeTab === 'cheque' ? activeTabBtn : tabBtn}><FaMoneyCheckAlt className="mr-1 inline text-xs" /> Cheque Cycle ({cheques.length})</button>
                <button onClick={() => setActiveTab('pnl')} style={activeTab === 'pnl' ? activeTabBtn : tabBtn}>Financial Statements (P&L & Balance Sheet)</button>
            </div>

            {/* TAB 1: CHART OF ACCOUNTS TREE */}
            {activeTab === 'coa' && (
                <div>
                    <form onSubmit={handleCreateAccount} className="grid grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4">
                        <input placeholder="Code (e.g. 10010)" value={accForm.code} onChange={e => setAccForm({ ...accForm, code: e.target.value })} required style={inputStyle} />
                        <input placeholder="Account Name (e.g. Cash in Hand)" value={accForm.name} onChange={e => setAccForm({ ...accForm, name: e.target.value })} required style={inputStyle} />
                        <select value={accForm.accountType} onChange={e => setAccForm({ ...accForm, accountType: e.target.value })} style={inputStyle}>
                            <option value="ASSET">ASSET (10000)</option>
                            <option value="LIABILITY">LIABILITY (20000)</option>
                            <option value="EQUITY">EQUITY (30000)</option>
                            <option value="INCOME">INCOME (40000)</option>
                            <option value="EXPENSE">EXPENSE (50000)</option>
                        </select>
                        <button type="submit" style={addBtnStyle}>+ Add COA Account</button>
                    </form>

                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table style={tableStyle}>
                            <thead style={tableHeaderStyle}>
                                <tr>
                                    <th style={thStyle}>Code</th>
                                    <th style={thStyle}>Account Name</th>
                                    <th style={thStyle}>Type</th>
                                    <th style={thStyle}>Current Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {accounts.map(a => (
                                    <tr key={a._id}>
                                        <td style={tdStyle}><strong>{a.code}</strong></td>
                                        <td style={tdStyle}>{a.name}</td>
                                        <td style={tdStyle}>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">{a.accountType}</span>
                                        </td>
                                        <td style={tdStyle}><strong>{a.balance} SAR</strong></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 2: JOURNAL VOUCHERS */}
            {activeTab === 'jv' && (
                <form onSubmit={handlePostJV} className="space-y-4">
                    <input placeholder="JV Description / Memo" value={jvForm.description} onChange={e => setJvForm({ ...jvForm, description: e.target.value })} required style={inputStyle} />
                    
                    {jvForm.entries.map((entry, idx) => (
                        <div key={idx} className="grid grid-cols-4 gap-2 bg-slate-50 p-2 rounded-lg border">
                            <select value={entry.accountId} onChange={e => {
                                const updated = [...jvForm.entries];
                                updated[idx].accountId = e.target.value;
                                setJvForm({ ...jvForm, entries: updated });
                            }} required style={inputStyle}>
                                <option value="">Select COA Account</option>
                                {accounts.map(a => <option key={a._id} value={a._id}>{a.code} - {a.name}</option>)}
                            </select>
                            <input type="number" placeholder="Debit (SAR)" value={entry.debit} onChange={e => {
                                const updated = [...jvForm.entries];
                                updated[idx].debit = e.target.value;
                                setJvForm({ ...jvForm, entries: updated });
                            }} style={inputStyle} />
                            <input type="number" placeholder="Credit (SAR)" value={entry.credit} onChange={e => {
                                const updated = [...jvForm.entries];
                                updated[idx].credit = e.target.value;
                                setJvForm({ ...jvForm, entries: updated });
                            }} style={inputStyle} />
                            <input placeholder="Memo" value={entry.memo} onChange={e => {
                                const updated = [...jvForm.entries];
                                updated[idx].memo = e.target.value;
                                setJvForm({ ...jvForm, entries: updated });
                            }} style={inputStyle} />
                        </div>
                    ))}

                    <button type="submit" style={addBtnStyle} className="w-full py-3">Post Balanced Journal Voucher</button>
                </form>
            )}

            {/* TAB 3: CHEQUE CYCLE */}
            {activeTab === 'cheque' && (
                <div>
                    <form onSubmit={handleCreateCheque} className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4">
                        <input placeholder="Cheque No" value={chequeForm.chequeNumber} onChange={e => setChequeForm({ ...chequeForm, chequeNumber: e.target.value })} required style={inputStyle} />
                        <select value={chequeForm.chequeType} onChange={e => setChequeForm({ ...chequeForm, chequeType: e.target.value })} style={inputStyle}>
                            <option value="RECEIVED">RECEIVED (From Customer)</option>
                            <option value="ISSUED">ISSUED (To Supplier)</option>
                        </select>
                        <input placeholder="Party Name" value={chequeForm.partyName} onChange={e => setChequeForm({ ...chequeForm, partyName: e.target.value })} required style={inputStyle} />
                        <input placeholder="Bank Name" value={chequeForm.bankName} onChange={e => setChequeForm({ ...chequeForm, bankName: e.target.value })} required style={inputStyle} />
                        <input type="number" placeholder="Amount (SAR)" value={chequeForm.amount} onChange={e => setChequeForm({ ...chequeForm, amount: e.target.value })} required style={inputStyle} />
                        <input type="date" value={chequeForm.dueDate} onChange={e => setChequeForm({ ...chequeForm, dueDate: e.target.value })} required style={inputStyle} />
                        <button type="submit" style={addBtnStyle} className="col-span-3">+ Add Cheque to Portfolio</button>
                    </form>

                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table style={tableStyle}>
                            <thead style={tableHeaderStyle}>
                                <tr>
                                    <th style={thStyle}>Cheque No</th>
                                    <th style={thStyle}>Type</th>
                                    <th style={thStyle}>Party</th>
                                    <th style={thStyle}>Bank</th>
                                    <th style={thStyle}>Amount</th>
                                    <th style={thStyle}>Status</th>
                                    <th style={thStyle}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cheques.map(c => (
                                    <tr key={c._id}>
                                        <td style={tdStyle}><strong>{c.chequeNumber}</strong></td>
                                        <td style={tdStyle}><span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100">{c.chequeType}</span></td>
                                        <td style={tdStyle}>{c.partyName}</td>
                                        <td style={tdStyle}>{c.bankName}</td>
                                        <td style={tdStyle}><strong>{c.amount} SAR</strong></td>
                                        <td style={tdStyle}>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${c.status === 'CLEARED' ? 'bg-emerald-100 text-emerald-700' : (c.status === 'BOUNCED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700')}`}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            {c.status === 'PENDING' && (
                                                <div className="flex gap-1">
                                                    <button onClick={() => handleChequeStatus(c._id, 'CLEARED')} className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px]">Clear</button>
                                                    <button onClick={() => handleChequeStatus(c._id, 'BOUNCED')} className="px-2 py-1 bg-rose-600 text-white rounded text-[10px]">Bounce</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 4: FINANCIAL STATEMENTS */}
            {activeTab === 'pnl' && statements && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <h4 className="font-extrabold text-slate-900 mb-3 border-b pb-2">Profit & Loss Statement (Income Statement)</h4>
                        <div className="flex justify-between py-1 text-sm"><span>Operating Revenue (Income):</span><strong>{statements.totalIncome} SAR</strong></div>
                        <div className="flex justify-between py-1 text-sm text-rose-600"><span>Operating Expenses:</span><strong>- {statements.totalExpenses} SAR</strong></div>
                        <hr className="my-2" />
                        <div className="flex justify-between py-1 text-base font-extrabold text-blue-600"><span>Net Profit:</span><span>{statements.netProfit} SAR</span></div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <h4 className="font-extrabold text-slate-900 mb-3 border-b pb-2">Balance Sheet Overview</h4>
                        <div className="flex justify-between py-1 text-sm text-emerald-700"><span>Total Assets:</span><strong>{statements.totalAssets} SAR</strong></div>
                        <div className="flex justify-between py-1 text-sm text-amber-700"><span>Total Liabilities:</span><strong>{statements.totalLiabilities} SAR</strong></div>
                        <div className="flex justify-between py-1 text-sm text-indigo-700"><span>Total Owner's Equity:</span><strong>{statements.totalEquity} SAR</strong></div>
                    </div>
                </div>
            )}
        </div>
    );
};

const cardStyle = {
    background: '#ffffff',
    padding: '24px',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    color: '#0f172a',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
};

const headerStyle = {
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '12px',
    marginBottom: '16px'
};

const tabNav = {
    display: 'flex',
    gap: '8px',
    borderBottom: '2px solid #e2e8f0',
    marginBottom: '16px'
};

const activeTabBtn = {
    padding: '8px 14px',
    border: 'none',
    borderBottom: '3px solid #2563eb',
    backgroundColor: 'transparent',
    color: '#2563eb',
    fontWeight: '800',
    fontSize: '13px',
    cursor: 'pointer'
};

const tabBtn = {
    padding: '8px 14px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748b',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer'
};

const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontSize: '13px',
    outline: 'none',
};

const addBtnStyle = {
    padding: '8px 14px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontWeight: '800',
    fontSize: '13px',
    cursor: 'pointer'
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
    padding: '10px 14px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: '700',
};

const tdStyle = {
    padding: '10px 14px',
    borderBottom: '1px solid #e2e8f0',
    fontSize: '13px',
};

export default ChartOfAccountsManager;
