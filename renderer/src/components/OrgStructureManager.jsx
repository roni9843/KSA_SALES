import { useState } from 'react';
import { FaSitemap, FaBuilding, FaUserTie, FaPlus } from 'react-icons/fa';
import InfoTooltip from './common/InfoTooltip';

const OrgStructureManager = () => {
    const [activeTab, setActiveTab] = useState('orgchart');
    const [departments, setDepartments] = useState([
        { id: 1, name: 'Executive Leadership & Strategy', manager: 'Sheikh Eng. Abdulaziz Al-Saud', staffCount: 4 },
        { id: 2, name: 'Sales & POS Operations', manager: 'Tariq Al-Harbi', staffCount: 12 },
        { id: 3, name: 'Finance & Double-Entry Accounting', manager: 'Faisal Al-Otaibi', staffCount: 6 },
        { id: 4, name: 'Logistics & Warehouse Operations', manager: 'Mansour Al-Ghamdi', staffCount: 15 }
    ]);

    return (
        <div style={cardStyle}>
            <div style={headerStyle}>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <FaSitemap className="text-blue-600" /> Organizational Hierarchy & Designations Hub
                    <InfoTooltip 
                        title="কোম্পানির সাংগঠনিক কাঠামো ও পদসোপান" 
                        content="কোম্পানির ডিপার্টমেন্ট, স্টাফ পদবী (Designations), ও অর্গানাইজেশনাল হায়ারার্কি তৈরি।" 
                        formula="Company Staff Density = Total Employees / Active Departments"
                    />
                </h2>
            </div>

            <div style={tabNav}>
                <button onClick={() => setActiveTab('orgchart')} style={activeTab === 'orgchart' ? activeTabBtn : tabBtn}>Organizational Chart</button>
                <button onClick={() => setActiveTab('depts')} style={activeTab === 'depts' ? activeTabBtn : tabBtn}>Manage Departments ({departments.length})</button>
                <button onClick={() => setActiveTab('designations')} style={activeTab === 'designations' ? activeTabBtn : tabBtn}>Manage Designations & Levels</button>
            </div>

            {activeTab === 'orgchart' && (
                <div className="p-6 bg-slate-900 text-white rounded-2xl space-y-4">
                    <div className="text-center font-extrabold text-blue-400 text-sm">
                        👑 BOARD OF DIRECTORS / CEO: Sheikh Eng. Abdulaziz Al-Saud
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs text-center">
                        <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                            <h4 className="font-bold text-amber-300 mb-1">💼 Finance & Accounts</h4>
                            <p className="text-slate-400">Head: Faisal Al-Otaibi</p>
                        </div>
                        <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                            <h4 className="font-bold text-emerald-300 mb-1">🛒 Sales & POS Counter</h4>
                            <p className="text-slate-400">Head: Tariq Al-Harbi</p>
                        </div>
                        <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                            <h4 className="font-bold text-blue-300 mb-1">📦 Logistics & Warehouses</h4>
                            <p className="text-slate-400">Head: Mansour Al-Ghamdi</p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'depts' && (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table style={tableStyle}>
                        <thead style={tableHeaderStyle}>
                            <tr>
                                <th style={thStyle}>Department Name</th>
                                <th style={thStyle}>Department Head / Manager</th>
                                <th style={thStyle}>Active Staff Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            {departments.map(d => (
                                <tr key={d.id}>
                                    <td style={tdStyle}><strong>{d.name}</strong></td>
                                    <td style={tdStyle}>{d.manager}</td>
                                    <td style={tdStyle}><span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-bold text-[10px]">{d.staffCount} Staff Members</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'designations' && (
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
                    Designation Levels: Executive C-Level, Senior Manager, Operations Supervisor, Senior Cashier, Junior Accountant.
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

export default OrgStructureManager;
