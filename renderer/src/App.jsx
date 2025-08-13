import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Layout from './components/Layout';
import Toast from './components/common/Toast';

import Home from './pages/Home';
import AddCategory from './pages/AddCategory';
import CreateInvoice from './pages/CreateInvoice';
import InvoicePrint from './pages/InvoicePrint';
import InvoiceList from './pages/InvoiceList';
import ProductPage from './pages/ProductPage';
import Customers from './pages/Customers';
import Suppliers from './pages/Suppliers';
import Reporting from './pages/Reporting';
import TaxRates from './pages/TaxRates';
import MyCompany from './pages/MyCompany';
import ProductPurchase from './pages/ProductPurchase';
import PurchaseList from './components/PurchaseList';
import QuotationPrint from './pages/QuotationPrint';


function App() {

  return (
    <Router>
      <Layout>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category" element={<AddCategory />} />
          <Route path="/products" element={<ProductPage />} />
          <Route path="/create-invoice" element={<CreateInvoice />} />
          <Route path="/invoice/:id" element={<InvoicePrint />} />
          <Route path="/quotation" element={<QuotationPrint />} />
          <Route path="/invoices" element={<InvoiceList />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/reporting" element={<Reporting />} />
          <Route path="/tax-rates" element={<TaxRates />} />
          <Route path="/my-company" element={<MyCompany />} />
          <Route path="/product-purchase" element={<ProductPurchase />} />
          <Route path="/purchase-list" element={<PurchaseList />} />
          <Route path="*" element={<p>404 Not Found</p>} />
        </Routes>
      </Layout>
      <Toast />
    </Router>
  );
}

export default App;
