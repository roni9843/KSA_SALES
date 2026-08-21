import { useEffect, useState } from 'react';
import { FaMoneyBillWave, FaDownload, FaPlayCircle, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const PayrollManager = () => {
    const [payslips, setPayslips] = useState([]);
    const [month, setMonth] = useState('2026-08');

    const fetchPayslips = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/payroll', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.success) setPayslips(data.payslips || []);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchPayslips();
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
                toast.success(`Generated ${data.count} Payslips for ${month}!`);
                fetchPayslips();
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleDownloadWps = () => {
        window.open('http://localhost:5000/api/payroll/wps-export', '_blank');
        toast.success('Downloading Saudi WPS Bank CSV File...');
    };

    return (
        <div style={cardStyle}>
            <div style={headerStyle} className="flex justify-between items-center">
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <FaMoneyBillWave className="text-blue-600" /> Monthly Payroll Engine & WPS Export
                </h2>
                <button onClick={handleDownloadWps} style={wpsBtnStyle}>
                    <FaDownload className="mr-1 inline text-xs" /> Export Saudi WPS Bank CSV
                </button>
            </div>

            <div className="flex gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 items-center">
                <div>
                    <label className="text-xs font-bold text-slate-600 block">Select Payroll Month</label>
                    <input type="month" value={month} onChange={e => setMonth(e.target.value)} style={inputStyle} />
                </div>
                <button onClick={handleRunPayroll} style={runBtnStyle} className="mt-4">
                    <FaPlayCircle className="mr-1 inline text-sm" /> Run Monthly Payroll Engine
                </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table style={tableStyle}>
                    <thead style={tableHeaderStyle}>
                        <tr>
                            <th style={thStyle}>Payslip No</th>
                            <th style={thStyle}>Employee</th>
                            <th style={thStyle}>Month</th>
                            <th style={thStyle}>Basic Salary</th>
                            <th style={thStyle}>Allowances</th>
                            <th style={thStyle}>Overtime Pay</th>
                            <th style={thStyle}>Net Pay</th>
                            <th style={thStyle}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payslips.length === 0 ? (
                            <tr><td colSpan="8" className="p-4 text-center text-xs text-slate-400">No Payslips generated yet. Select month and run payroll.</td></tr>
                        ) : (
                            payslips.map(p => (
                                <tr key={p._id}>
                                    <td style={tdStyle}><strong>{p.payslipNo}</strong></td>
                                    <td style={tdStyle}>{p.employee?.name || '-'}</td>
                                    <td style={tdStyle}>{p.month}</td>
                                    <td style={tdStyle}>{p.basicSalary} SAR</td>
                                    <td style={tdStyle}>{p.totalAllowances} SAR</td>
                                    <td style={tdStyle}>{p.overtimePay} SAR</td>
                                    <td style={tdStyle}><strong className="text-emerald-600 text-sm">{p.netSalary} SAR</strong></td>
                                    <td style={tdStyle}>
                                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">{p.paymentStatus}</span>
                                    </td>
                                </tr>
                            ))
                        )}
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
    width: '180px',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontSize: '13px',
    outline: 'none',
};

const runBtnStyle = {
    padding: '9px 16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontWeight: '800',
    fontSize: '13px',
    cursor: 'pointer'
};

const wpsBtnStyle = {
    padding: '8px 14px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#059669',
    color: '#ffffff',
    fontWeight: '800',
    fontSize: '12px',
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
