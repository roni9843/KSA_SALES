import { useNavigate } from 'react-router-dom';
import AddProduct from '../components/AddProduct';

const ProductPage = () => {
    const navigate = useNavigate();

    const handleAdded = () => {
        navigate('/product-list');
    }

    return (
        <div>
            <AddProduct onAdded={handleAdded} />
        </div>
    );
};

export default ProductPage;
