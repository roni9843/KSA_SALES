import React, { useState } from 'react';
import AddSupplier from '../components/AddSupplier';
import SupplierList from '../components/SupplierList';

const Suppliers = () => {
    const [refresh, setRefresh] = useState(false);

    const handleAdded = () => {
        setRefresh(!refresh);
    }

    return (
        <div>
            <AddSupplier onAdded={handleAdded} />
            <SupplierList refresh={refresh} />
        </div>
    );
};

export default Suppliers;
