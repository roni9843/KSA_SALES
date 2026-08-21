import { useEffect, useState } from 'react';
import { FaBook, FaMoneyCheckAlt, FaBalanceScale, FaPlus, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import InfoTooltip from './common/InfoTooltip';

const ChartOfAccountsManager = () => {
    const [activeTab, setActiveTab] = useState('coa'); // 'coa' | 'jv' | 'cheques'
    const [accounts, setAccounts] = useState([]);
    const [jvs, setJvs] = useState([]);
    const [cheques, setCheques] = useState([]);

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

    const fetchData = async () => {
        try {
            const accRes = await fetch('http://localhost:5000/api/accounts', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const accData = await accRes.json();
            if (accData.success) setAccounts(accData.accounts || []);

            const jvRes = await fetch('http://localhost:5000/api/journal-vouchers', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const jvData = await jvRes.json();
            if (jvData.success) setJvs(jvData.jvs || []);

            const chkRes = await fetch('http://localhost:5000/api/cheques', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const chkData = await chkRes.json();
            if (chkData.success) setCheques(chkData.cheques || []);
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
                toast.success('Chart of Account added!');
                setAccForm({ code: '', name: '', accountType: 'ASSET', balance: 0 });
                fetchData();
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleCreateJV = async (e) => {
        e.preventDefault();
        const totalDebit = jvForm.entries.reduce((sum, i) => sum + (parseFloat(i.debit) || 0), 0);
        const totalCredit = jvForm.entries.reduce((sum, i) => sum + (parseFloat(i.credit) || 0), 0);

        if (totalDebit !== totalCredit) {
            return toast.error(`Unbalanced Journal Voucher! Total Debit (${totalDebit}) must equal Total Credit (${totalCredit}).`);
        }

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
                toast.success('Balanced Journal Voucher posted!');
                setJvForm({
                    description: '',
                    entries: [
                        { accountId: '', debit: 0, credit: 0, memo: '' },
                        { accountId: '', debit: 0, credit: 0, memo: '' }
                    ]
                });
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
                    <FaBook className="text-blue-600" /> Double-Entry Accounting & Cheques Ledger
                    <InfoTooltip 
                        title="ডাবল-এন্ট্রি হিসাববিজ্ঞান ও ভাউচার সমীকরণ" 
                        content="আন্তর্জাতিক হিসাববিজ্ঞান মানদণ্ড (IFRS) অনুযায়ী প্রতিটি লেনদেনের সমপরিমাণ ডেবিট (Debit) এবং ক্রেডিট (Credit) এন্ট্রি পোস্ট করতে হয়। মোট ডেবিট এবং মোট ক্রেডিট সমান না হলে ভাউচার পোস্ট হবে না।" 
                        formula="Σ Total Debits = Σ Total Credits (সম্পদ + খরচ = দায় + মালিকানা + আয়)"
                    />
                </h2>
            </div>

            <div style={tabNav}>
                <button onClick={() => setActiveTab('coa')} style={activeTab === 'coa' ? activeTabBtn : tabBtn}>Chart of Accounts ({accounts.length})</button>
                <button onClick={() => setActiveTab('jv')} style={activeTab === 'jv' ? activeTabBtn : tabBtn}><FaBalanceScale className="mr-1 inline text-xs" /> Journal Vouchers ({jvs.length})</button>
                <button onClick={() => setActiveTab('cheques')} style={activeTab === 'cheques' ? activeTabBtn : tabBtn}><FaMoneyCheckAlt className="mr-1 inline text-xs" /> Cheque Management ({cheques.length})</button>
            </div>

            {/* TAB 1: COA */}
            {activeTab === 'coa' && (
                <div>
                    <form onSubmit={handleCreateAccount} className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                        <input placeholder="Account Code (e.g. 10010)" value={accForm.code} onChange={e => setAccForm({ ...accForm, code: e.target.value })} required style={inputStyle} />
                        <input placeholder="Account Name (e.g. Riyadh Bank Vault)" value={accForm.name} onChange={e => setAccForm({ ...accForm, name: e.target.value })} required style={inputStyle} />
                        <select value={accForm.accountType} onChange={e => setAccForm({ ...accForm, accountType: e.target.value })} style={inputStyle}>
                            <option value="ASSET">ASSET (সম্পদ)</option>
                            <option value="LIABILITY">LIABILITY (দায়)</option>
                            <option value="EQUITY">EQUITY (মালিকানা স্বত্ব)</option>
                            <option value="INCOME">INCOME (আয়)</option>
                            <option value="EXPENSE">EXPENSE (ব্যয়)</option>
                        </select>
                        <button type="submit" style={addBtnStyle}>+ Add COA Account</button>
                    </form>

                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table style={tableStyle}>
                            <thead style={tableHeaderStyle}>
                                <tr>
                                    <th style={thStyle}>Code</th>
                                    <th style={thStyle}>Account Title</th>
                                    <th style={thStyle}>Type</th>
                                    <th style={thStyle}>Current Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {accounts.map(a => (
                                    <tr key={a._id}>
                                        <td style={tdStyle}><strong>{a.code}</strong></td>
                                        <td style={tdStyle}>{a.name}</td>
                                        <td style={tdStyle}><span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">{a.accountType}</span></td>
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
                <div>
                    <form onSubmit={handleCreateJV} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                        <input placeholder="Voucher Description / Memo" value={jvForm.description} onChange={e => setJvForm({ ...jvForm, description: e.target.value })} required style={inputStyle} />
                        
                        {jvForm.entries.map((row, idx) => (
                            <div key={idx} className="grid grid-cols-4 gap-3 bg-white p-3 rounded-lg border border-slate-200">
                                <select required value={row.accountId} onChange={e => {
                                    const updated = [...jvForm.entries];
                                    updated[idx].accountId = e.target.value;
                                    setJvForm({ ...jvForm, entries: updated });
                                }} style={inputStyle}>
                                    <option value="">Select Account</option>
                                    {accounts.map(a => <option key={a._id} value={a._id}>{a.code} - {a.name}</option>)}
                                </select>
                                <input type="number" placeholder="Debit (SAR)" value={row.debit} onChange={e => {
                                    const updated = [...jvForm.entries];
                                    updated[idx].debit = e.target.value;
                                    setJvForm({ ...jvForm, entries: updated });
                                }} style={inputStyle} />
                                <input type="number" placeholder="Credit (SAR)" value={row.credit} onChange={e => {
                                    const updated = [...jvForm.entries];
                                    updated[idx].credit = e.target.value;
                                    setJvForm({ ...jvForm, entries: updated });
                                }} style={inputStyle} />
                                <input placeholder="Memo" value={row.memo} onChange={e => {
                                    const updated = [...jvForm.entries];
                                    updated[idx].memo = e.target.value;
                                    setJvForm({ ...jvForm, entries: updated });
                                }} style={inputStyle} />
                            </div>
                        ))}

                        <button type="submit" style={addBtnStyle}>Post Balanced Double-Entry JV</button>
                    </form>

                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table style={tableStyle}>
                            <thead style={tableHeaderStyle}>
                                <tr>
                                    <th style={thStyle}>Voucher No</th>
                                    <th style={thStyle}>Description</th>
                                    <th style={thStyle}>Total Debit</th>
                                    <th style={thStyle}>Total Credit</th>
                                    <th style={thStyle}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jvs.map(j => (
                                    <tr key={j._id}>
                                        <td style={tdStyle}><strong>{j.voucherNo}</strong></td>
                                        <td style={tdStyle}>{j.description}</td>
                                        <td style={tdStyle}><strong>{j.totalDebit} SAR</strong></td>
                                        <td style={tdStyle}><strong>{j.totalCredit} SAR</strong></td>
                                        <td style={tdStyle}><span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">{j.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 3: CHEQUES */}
            {activeTab === 'cheques' && (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table style={tableStyle}>
                        <thead style={tableHeaderStyle}>
                            <tr>
                                <th style={thStyle}>Cheque No</th>
                                <th style={thStyle}>Party / Customer</th>
                                <th style={thStyle}>Bank Name</th>
                                <th style={thStyle}>Amount</th>
                                <th style={thStyle}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cheques.map(c => (
                                <tr key={c._id}>
                                    <td style={tdStyle}><strong>{c.chequeNumber}</strong></td>
                                    <td style={tdStyle}>{c.partyName}</td>
                                    <td style={tdStyle}>{c.bankName}</td>
                                    <td style={tdStyle}><strong>{c.amount} SAR</strong></td>
                                    <td style={tdStyle}>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${c.status === 'CLEARED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {c.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
