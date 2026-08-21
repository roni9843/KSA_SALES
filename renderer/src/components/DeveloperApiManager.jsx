import { useEffect, useState } from 'react';
import { FaCode, FaKey, FaNetworkWired, FaPlus, FaCopy, FaCheckCircle, FaBan } from 'react-icons/fa';
import toast from 'react-hot-toast';
import InfoTooltip from './common/InfoTooltip';

const DeveloperApiManager = () => {
    const [activeTab, setActiveTab] = useState('keys'); // 'keys' | 'webhooks'
    const [keys, setKeys] = useState([]);
    const [webhooks, setWebhooks] = useState([]);

    // Key Form
    const [keyForm, setKeyForm] = useState({ keyName: '', permissions: ['read:products', 'write:invoices'] });

    // Webhook Form
    const [webhookForm, setWebhookForm] = useState({ targetUrl: '', events: ['invoice.created'] });

    const fetchData = async () => {
        try {
            const keyRes = await fetch('http://localhost:5000/api/developers/keys', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const keyData = await keyRes.json();
            if (keyData.success) setKeys(keyData.keys || []);

            const whRes = await fetch('http://localhost:5000/api/developers/webhooks', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const whData = await whRes.json();
            if (whData.success) setWebhooks(whData.webhooks || []);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleGenerateKey = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/developers/keys', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(keyForm)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Developer API Key generated!');
                setKeyForm({ keyName: '', permissions: ['read:products', 'write:invoices'] });
                fetchData();
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleRevokeKey = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/developers/keys/${id}/revoke`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await res.json();
            if (data.success) {
                toast.success('API Key Revoked!');
                fetchData();
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleCreateWebhook = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/developers/webhooks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(webhookForm)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Webhook Subscription created!');
                setWebhookForm({ targetUrl: '', events: ['invoice.created'] });
                fetchData();
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('API Secret Key copied to clipboard!');
    };

    return (
        <div style={cardStyle}>
            <div style={headerStyle}>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <FaCode className="text-blue-600" /> Developers Open API & Webhooks Engine
                    <InfoTooltip 
                        title="ডেভেলপার এপিআই ও HMAC সাইনড ওয়েবহুক লজিক" 
                        content="থার্ড-পার্টি সিস্টেম বা ই-কমার্স সাইট কানেক্ট করার জন্য এপিআই কি জেনারেট করা হয় এবং রিয়েল-টাইম ইভেন্টে (যেমন ইনভয়েস তৈরি হলে) HMAC SHA-256 এনক্রিপ্টেড পে-লোড তৈরি করে টার্গেট ইউআরএল-এ অটো সেন্ড করা হয়।" 
                        formula="X-Webhook-Signature = HMAC-SHA256(PayloadData, WebhookSecretKey)"
                    />
                </h2>
            </div>

            <div style={tabNav}>
                <button onClick={() => setActiveTab('keys')} style={activeTab === 'keys' ? activeTabBtn : tabBtn}><FaKey className="mr-1 inline text-xs" /> Developer API Keys ({keys.length})</button>
                <button onClick={() => setActiveTab('webhooks')} style={activeTab === 'webhooks' ? activeTabBtn : tabBtn}><FaNetworkWired className="mr-1 inline text-xs" /> Webhook Subscriptions ({webhooks.length})</button>
            </div>

            {/* TAB 1: API KEYS */}
            {activeTab === 'keys' && (
                <div>
                    <form onSubmit={handleGenerateKey} className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                        <input placeholder="Key Name (e.g. WooCommerce Store Sync)" value={keyForm.keyName} onChange={e => setKeyForm({ ...keyForm, keyName: e.target.value })} required style={inputStyle} />
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                            <span>Permissions: Full Open API Access</span>
                        </div>
                        <button type="submit" style={addBtnStyle}>+ Generate API Key</button>
                    </form>

                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table style={tableStyle}>
                            <thead style={tableHeaderStyle}>
                                <tr>
                                    <th style={thStyle}>Key Name</th>
                                    <th style={thStyle}>API Secret Key</th>
                                    <th style={thStyle}>Rate Limit</th>
                                    <th style={thStyle}>Status</th>
                                    <th style={thStyle}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {keys.map(k => (
                                    <tr key={k._id}>
                                        <td style={tdStyle}><strong>{k.keyName}</strong></td>
                                        <td style={tdStyle}>
                                            <div className="flex items-center gap-2 font-mono text-xs text-slate-800">
                                                <span>{k.keySecret.slice(0, 15)}...</span>
                                                <button onClick={() => copyToClipboard(k.keySecret)} className="text-blue-600 p-1 hover:bg-blue-50 rounded" title="Copy Secret">
                                                    <FaCopy />
                                                </button>
                                            </div>
                                        </td>
                                        <td style={tdStyle}>{k.rateLimitPerMin} req / min</td>
                                        <td style={tdStyle}>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${k.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                {k.status}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            {k.status === 'ACTIVE' && (
                                                <button onClick={() => handleRevokeKey(k._id)} className="px-2 py-1 bg-rose-600 text-white rounded text-[10px]">Revoke</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 2: WEBHOOKS */}
            {activeTab === 'webhooks' && (
                <div>
                    <form onSubmit={handleCreateWebhook} className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                        <input placeholder="Target Delivery URL (https://...)" value={webhookForm.targetUrl} onChange={e => setWebhookForm({ ...webhookForm, targetUrl: e.target.value })} required style={inputStyle} />
                        <select value={webhookForm.events[0]} onChange={e => setWebhookForm({ ...webhookForm, events: [e.target.value] })} style={inputStyle}>
                            <option value="invoice.created">invoice.created (New Sales Tax Invoice)</option>
                            <option value="stock.low">stock.low (Low Inventory Alert)</option>
                            <option value="customer.added">customer.added (New CRM Client)</option>
                        </select>
                        <button type="submit" style={addBtnStyle}>+ Subscribe Webhook</button>
                    </form>

                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table style={tableStyle}>
                            <thead style={tableHeaderStyle}>
                                <tr>
                                    <th style={thStyle}>Target Delivery URL</th>
                                    <th style={thStyle}>Subscribed Events</th>
                                    <th style={thStyle}>HMAC Secret</th>
                                    <th style={thStyle}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {webhooks.map(w => (
                                    <tr key={w._id}>
                                        <td style={tdStyle}><span className="font-mono text-xs">{w.targetUrl}</span></td>
                                        <td style={tdStyle}>{w.events?.join(', ')}</td>
                                        <td style={tdStyle}><span className="font-mono text-[10px] text-slate-500">{w.secretKey}</span></td>
                                        <td style={tdStyle}><span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">{w.status}</span></td>
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

export default DeveloperApiManager;
