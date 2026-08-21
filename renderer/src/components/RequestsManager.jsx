import { useEffect, useState } from 'react';
import { FaClipboardList, FaPlus, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import InfoTooltip from './common/InfoTooltip';

const RequestsManager = () => {
    const [activeTab, setActiveTab] = useState('requests');
    const [requests, setRequests] = useState([
        { id: 1, reqNo: 'REQ-2026-001', type: 'Material Requisition', requestedBy: 'Tariq Al-Harbi', department: 'Sales', status: 'APPROVED', amount: '4,500 SAR' },
        { id: 2, reqNo: 'REQ-2026-002', type: 'Petty Cash Advance', requestedBy: 'Faisal Al-Otaibi', department: 'Finance', status: 'PENDING', amount: '1,200 SAR' }
    ]);

    return (
        <div style={cardStyle}>
            <div style={headerStyle}>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <FaClipboardList className="text-blue-600" /> Internal Material & Cash Requisitions Hub
                    <InfoTooltip 
                        title="অভ্যন্তরীণ আবেদন ও অনুমোদন প্রক্রিয়া" 
                        content="কোম্পানির বিভাগীয় মালামাল বা নগদ ক্যাশ অগ্রিমের আবেদন এবং ডিপার্টমেন্ট হেড অনুমোদন সিস্টেম।" 
                        formula="Approved Requests = Total Requests - Pending - Rejected"
                    />
                </h2>
            </div>

            <div style={tabNav}>
                <button onClick={() => setActiveTab('requests')} style={activeTab === 'requests' ? activeTabBtn : tabBtn}>Manage Requests ({requests.length})</button>
                <button onClick={() => setActiveTab('types')} style={activeTab === 'types' ? activeTabBtn : tabBtn}>Request Types & Approval Workflows</button>
            </div>

            {activeTab === 'requests' && (
                <div className="space-y-4">
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table style={tableStyle}>
                            <thead style={tableHeaderStyle}>
                                <tr>
                                    <th style={thStyle}>Request No</th>
                                    <th style={thStyle}>Request Type</th>
                                    <th style={thStyle}>Requested By</th>
                                    <th style={thStyle}>Department</th>
                                    <th style={thStyle}>Estimated Value</th>
                                    <th style={thStyle}>Approval Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map(r => (
                                    <tr key={r.id}>
                                        <td style={tdStyle}><strong>{r.reqNo}</strong></td>
                                        <td style={tdStyle}>{r.type}</td>
                                        <td style={tdStyle}>{r.requestedBy}</td>
                                        <td style={tdStyle}>{r.department}</td>
                                        <td style={tdStyle}><strong>{r.amount}</strong></td>
                                        <td style={tdStyle}>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {r.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'types' && (
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
                    Workflow Types: Material Requisition, Travel Clearance, Advance Salary Request, Equipment Repair Request.
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
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const tableHeaderStyle = { backgroundColor: '#f8fafc', color: '#475569' };
const thStyle = { padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '700' };
const tdStyle = { padding: '10px 14px', borderBottom: '1px solid #e2e8f0', fontSize: '13px' };

export default RequestsManager;
