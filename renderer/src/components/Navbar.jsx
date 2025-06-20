import { Link } from 'react-router-dom';

function Navbar() {
    return (
        <nav style={{ padding: '10px', background: '#222', color: '#fff', display: 'flex', gap: '15px' }}>
            <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>🏠 Home</Link>
            <Link to="/product" style={{ color: '#fff', textDecoration: 'none' }}>📦 Products</Link>
            <Link to="/category" style={{ color: '#fff', textDecoration: 'none' }}>📁 Category</Link>
            <Link to="/create-invoice" style={{ color: '#fff', textDecoration: 'none' }}>🧾 Invoice</Link>
        </nav>
    );
}

export default Navbar;
