import { useNavigate } from 'react-router-dom';
import AddSupplier from '../components/AddSupplier';

const Suppliers = () => {
    const navigate = useNavigate();

    const handleAdded = () => {
        navigate('/supplier-list');
    }

    return (
        <div>
            <AddSupplier onAdded={handleAdded} />
        </div>
    );
};

export default Suppliers;
