import React, { useState } from 'react';
import AddTaxRate from '../components/AddTaxRate';
import TaxList from '../components/TaxList';

const TaxRates = () => {
    const [refresh, setRefresh] = useState(false);

    const handleAdded = () => {
        setRefresh(!refresh);
    }

    return (
        <div>
            <AddTaxRate onAdded={handleAdded} />
            <TaxList refresh={refresh} />
        </div>
    );
};

export default TaxRates;
