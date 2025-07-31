import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaFolder, FaBox, FaFileInvoice, FaClipboardList, FaUsers, FaTruck, FaChartBar, FaMoneyBillAlt, FaBuilding, FaShoppingCart } from 'react-icons/fa';

const Sidebar = () => {
    const location = useLocation();

    const menuItems = [
        { path: '/', label: 'Home', icon: <FaHome /> },
        { path: '/category', label: 'Category', icon: <FaFolder /> },
        { path: '/products', label: 'Products', icon: <FaBox /> },
        { path: '/create-invoice', label: 'Invoice', icon: <FaFileInvoice /> },
        { path: '/invoices', label: 'Invoices', icon: <FaClipboardList /> },
        { path: '/customers', label: 'Customers', icon: <FaUsers /> },
        { path: '/suppliers', label: 'Suppliers', icon: <FaTruck /> },
        { path: '/reporting', label: 'Reporting', icon: <FaChartBar /> },
        { path: '/tax-rates', label: 'Tax Rates', icon: <FaMoneyBillAlt /> },
        { path: '/my-company', label: 'My Company', icon: <FaBuilding /> },
        { path: '/product-purchase', label: 'Product Purchase', icon: <FaShoppingCart /> },
        { path: '/purchase-list', label: 'Purchase List', icon: <FaClipboardList /> }
    ];

    return (
        <div style={{ padding: '20px', color: '#fff' }}>
            {menuItems.map(item => (
                <Link
                    key={item.path}
                    to={item.path}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        margin: '10px 0',
                        color: location.pathname === item.path ? '#1abc9c' : '#ecf0f1',
                        textDecoration: 'none',
                        fontWeight: location.pathname === item.path ? 'bold' : 'normal'
                    }}
                >
                    <span style={{ marginRight: '10px' }}>{item.icon}</span>
                    {item.label}
                </Link>
            ))}
        </div>
    );
};

export default Sidebar;
