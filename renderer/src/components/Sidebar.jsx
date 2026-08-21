import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    FaHome, FaFileInvoice, FaShoppingCart, FaIndustry, FaCalendarCheck,
    FaCreditCard, FaChartLine, FaBuilding, FaTools, FaPrint, FaUsers,
    FaCoins, FaIdCard, FaUserClock, FaBoxes, FaTruck, FaClock,
    FaMoneyBillWave, FaBook, FaClipboardList, FaUserTie, FaSitemap,
    FaCalendarAlt, FaFileInvoiceDollar, FaChartBar, FaFileAlt, FaCog,
    FaChevronDown, FaChevronRight, FaSignOutAlt, FaUserCheck, FaStore, FaShieldAlt
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

    // 27-Section Enterprise ERP Menu Hierarchy
    const menuSections = [
        {
            title: '1. DASHBOARD',
            items: [
                {
                    label: 'Dashboard',
                    icon: <FaHome />,
                    subItems: [
                        { path: '/', label: 'Sales Dashboard' },
                        { path: '/employees', label: 'Human Resources Dashboard' }
                    ]
                }
            ]
        },
        {
            title: '2. SALES',
            items: [
                {
                    label: 'Sales Invoicing & Estimates',
                    icon: <FaFileInvoice />,
                    subItems: [
                        { path: '/invoices', label: 'Manage Invoices' },
                        { path: '/create-invoice', label: '+ Create Invoice' },
                        { path: '/quotation', label: 'Manage Estimates' },
                        { path: '/quotation', label: '+ Create Estimate' },
                        { path: '/sales-return', label: 'Credit Notes & Refunds' },
                        { path: '/draft-invoices', label: 'Recurring & Draft Invoices' },
                        { path: '/collect-due', label: 'Client Payments' },
                        { path: '/tax-rates', label: 'Sales Settings' }
                    ]
                }
            ]
        },
        {
            title: '3. POS (POINT OF SALE)',
            items: [
                {
                    label: 'Point of Sale (POS)',
                    icon: <FaShoppingCart />,
                    subItems: [
                        { path: '/create-invoice', label: '⚡ Start Selling (POS Terminal)' },
                        { path: '/create-invoice', label: 'POS Sessions & Cash Shifts' },
                        { path: '/product-sales-report', label: 'POS Reports' },
                        { path: '/general-setting', label: 'POS Settings' }
                    ]
                }
            ]
        },
        {
            title: '4. MANUFACTURING',
            items: [
                {
                    label: 'Manufacturing & Assembly',
                    icon: <FaIndustry />,
                    subItems: [
                        { path: '/manufacturing', label: 'Bill of Materials (BOM)' },
                        { path: '/manufacturing', label: 'Production Plans & Orders' },
                        { path: '/manufacturing', label: 'Indirect Costs & Workstations' },
                        { path: '/manufacturing', label: 'Manufacturing Settings' }
                    ]
                }
            ]
        },
        {
            title: '5. BOOKINGS',
            items: [
                {
                    label: 'Bookings & Appointments',
                    icon: <FaCalendarCheck />,
                    subItems: [
                        { path: '/tasks-operations', label: 'Manage Bookings' },
                        { path: '/system-settings', label: 'Booking Settings' }
                    ]
                }
            ]
        },
        {
            title: '6. INSTALLMENTS MANAGEMENT',
            items: [
                {
                    label: 'Installment Agreements',
                    icon: <FaCreditCard />,
                    subItems: [
                        { path: '/create-invoice', label: 'Installment Agreements' },
                        { path: '/collect-due', label: 'Installments Due Log' }
                    ]
                }
            ]
        },
        {
            title: '7. SALES TARGET & COMMISSIONS',
            items: [
                {
                    label: 'Target & Commissions',
                    icon: <FaChartLine />,
                    subItems: [
                        { path: '/product-sales-report', label: 'Commission Rules' },
                        { path: '/product-sales-report', label: 'Sales Commissions & Periods' }
                    ]
                }
            ]
        },
        {
            title: '8. RENTAL AND UNIT MANAGEMENT',
            items: [
                {
                    label: 'Rental & Meters',
                    icon: <FaBuilding />,
                    subItems: [
                        { path: '/tasks-operations', label: 'Units & Reservation Orders' },
                        { path: '/tasks-operations', label: 'Rental Pricing & Lease Contracts' },
                        { path: '/tasks-operations', label: 'Rental Meter Readings' },
                        { path: '/system-settings', label: 'Rental Settings' }
                    ]
                }
            ]
        },
        {
            title: '9. WORK ORDERS',
            items: [
                {
                    label: 'Work Orders & Job Cards',
                    icon: <FaTools />,
                    subItems: [
                        { path: '/manufacturing', label: 'Manage Work Orders' },
                        { path: '/manufacturing', label: '+ Add Work Order' },
                        { path: '/system-settings', label: 'Work Order Settings' }
                    ]
                }
            ]
        },
        {
            title: '10. PRINTING ORDERS',
            items: [
                {
                    label: 'Printing Orders',
                    icon: <FaPrint />,
                    subItems: [
                        { path: '/invoice/1', label: 'Manage Printing Orders' },
                        { path: '/general-setting', label: 'Printing Templates' }
                    ]
                }
            ]
        },
        {
            title: '11. CLIENTS & CRM',
            items: [
                {
                    label: 'Clients & CRM Directory',
                    icon: <FaUsers />,
                    subItems: [
                        { path: '/customer-list', label: 'Manage Clients' },
                        { path: '/customers', label: '+ Add New Client' },
                        { path: '/customer-list', label: 'Appointments & Contacts List' },
                        { path: '/system-settings', label: 'Client Settings' }
                    ]
                }
            ]
        },
        {
            title: '12. POINTS & CREDITS',
            items: [
                {
                    label: 'Points & Credits',
                    icon: <FaCoins />,
                    subItems: [
                        { path: '/customer-list', label: 'Manage Credit Charges & Usages' },
                        { path: '/customer-list', label: 'Credit Packages & Types' }
                    ]
                }
            ]
        },
        {
            title: '13. MEMBERSHIPS',
            items: [
                {
                    label: 'Memberships & Subscriptions',
                    icon: <FaIdCard />,
                    subItems: [
                        { path: '/customer-list', label: 'Manage Memberships' },
                        { path: '/customer-list', label: 'Manage Subscriptions' }
                    ]
                }
            ]
        },
        {
            title: '14. CLIENTS ATTENDANCE',
            items: [
                {
                    label: 'Clients Attendance',
                    icon: <FaUserClock />,
                    subItems: [
                        { path: '/customer-list', label: 'Clients Attendance Logs' }
                    ]
                }
            ]
        },
        {
            title: '15. INVENTORY',
            items: [
                {
                    label: 'Inventory Catalog',
                    icon: <FaBoxes />,
                    subItems: [
                        { path: '/product-list', label: 'Products & Services' },
                        { path: '/products', label: '+ Add Product' },
                        { path: '/warehouses', label: 'Warehouses & Stock Transfers' },
                        { path: '/stock-adjust', label: 'Manage Stocktakings & Requisitions' },
                        { path: '/general-setting', label: 'Inventory Settings' }
                    ]
                }
            ]
        },
        {
            title: '16. PURCHASES',
            items: [
                {
                    label: 'Purchases & Suppliers',
                    icon: <FaTruck />,
                    subItems: [
                        { path: '/purchase-orders', label: 'Purchase Orders & Landed Cost' },
                        { path: '/product-purchase', label: '+ New Purchase Invoice' },
                        { path: '/purchase-list', label: 'Purchase History & Requests' },
                        { path: '/supplier-list', label: 'Manage Suppliers & Payments' }
                    ]
                }
            ]
        },
        {
            title: '17. TIME TRACKING',
            items: [
                {
                    label: 'Time Tracking',
                    icon: <FaClock />,
                    subItems: [
                        { path: '/tasks-operations', label: 'Time Tracking & Logs' },
                        { path: '/create-invoice', label: 'Generate Time Invoice' }
                    ]
                }
            ]
        },
        {
            title: '18. FINANCE',
            items: [
                {
                    label: 'Finance & Treasuries',
                    icon: <FaMoneyBillWave />,
                    subItems: [
                        { path: '/cash-flow', label: 'Expenses & Incomes' },
                        { path: '/cash-flow', label: 'Treasuries & Bank Accounts' },
                        { path: '/accounting', label: 'Employee Custody' }
                    ]
                }
            ]
        },
        {
            title: '19. ACCOUNTING',
            items: [
                {
                    label: 'Double-Entry Accounting',
                    icon: <FaBook />,
                    subItems: [
                        { path: '/accounting', label: 'Chart of Accounts (COA)' },
                        { path: '/accounting', label: 'Journal Entries & Postings' },
                        { path: '/accounting', label: 'Cheques & Assets Ledger' }
                    ]
                }
            ]
        },
        {
            title: '20. REQUESTS',
            items: [
                {
                    label: 'Manage Requests',
                    icon: <FaClipboardList />,
                    subItems: [
                        { path: '/tasks-operations', label: 'Manage Requests & Types' }
                    ]
                }
            ]
        },
        {
            title: '21. EMPLOYEES',
            items: [
                {
                    label: 'Employee Management',
                    icon: <FaUserTie />,
                    subItems: [
                        { path: '/employees', label: 'Manage Employees' },
                        { path: '/employees', label: 'Employee Roles & Assets' }
                    ]
                }
            ]
        },
        {
            title: '22. ORGANIZATIONAL STRUCTURE',
            items: [
                {
                    label: 'Organization Chart',
                    icon: <FaSitemap />,
                    subItems: [
                        { path: '/employees', label: 'Manage Designations & Departments' },
                        { path: '/employees', label: 'Organizational Chart' }
                    ]
                }
            ]
        },
        {
            title: '23. ATTENDANCE',
            items: [
                {
                    label: 'Attendance & Leaves',
                    icon: <FaCalendarAlt />,
                    subItems: [
                        { path: '/employees', label: 'Attendance Logs & Sheets' },
                        { path: '/employees', label: 'Leave Applications & Shift Schedule' }
                    ]
                }
            ]
        },
        {
            title: '24. PAYROLL',
            items: [
                {
                    label: 'HR Payroll Engine',
                    icon: <FaFileInvoiceDollar />,
                    subItems: [
                        { path: '/payroll', label: 'Pay Runs & Monthly Payslips' },
                        { path: '/payroll', label: 'Saudi WPS Bank CSV Exporter' }
                    ]
                }
            ]
        },
        {
            title: '25. REPORTS',
            items: [
                {
                    label: 'Reports & Analytics',
                    icon: <FaChartBar />,
                    subItems: [
                        { path: '/reporting', label: 'Sales & Purchase Reports' },
                        { path: '/reporting', label: 'Accounting & Financial Reports' },
                        { path: '/product-sales-report', label: 'Manufacturing & Stock Reports' },
                        { path: '/product-transaction', label: 'System Activity & Audit Log' }
                    ]
                }
            ]
        },
        {
            title: '26. TEMPLATES',
            items: [
                {
                    label: 'Templates & Reminders',
                    icon: <FaFileAlt />,
                    subItems: [
                        { path: '/general-setting', label: 'Printable & Prefilled Templates' },
                        { path: '/system-settings', label: 'Terms & Auto Reminder Rules' }
                    ]
                }
            ]
        },
        {
            title: '27. SETTINGS',
            items: [
                {
                    label: 'Administration Settings',
                    icon: <FaCog />,
                    subItems: [
                        { path: '/system-settings', label: 'System Sequences & Tax Settings' },
                        { path: '/developer-api', label: 'Developer Open API & Webhooks' },
                        { path: '/manage-merchants', label: 'Store SaaS Management' },
                        { path: '/manage-users', label: 'Staff Users & Roles' },
                        { path: '/database-backup', label: 'Database Backup & Restore' }
                    ]
                }
            ]
        }
    ];

    return (
        <div className="flex flex-col h-full bg-white border-r border-slate-200 text-slate-700 font-['Plus_Jakarta_Sans',sans-serif] select-none">
            {/* Sidebar Header */}
            <div className="p-3 pb-1 border-b border-slate-100">
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="truncate">Enterprise ERP 27 Modules Active</span>
                </div>
            </div>

            {/* Menu List */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
                {menuSections.map((section, idx) => (
                    <div key={idx} className="space-y-1">
                        <div className="px-3 text-[10px] font-extrabold text-blue-600 uppercase tracking-widest bg-blue-50/50 py-1 rounded-md mb-1">
                            {section.title}
                        </div>

                        <div className="space-y-1">
                            {section.items.map(item => {
                                const isOpen = openMenu === item.label || (item.subItems && item.subItems.some(sub => sub.path === location.pathname));

                                return (
                                    <div key={item.label}>
                                        <button
                                            onClick={() => handleMenuClick(item.label)}
                                            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-700 transition-all"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div className="h-6 w-6 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs">
                                                    {item.icon}
                                                </div>
                                                <span className="text-xs font-extrabold text-slate-800">{item.label}</span>
                                            </div>
                                            <span className="text-[10px] text-slate-400">
                                                {isOpen ? <FaChevronDown /> : <FaChevronRight />}
                                            </span>
                                        </button>

                                        {isOpen && item.subItems && (
                                            <div className="ml-5 pl-2 border-l-2 border-blue-500/30 mt-1 space-y-1">
                                                {item.subItems.map(subItem => {
                                                    const isSubActive = location.pathname === subItem.path;
                                                    return (
                                                        <Link
                                                            key={subItem.label + subItem.path}
                                                            to={subItem.path}
                                                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                                                isSubActive
                                                                    ? 'bg-blue-600 text-white font-extrabold shadow-sm'
                                                                    : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50'
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
                                );
                            })}
                        </div>
                    </div>
                ))}
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
                            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                                <FaUserCheck />
                            </div>
                            <div className="truncate">
                                <div className="text-xs font-extrabold text-slate-900 truncate">{user.username}</div>
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
