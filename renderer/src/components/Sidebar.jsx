import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    FaHome, FaFolder, FaBox, FaFileInvoice, FaClipboardList, FaUsers, FaTruck,
    FaChartBar, FaMoneyBillAlt, FaBuilding, FaShoppingCart,
    FaChevronDown, FaChevronRight
} from 'react-icons/fa';

const Sidebar = () => {
    const location = useLocation();
    const [openMenu, setOpenMenu] = useState(null);

    const handleMenuClick = (label) => {
        setOpenMenu(openMenu === label ? null : label);
    };

    const menuItems = [
        { path: '/', label: 'Home', icon: <FaHome /> },
        { path: '/category', label: 'Category', icon: <FaFolder /> },
        { path: '/products', label: 'Products', icon: <FaBox /> },
        {
            label: 'Invoice',
            icon: <FaFileInvoice />,
            subItems: [
                { path: '/create-invoice', label: 'Invoice Create' },
                { path: '/invoices', label: 'Invoice List' },
            ]
        },
        { path: '/customers', label: 'Customers', icon: <FaUsers /> },
        { path: '/suppliers', label: 'Suppliers', icon: <FaTruck /> },
        { path: '/reporting', label: 'Reporting', icon: <FaChartBar /> },
        { path: '/tax-rates', label: 'Tax Rates', icon: <FaMoneyBillAlt /> },
        { path: '/my-company', label: 'My Company', icon: <FaBuilding /> },
        {
            label: 'Purchase',
            icon: <FaShoppingCart />,
            subItems: [
                { path: '/product-purchase', label: 'Purchase Product' },
                { path: '/purchase-list', label: 'Purchase List' },
            ]
        }
    ];

    return (
        <div style={{ padding: '20px', color: '#fff' }}>
            {menuItems.map(item => {
                const isParentActive = item.subItems && item.subItems.some(sub => sub.path === location.pathname);
                const isOpen = openMenu === item.label;

                if (item.subItems) {
                    return (
                        <div key={item.label}>
                            <div
                                onClick={() => handleMenuClick(item.label)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    margin: '10px 0',
                                    cursor: 'pointer',
                                    color: isParentActive ? '#1abc9c' : '#ecf0f1',
                                    fontWeight: isParentActive ? 'bold' : 'normal'
                                }}
                            >
                                <span style={{ marginRight: '10px' }}>{item.icon}</span>
                                <span style={{ flexGrow: 1 }}>{item.label}</span>
                                <span style={{ marginLeft: 'auto' }}>
                                    {isOpen ? <FaChevronDown /> : <FaChevronRight />}
                                </span>
                            </div>
                            <div style={{
                                maxHeight: isOpen ? '100px' : '0',
                                overflow: 'hidden',
                                transition: 'max-height 0.3s ease-in-out',
                                paddingLeft: '20px'
                            }}>
                                {item.subItems.map(subItem => (
                                    <Link
                                        key={subItem.path}
                                        to={subItem.path}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            margin: '10px 0',
                                            color: location.pathname === subItem.path ? '#1abc9c' : '#ecf0f1',
                                            textDecoration: 'none',
                                            fontWeight: location.pathname === subItem.path ? 'bold' : 'normal'
                                        }}
                                    >
                                        {subItem.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    );
                } else {
                    return (
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
                    );
                }
            })}
        </div>
    );
};

export default Sidebar;
