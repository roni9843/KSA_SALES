import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FaShieldAlt, FaStore, FaChartPie, FaSignOutAlt, FaCloud, FaUsers } from 'react-icons/fa';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Overview & Metrics', icon: <FaChartPie /> },
    { path: '/merchants', label: 'Merchant Stores', icon: <FaStore /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-slate-900/80 border-b border-slate-800 backdrop-blur-md px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-admin-600 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-admin-600/30">
            <FaShieldAlt className="text-xl" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              SaaS Super Admin <span className="text-xs bg-admin-500/20 text-admin-400 border border-admin-500/40 px-2 py-0.5 rounded-full font-semibold">Cloud Control</span>
            </h1>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <FaCloud className="text-emerald-400 text-[10px]" /> MongoDB Atlas: <span className="text-slate-300 font-mono">elecEcommerce</span>
            </p>
          </div>
        </div>

        {/* User Info & Navigation */}
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-admin-600 text-white shadow-md shadow-admin-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {item.icon} {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-white">{user?.username || 'Super Admin'}</div>
              <div className="text-xs text-admin-400 font-medium">System Manager</div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-rose-950/60 hover:border-rose-800/60 text-slate-400 hover:text-rose-300 transition-all"
            >
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </header>

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900/40 border-t border-slate-900 py-4 px-6 text-center text-xs text-slate-500">
        SaaS Control Center &bull; Powered by MongoDB Cloud &bull; ArafLogix POS Ecosystem
      </footer>
    </div>
  );
};

export default AdminLayout;
