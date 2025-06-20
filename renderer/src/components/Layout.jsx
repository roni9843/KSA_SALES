import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main style={{ marginLeft: '200px', padding: '20px', width: '100%' }}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
