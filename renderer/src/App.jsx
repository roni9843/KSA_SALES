import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Layout from './components/Layout';
import Toast from './components/common/Toast';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import AddCategory from './pages/AddCategory';
import CreateInvoice from './pages/CreateInvoice';
import InvoicePrint from './pages/InvoicePrint';
import InvoiceList from './pages/InvoiceList';
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/*" element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/category" element={<AddCategory />} />
                  <Route path="/products" element={<ProductPage />} />
                  <Route path="/product-list" element={<ProductListPage />} />
                  <Route path="/create-invoice" element={<CreateInvoice />} />
                  <Route path="/invoice/:id" element={<InvoicePrint />} />
                  <Route path="/quotation" element={<QuotationPrint />} />
                  <Route path="/invoices" element={<InvoiceList />} />
                  <Route path="/collect-due" element={<CollectDue />} />
                  <Route path="/due-receipt/:invoiceId" element={<DueCollectionReceipt />} />
                  <Route path="/payment-history" element={<PaymentHistory />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/customer-list" element={<CustomerListPage />} />
                  <Route path="/suppliers" element={<Suppliers />} />
                  <Route path="/supplier-list" element={<SupplierListPage />} />
                  <Route path="/reporting" element={<Reporting />} />
                  <Route path="/tax-rates" element={<TaxRates />} />
                  <Route path="/my-company" element={<MyCompany />} />
                  <Route path="/product-purchase" element={<ProductPurchase />} />
                  <Route path="/purchase-list" element={<PurchaseList />} />
                  <Route path="/manage-roles" element={<RoleManagement />} />
                  <Route path="/manage-users" element={<UserManagement />} />
                  <Route path="/general-setting" element={<GeneralSetting />} />
                  <Route path="*" element={<p>404 Not Found</p>} />
                </Routes>
              </Layout>
            } />
          </Route>
        </Routes>
        <Toast />
      </Router>
    </AuthProvider>
  );
}

export default App;
