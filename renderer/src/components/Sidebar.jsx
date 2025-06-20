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
        <div style={{
            width: '200px',
            background: '#2c3e50',
            height: '100vh',
            color: '#fff',
            padding: '20px',
            boxSizing: 'border-box',
            position: 'fixed',
            top: 0,
            left: 0
        }}>
            <h2 style={{ color: '#fff' }}>Moto POS</h2>
            <nav>
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
            </nav>
        </div>
    );
};

export default Sidebar;
