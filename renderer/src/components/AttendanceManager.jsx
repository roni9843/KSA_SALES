import { useEffect, useState } from 'react';
import { FaCalendarAlt, FaClock, FaCheckCircle, FaUserClock, FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';
import InfoTooltip from './common/InfoTooltip';

const AttendanceManager = () => {
    const [activeTab, setActiveTab] = useState('logs');
    const [attendanceLogs, setAttendanceLogs] = useState([]);
    const [employees, setEmployees] = useState([]);

    // Check-In Form
    const [form, setForm] = useState({
        employeeId: '',
        status: 'PRESENT',
        source: 'MANUAL',
        overtimeHours: 0
    });

    const fetchData = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/attendance', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.success) setAttendanceLogs(data.logs || data.attendance || []);

            const empRes = await fetch('http://localhost:5000/api/employees', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const empData = await empRes.json();
            if (empData.success) setEmployees(empData.employees || []);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCheckIn = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/attendance/check-in', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Attendance Check-In recorded successfully!');
                setForm({ employeeId: '', status: 'PRESENT', source: 'MANUAL', overtimeHours: 0 });
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
                <button onClick={() => setActiveTab('checkin')} style={activeTab === 'checkin' ? activeTabBtn : tabBtn}>+ Record Attendance Check-In</button>
                <button onClick={() => setActiveTab('sheets')} style={activeTab === 'sheets' ? activeTabBtn : tabBtn}>Attendance Sheets & Permissions</button>
                <button onClick={() => setActiveTab('leaves')} style={activeTab === 'leaves' ? activeTabBtn : tabBtn}>Leave Applications</button>
                <button onClick={() => setActiveTab('shifts')} style={activeTab === 'shifts' ? activeTabBtn : tabBtn}><FaClock className="mr-1 inline" /> Shifts Management</button>
            </div>

            {/* TAB 1: LOGS */}
            {activeTab === 'logs' && (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table style={tableStyle}>
                        <thead style={tableHeaderStyle}>
                            <tr>
                                <th style={thStyle}>Date</th>
                                <th style={thStyle}>Employee</th>
                                <th style={thStyle}>Source</th>
                                <th style={thStyle}>Overtime Hours</th>
                                <th style={thStyle}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendanceLogs.map(a => (
                                <tr key={a._id}>
                                    <td style={tdStyle}>{new Date(a.date).toLocaleDateString()}</td>
                                    <td style={tdStyle}><strong>{a.employee?.name || 'Staff Member'}</strong> ({a.employee?.employeeCode || 'EMP'})</td>
                                    <td style={tdStyle}><span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">{a.source || 'MANUAL'}</span></td>
                                    <td style={tdStyle}><strong className="text-amber-600">{a.overtimeHours || 0} Hrs</strong></td>
                                    <td style={tdStyle}>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${a.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                            {a.status || 'PRESENT'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* TAB 2: CHECK-IN FORM */}
            {activeTab === 'checkin' && (
                <form onSubmit={handleCheckIn} className="space-y-4 max-w-lg bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <div>
                        <label className="block text-xs font-extrabold mb-1">Select Employee</label>
                        <select required value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} style={inputStyle}>
                            <option value="">-- Choose Employee --</option>
                            {employees.map(e => <option key={e._id} value={e._id}>{e.name} ({e.employeeCode}) - {e.department}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-extrabold mb-1">Attendance Status</label>
                            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={inputStyle}>
                                <option value="PRESENT">PRESENT (উপস্থিত)</option>
                                <option value="LATE">LATE (বিলম্ব)</option>
                                <option value="ABSENT">ABSENT (অনুপস্থিত)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-extrabold mb-1">Check-In Source</label>
                            <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} style={inputStyle}>
                                <option value="MANUAL">MANUAL Admin Entry</option>
                                <option value="BIOMETRIC">BIOMETRIC Fingerprint Scanner</option>
                                <option value="ESS_GPS">ESS Mobile App (GPS Location)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-extrabold mb-1">Overtime Hours Worked (OT)</label>
                        <input type="number" min="0" step="0.5" value={form.overtimeHours} onChange={e => setForm({ ...form, overtimeHours: e.target.value })} style={inputStyle} />
                    </div>

                    <button type="submit" style={addBtnStyle}>Submit Employee Attendance Check-In</button>
                </form>
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
const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '13px', outline: 'none' };
const addBtnStyle = { padding: '8px 14px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '800', fontSize: '13px', cursor: 'pointer' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const tableHeaderStyle = { backgroundColor: '#f8fafc', color: '#475569' };
const thStyle = { padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '700' };
const tdStyle = { padding: '10px 14px', borderBottom: '1px solid #e2e8f0', fontSize: '13px' };

export default AttendanceManager;
