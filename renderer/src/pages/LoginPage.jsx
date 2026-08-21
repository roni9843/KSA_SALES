import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();
    const { login, loading } = useAuthStore();

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        
        const result = await login(username, password);
        if (result.success) {
            navigate('/');
        } else {
            setErrorMsg(result.message || 'Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
                <div className="text-center">
                    <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
                        Moto POS <span className="text-blue-600">Cloud</span>
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Sign in to manage your inventory, sales, and analytics
                    </p>
                </div>
                
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 text-sm"
                                placeholder="Username (e.g. supperAdmin)"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 text-sm"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    {errorMsg && (
                        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-center text-sm font-medium text-rose-700">
                            {errorMsg}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full justify-center rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white hover:bg-blue-700 focus:outline-none shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-all duration-200"
                        >
                            {loading ? (
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </div>
                </form>

                <div className="flex flex-col items-center justify-between space-y-3 text-center mt-4">
                    <p className="text-xs text-slate-600">
                        New Store Owner?{' '}
                        <Link to="/register-merchant" className="font-bold text-blue-600 hover:underline">
                          Register Your Shop Account
                        </Link>
                    </p>
                    <p className="text-xs text-slate-500">
                        Staff Member?{' '}
                        <Link to="/register" className="font-medium text-slate-600 hover:underline">
                            Create User Account
                        </Link>
                    </p>
                    <p className="text-xs text-slate-400">
                        Developed by{' '}
                        <a
                            href="https://araflogix.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            ArafLogix
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;