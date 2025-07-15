import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Layout from './components/Layout';

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


function App() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => i18n.changeLanguage(lng);

  return (
    <Router>
      <Layout>
        <div style={{ marginBottom: '10px' }}>
          <select onChange={(e) => changeLanguage(e.target.value)} defaultValue={i18n.language}>
            <option value="en">English</option>
            <option value="bn">বাংলা</option>
            <option value="ar">العربية</option>
          </select>
        </div>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category" element={<AddCategory />} />
          <Route path="/products" element={<ProductPage />} />
          <Route path="/create-invoice" element={<CreateInvoice />} />
          <Route path="/invoice/:id" element={<InvoicePrint />} />
          <Route path="/invoices" element={<InvoiceList />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/reporting" element={<Reporting />} />
          <Route path="/tax-rates" element={<TaxRates />} />
          <Route path="/my-company" element={<MyCompany />} />
          <Route path="*" element={<p>404 Not Found</p>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
