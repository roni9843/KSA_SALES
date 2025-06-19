import AddCategory from './components/AddCategory';
import AddProduct from './components/AddProduct';
import ProductList from './components/ProductList';

function App() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Moto POS</h1>
      <AddCategory />
      <AddProduct />
      <ProductList />
    </div>
  );
}

export default App;
