import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    FaHome, FaFolder, FaBox, FaFileInvoice, FaUsers, FaTruck,
    FaChartBar, FaPercent, FaCog, FaShoppingCart, FaBoxes,
    FaChevronDown, FaChevronRight, FaSignOutAlt, FaUserCheck, FaStore, FaShieldAlt, FaMoneyBillWave, FaWarehouse, FaBook, FaUserTie, FaIndustry, FaTasks, FaCode, FaClipboardList, FaSitemap, FaCalendarAlt
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

    const userPermissions = user?.permissions || [];

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
            title: 'MANUFACTURING & ASSEMBLY',
            items: [
                { path: '/manufacturing', label: 'BOM Recipes & Work Orders', icon: <FaIndustry />, permission: 'page:view:products' }
            ]
        },
        {
            title: 'PROJECTS & OPERATIONS',
            items: [
                { path: '/tasks-operations', label: 'Kanban Tasks & Meter Billing', icon: <FaTasks />, permission: 'page:view:dashboard' }
            ]
        },
        {
            title: 'FINANCE & TREASURIES',
            items: [
                {
                    label: 'Finance & Treasuries',
                    icon: <FaMoneyBillWave />,
                    permission: 'page:view:reporting',
                    subItems: [
                        { path: '/finance', label: 'Expenses & Incomes' },
                        { path: '/finance', label: 'Treasuries & Bank Accounts' },
                        { path: '/finance', label: 'Employee Custody' }
                    ]
                }
            ]
        },
        {
            title: 'ACCOUNTING & JOURNAL',
            items: [
                {
                    label: 'Double-Entry Accounting',
                    icon: <FaBook />,
                    permission: 'page:view:reporting',
                    subItems: [
                        { path: '/accounting', label: 'Chart of Accounts & Cheques' },
                        { path: '/accounting', label: 'Journal Entries & Postings' },
                        { path: '/cash-flow', label: 'Cash Flow & Register' }
                    ]
                }
            ]
        },
        {
            title: 'REQUESTS & REQUISITIONS',
            items: [
                { path: '/requests', label: 'Manage Requests & Approvals', icon: <FaClipboardList />, permission: 'page:view:dashboard' }
            ]
        },
        {
            title: 'HUMAN RESOURCES & STRUCTURE',
            items: [
                {
                    label: 'HR & Directory',
                    icon: <FaUserTie />,
                    permission: 'page:view:dashboard',
                    subItems: [
                        { path: '/employees', label: 'Employee Directory & Expiry' },
                        { path: '/payroll', label: 'Payroll Run & WPS Export' }
                    ]
                },
                { path: '/org-structure', label: 'Organizational Structure', icon: <FaSitemap />, permission: 'page:view:dashboard' },
                { path: '/attendance', label: 'Attendance & Leaves', icon: <FaCalendarAlt />, permission: 'page:view:dashboard' }
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
                        { path: '/reporting', label: 'Sales & Tax Summary' },
                        { path: '/product-sales-report', label: 'Product Sales Analysis' },
                        { path: '/product-transaction', label: 'Product Activity Register' },
                    ]
                }
            ]
        },
        {
            title: 'ADMINISTRATION & API',
            items: [
                { path: '/system-settings', label: 'System Sequences & Tax', icon: <FaCog />, permission: 'manage:users' },
                { path: '/developer-api', label: 'Developer API & Webhooks', icon: <FaCode />, permission: 'manage:users' },
                { path: '/manage-merchants', label: 'SaaS Store Control', icon: <FaStore />, permission: 'manage:users' },
                { path: '/manage-users', label: 'Staff Users & Roles', icon: <FaUserCheck />, permission: 'manage:users' },
                { path: '/general-setting', label: 'General Receipt Settings', icon: <FaCog />, permission: 'manage:users' },
                { path: '/database-backup', label: 'Database Backup & Restore', icon: <FaCog />, permission: 'manage:users' }
            ]
        }
    ];

    return (
        <div className="flex flex-col h-full bg-white border-r border-slate-200 text-slate-700 font-['Plus_Jakarta_Sans',sans-serif] select-none">
            <div className="p-3 pb-1 border-b border-slate-100">
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="truncate">SaaS Cloud POS Connected</span>
                </div>
            </div>

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
                                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                                                            isParentActive 
                                                                ? 'bg-blue-50 text-blue-700' 
                                                                : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2.5">
                                                            <span className="text-sm text-slate-500">{item.icon}</span>
                                                            <span>{item.label}</span>
                                                        </div>
                                                        <span className="text-[10px] text-slate-400">
                                                            {isOpen ? <FaChevronDown /> : <FaChevronRight />}
                                                        </span>
                                                    </button>

                                                    {isOpen && (
                                                        <div className="ml-5 pl-2 border-l-2 border-slate-100 mt-1 space-y-1">
                                                            {item.subItems.map(subItem => {
                                                                const isSubActive = location.pathname === subItem.path;
                                                                return (
                                                                    <Link
                                                                        key={subItem.path + subItem.label}
                                                                        to={subItem.path}
                                                                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                                                            isSubActive
                                                                                ? 'bg-blue-600 text-white font-bold shadow-sm'
                                                                                : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
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
                                                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                                                        isSelfActive
                                                            ? 'bg-blue-600 text-white shadow-sm'
                                                            : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                                                    }`}
                                                >
                                                    <span className={`text-sm ${isSelfActive ? 'text-white' : 'text-slate-500'}`}>{item.icon}</span>
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

            {user && (
                <div className="p-3 border-t border-slate-100 bg-slate-50/50 m-2 rounded-2xl">
                    {user.merchant && (
                        <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-200/60">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <div className="h-6 w-6 rounded-md bg-blue-100 flex items-center justify-center text-blue-600 text-xs shrink-0 font-bold">
                                    <FaStore />
                                </div>
                                <div className="text-xs font-extrabold text-slate-800 truncate">
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
                            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                                <FaUserCheck />
                            </div>
                            <div className="truncate">
                                <div className="text-xs font-extrabold text-slate-800 truncate">{user.username}</div>
                                <div className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                                    <FaShieldAlt className="text-[9px]" /> Staff Member
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
