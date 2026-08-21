import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FaShieldAlt, FaLock, FaUser } from 'react-icons/fa';

const AdminLogin = () => {
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
      setErrorMsg(result.message || 'Login failed. Invalid credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-slate-800/80 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-admin-600/20 text-admin-400 border border-admin-500/30 mb-4 shadow-xl shadow-admin-500/10">
            <FaShieldAlt className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Super Admin Login
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Access the SaaS Cloud Merchant & Database Portal
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleLogin}>
          {errorMsg && (
            <div className="rounded-xl bg-rose-950/60 border border-rose-800/60 p-3.5 text-center text-sm font-medium text-rose-300">
              {errorMsg}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Super Admin Username</label>
              <div className="relative">
                <FaUser className="absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="supperAdmin"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-admin-500 focus:outline-none focus:ring-1 focus:ring-admin-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <FaLock className="absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-admin-500 focus:outline-none focus:ring-1 focus:ring-admin-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center rounded-xl bg-gradient-to-r from-admin-600 to-sky-500 py-3.5 text-sm font-bold text-white hover:from-admin-500 hover:to-sky-400 focus:outline-none focus:ring-2 focus:ring-admin-500/50 shadow-lg shadow-admin-600/20 disabled:opacity-50 transition-all duration-200"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              'Sign In to SaaS Portal'
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 border-t border-slate-800/60 pt-4">
          Secured with MongoDB Atlas Cloud &bull; elecEcommerce
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
