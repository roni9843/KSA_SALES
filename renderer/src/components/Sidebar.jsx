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
        {
            label: 'Products',
            icon: <FaBox />,
            subItems: [
                { path: '/products', label: 'Add Product' },
                { path: '/product-list', label: 'Product List' },
            ]
        },
        {
            label: 'Invoice',
            icon: <FaFileInvoice />,
            subItems: [
                { path: '/create-invoice', label: 'Invoice Create' },
                { path: '/invoices', label: 'Invoice List' },
            ]
        },
        {
            label: 'Customers',
            icon: <FaUsers />,
            subItems: [
                { path: '/customers', label: 'Add Customer' },
                { path: '/customer-list', label: 'Customer List' },
            ]
        },
        {
            label: 'Suppliers',
            icon: <FaTruck />,
            subItems: [
                { path: '/suppliers', label: 'Add Supplier' },
                { path: '/supplier-list', label: 'Supplier List' },
            ]
        },
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

                const linkStyle = {
                    display: 'flex',
                    alignItems: 'center',
                    textDecoration: 'none',
                    color: location.pathname === item.path ? '#1abc9c' : '#ecf0f1',
                    fontWeight: location.pathname === item.path ? 'bold' : 'normal'
                };

                const parentLinkStyle = {
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    color: isParentActive ? '#1abc9c' : '#ecf0f1',
                    fontWeight: isParentActive ? 'bold' : 'normal'
                };

                return (
                    <div key={item.label || item.path} style={{ margin: '20px 0' }}>
                        {item.subItems ? (
                            <>
                                <div onClick={() => handleMenuClick(item.label)} style={parentLinkStyle}>
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
                                    paddingLeft: '20px',
                                    marginTop: isOpen ? '10px' : '0'
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
                            </>
                        ) : (
                            <Link to={item.path} style={linkStyle}>
                                <span style={{ marginRight: '10px' }}>{item.icon}</span>
                                {item.label}
                            </Link>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default Sidebar;
