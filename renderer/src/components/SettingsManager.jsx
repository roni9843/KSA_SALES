import { useEffect, useState } from 'react';
import { FaCog, FaHashtag, FaPercent, FaCoins, FaPlus, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import InfoTooltip from './common/InfoTooltip';

const SettingsManager = () => {
    const [activeTab, setActiveTab] = useState('sequences'); // 'sequences' | 'taxes' | 'currencies'
    const [sequences, setSequences] = useState([]);
    const [taxRules, setTaxRules] = useState([]);
    const [currencies, setCurrencies] = useState([]);

    // Sequence Form
    const [seqForm, setSeqForm] = useState({ docType: 'INVOICE', prefix: 'INV', nextNumber: 1, zeroPad: 5 });

    // Tax Rule Form
    const [taxForm, setTaxForm] = useState({ ruleName: '', exemptionCertificateNo: '', customerType: 'GOVERNMENT', vatRate: 0 });

    // Currency Form
    const [currForm, setCurrForm] = useState({ currencyCode: '', currencyName: '', symbol: '', exchangeRate: 1.0 });

    const fetchData = async () => {
        try {
            const seqRes = await fetch('http://localhost:5000/api/auto-sequences', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const seqData = await seqRes.json();
            if (seqData.success) setSequences(seqData.sequences || []);

            const taxRes = await fetch('http://localhost:5000/api/tax-exemptions', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const taxData = await taxRes.json();
            if (taxData.success) setTaxRules(taxData.rules || []);

            const curRes = await fetch('http://localhost:5000/api/currency-rates', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const curData = await curRes.json();
            if (curData.success) setCurrencies(curData.rates || []);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSaveSequence = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/auto-sequences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(seqForm)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Sequence Prefix updated!');
                fetchData();
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleCreateTaxRule = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/tax-exemptions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(taxForm)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('VAT Exemption Rule added!');
                setTaxForm({ ruleName: '', exemptionCertificateNo: '', customerType: 'GOVERNMENT', vatRate: 0 });
                fetchData();
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleSaveCurrency = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/currency-rates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(currForm)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Currency Exchange Rate updated!');
                setCurrForm({ currencyCode: '', currencyName: '', symbol: '', exchangeRate: 1.0 });
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
                    <FaCog className="text-blue-600" /> Enterprise System Settings & Auto-Sequences
                    <InfoTooltip 
                        title="ডকুমেন্ট অটো-সিকোয়েন্স নাম্বারিং লজিক" 
                        content="ইনভয়েস, পিও, কাস্টমার এবং ভাউচারের নাম্বার কাস্টম প্রিফিক্স ও প্যাডিং কারেন্ট পজিশন অনুযায়ী তৈরি করা হয়। যেমন প্রিফিক্স KSA-INV এবং প্যাডিং 5 হলে পরবর্তী ইনভয়েস নাম্বার হবে KSA-INV-00103।" 
                        formula="Formatted Document No = Prefix + '-' + padStart(NextNumber, ZeroPad)"
                    />
                </h2>
            </div>

            <div style={tabNav}>
                <button onClick={() => setActiveTab('sequences')} style={activeTab === 'sequences' ? activeTabBtn : tabBtn}><FaHashtag className="mr-1 inline text-xs" /> Document Prefixes & Sequences ({sequences.length})</button>
                <button onClick={() => setActiveTab('taxes')} style={activeTab === 'taxes' ? activeTabBtn : tabBtn}><FaPercent className="mr-1 inline text-xs" /> Tax Exemption Rules ({taxRules.length})</button>
                <button onClick={() => setActiveTab('currencies')} style={activeTab === 'currencies' ? activeTabBtn : tabBtn}><FaCoins className="mr-1 inline text-xs" /> Multi-Currency Rates ({currencies.length})</button>
            </div>

            {/* TAB 1: AUTO SEQUENCES */}
            {activeTab === 'sequences' && (
                <div>
                    <form onSubmit={handleSaveSequence} className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                        <select value={seqForm.docType} onChange={e => setSeqForm({ ...seqForm, docType: e.target.value })} style={inputStyle}>
                            <option value="INVOICE">INVOICE (Sales Tax Invoice)</option>
                            <option value="PO">PO (Purchase Order)</option>
                            <option value="PR">PR (Purchase Request)</option>
                            <option value="JV">JV (Journal Voucher)</option>
                            <option value="MO">MO (Manufacturing Order)</option>
                            <option value="TASK">TASK (Kanban Task)</option>
                        </select>
                        <input placeholder="Prefix (e.g. KSA-INV)" value={seqForm.prefix} onChange={e => setSeqForm({ ...seqForm, prefix: e.target.value })} required style={inputStyle} />
                        <input type="number" placeholder="Next Number" value={seqForm.nextNumber} onChange={e => setSeqForm({ ...seqForm, nextNumber: e.target.value })} required style={inputStyle} />
                        <button type="submit" style={addBtnStyle}>Save Sequence Rule</button>
                    </form>

                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table style={tableStyle}>
                            <thead style={tableHeaderStyle}>
                                <tr>
                                    <th style={thStyle}>Document Type</th>
                                    <th style={thStyle}>Prefix</th>
                                    <th style={thStyle}>Next Counter</th>
                                    <th style={thStyle}>Preview Sample</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sequences.map(s => (
                                    <tr key={s._id}>
                                        <td style={tdStyle}><strong>{s.docType}</strong></td>
                                        <td style={tdStyle}>{s.prefix}</td>
                                        <td style={tdStyle}>{s.nextNumber}</td>
                                        <td style={tdStyle}><span className="font-mono text-xs text-blue-600 font-bold">{s.prefix}-{String(s.nextNumber).padStart(s.zeroPad, '0')}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 2: TAX EXEMPTIONS */}
            {activeTab === 'taxes' && (
                <div>
                    <form onSubmit={handleCreateTaxRule} className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                        <input placeholder="Rule Name" value={taxForm.ruleName} onChange={e => setTaxForm({ ...taxForm, ruleName: e.target.value })} required style={inputStyle} />
                        <input placeholder="Certificate / Exemption No" value={taxForm.exemptionCertificateNo} onChange={e => setTaxForm({ ...taxForm, exemptionCertificateNo: e.target.value })} required style={inputStyle} />
                        <input type="number" placeholder="VAT Rate % (e.g. 0)" value={taxForm.vatRate} onChange={e => setTaxForm({ ...taxForm, vatRate: e.target.value })} required style={inputStyle} />
                        <button type="submit" style={addBtnStyle}>+ Add Tax Exemption</button>
                    </form>

                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table style={tableStyle}>
                            <thead style={tableHeaderStyle}>
                                <tr>
                                    <th style={thStyle}>Rule Name</th>
                                    <th style={thStyle}>Certificate No</th>
                                    <th style={thStyle}>Customer Type</th>
                                    <th style={thStyle}>VAT Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {taxRules.map(t => (
                                    <tr key={t._id}>
                                        <td style={tdStyle}><strong>{t.ruleName}</strong></td>
                                        <td style={tdStyle}>{t.exemptionCertificateNo}</td>
                                        <td style={tdStyle}>{t.customerType}</td>
                                        <td style={tdStyle}><strong className="text-emerald-600">{t.vatRate}% (EXEMPT)</strong></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 3: MULTI-CURRENCY */}
            {activeTab === 'currencies' && (
                <div>
                    <form onSubmit={handleSaveCurrency} className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                        <input placeholder="Currency Code (e.g. USD)" value={currForm.currencyCode} onChange={e => setCurrForm({ ...currForm, currencyCode: e.target.value })} required style={inputStyle} />
                        <input placeholder="Currency Name (e.g. US Dollar)" value={currForm.currencyName} onChange={e => setCurrForm({ ...currForm, currencyName: e.target.value })} required style={inputStyle} />
                        <input placeholder="Symbol (e.g. $)" value={currForm.symbol} onChange={e => setCurrForm({ ...currForm, symbol: e.target.value })} style={inputStyle} />
                        <input type="number" step="0.0001" placeholder="Exchange Rate to SAR" value={currForm.exchangeRate} onChange={e => setCurrForm({ ...currForm, exchangeRate: e.target.value })} required style={inputStyle} />
                        <button type="submit" style={addBtnStyle} className="col-span-4">Save Exchange Rate</button>
                    </form>

                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table style={tableStyle}>
                            <thead style={tableHeaderStyle}>
                                <tr>
                                    <th style={thStyle}>Currency Code</th>
                                    <th style={thStyle}>Name</th>
                                    <th style={thStyle}>Symbol</th>
                                    <th style={thStyle}>Rate (Base SAR)</th>
                                    <th style={thStyle}>Default Base</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currencies.map(c => (
                                    <tr key={c._id}>
                                        <td style={tdStyle}><strong>{c.currencyCode}</strong></td>
                                        <td style={tdStyle}>{c.currencyName}</td>
                                        <td style={tdStyle}>{c.symbol}</td>
                                        <td style={tdStyle}><strong>{c.exchangeRate} SAR</strong></td>
                                        <td style={tdStyle}>
                                            {c.isDefault ? <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold text-[10px]">BASE CURRENCY</span> : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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

export default SettingsManager;
