import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AddCategory from './components/AddCategory';
import AddProduct from './components/AddProduct';
import ProductList from './components/ProductList';
import CreateInvoice from './components/CreateInvoice';
import InvoicePrint from './pages/InvoicePrint';


function App() {
  const { t, i18n } = useTranslation();


  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <Router>
      <div style={{ padding: '20px' }}>
        <h1>{t('title')}</h1>

        {/* 🌐 Language switcher */}
        <select onChange={(e) => changeLanguage(e.target.value)} defaultValue={i18n.language}>
          <option value="en">English</option>
          <option value="bn">বাংলা</option>
          <option value="ar">العربية</option>
        </select>

        <Routes>
          <Route path="/" element={
            <>
              <AddCategory />
              <AddProduct />
              <ProductList />
              <CreateInvoice />
            </>
          } />
          <Route path="/invoice/:id" element={<InvoicePrint />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
