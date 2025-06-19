import { useTranslation } from 'react-i18next';
import AddCategory from './components/AddCategory';
import AddProduct from './components/AddProduct';
import ProductList from './components/ProductList';

function App() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>{t('title')}</h1>

      {/* 🌐 Language switcher */}
      <select onChange={(e) => changeLanguage(e.target.value)} defaultValue={i18n.language}>
        <option value="en">English</option>
        <option value="bn">বাংলা</option>
        <option value="ar">العربية</option>
      </select>

      <AddCategory />
      <AddProduct />
      <ProductList />
    </div>
  );
}

export default App;
