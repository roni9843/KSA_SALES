import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const navigate = useNavigate();
    const { register, loading } = useAuthStore();

    const handleRegister = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (password !== confirmPassword) {
            setErrorMsg('Passwords do not match');
            return;
        }

        const result = await register(username, password);
        if (result.success) {
            setSuccessMsg('Registration successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } else {
            setErrorMsg(result.message || 'Registration failed. Try a different username.');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-12 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
            <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-slate-950/60 p-8 shadow-2xl backdrop-blur-md">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white">
                        Create Account
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                        Join Moto POS Cloud and manage your business online
                    </p>
                </div>

                <form className="mt-8 space-y-4" onSubmit={handleRegister}>
                    <div className="space-y-3 rounded-md shadow-sm">
                        <div>
                            <label className="sr-only">Username</label>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="relative block w-full appearance-none rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-3 text-slate-200 placeholder-slate-500 focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                                placeholder="Username"
                            />
                        </div>
                        <div>
                            <label className="sr-only">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="relative block w-full appearance-none rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-3 text-slate-200 placeholder-slate-500 focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                                placeholder="Password"
                            />
                        </div>
                        <div>
                            <label className="sr-only">Confirm Password</label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="relative block w-full appearance-none rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-3 text-slate-200 placeholder-slate-500 focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                                placeholder="Confirm Password"
                            />
                        </div>
                    </div>

                    {errorMsg && (
                        <div className="rounded-lg bg-red-950/50 border border-red-800/60 p-3 text-center text-sm font-medium text-red-400">
                            {errorMsg}
                        </div>
                    )}

                    {successMsg && (
                        <div className="rounded-lg bg-emerald-950/50 border border-emerald-800/60 p-3 text-center text-sm font-medium text-emerald-400">
                            {successMsg}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full justify-center rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-3 text-sm font-semibold text-white hover:from-primary-500 hover:to-primary-450 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 transition-all duration-200"
                        >
                            {loading ? (
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            ) : (
                                'Sign Up'
                            )}
                        </button>
                    </div>
                </form>

                <div className="flex flex-col items-center justify-between text-center mt-4">
                    <p className="text-xs text-slate-500">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-primary-500 hover:text-primary-400">
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
