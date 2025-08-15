import { useNavigate } from 'react-router-dom';
import AddCustomer from '../components/AddCustomer';

const Customers = () => {
    const navigate = useNavigate();

    const handleAdded = () => {
        navigate('/customer-list');
    }

    return (
        <div>
            <AddCustomer onAdded={handleAdded} />
        </div>
    );
};

export default Customers;
