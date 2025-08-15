import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const result = await login(username, password);
            if (result.success) {
                navigate('/');
            } else {
                setError(result.message || 'Failed to login. Please check your credentials.');
            }
        } catch (err) {
            setError('An error occurred during login.');
            console.error(err);
        }
    };

    const pageStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f0f2f5'
    };

    const formContainerStyle = {
        padding: '40px',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
    };

    const inputStyle = {
        width: '100%',
        padding: '12px',
        marginBottom: '20px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontSize: '16px'
    };

    const buttonStyle = {
        width: '100%',
        padding: '12px',
        background: '#282A35',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold'
    };

    return (
        <div style={pageStyle}>
            <div style={formContainerStyle}>
                <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>Login</h1>
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        required
                        style={inputStyle}
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                        style={inputStyle}
                    />
                    {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}
                    <button type="submit" style={buttonStyle}>Login</button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;