import AddCategory from './components/AddCategory';
import AddProduct from './components/AddProduct';

function App() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Moto POS</h1>
      <AddCategory />
      <AddProduct />
    </div>
  );
}

export default App;
