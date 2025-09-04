import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    FaHome, FaFolder, FaBox, FaFileInvoice, FaUsers, FaTruck,
    FaChartBar, FaMoneyBillAlt, FaBuilding, FaShoppingCart,
    FaChevronDown, FaChevronRight, FaSignOutAlt, FaUser
} from 'react-icons/fa';

import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [openMenu, setOpenMenu] = useState(null);
    const { user, logout } = useAuth();

    const handleMenuClick = (label) => {
        setOpenMenu(openMenu === label ? null : label);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    let menuItems = [
        // { path: '/', label: 'Home', icon: <FaHome />, permission: 'page:view:home' },
        { path: '/', label: 'Dashboard', icon: <FaHome />, permission: 'page:view:dashboard' },
        { path: '/category', label: 'Category', icon: <FaFolder />, permission: 'page:view:category' },
        {
            label: 'Products',
            icon: <FaBox />,
            permission: 'page:view:products',
            subItems: [
                { path: '/products', label: 'Add Product' },
                { path: '/product-list', label: 'Product List' },
            ]
        },
        {
            label: 'Invoice',
            icon: <FaFileInvoice />,
            permission: 'page:view:invoice',
            subItems: [
                { path: '/create-invoice', label: 'Invoice Create' },
                { path: '/invoices', label: 'Invoice List' },
                { path: '/collect-due', label: 'Collect Due' },
                { path: '/payment-history', label: 'Payment History' },
            ]
        },
        {
            label: 'Customers',
            icon: <FaUsers />,
            permission: 'page:view:customers',
            subItems: [
                { path: '/customers', label: 'Add Customer' },
                { path: '/customer-list', label: 'Customer List' },
            ]
        },
        {
            label: 'Suppliers',
            icon: <FaTruck />,
            permission: 'page:view:suppliers',
            subItems: [
                { path: '/suppliers', label: 'Add Supplier' },
                { path: '/supplier-list', label: 'Supplier List' },
            ]
        },
                {
            label: 'Reporting',
            icon: <FaChartBar />,
            permission: 'page:view:reporting',
            subItems: [
                { path: '/product-sales-report', label: 'Product wise sales' },
                { path: '/product-transaction', label: 'Product Transaction' },
            ]
        },
        { path: '/tax-rates', label: 'Tax Rates', icon: <FaMoneyBillAlt />, permission: 'page:view:tax-rates' },
        // { path: '/my-company', label: 'My Company', icon: <FaBuilding />, permission: 'page:view:my-company' },
        {
            label: 'Purchase',
            icon: <FaShoppingCart />,
            permission: 'page:view:purchase',
            subItems: [
                { path: '/product-purchase', label: 'Purchase Product' },
                { path: '/purchase-list', label: 'Purchase List' },
            ]
        },
        {
            label: 'Stock',
            icon: <FaBox />,
            permission: 'page:view:stock',
            subItems: [
                { path: '/stock-adjust', label: 'Stock Adjust' },
                { path: '/stock-adjustment-list', label: 'Adjustment List' },
            ]
        }
    ];

    // Add settings menu for users with permission
    if (user && (user.permissions.includes('*') || user.permissions.includes('manage:users'))) {
        menuItems.push({
            label: 'Settings',
            icon: <FaBuilding />,
            permission: 'manage:users',
            subItems: [
                { path: '/manage-roles', label: 'Role Management' },
                { path: '/manage-users', label: 'User Management' },
                { path: '/general-setting', label: 'General Setting' },
                { path: '/database-backup', label: 'Database Backup' },
                { path: '/licensing', label: 'Licensing' },
            ]
        });
    }

    const filteredMenuItems = menuItems.filter(item =>
        user && (user.permissions.includes('*') || user.permissions.includes(item.permission))
    );


    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', color: '#fff' }}>
            <div style={{ overflowY: 'auto', flexGrow: 1, padding: '0 20px' }}>
                {filteredMenuItems.map(item => {
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
                                        maxHeight: isOpen ? '200px' : '0',
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
            {user && (
                <div style={{ padding: '20px', borderTop: '1px solid #4a4a4a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                            <FaUser style={{ marginRight: '10px' }} />
                            {user.username}
                        </span>
                        <button onClick={handleLogout} title="Logout" style={{ background: 'none', border: 'none', color: '#ecf0f1', cursor: 'pointer', fontSize: '20px' }}>
                            <FaSignOutAlt />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sidebar;
