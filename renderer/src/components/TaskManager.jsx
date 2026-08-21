import { useEffect, useState } from 'react';
import { FaTasks, FaProjectDiagram, FaTachometerAlt, FaPlus, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import InfoTooltip from './common/InfoTooltip';

const TaskManager = () => {
    const [activeTab, setActiveTab] = useState('kanban'); // 'kanban' | 'projects' | 'meters'
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [meters, setMeters] = useState([]);
    const [customers, setCustomers] = useState([]);

    // Project Form
    const [projForm, setProjForm] = useState({ name: '', customer: '', budget: 5000, deadline: '' });

    // Task Form
    const [taskForm, setTaskForm] = useState({ title: '', project: '', priority: 'MEDIUM', dueDate: '' });

    // Meter Form
    const [meterForm, setMeterForm] = useState({ meterNo: '', tenant: '', previousReading: 0, currentReading: 0, ratePerUnit: 2.5 });

    const fetchData = async () => {
        try {
            const taskRes = await fetch('http://localhost:5000/api/tasks', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const taskData = await taskRes.json();
            if (taskData.success) setTasks(taskData.tasks || []);

            const projRes = await fetch('http://localhost:5000/api/projects', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const projData = await projRes.json();
            if (projData.success) setProjects(projData.projects || []);

            const mtrRes = await fetch('http://localhost:5000/api/rental-meters', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const mtrData = await mtrRes.json();
            if (mtrData.success) setMeters(mtrData.meters || []);

            const custRes = await fetch('http://localhost:5000/api/customers', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const custData = await custRes.json();
            if (custData.success) setCustomers(custData.customers || []);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(projForm)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Project created!');
                setProjForm({ name: '', customer: '', budget: 5000, deadline: '' });
                fetchData();
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(taskForm)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Task created for Kanban Board!');
                setTaskForm({ title: '', project: '', priority: 'MEDIUM', dueDate: '' });
                fetchData();
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleTaskStatusMove = async (id, status) => {
        try {
            const res = await fetch(`http://localhost:5000/api/tasks/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Task moved to ${status}`);
                fetchData();
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleCreateMeter = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/rental-meters', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(meterForm)
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Meter Reading Billed: ${data.meter?.billedAmount} SAR`);
                setMeterForm({ meterNo: '', tenant: '', previousReading: 0, currentReading: 0, ratePerUnit: 2.5 });
                fetchData();
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const columns = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

    return (
        <div style={cardStyle}>
            <div style={headerStyle}>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <FaTasks className="text-blue-600" /> Tasks, Projects & Meter Operations Hub
                    <InfoTooltip 
                        title="রেন্টাল মিটার ও কানবান টাস্ক হিসাব" 
                        content="দোকান/ফ্ল্যাট ভাড়ার বিদ্যুৎ বা পানির মিটার রিডিংয়ের ব্যবধানের ওপর নির্ধারিত দর গুণ করে বিল টাকার পরিমাণ তৈরি করা হয়। এবং কানবান বোর্ডে টাস্কের ধাপ সচল রাখা হয়।" 
                        formula="Billed Amount = (Current Reading - Previous Reading) × Rate Per Unit"
                    />
                </h2>
            </div>

            <div style={tabNav}>
                <button onClick={() => setActiveTab('kanban')} style={activeTab === 'kanban' ? activeTabBtn : tabBtn}>Task Kanban Board ({tasks.length})</button>
                <button onClick={() => setActiveTab('projects')} style={activeTab === 'projects' ? activeTabBtn : tabBtn}><FaProjectDiagram className="mr-1 inline text-xs" /> Projects ({projects.length})</button>
                <button onClick={() => setActiveTab('meters')} style={activeTab === 'meters' ? activeTabBtn : tabBtn}><FaTachometerAlt className="mr-1 inline text-xs" /> Rental Meter Billing ({meters.length})</button>
            </div>

            {/* TAB 1: KANBAN BOARD */}
            {activeTab === 'kanban' && (
                <div>
                    <form onSubmit={handleCreateTask} className="grid grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 mb-6">
                        <input placeholder="Task Title" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} required style={inputStyle} />
                        <select value={taskForm.project} onChange={e => setTaskForm({ ...taskForm, project: e.target.value })} style={inputStyle}>
                            <option value="">Select Project</option>
                            {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </select>
                        <select value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })} style={inputStyle}>
                            <option value="LOW">LOW</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="HIGH">HIGH</option>
                            <option value="URGENT">URGENT</option>
                        </select>
                        <button type="submit" style={addBtnStyle}>+ Add Task</button>
                    </form>

                    {/* KANBAN COLUMNS */}
                    <div className="grid grid-cols-4 gap-4">
                        {columns.map(col => (
                            <div key={col} className="bg-slate-50 p-3 rounded-xl border border-slate-200 min-h-[300px]">
                                <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider mb-3 flex justify-between items-center">
                                    <span>{col.replace('_', ' ')}</span>
                                    <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 text-[10px]">
                                        {tasks.filter(t => t.status === col).length}
                                    </span>
                                </h4>

                                <div className="space-y-2">
                                    {tasks.filter(t => t.status === col).map(t => (
                                        <div key={t._id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm space-y-2">
                                            <div className="flex justify-between items-start">
                                                <h5 className="font-bold text-xs text-slate-900">{t.title}</h5>
                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${t.priority === 'URGENT' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {t.priority}
                                                </span>
                                            </div>

                                            {/* Status Movement buttons */}
                                            <div className="flex gap-1 pt-1 border-t">
                                                {col !== 'TODO' && (
                                                    <button onClick={() => handleTaskStatusMove(t._id, columns[columns.indexOf(col) - 1])} className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">◀ Prev</button>
                                                )}
                                                {col !== 'DONE' && (
                                                    <button onClick={() => handleTaskStatusMove(t._id, columns[columns.indexOf(col) + 1])} className="text-[9px] px-1.5 py-0.5 bg-blue-600 text-white rounded">Next ▶</button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 2: PROJECTS */}
            {activeTab === 'projects' && (
                <div>
                    <form onSubmit={handleCreateProject} className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                        <input placeholder="Project Name" value={projForm.name} onChange={e => setProjForm({ ...projForm, name: e.target.value })} required style={inputStyle} />
                        <select value={projForm.customer} onChange={e => setProjForm({ ...projForm, customer: e.target.value })} style={inputStyle}>
                            <option value="">Select Customer</option>
                            {customers.map(c => <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>)}
                        </select>
                        <input type="number" placeholder="Budget (SAR)" value={projForm.budget} onChange={e => setProjForm({ ...projForm, budget: e.target.value })} style={inputStyle} />
                        <button type="submit" style={addBtnStyle}>+ Create Project</button>
                    </form>

                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table style={tableStyle}>
                            <thead style={tableHeaderStyle}>
                                <tr>
                                    <th style={thStyle}>Code</th>
                                    <th style={thStyle}>Project Name</th>
                                    <th style={thStyle}>Customer</th>
                                    <th style={thStyle}>Budget</th>
                                    <th style={thStyle}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.map(p => (
                                    <tr key={p._id}>
                                        <td style={tdStyle}><strong>{p.projectCode}</strong></td>
                                        <td style={tdStyle}>{p.name}</td>
                                        <td style={tdStyle}>{p.customer?.name || '-'}</td>
                                        <td style={tdStyle}><strong>{p.budget} SAR</strong></td>
                                        <td style={tdStyle}><span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">{p.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 3: RENTAL METER BILLING */}
            {activeTab === 'meters' && (
                <div>
                    <form onSubmit={handleCreateMeter} className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                        <input placeholder="Meter Serial No" value={meterForm.meterNo} onChange={e => setMeterForm({ ...meterForm, meterNo: e.target.value })} required style={inputStyle} />
                        <select value={meterForm.tenant} onChange={e => setMeterForm({ ...meterForm, tenant: e.target.value })} required style={inputStyle}>
                            <option value="">Select Tenant Customer</option>
                            {customers.map(c => <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>)}
                        </select>
                        <input type="number" placeholder="Previous Reading" value={meterForm.previousReading} onChange={e => setMeterForm({ ...meterForm, previousReading: e.target.value })} required style={inputStyle} />
                        <input type="number" placeholder="Current Reading" value={meterForm.currentReading} onChange={e => setMeterForm({ ...meterForm, currentReading: e.target.value })} required style={inputStyle} />
                        <input type="number" step="0.1" placeholder="Rate / Unit (SAR)" value={meterForm.ratePerUnit} onChange={e => setMeterForm({ ...meterForm, ratePerUnit: e.target.value })} required style={inputStyle} />
                        <button type="submit" style={addBtnStyle}>Calculate & Bill Meter</button>
                    </form>

                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table style={tableStyle}>
                            <thead style={tableHeaderStyle}>
                                <tr>
                                    <th style={thStyle}>Meter No</th>
                                    <th style={thStyle}>Tenant</th>
                                    <th style={thStyle}>Prev Reading</th>
                                    <th style={thStyle}>Curr Reading</th>
                                    <th style={thStyle}>Units Consumed</th>
                                    <th style={thStyle}>Billed Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {meters.map(m => (
                                    <tr key={m._id}>
                                        <td style={tdStyle}><strong>{m.meterNo}</strong></td>
                                        <td style={tdStyle}>{m.tenant?.name || '-'}</td>
                                        <td style={tdStyle}>{m.previousReading}</td>
                                        <td style={tdStyle}>{m.currentReading}</td>
                                        <td style={tdStyle}>{m.currentReading - m.previousReading} Units</td>
                                        <td style={tdStyle}><strong className="text-emerald-600">{m.billedAmount} SAR</strong></td>
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

export default TaskManager;
