import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FaStore, FaPlus, FaEdit, FaTrash, FaSearch, FaUsers, FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';

const MerchantManagement = () => {
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
      toast.error(err.response?.data?.message || 'Failed to fetch merchants');
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
        toast.success('Merchant store updated successfully!');
      } else {
        await api.post('/merchants', formData);
        toast.success('New merchant store created successfully!');
      }
      setShowModal(false);
      fetchMerchants();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    }
  };

  const handleDelete = async (id, shopName) => {
    if (window.confirm(`Are you sure you want to delete "${shopName}"? All associated store data and users will be permanently removed.`)) {
      try {
        await api.delete(`/merchants/${id}`);
        toast.success('Merchant deleted successfully!');
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

  // Calculate Metrics
  const totalCount = merchants.length;
  const activeCount = merchants.filter(m => m.subscriptionStatus === 'active').length;
  const trialCount = merchants.filter(m => m.subscriptionStatus === 'trial').length;
  const expiredCount = merchants.filter(m => m.subscriptionStatus === 'expired' || m.subscriptionStatus === 'suspended').length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <FaCheckCircle className="text-emerald-600" /> Active
          </span>
        );
      case 'trial':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            <FaExclamationTriangle className="text-blue-600" /> Trial (30 Days)
          </span>
        );
      case 'expired':
      case 'suspended':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            <FaTimesCircle className="text-rose-600" /> {status ? status.toUpperCase() : 'EXPIRED'}
          </span>
        );
    }
  };

  return (
    <div className="p-2 space-y-6 text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <FaStore className="text-blue-600" /> Merchant Store Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Super Admin Portal to control registered shops, subscriptions, and system users
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-600/20 transition-all"
        >
          <FaPlus /> Add New Merchant
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Stores</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{totalCount}</h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 text-xl border border-slate-200">
            <FaStore />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Subscriptions</p>
            <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">{activeCount}</h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 text-xl">
            <FaCheckCircle />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Trial Accounts</p>
            <h3 className="text-3xl font-extrabold text-blue-600 mt-1">{trialCount}</h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 text-xl">
            <FaExclamationTriangle />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expired / Suspended</p>
            <h3 className="text-3xl font-extrabold text-rose-600 mt-1">{expiredCount}</h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 text-xl">
            <FaTimesCircle />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <FaSearch className="absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by store name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 text-sm rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-600">Filter Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 px-3 py-2 text-sm rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="trial">Trial</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Merchants Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-2 text-sm">Loading merchants data...</p>
          </div>
        ) : filteredMerchants.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FaStore className="mx-auto text-4xl text-slate-400 mb-3" />
            <p className="text-base font-semibold text-slate-700">No merchant stores found</p>
            <p className="text-xs text-slate-500 mt-1">Try tweaking your search or add a new merchant account.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-600">
                <tr>
                  <th className="px-6 py-4">Shop Name</th>
                  <th className="px-6 py-4">Owner Name</th>
                  <th className="px-6 py-4">Contact Details</th>
                  <th className="px-6 py-4">Users</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Registered Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredMerchants.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 text-sm">
                        <FaStore />
                      </div>
                      <div>
                        {m.shopName}
                        <div className="text-xs font-normal text-slate-500">{m.address || 'No address'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">{m.ownerName}</td>
                    <td className="px-6 py-4 text-xs space-y-0.5">
                      <div className="text-slate-900 font-semibold">{m.email}</div>
                      <div className="text-slate-500">{m.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-bold text-slate-700 border border-slate-200">
                        <FaUsers className="text-slate-500" /> {m.userCount || 1} User(s)
                      </span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(m.subscriptionStatus)}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(m.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(m)}
                        title="Edit Merchant"
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(m._id, m.shopName)}
                        title="Delete Merchant"
                        className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 transition-colors"
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

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
              <FaStore className="text-blue-600" /> {isEditing ? 'Edit Merchant Store' : 'Add New Merchant Store'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Shop Name</label>
                  <input
                    type="text"
                    required
                    value={formData.shopName}
                    onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 px-3.5 py-2.5 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Owner Name</label>
                  <input
                    type="text"
                    required
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 px-3.5 py-2.5 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 px-3.5 py-2.5 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 px-3.5 py-2.5 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 px-3.5 py-2.5 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subscription Status</label>
                <select
                  value={formData.subscriptionStatus}
                  onChange={(e) => setFormData({ ...formData, subscriptionStatus: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 px-3.5 py-2.5 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  <option value="active">Active (Full Subscription)</option>
                  <option value="trial">Trial (30 Days)</option>
                  <option value="expired">Expired</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              {!isEditing && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-slate-200 pt-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Username</label>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 px-3.5 py-2.5 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Password</label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 px-3.5 py-2.5 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md shadow-blue-600/20"
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

export default MerchantManagement;
