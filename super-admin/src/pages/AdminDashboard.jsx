import { useState, useEffect } from 'react';
import api from '../utils/api';
import { FaStore, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaCloud, FaDatabase, FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMerchants = async () => {
      try {
        const res = await api.get('/merchants');
        setMerchants(res.data.merchants || []);
      } catch (err) {
        console.error('Failed to load merchant metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    loadMerchants();
  }, []);

  const totalCount = merchants.length;
  const activeCount = merchants.filter(m => m.subscriptionStatus === 'active').length;
  const trialCount = merchants.filter(m => m.subscriptionStatus === 'trial').length;
  const expiredCount = merchants.filter(m => m.subscriptionStatus === 'expired' || m.subscriptionStatus === 'suspended').length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-admin-950 via-slate-900 to-slate-950 border border-slate-800 p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-admin-500/20 text-admin-300 border border-admin-500/30">
            <FaCloud className="text-admin-400" /> Connected to MongoDB Atlas Cloud
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            SaaS Merchant Control Panel
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Manage your store clients, monitor active subscriptions, track trial periods, and add new merchant accounts directly in your MongoDB cloud database (<span className="text-admin-300 font-mono">elecEcommerce</span>).
          </p>
          <div className="pt-2 flex items-center gap-4">
            <Link
              to="/merchants"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-admin-600 hover:bg-admin-500 text-white font-bold text-sm shadow-lg shadow-admin-600/30 transition-all"
            >
              <FaStore /> Manage Stores & Subscriptions
            </Link>
          </div>
        </div>

        {/* Decorative Graphic */}
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <FaDatabase className="text-[240px] text-white" />
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card glass-card-hover p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Registered Shops</p>
            <h2 className="text-3xl font-extrabold text-white mt-1">{totalCount}</h2>
            <p className="text-xs text-slate-500 mt-1">In MongoDB Atlas Cluster</p>
          </div>
          <div className="h-14 w-14 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-admin-400 text-2xl">
            <FaStore />
          </div>
        </div>

        <div className="glass-card glass-card-hover p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Paid Stores</p>
            <h2 className="text-3xl font-extrabold text-emerald-400 mt-1">{activeCount}</h2>
            <p className="text-xs text-emerald-500/80 mt-1">Full Subscription</p>
          </div>
          <div className="h-14 w-14 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 text-2xl">
            <FaCheckCircle />
          </div>
        </div>

        <div className="glass-card glass-card-hover p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Trial Accounts</p>
            <h2 className="text-3xl font-extrabold text-sky-400 mt-1">{trialCount}</h2>
            <p className="text-xs text-sky-500/80 mt-1">30-Day Free Trial</p>
          </div>
          <div className="h-14 w-14 rounded-2xl bg-sky-950/60 border border-sky-800/60 flex items-center justify-center text-sky-400 text-2xl">
            <FaExclamationTriangle />
          </div>
        </div>

        <div className="glass-card glass-card-hover p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Expired / Suspended</p>
            <h2 className="text-3xl font-extrabold text-rose-400 mt-1">{expiredCount}</h2>
            <p className="text-xs text-rose-500/80 mt-1">Requires Renewal</p>
          </div>
          <div className="h-14 w-14 rounded-2xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400 text-2xl">
            <FaTimesCircle />
          </div>
        </div>
      </div>

      {/* Recent Merchants Table */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FaStore className="text-admin-400" /> Recent Merchant Signups
            </h3>
            <p className="text-xs text-slate-400">Latest shop registrations in MongoDB cloud</p>
          </div>
          <Link
            to="/merchants"
            className="text-xs font-bold text-admin-400 hover:text-admin-300 hover:underline"
          >
            View All ({totalCount}) &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-400 text-sm">Loading database metrics...</div>
        ) : merchants.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">No merchant stores created yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Store Name</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {merchants.slice(0, 5).map((m) => (
                  <tr key={m._id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-bold text-white">{m.shopName}</td>
                    <td className="px-4 py-3 text-slate-300">{m.ownerName}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{m.email} &bull; {m.phone}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        m.subscriptionStatus === 'active'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                          : m.subscriptionStatus === 'trial'
                          ? 'bg-sky-950/80 text-sky-300 border-sky-700/60'
                          : 'bg-rose-950/80 text-rose-300 border-rose-700/60'
                      }`}>
                        {m.subscriptionStatus || 'trial'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
