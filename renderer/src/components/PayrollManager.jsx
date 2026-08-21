import { useEffect, useState } from 'react';
import { FaUserTie, FaMoneyBillWave, FaFileCsv, FaCalculator, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import InfoTooltip from './common/InfoTooltip';

const PayrollManager = () => {
    const [payslips, setPayslips] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [month, setMonth] = useState('2026-08');

    const fetchData = async () => {
        try {
            const payRes = await fetch('http://localhost:5000/api/payroll', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const payData = await payRes.json();
            if (payData.success) setPayslips(payData.payslips || []);

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

    const handleRunPayroll = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/payroll/run', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ month })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Monthly Payroll executed for ${data.count} employees!`);
                fetchData();
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleExportWPS = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/payroll/export-wps?month=${month}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const text = await res.text();
            
            const blob = new Blob([text], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Saudi_WPS_Payroll_${month}.csv`;
            a.click();
            toast.success('Saudi Arabia WPS Bank CSV File Exported!');
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div style={cardStyle}>
            <div style={headerStyle}>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <FaMoneyBillWave className="text-blue-600" /> HR Monthly Payroll & Saudi WPS Bank Exporter
                    <InfoTooltip 
                        title="সৌদি শ্রমনীতি ওভারটাইম ও WPS পে-রোল হিসাব" 
                        content="সৌদি আরবের শ্রমনীতি (Saudi Labor Law Article 107) অনুসারে ওভারটাইমের মূল্য ঘণ্টাপ্রতি বেসিক বেতনের ১.৫ গুণ ধরে গণনা করা হয় এবং মাস শেষে ব্যাংক স্থানান্তরের জন্য استاندارد WPS (Wage Protection System) CSV ফাইল তৈরি করা হয়।" 
                        formula="OT Pay = OT Hours × (Basic Salary / 208) × 1.5"
                    />
                </h2>
            </div>

            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                <div className="flex items-center gap-3">
                    <label className="text-xs font-extrabold text-slate-700">Select Payroll Month:</label>
                    <input type="month" value={month} onChange={e => setMonth(e.target.value)} style={{ ...inputStyle, width: '180px' }} />
                    <button onClick={handleRunPayroll} style={addBtnStyle}>▶ Execute Monthly Payroll Run</button>
                </div>

                <button onClick={handleExportWPS} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20">
                    <FaFileCsv className="text-sm" /> Export Saudi WPS Bank CSV
                </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table style={tableStyle}>
                    <thead style={tableHeaderStyle}>
                        <tr>
                            <th style={thStyle}>Payslip No</th>
                            <th style={thStyle}>Employee Name</th>
                            <th style={thStyle}>Basic Salary</th>
                            <th style={thStyle}>Allowances (HRA+Trans)</th>
                            <th style={thStyle}>Overtime Pay</th>
                            <th style={thStyle}>Net Salary</th>
                            <th style={thStyle}>WPS Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payslips.map(p => (
                            <tr key={p._id}>
                                <td style={tdStyle}><strong>{p.payslipNo}</strong></td>
                                <td style={tdStyle}>{p.employee?.name || '-'}</td>
                                <td style={tdStyle}>{p.basicSalary} SAR</td>
                                <td style={tdStyle}>{p.totalAllowances} SAR</td>
                                <td style={tdStyle}><span className="text-amber-700 font-bold">{p.overtimePay} SAR</span></td>
                                <td style={tdStyle}><strong className="text-emerald-600 text-sm">{p.netSalary} SAR</strong></td>
                                <td style={tdStyle}>
                                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-extrabold text-[10px]">WPS EXPORTED</span>
                                </td>
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

export default PayrollManager;
