import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import { FaPlusCircle, FaStore, FaClock, FaGlobe, FaBars } from 'react-icons/fa';

const Clock = () => {
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setDate(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const formatDateTime = (date) => {
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' });
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;

        return `${day} ${month} &bull; ${hours}:${minutes} ${ampm}`;
    };

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-blue-700 shadow-sm">
            <FaClock className="text-blue-600" />
            <span dangerouslySetInnerHTML={{ __html: formatDateTime(date) }}></span>
        </div>
    );
};

const Layout = ({ children }) => {
    const { i18n } = useTranslation();
    const { user } = useAuthStore();
    const [showSidebar, setShowSidebar] = useState(true);

    const changeLanguage = (lng) => i18n.changeLanguage(lng);
    const toggleSidebar = () => setShowSidebar(!showSidebar);

    return (
        <div className="h-screen flex flex-col bg-slate-50 text-slate-900 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">

            {/* 🔝 White Mode Modern POS Topbar */}
            <header className="h-14 bg-white border-b border-slate-200/90 shadow-sm flex items-center justify-between px-5 sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        title="Toggle Navigation"
                    >
                        <FaBars className="text-base" />
                    </button>

                    <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black shadow-md shadow-blue-500/20">
                            <FaStore className="text-base" />
                        </div>
                        <div>
                            <h2 className="text-sm font-extrabold text-slate-900 tracking-wide flex items-center gap-2">
                                {user?.merchant?.shopName || 'Moto POS'}
                            </h2>
                            <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider">
                                Cloud POS Terminal
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions & Header Items */}
                <div className="flex items-center gap-4">
                    {/* Quick Sale Button */}
                    <Link
                        to="/create-invoice"
                        className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all"
                    >
                        <FaPlusCircle /> + Quick Sale
                    </Link>

                    {/* Clock Pill */}
                    <Clock />

                    {/* Language Selector */}
                    <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-xl text-xs">
                        <FaGlobe className="text-slate-500 text-xs" />
                        <select
                            onChange={(e) => changeLanguage(e.target.value)}
                            defaultValue={i18n.language}
                            className="bg-transparent text-slate-800 focus:outline-none cursor-pointer text-xs"
                        >
                            <option value="en">English</option>
                            <option value="bn">বাংলা</option>
                            <option value="ar">العربية</option>
                        </select>
                    </div>
                </div>
            </header>

            {/* 📦 Main Body */}
            <div className="flex-1 flex overflow-hidden">
                {/* 📂 White Mode POS Sidebar */}
                <aside
                    className={`bg-white border-r border-slate-200 transition-all duration-300 flex flex-col ${
                        showSidebar ? 'w-64' : 'w-0'
                    } overflow-hidden`}
                >
                    {showSidebar && <Sidebar />}
                </aside>

                {/* 📄 Main Content Area */}
                <main className="flex-1 bg-slate-50 p-6 overflow-y-auto">
                    {children}
                </main>
            </div>

            {/* 🦶 White Mode Footer */}
            <footer className="h-9 bg-white border-t border-slate-200 flex items-center justify-between px-6 text-[11px] text-slate-500 shrink-0">
                <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    POS Cloud Connected &bull; System Online
                </span>
                <span>
                    Developed by <a href="https://araflogix.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">ArafLogix</a>
                </span>
            </footer>
        </div>
    );
};

export default Layout;