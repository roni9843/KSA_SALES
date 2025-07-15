import React, { useState } from 'react';
import AddCustomer from '../components/AddCustomer';
import CustomerList from '../components/CustomerList';

const Customers = () => {
    const [refresh, setRefresh] = useState(false);

    const handleAdded = () => {
        setRefresh(!refresh);
    }

    return (
        <div>
            <AddCustomer onAdded={handleAdded} />
            <CustomerList refresh={refresh} />
        </div>
    );
};

export default Customers;
