import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    FaHome, FaFolder, FaBox, FaFileInvoice, FaUsers, FaTruck,
    FaChartBar, FaPercent, FaCog, FaShoppingCart, FaBoxes,
    FaChevronDown, FaChevronRight, FaSignOutAlt, FaUserCheck, FaStore, FaShieldAlt, FaMoneyBillWave, FaWarehouse, FaBook, FaUserTie
} from 'react-icons/fa';

import { useAuthStore } from '../store/authStore';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [openMenu, setOpenMenu] = useState(null);
    const { user, logout } = useAuthStore();

    const handleMenuClick = (label) => {
        setOpenMenu(openMenu === label ? null : label);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Organized Sectioned Menu Structure for Ultra-Professional POS
    const menuSections = [
        {
            title: 'MAIN MENU',
            items: [
                { path: '/', label: 'Dashboard', icon: <FaHome />, permission: 'page:view:dashboard' },
            ]
        },
        {
            title: 'INVENTORY & CATALOG',
            items: [
                { path: '/category', label: 'Categories', icon: <FaFolder />, permission: 'page:view:category' },
                {
                    label: 'Products',
                    icon: <FaBox />,
                    permission: 'page:view:products',
                    subItems: [
                        { path: '/products', label: 'Add Product' },
                        { path: '/product-list', label: 'Product Catalog' },
                    ]
                },
                { path: '/warehouses', label: 'Warehouses & Stock Transfers', icon: <FaWarehouse />, permission: 'page:view:products' },
                {
                    label: 'Stock Adjustments',
                    icon: <FaBoxes />,
                    permission: 'page:view:stock',
                    subItems: [
                        { path: '/stock-adjust', label: 'New Stock Adjust' },
                        { path: '/stock-adjustment-list', label: 'Adjustment History' },
                    ]
                }
            ]
        },
        {
            title: 'SALES & CUSTOMERS',
            items: [
                {
                    label: 'POS Sales Invoice',
                    icon: <FaFileInvoice />,
                    permission: 'page:view:invoice',
                    subItems: [
                        { path: '/create-invoice', label: '+ Create Invoice' },
                        { path: '/draft-invoices', label: 'Draft Invoices' },
                        { path: '/invoices', label: 'Invoice History' },
                        { path: '/sales-return', label: 'Sales Return & Refund' },
                        { path: '/collect-due', label: 'Collect Customer Due' },
                        { path: '/payment-history', label: 'Payment Logs' },
                    ]
                },
                {
                    label: 'Customers',
                    icon: <FaUsers />,
                    permission: 'page:view:customers',
                    subItems: [
                        { path: '/customers', label: 'Add Customer' },
                        { path: '/customer-list', label: 'Customer Directory' },
                    ]
                },
                { path: '/tax-rates', label: 'Tax Rates', icon: <FaPercent />, permission: 'page:view:tax-rates' },
            ]
        },
        {
            title: 'SUPPLIERS & PURCHASES',
            items: [
                {
                    label: 'Purchase Orders & Landed Cost',
                    icon: <FaShoppingCart />,
                    permission: 'page:view:purchase',
                    subItems: [
                        { path: '/purchase-orders', label: 'PO & Landed Cost Manager' },
                        { path: '/product-purchase', label: 'New Purchase' },
                        { path: '/purchase-list', label: 'Purchase History' },
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
                }
            ]
        },
        {
            title: 'FINANCIAL & ACCOUNTING',
            items: [
                { path: '/accounting', label: 'Chart of Accounts & Cheques', icon: <FaBook />, permission: 'page:view:reporting' },
                { path: '/cash-flow', label: 'Cash Flow & Register', icon: <FaMoneyBillWave />, permission: 'page:view:reporting' }
            ]
        },
        {
            title: 'HUMAN RESOURCES (HR)',
            items: [
                {
                    label: 'HR & Payroll Engine',
                    icon: <FaUserTie />,
                    permission: 'page:view:dashboard',
                    subItems: [
                        { path: '/employees', label: 'Employee Directory & Expiry' },
                        { path: '/payroll', label: 'Payroll Run & WPS Export' },
                    ]
                }
            ]
        },
        {
            title: 'REPORTS & ANALYTICS',
            items: [
                {
                    label: 'Reports',
                    icon: <FaChartBar />,
                    permission: 'page:view:reporting',
                    subItems: [
                        { path: '/product-sales-report', label: 'Product Sales Report' },
                        { path: '/product-transaction', label: 'Inventory Log' },
                    ]
                }
            ]
        }
    ];

    const userPermissions = user?.permissions || [];

    // Add Administration Settings Section
    if (user && (userPermissions.includes('*') || userPermissions.includes('manage:users'))) {
        menuSections.push({
            title: 'ADMINISTRATION',
            items: [
                {
                    label: 'Settings & Security',
                    icon: <FaCog />,
                    permission: 'manage:users',
                    subItems: [
                        { path: '/manage-merchants', label: 'Store SaaS Management' },
                        { path: '/manage-roles', label: 'Role & Permissions' },
                        { path: '/manage-users', label: 'Staff Users' },
                        { path: '/general-setting', label: 'General Setting' },
                        { path: '/database-backup', label: 'Database Backup' },
                    ]
                }
            ]
        });
    }

    return (
        <div className="flex flex-col h-full bg-white border-r border-slate-200 text-slate-700 font-['Plus_Jakarta_Sans',sans-serif] select-none">
            {/* Sidebar Search/Quick Status Header */}
            <div className="p-3 pb-1 border-b border-slate-100">
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="truncate">SaaS Cloud POS Connected</span>
                </div>
            </div>

            {/* Menu List */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
                {menuSections.map((section, idx) => {
                    const filteredItems = section.items.filter(item =>
                        !user || userPermissions.includes('*') || userPermissions.includes(item.permission)
                    );

                    if (filteredItems.length === 0) return null;

                    return (
                        <div key={idx} className="space-y-1">
                            <div className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                                {section.title}
                            </div>

                            <div className="space-y-1 mt-1">
                                {filteredItems.map(item => {
                                    const isParentActive = item.subItems && item.subItems.some(sub => sub.path === location.pathname);
                                    const isSelfActive = location.pathname === item.path;
                                    const isOpen = openMenu === item.label || isParentActive;

                                    return (
                                        <div key={item.label || item.path}>
                                            {item.subItems ? (
                                                <div>
                                                    <button
                                                        onClick={() => handleMenuClick(item.label)}
                                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group ${
                                                            isParentActive
                                                                ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-200/60'
                                                                : 'text-slate-700 hover:bg-slate-50 hover:text-blue-700'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2.5">
                                                            <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs transition-colors ${
                                                                isParentActive
                                                                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                                                                    : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600'
                                                            }`}>
                                                                {item.icon}
                                                            </div>
                                                            <span>{item.label}</span>
                                                        </div>
                                                        <span className="text-[10px] text-slate-400 group-hover:text-blue-600">
                                                            {isOpen ? <FaChevronDown /> : <FaChevronRight />}
                                                        </span>
                                                    </button>

                                                    {isOpen && (
                                                        <div className="ml-5 pl-3 border-l-2 border-blue-500/30 mt-1.5 space-y-1 py-0.5">
                                                            {item.subItems.map(subItem => {
                                                                const isSubActive = location.pathname === subItem.path;
                                                                return (
                                                                    <Link
                                                                        key={subItem.path}
                                                                        to={subItem.path}
                                                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                                                                            isSubActive
                                                                                ? 'bg-blue-600 text-white font-extrabold shadow-md shadow-blue-600/20'
                                                                                : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50/80'
                                                                        }`}
                                                                    >
                                                                        <span className={`h-1.5 w-1.5 rounded-full ${isSubActive ? 'bg-white' : 'bg-slate-300'}`}></span>
                                                                        {subItem.label}
                                                                    </Link>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <Link
                                                    to={item.path}
                                                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group ${
                                                        isSelfActive
                                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25'
                                                            : 'text-slate-700 hover:bg-slate-50 hover:text-blue-700'
                                                    }`}
                                                >
                                                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs transition-colors ${
                                                        isSelfActive
                                                            ? 'bg-white/20 text-white'
                                                            : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600'
                                                    }`}>
                                                        {item.icon}
                                                    </div>
                                                    <span>{item.label}</span>
                                                </Link>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Merchant User Footer Card */}
            {user && (
                <div className="p-3 border-t border-slate-200 bg-slate-50/80 m-2 rounded-2xl border">
                    {user.merchant && (
                        <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-200">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <div className="h-6 w-6 rounded-md bg-blue-100 flex items-center justify-center text-blue-700 text-xs shrink-0 font-bold">
                                    <FaStore />
                                </div>
                                <div className="text-xs font-extrabold text-slate-900 truncate">
                                    {user.merchant.shopName}
                                </div>
                            </div>
                            <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 font-extrabold text-[9px] uppercase">
                                Active
                            </span>
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm shadow-blue-500/20">
                                <FaUserCheck />
                            </div>
                            <div className="truncate">
                                <div className="text-xs font-extrabold text-slate-900 truncate">{user.username}</div>
                                <div className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                                    <FaShieldAlt className="text-[9px]" /> Staff Cashier
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            title="Sign Out"
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                            <FaSignOutAlt className="text-sm" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sidebar;
