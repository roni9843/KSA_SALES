import { useEffect, useState } from 'react';

const ProductList = ({ refresh }) => {
    const [list, setList] = useState([]);

    const fetch = async () => {
        const products = await window.electron.ipcRenderer.invoke('get-products');
        setList(products);
    };

    const deleteProduct = async (id) => {
        if (confirm('Delete this product?')) {
            await window.electron.ipcRenderer.invoke('delete-product', id);
            fetch();
        }
    };

    useEffect(() => {
        fetch();
    }, [refresh]);

    return (
        <div style={cardStyle}>
            <h3>📦 Product List</h3>
            <table style={tableStyle}>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>SKU</th>
                        <th>Category</th>
                        <th>Purchase</th>
                        <th>Sale</th>
                        <th>Stock</th>
                        <th>Unit</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {list.map(p => (
                        <tr key={p.id}>
                            <td>{p.name}</td>
                            <td>{p.sku}</td>
                            <td>{p.category_name}</td>
                            <td>{p.purchase_price}</td>
                            <td>{p.sale_price}</td>
                            <td>{p.quantity_in_stock}</td>
                            <td>{p.unit}</td>
                            <td>
                                <button onClick={() => deleteProduct(p.id)}>🗑</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const cardStyle = {
    background: '#2c3e50',
    padding: '15px',
    borderRadius: '10px',
    color: '#fff',
    marginTop: '20px'
};

const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '10px',
    backgroundColor: '#34495e',
    color: '#fff'
};

export default ProductList;
