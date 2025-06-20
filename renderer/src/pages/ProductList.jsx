import React, { useEffect, useState } from 'react';

function ProductList() {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const loadProducts = async () => {
        try {
            const result = await window.electron.ipcRenderer.invoke('get-products');
            setProducts(result);
        } catch (err) {
            console.error('Error loading products:', err);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ marginTop: '30px' }}>
            <h2>Product List</h2>
            <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ marginBottom: '10px' }}
            />
            <table border="1" cellPadding="6" width="100%">
                <thead>
                    <tr>
                        <th>SKU</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Purchase</th>
                        <th>Sale</th>
                        <th>Stock</th>
                        <th>Unit</th>
                        <th>Created</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.map(product => (
                        <tr key={product.id}>
                            <td>{product.sku}</td>
                            <td>{product.name}</td>
                            <td>{product.category_name}</td>
                            <td>{product.purchase_price}</td>
                            <td>{product.sale_price}</td>
                            <td>{product.quantity_in_stock}</td>
                            <td>{product.unit}</td>
                            <td>{product.created_at}</td>
                        </tr>
                    ))}
                    {filtered.length === 0 && (
                        <tr>
                            <td colSpan="8">No products found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default ProductList;
