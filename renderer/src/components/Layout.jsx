import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useTranslation } from 'react-i18next';


const Clock = () => {
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setDate(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const formatDateTime = (date) => {
        const year = date.getFullYear();
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' });

        const getDayWithSuffix = (d) => {
            if (d > 3 && d < 21) return `${d}th`;
            switch (d % 10) {
                case 1: return `${d}st`;
                case 2: return `${d}nd`;
                case 3: return `${d}rd`;
                default: return `${d}th`;
            }
        };

        const dayWithSuffix = getDayWithSuffix(day);

        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'

        const strTime = `${hours}:${minutes} ${ampm}`;

        return `${dayWithSuffix} ${month} ${year} | ${strTime}`;
    };

    return (
        <div style={{ fontSize: '16px', color: '#fff' }}>
            {formatDateTime(date)}
        </div>
    );
};


const Layout = ({ children }) => {
    const { i18n } = useTranslation();
    const changeLanguage = (lng) => i18n.changeLanguage(lng);

    const { t } = useTranslation();
    const [showSidebar, setShowSidebar] = useState(true);

    const toggleSidebar = () => setShowSidebar(!showSidebar);

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>

            {/* 🔝 Topbar */}
            <header
                style={{
                    height: '50px',
                    backgroundColor: '#282A35',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 20px',
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1000,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                        onClick={toggleSidebar}
                        style={{
                            fontSize: '22px',
                            background: '#282A35',
                            color: '#fff',
                            border: 'none',
                            padding: '4px 10px',
                            cursor: 'pointer',
                            borderRadius: '4px'
                        }}
                    >
                        ☰
                    </button>
                    <h2 style={{ margin: 0 }}>{t('title')} </h2>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <Clock />
                    {/* Language Selector */}
                    <div >
                        <select onChange={(e) => changeLanguage(e.target.value)} defaultValue={i18n.language}>
                            <option value="en">English</option>
                            <option value="bn">বাংলা</option>
                            <option value="ar">العربية</option>
                        </select>
                    </div>
                </div>
            </header>

            {/* 📦 Main Body */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* 📂 Sidebar */}
                <aside
                    style={{
                        width: showSidebar ? '250px' : '0px',
                        background: '#282A35',
                        color: '#fff',
                        overflowX: 'hidden',
                        transition: 'width 0.3s ease-in-out'
                    }}
                >
                    {showSidebar && <Sidebar />}
                </aside>

                {/* 📄 Main Content */}
                <main
                    style={{
                        flex: 1,
                        padding: '20px',
                        background: '#eeeeee',
                        color: '#ecf0f1',
                        overflowY: 'auto',
                        transition: 'all 0.3s ease',
                        width: showSidebar ? 'calc(100% - 250px)' : '100%',
                    }}
                >
                    {children}
                </main>
            </div>

            {/* 🦶 Footer */}
            <footer
                style={{
                    height: '40px',
                    backgroundColor: '#282A35',
                    color: '#ecf0f1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 20px',
                    flexShrink: 0
                }}
            >
                <span>
                    Developed by <a href="https://araflogix.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#1abc9c', textDecoration: 'none' }}>ArafLogix</a>
                </span>
            </footer>
        </div>
    );
};

export default Layout;