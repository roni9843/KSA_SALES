const express = require('express');
const router = express.Router();
const Payslip = require('../models/Payslip');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const { protect } = require('../middleware/auth');

// @route   GET /api/payroll
// @desc    Get all monthly payslips
router.get('/', protect, async (req, res) => {
  try {
    const payslips = await Payslip.find()
      .populate('employee', 'name employeeCode bankDetails department')
      .sort({ createdAt: -1 });

    res.json({ success: true, payslips });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/payroll/run
// @desc    Run Monthly Payroll & Generate Payslips for all active employees
router.post('/run', protect, async (req, res) => {
  try {
    const { month } = req.body; // e.g. '2026-08'
    const employees = await Employee.find({ status: 'ACTIVE' });
    const generatedPayslips = [];

    for (const emp of employees) {
      // Calculate Total Overtime Hours in the month
      const attendanceLogs = await Attendance.find({ employee: emp._id });
      const totalOtHours = attendanceLogs.reduce((sum, a) => sum + (a.overtimeHours || 0), 0);

      // Overtime Pay Formula: OT Hours * (Basic / 208) * 1.5
      const hourlyRate = emp.basicSalary / 208;
      const overtimePay = Math.round(totalOtHours * hourlyRate * 1.5);

      const totalAllowances = (emp.allowances?.hra || 0) + (emp.allowances?.transport || 0) + (emp.allowances?.other || 0);
      const grossSalary = emp.basicSalary + totalAllowances + overtimePay;

      const unpaidLeaveDeduction = 0;
      const loanEmiDeduction = 0;

      const netSalary = Math.round(grossSalary - unpaidLeaveDeduction - loanEmiDeduction);
      const payslipNo = 'PAY-' + month.replace('-', '') + '-' + emp.employeeCode;

      const payslip = await Payslip.create({
        payslipNo,
        employee: emp._id,
        month,
        basicSalary: emp.basicSalary,
        totalAllowances,
        overtimePay,
        unpaidLeaveDeduction,
        loanEmiDeduction,
        netSalary,
        paymentStatus: 'UNPAID'
      });

      generatedPayslips.push(payslip);
    }

    res.status(201).json({ success: true, count: generatedPayslips.length, payslips: generatedPayslips });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/payroll/wps-export
// @desc    Export Saudi Arabia Wage Protection System (WPS) Bank CSV file
router.get('/wps-export', protect, async (req, res) => {
  try {
    const payslips = await Payslip.find().populate('employee');

    let csvContent = 'EmployeeCode,EmployeeName,BankName,IBAN,BasicSalary,Allowances,Overtime,NetSalary\n';

    payslips.forEach(p => {
      const emp = p.employee;
      csvContent += `${emp.employeeCode},"${emp.name}",${emp.bankDetails?.bankName || 'NCB'},${emp.bankDetails?.iban || 'SA0000000000000000000000'},${p.basicSalary},${p.totalAllowances},${p.overtimePay},${p.netSalary}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="SAUDI_WPS_PAYROLL.csv"');
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
