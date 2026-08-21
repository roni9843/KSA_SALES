import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Layout from './components/Layout';
import Toast from './components/common/Toast';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AddCategory from './pages/AddCategory';
import CreateInvoice from './pages/CreateInvoice';
import DraftInvoices from './pages/DraftInvoices';
import InvoicePrint from './pages/InvoicePrint';
import InvoiceList from './pages/InvoiceList';
import SalesReturn from './pages/SalesReturn';
import ReturnSlipPrint from './pages/ReturnSlipPrint';
import ProductPage from './pages/ProductPage';
import ProductListPage from './pages/ProductListPage';
import Customers from './pages/Customers';
import CustomerListPage from './pages/CustomerListPage';
import Suppliers from './pages/Suppliers';
import SupplierListPage from './pages/SupplierListPage';
import Reporting from './pages/Reporting';
import TaxRates from './pages/TaxRates';
import MyCompany from './pages/MyCompany';
import ProductPurchase from './pages/ProductPurchase';
import PurchaseList from './components/PurchaseList';
import QuotationPrint from './pages/QuotationPrint';
import RoleManagement from './pages/RoleManagement';
import UserManagement from './pages/UserManagement';
import CollectDue from './pages/CollectDue';
import DueCollectionReceipt from './pages/DueCollectionReceipt';
import PaymentHistory from './pages/PaymentHistory';
import Dashboard from './pages/Dashboard';
import GeneralSetting from './pages/GeneralSetting';
import ProductSalesReport from './pages/ProductSalesReport';
import ProductTransaction from './pages/ProductTransaction';
import CashFlow from './pages/CashFlow';
import StockAdjust from './pages/StockAdjust';
import StockAdjustmentList from './pages/StockAdjustmentList';
import DatabaseBackup from './pages/DatabaseBackup';

// Newly Integrated Enterprise ERP Core Modules
import WarehouseManager from './components/WarehouseManager';
import PurchaseOrderManager from './components/PurchaseOrderManager';
import ChartOfAccountsManager from './components/ChartOfAccountsManager';
import EmployeeManager from './components/EmployeeManager';
import PayrollManager from './components/PayrollManager';
import ManufacturingManager from './components/ManufacturingManager';
import TaskManager from './components/TaskManager';
import SettingsManager from './components/SettingsManager';

import MerchantRegister from './pages/MerchantRegister';
import MerchantManagement from './pages/MerchantManagement';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register-merchant" element={<MerchantRegister />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/category" element={<AddCategory />} />
                <Route path="/products" element={<ProductPage />} />
                <Route path="/product-list" element={<ProductListPage />} />
                <Route path="/warehouses" element={<WarehouseManager />} />
                <Route path="/create-invoice" element={<CreateInvoice />} />
                <Route path="/draft-invoices" element={<DraftInvoices />} />
                <Route path="/invoice/:id" element={<InvoicePrint />} />
                <Route path="/quotation" element={<QuotationPrint />} />
                <Route path="/invoices" element={<InvoiceList />} />
                <Route path="/sales-return" element={<SalesReturn />} />
                <Route path="/return-slip/:id" element={<ReturnSlipPrint />} />
                <Route path="/collect-due" element={<CollectDue />} />
                <Route path="/due-receipt/:invoiceId" element={<DueCollectionReceipt />} />
                <Route path="/payment-history" element={<PaymentHistory />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/customer-list" element={<CustomerListPage />} />
                <Route path="/suppliers" element={<Suppliers />} />
                <Route path="/supplier-list" element={<SupplierListPage />} />
                <Route path="/purchase-orders" element={<PurchaseOrderManager />} />
                <Route path="/accounting" element={<ChartOfAccountsManager />} />
                <Route path="/employees" element={<EmployeeManager />} />
                <Route path="/payroll" element={<PayrollManager />} />
                <Route path="/manufacturing" element={<ManufacturingManager />} />
                <Route path="/tasks-operations" element={<TaskManager />} />
                <Route path="/system-settings" element={<SettingsManager />} />
                <Route path="/reporting" element={<Reporting />} />
                <Route path="/product-sales-report" element={<ProductSalesReport />} />
                <Route path="/product-transaction" element={<ProductTransaction />} />
                <Route path="/cash-flow" element={<CashFlow />} />
                <Route path="/tax-rates" element={<TaxRates />} />
                <Route path="/my-company" element={<MyCompany />} />
                <Route path="/product-purchase" element={<ProductPurchase />} />
                <Route path="/purchase-list" element={<PurchaseList />} />
                <Route path="/manage-roles" element={<RoleManagement />} />
                <Route path="/manage-users" element={<UserManagement />} />
                <Route path="/manage-merchants" element={<MerchantManagement />} />
                <Route path="/general-setting" element={<GeneralSetting />} />
                <Route path="/stock-adjust" element={<StockAdjust />} />
                <Route path="/stock-adjustment-list" element={<StockAdjustmentList />} />
                <Route path="/database-backup" element={<DatabaseBackup />} />
                <Route path="*" element={<p>404 Not Found</p>} />
              </Routes>
            </Layout>
          } />
        </Route>
      </Routes>
      <Toast />
    </Router>
  );
}

export default App;