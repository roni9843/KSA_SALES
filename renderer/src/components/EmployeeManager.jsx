import { useEffect, useState } from 'react';
import { FaUserTie, FaIdCard, FaExclamationTriangle, FaPlus, FaMoneyBillWave, FaEye, FaEdit, FaTrash, FaTimes, FaSave } from 'react-icons/fa';
import toast from 'react-hot-toast';

const EmployeeManager = () => {
    const [employees, setEmployees] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [activeTab, setActiveTab] = useState('list'); // 'list' | 'add'

    // Selected Employee for View & Edit
    const [selectedEmp, setSelectedEmp] = useState(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    // Edit Form State
    const [editForm, setEditForm] = useState({});

    // Registration Form State
    const [empForm, setEmpForm] = useState({
        name: '',
        email: '',
        phone: '',
        department: 'Sales',
        designation: 'Executive',
        basicSalary: 4000,
        hra: 1000,
        transport: 500,
        bankName: 'Al Rajhi Bank',
        iban: 'SA0000000000000000000000',
        iqamaExpiryDate: ''
    });

    const fetchData = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/employees', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.success) setEmployees(data.employees || []);

            const alertRes = await fetch('http://localhost:5000/api/employees/document-alerts', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const alertData = await alertRes.json();
            if (alertData.success) setAlerts(alertData.expiringEmployees || []);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateEmployee = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/employees', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    name: empForm.name,
                    email: empForm.email,
                    phone: empForm.phone,
                    department: empForm.department,
                    designation: empForm.designation,
                    basicSalary: parseFloat(empForm.basicSalary) || 0,
                    allowances: {
                        hra: parseFloat(empForm.hra) || 0,
                        transport: parseFloat(empForm.transport) || 0
                    },
                    bankDetails: {
                        bankName: empForm.bankName,
                        iban: empForm.iban
                    },
                    iqamaExpiryDate: empForm.iqamaExpiryDate || null
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Employee Profile registered!');
                setEmpForm({
                    name: '', email: '', phone: '', department: 'Sales', designation: 'Executive',
                    basicSalary: 4000, hra: 1000, transport: 500, bankName: 'Al Rajhi Bank', iban: 'SA0000000000000000000000', iqamaExpiryDate: ''
                });
                fetchData();
                setActiveTab('list');
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleOpenEdit = (emp) => {
        setSelectedEmp(emp);
        setEditForm({
            name: emp.name || '',
            email: emp.email || '',
            phone: emp.phone || '',
            department: emp.department || '',
            designation: emp.designation || '',
            basicSalary: emp.basicSalary || 0,
            hra: emp.allowances?.hra || 0,
            transport: emp.allowances?.transport || 0,
            bankName: emp.bankDetails?.bankName || '',
            iban: emp.bankDetails?.iban || '',
            iqamaExpiryDate: emp.iqamaExpiryDate ? new Date(emp.iqamaExpiryDate).toISOString().split('T')[0] : ''
        });
        setIsEditOpen(true);
    };

    const handleUpdateEmployee = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:5000/api/employees/${selectedEmp._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    name: editForm.name,
                    email: editForm.email,
                    phone: editForm.phone,
                    department: editForm.department,
                    designation: editForm.designation,
                    basicSalary: parseFloat(editForm.basicSalary) || 0,
                    allowances: {
                        hra: parseFloat(editForm.hra) || 0,
                        transport: parseFloat(editForm.transport) || 0
                    },
                    bankDetails: {
                        bankName: editForm.bankName,
                        iban: editForm.iban
                    },
                    iqamaExpiryDate: editForm.iqamaExpiryDate || null
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Employee Profile updated successfully!');
                setIsEditOpen(false);
                fetchData();
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleDeleteEmployee = async (empId) => {
        if (!window.confirm('Are you sure you want to delete this employee profile?')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/employees/${empId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Employee Profile deleted.');
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
                    <FaUserTie className="text-blue-600" /> Employee Directory & Document Expiry
                </h2>
            </div>

            {/* Document Expiry Warnings */}
            {alerts.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl mb-4 flex items-center gap-3 text-xs text-amber-800 font-bold">
                    <FaExclamationTriangle className="text-lg text-amber-600" />
                    <div>
                        <span>Attention: {alerts.length} Employee Iqama / Passport expiring in the next 30 days!</span>
                    </div>
                </div>
            )}

            {/* Tab Navigation */}
            <div style={tabNav}>
                <button onClick={() => setActiveTab('list')} style={activeTab === 'list' ? activeTabBtn : tabBtn}>Employee Directory ({employees.length})</button>
                <button onClick={() => setActiveTab('add')} style={activeTab === 'add' ? activeTabBtn : tabBtn}>+ Add New Employee Profile</button>
            </div>

            {/* TAB 1: LIST */}
            {activeTab === 'list' && (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table style={tableStyle}>
                        <thead style={tableHeaderStyle}>
                            <tr>
                                <th style={thStyle}>EMP Code</th>
                                <th style={thStyle}>Name</th>
                                <th style={thStyle}>Department & Title</th>
                                <th style={thStyle}>Basic Salary</th>
                                <th style={thStyle}>Iqama Expiry Date</th>
                                <th style={thStyle}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map(emp => (
                                <tr key={emp._id}>
                                    <td style={tdStyle}><strong>{emp.employeeCode}</strong></td>
                                    <td style={tdStyle}>
                                        <div className="font-bold text-slate-900">{emp.name}</div>
                                        <div className="text-[11px] text-slate-500">{emp.email || emp.phone}</div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div className="font-semibold text-slate-800">{emp.department}</div>
                                        <div className="text-[11px] text-slate-500">{emp.designation}</div>
                                    </td>
                                    <td style={tdStyle}><strong>{emp.basicSalary} SAR</strong></td>
                                    <td style={tdStyle}>
                                        {emp.iqamaExpiryDate ? (
                                            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                                                {new Date(emp.iqamaExpiryDate).toLocaleDateString()}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-slate-400">N/A</span>
                                        )}
                                    </td>
                                    <td style={tdStyle}>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => { setSelectedEmp(emp); setIsViewOpen(true); }} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100" title="View Details">
                                                <FaEye />
                                            </button>
                                            <button onClick={() => handleOpenEdit(emp)} className="p-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100" title="Edit Profile">
                                                <FaEdit />
                                            </button>
                                            <button onClick={() => handleDeleteEmployee(emp._id)} className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100" title="Delete Profile">
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* TAB 2: ADD EMPLOYEE */}
            {activeTab === 'add' && (
                <form onSubmit={handleCreateEmployee} className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <input placeholder="Full Name" value={empForm.name} onChange={e => setEmpForm({ ...empForm, name: e.target.value })} required style={inputStyle} />
                    <input placeholder="Email Address" type="email" value={empForm.email} onChange={e => setEmpForm({ ...empForm, email: e.target.value })} style={inputStyle} />
                    <input placeholder="Phone (+966...)" value={empForm.phone} onChange={e => setEmpForm({ ...empForm, phone: e.target.value })} required style={inputStyle} />
                    <input placeholder="Department" value={empForm.department} onChange={e => setEmpForm({ ...empForm, department: e.target.value })} style={inputStyle} />
                    <input placeholder="Designation / Title" value={empForm.designation} onChange={e => setEmpForm({ ...empForm, designation: e.target.value })} style={inputStyle} />
                    <input type="number" placeholder="Basic Salary (SAR)" value={empForm.basicSalary} onChange={e => setEmpForm({ ...empForm, basicSalary: e.target.value })} required style={inputStyle} />
                    <input placeholder="Bank Name (e.g. Al Rajhi)" value={empForm.bankName} onChange={e => setEmpForm({ ...empForm, bankName: e.target.value })} style={inputStyle} />
                    <input placeholder="IBAN (e.g. SA00...)" value={empForm.iban} onChange={e => setEmpForm({ ...empForm, iban: e.target.value })} style={inputStyle} />
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 block">Iqama Expiry Date</label>
                        <input type="date" value={empForm.iqamaExpiryDate} onChange={e => setEmpForm({ ...empForm, iqamaExpiryDate: e.target.value })} style={inputStyle} />
                    </div>
                    <button type="submit" style={addBtnStyle} className="col-span-3 py-2.5">+ Register Employee Profile</button>
                </form>
            )}

            {/* MODAL 1: VIEW DETAILS */}
            {isViewOpen && selectedEmp && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 relative">
                        <button onClick={() => setIsViewOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><FaTimes /></button>
                        
                        <div className="flex items-center gap-3 border-b pb-3 border-slate-100">
                            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-extrabold flex items-center justify-center text-lg">
                                {selectedEmp.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-extrabold text-slate-900 text-base">{selectedEmp.name}</h3>
                                <p className="text-xs text-blue-600 font-bold">{selectedEmp.employeeCode} • {selectedEmp.department}</p>
                            </div>
                        </div>

                        <div className="space-y-2 text-xs text-slate-700">
                            <div className="flex justify-between py-1 border-b border-slate-50">
                                <span className="text-slate-500">Designation:</span>
                                <span className="font-bold">{selectedEmp.designation || 'Staff'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-50">
                                <span className="text-slate-500">Phone:</span>
                                <span className="font-bold">{selectedEmp.phone || '-'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-50">
                                <span className="text-slate-500">Email:</span>
                                <span className="font-bold">{selectedEmp.email || '-'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-50">
                                <span className="text-slate-500">Basic Salary:</span>
                                <span className="font-bold text-emerald-600">{selectedEmp.basicSalary} SAR</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-50">
                                <span className="text-slate-500">Bank Name & IBAN:</span>
                                <span className="font-mono text-[11px] font-bold">{selectedEmp.bankDetails?.bankName} ({selectedEmp.bankDetails?.iban})</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-50">
                                <span className="text-slate-500">Iqama Expiry Date:</span>
                                <span className="font-bold text-amber-700">{selectedEmp.iqamaExpiryDate ? new Date(selectedEmp.iqamaExpiryDate).toLocaleDateString() : 'N/A'}</span>
                            </div>
                        </div>

                        <button onClick={() => setIsViewOpen(false)} className="w-full py-2 bg-slate-100 font-bold text-xs text-slate-700 rounded-lg">Close Details</button>
                    </div>
                </div>
            )}

            {/* MODAL 2: EDIT EMPLOYEE */}
            {isEditOpen && selectedEmp && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 relative">
                        <button onClick={() => setIsEditOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><FaTimes /></button>
                        
                        <h3 className="font-extrabold text-slate-900 text-base border-b pb-2">Edit Employee Profile ({selectedEmp.employeeCode})</h3>

                        <form onSubmit={handleUpdateEmployee} className="grid grid-cols-2 gap-3 text-xs">
                            <div className="col-span-2">
                                <label className="block text-[10px] font-extrabold mb-1">Full Name</label>
                                <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} required style={inputStyle} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-extrabold mb-1">Phone</label>
                                <input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} required style={inputStyle} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-extrabold mb-1">Email</label>
                                <input value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} style={inputStyle} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-extrabold mb-1">Department</label>
                                <input value={editForm.department} onChange={e => setEditForm({ ...editForm, department: e.target.value })} style={inputStyle} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-extrabold mb-1">Designation</label>
                                <input value={editForm.designation} onChange={e => setEditForm({ ...editForm, designation: e.target.value })} style={inputStyle} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-extrabold mb-1">Basic Salary (SAR)</label>
                                <input type="number" value={editForm.basicSalary} onChange={e => setEditForm({ ...editForm, basicSalary: e.target.value })} required style={inputStyle} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-extrabold mb-1">Iqama Expiry Date</label>
                                <input type="date" value={editForm.iqamaExpiryDate} onChange={e => setEditForm({ ...editForm, iqamaExpiryDate: e.target.value })} style={inputStyle} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-extrabold mb-1">Bank Name</label>
                                <input value={editForm.bankName} onChange={e => setEditForm({ ...editForm, bankName: e.target.value })} style={inputStyle} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-extrabold mb-1">IBAN Account</label>
                                <input value={editForm.iban} onChange={e => setEditForm({ ...editForm, iban: e.target.value })} style={inputStyle} />
                            </div>

                            <button type="submit" style={addBtnStyle} className="col-span-2 py-2.5 mt-2 flex items-center justify-center gap-2">
                                <FaSave /> Save Updated Employee Profile
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const cardStyle = { background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' };
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

export default EmployeeManager;
