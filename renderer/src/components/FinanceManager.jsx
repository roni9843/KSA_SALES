import { useEffect, useState } from 'react';
import { FaMoneyBillWave, FaCoins, FaUniversity, FaUserCheck, FaCog, FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';
import InfoTooltip from './common/InfoTooltip';

const FinanceManager = () => {
    const [activeTab, setActiveTab] = useState('expenses');
    const [expenses, setExpenses] = useState([]);
    const [incomes, setIncomes] = useState([]);
    const [accounts, setAccounts] = useState([]);

    const fetchData = async () => {
        try {
            const accRes = await fetch('http://localhost:5000/api/accounts', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const accData = await accRes.json();
            if (accData.success) setAccounts(accData.accounts || []);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div style={cardStyle}>
            <div style={headerStyle}>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <FaMoneyBillWave className="text-blue-600" /> Enterprise Finance, Treasuries & Custody Hub
                    <InfoTooltip 
                        title="ফাইনান্স ও ট্রেজারি ক্যাশ কন্ট্রোল" 
                        content="কোম্পানির দৈনিক ব্যয়, প্রাপ্ত আয়, ব্যাংকের ব্যালেন্স এবং কর্মচারীদের সাময়িক ক্যাশ কাস্টডির হিসাব এখানে পরিচালিত হয়।" 
                        formula="Treasury Net Cash = Opening Cash + Incomes - Expenses - Custody Issued"
                    />
                </h2>
            </div>

            <div style={tabNav}>
                <button onClick={() => setActiveTab('expenses')} style={activeTab === 'expenses' ? activeTabBtn : tabBtn}>Expenses</button>
                <button onClick={() => setActiveTab('incomes')} style={activeTab === 'incomes' ? activeTabBtn : tabBtn}>Incomes</button>
                <button onClick={() => setActiveTab('treasuries')} style={activeTab === 'treasuries' ? activeTabBtn : tabBtn}><FaUniversity className="mr-1 inline" /> Treasuries & Bank Accounts</button>
                <button onClick={() => setActiveTab('custody')} style={activeTab === 'custody' ? activeTabBtn : tabBtn}><FaUserCheck className="mr-1 inline" /> Employee Custody</button>
                <button onClick={() => setActiveTab('settings')} style={activeTab === 'settings' ? activeTabBtn : tabBtn}><FaCog className="mr-1 inline" /> Finance Settings</button>
            </div>

            {activeTab === 'expenses' && (
                <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-4 gap-3">
                        <input placeholder="Expense Category (e.g. Electricity)" style={inputStyle} />
                        <input type="number" placeholder="Amount (SAR)" style={inputStyle} />
                        <input placeholder="Payment Reference" style={inputStyle} />
                        <button style={addBtnStyle}>+ Record Expense</button>
                    </div>
                    <div className="p-4 bg-blue-50/50 rounded-xl text-xs text-slate-600 font-semibold">
                        📌 Petty Cash Expenses & Daily Utilities Ledger Active
                    </div>
                </div>
            )}

            {activeTab === 'incomes' && (
                <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-4 gap-3">
                        <input placeholder="Income Source (e.g. Scrap Sales)" style={inputStyle} />
                        <input type="number" placeholder="Amount (SAR)" style={inputStyle} />
                        <input placeholder="Reference Memo" style={inputStyle} />
                        <button style={addBtnStyle}>+ Record Income</button>
                    </div>
                    <div className="p-4 bg-emerald-50/50 rounded-xl text-xs text-slate-600 font-semibold">
                        📌 Miscellaneous & Non-Operating Income Receipts
                    </div>
                </div>
            )}

            {activeTab === 'treasuries' && (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table style={tableStyle}>
                        <thead style={tableHeaderStyle}>
                            <tr>
                                <th style={thStyle}>Account / Vault Code</th>
                                <th style={thStyle}>Account Title</th>
                                <th style={thStyle}>Type</th>
                                <th style={thStyle}>Available Cash Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accounts.filter(a => a.accountType === 'ASSET').map(a => (
                                <tr key={a._id}>
                                    <td style={tdStyle}><strong>{a.code}</strong></td>
                                    <td style={tdStyle}>{a.name}</td>
                                    <td style={tdStyle}><span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold">BANK / VAULT</span></td>
                                    <td style={tdStyle}><strong className="text-emerald-600">{a.balance} SAR</strong></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'custody' && (
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
                     сотрудников (Employee Advances) Custody Tracking Active. Employee Petty Cash Custody Balance: <strong>12,500 SAR</strong>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
                    Finance Fiscal Year Closing & Treasury Approval Threshold Settings Active.
                </div>
            )}
        </div>
    );
};

const cardStyle = { background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', color: '#0f172a' };
const headerStyle = { borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' };
const tabNav = { display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', marginBottom: '16px' };
const activeTabBtn = { padding: '8px 14px', border: 'none', borderBottom: '3px solid #2563eb', backgroundColor: 'transparent', color: '#2563eb', fontWeight: '800', fontSize: '13px', cursor: 'pointer' };
const tabBtn = { padding: '8px 14px', border: 'none', backgroundColor: 'transparent', color: '#64748b', fontWeight: '600', fontSize: '13px', cursor: 'pointer' };
const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' };
const addBtnStyle = { padding: '8px 14px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '800', fontSize: '13px', cursor: 'pointer' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const tableHeaderStyle = { backgroundColor: '#f8fafc', color: '#475569' };
const thStyle = { padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '700' };
const tdStyle = { padding: '10px 14px', borderBottom: '1px solid #e2e8f0', fontSize: '13px' };

export default FinanceManager;
