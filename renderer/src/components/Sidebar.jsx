import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();

    const menuItems = [
        { path: '/', label: '🏠 Home' },
        { path: '/category', label: '📁 Category' },
        { path: '/product', label: '📦 Products' },
        { path: '/create-invoice', label: '🧾 Invoice' },
        { path: '/invoices', label: '📋 Invoices' }
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
