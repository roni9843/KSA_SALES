import { useEffect, useState } from 'react';
import { FaUserTie, FaIdCard, FaExclamationTriangle, FaPlus, FaMoneyBillWave } from 'react-icons/fa';
import toast from 'react-hot-toast';

const EmployeeManager = () => {
    const [employees, setEmployees] = useState([]);
    const [alerts, setAlerts] = useState([]);
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
                toast.success('Employee Profile created!');
                setEmpForm({
                    name: '', email: '', phone: '', department: 'Sales', designation: 'Executive',
                    basicSalary: 4000, hra: 1000, transport: 500, bankName: 'Al Rajhi Bank', iban: 'SA0000000000000000000000', iqamaExpiryDate: ''
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

            {/* Employee Form */}
            <form onSubmit={handleCreateEmployee} className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                <input placeholder="Full Name" value={empForm.name} onChange={e => setEmpForm({ ...empForm, name: e.target.value })} required style={inputStyle} />
                <input placeholder="Phone" value={empForm.phone} onChange={e => setEmpForm({ ...empForm, phone: e.target.value })} required style={inputStyle} />
                <input placeholder="Department" value={empForm.department} onChange={e => setEmpForm({ ...empForm, department: e.target.value })} style={inputStyle} />
                <input type="number" placeholder="Basic Salary (SAR)" value={empForm.basicSalary} onChange={e => setEmpForm({ ...empForm, basicSalary: e.target.value })} required style={inputStyle} />
                <input placeholder="Bank Name (e.g. Al Rajhi)" value={empForm.bankName} onChange={e => setEmpForm({ ...empForm, bankName: e.target.value })} style={inputStyle} />
                <input placeholder="IBAN (e.g. SA00...)" value={empForm.iban} onChange={e => setEmpForm({ ...empForm, iban: e.target.value })} style={inputStyle} />
                <div>
                    <label className="text-[10px] font-bold text-slate-500 block">Iqama Expiry Date</label>
                    <input type="date" value={empForm.iqamaExpiryDate} onChange={e => setEmpForm({ ...empForm, iqamaExpiryDate: e.target.value })} style={inputStyle} />
                </div>
                <button type="submit" style={addBtnStyle} className="col-span-2 self-end py-2.5">+ Register Employee</button>
            </form>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table style={tableStyle}>
                    <thead style={tableHeaderStyle}>
                        <tr>
                            <th style={thStyle}>EMP Code</th>
                            <th style={thStyle}>Name</th>
                            <th style={thStyle}>Department</th>
                            <th style={thStyle}>Basic Salary</th>
                            <th style={thStyle}>IBAN Bank Account</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map(emp => (
                            <tr key={emp._id}>
                                <td style={tdStyle}><strong>{emp.employeeCode}</strong></td>
                                <td style={tdStyle}>{emp.name}</td>
                                <td style={tdStyle}>{emp.department}</td>
                                <td style={tdStyle}><strong>{emp.basicSalary} SAR</strong></td>
                                <td style={tdStyle}><span className="text-xs font-mono">{emp.bankDetails?.iban || '-'}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
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

export default EmployeeManager;
