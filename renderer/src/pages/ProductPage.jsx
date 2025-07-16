import AddProduct from '../components/AddProduct';
import ProductList from '../components/ProductList';
import { useState } from 'react';

const ProductPage = () => {
    const [refresh, setRefresh] = useState(false);

    const refreshData = () => setRefresh(!refresh);

    return (
        <div style={{ padding: '20px' }}>
            <h2 style={{ color: '#333' }}>🛒 Product Management</h2>
            <AddProduct onAdded={refreshData} />
            <ProductList refresh={refresh} />
        </div>
    );
};

export default ProductPage;
