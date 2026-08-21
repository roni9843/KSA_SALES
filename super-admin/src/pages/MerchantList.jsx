import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FaStore, FaPlus, FaEdit, FaTrash, FaSearch, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaUsers } from 'react-icons/fa';

const MerchantList = () => {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [formData, setFormData] = useState({
    shopName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    username: '',
    password: '',
    subscriptionStatus: 'trial'
  });

  const fetchMerchants = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/merchants');
      setMerchants(res.data.merchants || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch merchants from MongoDB');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMerchants();
  }, [fetchMerchants]);

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      shopName: '',
      ownerName: '',
      email: '',
      phone: '',
      address: '',
      username: '',
      password: '',
      subscriptionStatus: 'trial'
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (merchant) => {
    setIsEditing(true);
    setCurrentId(merchant._id);
    setFormData({
      shopName: merchant.shopName || '',
      ownerName: merchant.ownerName || '',
      email: merchant.email || '',
      phone: merchant.phone || '',
      address: merchant.address || '',
      username: '',
      password: '',
      subscriptionStatus: merchant.subscriptionStatus || 'trial'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/merchants/${currentId}`, {
          shopName: formData.shopName,
          ownerName: formData.ownerName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          subscriptionStatus: formData.subscriptionStatus
        });
        toast.success('Merchant updated successfully in MongoDB Atlas!');
      } else {
        await api.post('/merchants', formData);
        toast.success('New Merchant created in MongoDB Atlas!');
      }
      setShowModal(false);
      fetchMerchants();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed.');
    }
  };

  const handleDelete = async (id, shopName) => {
    if (window.confirm(`Delete merchant "${shopName}" permanently from MongoDB Cloud?`)) {
      try {
        await api.delete(`/merchants/${id}`);
        toast.success('Merchant store deleted!');
        fetchMerchants();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete merchant.');
      }
    }
  };

  const filteredMerchants = merchants.filter(m => {
    const matchesSearch = 
      m.shopName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone?.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || m.subscriptionStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <FaStore className="text-admin-400" /> Merchant Stores & SaaS Subscriptions
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time management of all shops stored in MongoDB Atlas (<span className="text-admin-300 font-mono">elecEcommerce</span>)
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-admin-600 to-sky-500 hover:from-admin-500 hover:to-sky-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-admin-600/30 transition-all"
        >
          <FaPlus /> Add New Merchant Store
        </button>
      </div>

      {/* Filter & Search */}
      <div className="glass-card p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <FaSearch className="absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search store name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 pl-10 pr-4 py-2 text-sm rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-admin-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-medium">Subscription Filter:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 px-3.5 py-2 text-sm rounded-xl text-white focus:outline-none focus:border-admin-500"
          >
            <option value="all">All Subscriptions</option>
            <option value="active">Active (Paid)</option>
            <option value="trial">Trial (30-Days)</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Merchant Table */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-admin-500 border-t-transparent"></div>
            <p className="mt-2 text-sm">Fetching store records from MongoDB Cloud...</p>
          </div>
        ) : filteredMerchants.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FaStore className="mx-auto text-4xl text-slate-600 mb-3" />
            <p className="text-base font-semibold text-slate-300">No merchant stores found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Shop Name</th>
                  <th className="px-6 py-4">Owner Name</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Users</th>
                  <th className="px-6 py-4">Subscription</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredMerchants.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-admin-950/80 border border-admin-800/60 flex items-center justify-center text-admin-400">
                        <FaStore />
                      </div>
                      <div>
                        {m.shopName}
                        <div className="text-xs font-normal text-slate-500">{m.address || 'No address provided'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-200">{m.ownerName}</td>
                    <td className="px-6 py-4 text-xs space-y-0.5">
                      <div className="text-slate-300 font-medium">{m.email}</div>
                      <div className="text-slate-500">{m.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                        <FaUsers className="text-slate-400" /> {m.userCount || 1} User(s)
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                        m.subscriptionStatus === 'active'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                          : m.subscriptionStatus === 'trial'
                          ? 'bg-sky-950/80 text-sky-300 border-sky-700/60'
                          : 'bg-rose-950/80 text-rose-300 border-rose-700/60'
                      }`}>
                        {m.subscriptionStatus === 'active' && <FaCheckCircle className="text-emerald-400" />}
                        {m.subscriptionStatus === 'trial' && <FaExclamationTriangle className="text-sky-400" />}
                        {m.subscriptionStatus !== 'active' && m.subscriptionStatus !== 'trial' && <FaTimesCircle className="text-rose-400" />}
                        {m.subscriptionStatus ? m.subscriptionStatus.toUpperCase() : 'TRIAL'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(m)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Edit Merchant"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(m._id, m.shopName)}
                        className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-300 transition-colors"
                        title="Delete Merchant"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-6">
            <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <FaStore className="text-admin-400" /> {isEditing ? 'Edit Merchant Details' : 'Create Merchant Store'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Shop Name</label>
                  <input
                    type="text"
                    required
                    value={formData.shopName}
                    onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-admin-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Owner Name</label>
                  <input
                    type="text"
                    required
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-admin-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-admin-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-admin-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-admin-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subscription Status</label>
                <select
                  value={formData.subscriptionStatus}
                  onChange={(e) => setFormData({ ...formData, subscriptionStatus: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-admin-500"
                >
                  <option value="active">Active (Paid)</option>
                  <option value="trial">Trial (30-Days)</option>
                  <option value="expired">Expired</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              {!isEditing && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-slate-800 pt-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Username</label>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-admin-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Password</label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-admin-500"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-admin-600 to-sky-500 hover:from-admin-500 hover:to-sky-400 text-white font-bold text-sm transition-all shadow-lg shadow-admin-600/30"
                >
                  {isEditing ? 'Save Changes' : 'Create Merchant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchantList;
