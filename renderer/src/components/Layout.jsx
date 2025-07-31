import { useState } from 'react';
import Sidebar from './Sidebar';
import { useTranslation } from 'react-i18next';

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
                    // width: '100%',
                    // marginLeft: showSidebar ? '200px' : '0px',
                    // transition: 'margin-left 0.3s ease-in-out'
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
                    <div style={{ marginBottom: '10px' }}>
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
                        width: showSidebar ? '200px' : '0px',
                        background: '#282A35',
                        color: '#fff',
                        overflowX: 'hidden',
                        transition: 'width 0.3s ease-in-out'
                    }}
                >
                    {showSidebar && (
                        <div style={{ padding: '15px' }}>
                            <Sidebar />
                        </div>
                    )}
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
                        width: showSidebar ? 'calc(100% - 200px)' : '100%',
                    }}
                >
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
