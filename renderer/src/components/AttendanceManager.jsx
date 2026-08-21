import { useEffect, useState } from 'react';
import { FaCalendarAlt, FaClock, FaCheckCircle, FaUserClock } from 'react-icons/fa';
import InfoTooltip from './common/InfoTooltip';

const AttendanceManager = () => {
    const [activeTab, setActiveTab] = useState('logs');
    const [attendanceLogs, setAttendanceLogs] = useState([]);

    const fetchData = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/attendance', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.success) setAttendanceLogs(data.attendance || []);
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
                    <FaCalendarAlt className="text-blue-600" /> Employee Attendance & Shift Schedule Hub
                    <InfoTooltip 
                        title="কর্মীদের ডিজিটাল হাজিরা ও ওভারটাইম ঘণ্টা" 
                        content="বায়োমেট্রিক বা অনলাইন উপস্থিতি লগ, শিফট টাইম টেবিল এবং ছুটির আবেদন রেকর্ড।" 
                        formula="Present Ratio = (Present Employees / Total Staff) × 100%"
                    />
                </h2>
            </div>

            <div style={tabNav}>
                <button onClick={() => setActiveTab('logs')} style={activeTab === 'logs' ? activeTabBtn : tabBtn}>Attendance Logs ({attendanceLogs.length})</button>
                <button onClick={() => setActiveTab('sheets')} style={activeTab === 'sheets' ? activeTabBtn : tabBtn}>Attendance Sheets & Permissions</button>
                <button onClick={() => setActiveTab('leaves')} style={activeTab === 'leaves' ? activeTabBtn : tabBtn}>Leave Applications</button>
                <button onClick={() => setActiveTab('shifts')} style={activeTab === 'shifts' ? activeTabBtn : tabBtn}><FaClock className="mr-1 inline" /> Shifts Management</button>
            </div>

            {activeTab === 'logs' && (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table style={tableStyle}>
                        <thead style={tableHeaderStyle}>
                            <tr>
                                <th style={thStyle}>Date</th>
                                <th style={thStyle}>Employee</th>
                                <th style={thStyle}>In Time</th>
                                <th style={thStyle}>Out Time</th>
                                <th style={thStyle}>Overtime Hours</th>
                                <th style={thStyle}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendanceLogs.map(a => (
                                <tr key={a._id}>
                                    <td style={tdStyle}>{new Date(a.date).toLocaleDateString()}</td>
                                    <td style={tdStyle}>{a.employee?.name || 'Staff Member'}</td>
                                    <td style={tdStyle}>{a.clockIn || '08:00 AM'}</td>
                                    <td style={tdStyle}>{a.clockOut || '05:00 PM'}</td>
                                    <td style={tdStyle}><strong className="text-amber-600">{a.overtimeHours || 0} Hrs</strong></td>
                                    <td style={tdStyle}>
                                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold">PRESENT</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'sheets' && (
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
                    Monthly Attendance Performance Timesheets & Late Permission Penalties Active.
                </div>
            )}

            {activeTab === 'leaves' && (
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
                    Leave Balance Tracker: Annual Paid Leave (21 Days), Sick Leave (30 Days), Emergency Leave.
                </div>
            )}

            {activeTab === 'shifts' && (
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
                    Shift Timings: Morning Shift (08:00 AM - 04:00 PM), Evening Shift (04:00 PM - 12:00 AM).
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

export default AttendanceManager;
