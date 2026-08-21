require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/category'));
app.use('/api/products', require('./routes/product'));
app.use('/api/customers', require('./routes/customer'));
app.use('/api/client-groups', require('./routes/clientGroup'));
app.use('/api/warehouses', require('./routes/warehouse'));
app.use('/api/price-lists', require('./routes/priceList'));
app.use('/api/pos-shifts', require('./routes/posShift'));
app.use('/api/installments', require('./routes/installment'));
app.use('/api/suppliers', require('./routes/supplier'));
app.use('/api/purchase-orders', require('./routes/purchaseOrder'));
app.use('/api/invoices', require('./routes/invoice'));
app.use('/api/purchases', require('./routes/purchase'));
app.use('/api/accounts', require('./routes/account'));
app.use('/api/journal-vouchers', require('./routes/journalVoucher'));
app.use('/api/cheques', require('./routes/cheque'));
app.use('/api/employees', require('./routes/employee'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/payroll', require('./routes/payroll'));
app.use('/api/boms', require('./routes/bom'));
app.use('/api/work-centers', require('./routes/workCenter'));
app.use('/api/manufacturing-orders', require('./routes/manufacturingOrder'));
app.use('/api/projects', require('./routes/project'));
app.use('/api/tasks', require('./routes/task'));
app.use('/api/rental-meters', require('./routes/rentalMeter'));
app.use('/api/stock', require('./routes/stock'));
app.use('/api/tax', require('./routes/tax'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/reports', require('./routes/reporting'));
app.use('/api/merchants', require('./routes/merchant'));
app.use('/api/cashflow', require('./routes/cashflow'));
app.use('/api/cash-register', require('./routes/cashRegister'));
app.use('/api/returns', require('./routes/salesReturn'));

// Simple base route
app.get('/', (req, res) => {
  res.send('Moto POS Cloud API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.message);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
