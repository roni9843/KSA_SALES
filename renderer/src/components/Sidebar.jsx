import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();

    const menuItems = [
        { path: '/', label: '🏠 Home' },
        { path: '/category', label: '📁 Category' },
        { path: '/products', label: '📦 Products' },
        { path: '/create-invoice', label: '🧾 Invoice' },
        { path: '/invoices', label: '📋 Invoices' },
        { path: '/customers', label: '👥 Customers' },
        { path: '/suppliers', label: '🚚 Suppliers' },
        { path: '/reporting', label: '📊 Reporting' },
        { path: '/tax-rates', label: '💰 Tax Rates' },
        { path: '/my-company', label: '🏢 My Company' }
    ];

    return (
        <div style={{ padding: '20px', color: '#fff' }}>
            {menuItems.map(item => (
                <Link
                    key={item.path}
                    to={item.path}
                    style={{
                        display: 'block',
                        margin: '10px 0',
                        color: location.pathname === item.path ? '#1abc9c' : '#ecf0f1',
                        textDecoration: 'none',
                        fontWeight: location.pathname === item.path ? 'bold' : 'normal'
                    }}
                >
                    {item.label}
                </Link>
            ))}
        </div>
    );
};



export default Sidebar;
