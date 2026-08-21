import { useState } from 'react';
import Switch from './common/Switch';
import { FaUser, FaBuilding, FaWallet, FaMapMarkerAlt, FaUsers, FaPlus, FaTrash } from 'react-icons/fa';

const AddCustomer = ({ onAdded }) => {
    const [activeTab, setActiveTab] = useState('basic'); // 'basic' | 'finance' | 'address'
    const [form, setForm] = useState({
        client_type: 'INDIVIDUAL',
        name: '',
        code: '',
        phone: '',
        email: '',
        address: '',
        zip_code: '',
        city: '',
        country: '',
        tax_number: '',
        cr_number: '',
        Uakam_no: '',
        opening_balance: 0,
        opening_balance_type: 'DEBIT',
        credit_limit: 0,
        credit_period_days: 0,
        category: '',
        status: 1,
        addresses: []
    });

    const [newAddress, setNewAddress] = useState({
        title: 'Branch Office',
        addressLine: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Saudi Arabia'
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };

    const handleAddAddress = () => {
        if (!newAddress.addressLine) return;
        setForm({ ...form, addresses: [...form.addresses, newAddress] });
        setNewAddress({ title: 'Branch Office', addressLine: '', city: '', state: '', zipCode: '', country: 'Saudi Arabia' });
    };

    const handleRemoveAddress = (index) => {
        const updated = [...form.addresses];
        updated.splice(index, 1);
        setForm({ ...form, addresses: updated });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await window.electron.ipcRenderer.invoke('add-customer', form);
        if (onAdded) onAdded();
        setForm({
            client_type: 'INDIVIDUAL',
            name: '',
            code: '',
            phone: '',
            email: '',
            address: '',
            zip_code: '',
            city: '',
            country: '',
            tax_number: '',
            cr_number: '',
            Uakam_no: '',
            opening_balance: 0,
            opening_balance_type: 'DEBIT',
            credit_limit: 0,
            credit_period_days: 0,
            category: '',
            status: 1,
            addresses: []
        });
        setActiveTab('basic');
    };

    return (
        <div style={cardStyle}>
            <div style={headerStyle}>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <FaUser className="text-blue-600" /> Add New Client / Customer
                </h2>
                <div style={typeToggleStyle}>
                    <button
                        type="button"
                        onClick={() => setForm({ ...form, client_type: 'INDIVIDUAL' })}
                        style={form.client_type === 'INDIVIDUAL' ? activeTypeBtn : inactiveTypeBtn}
                    >
                        <FaUser className="mr-1 text-xs" /> Individual
                    </button>
                    <button
                        type="button"
                        onClick={() => setForm({ ...form, client_type: 'CORPORATE' })}
                        style={form.client_type === 'CORPORATE' ? activeTypeBtn : inactiveTypeBtn}
                    >
                        <FaBuilding className="mr-1 text-xs" /> Corporate / Business
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div style={tabBarNav}>
                <button
                    type="button"
                    onClick={() => setActiveTab('basic')}
                    style={activeTab === 'basic' ? activeTabStyle : inactiveTabStyle}
                >
                    <FaUser className="mr-2" /> 1. Basic & Legal Info
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('finance')}
                    style={activeTab === 'finance' ? activeTabStyle : inactiveTabStyle}
                >
                    <FaWallet className="mr-2" /> 2. Financial & Credit Limit
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('address')}
                    style={activeTab === 'address' ? activeTabStyle : inactiveTabStyle}
                >
                    <FaMapMarkerAlt className="mr-2" /> 3. Multiple Addresses ({form.addresses.length})
                </button>
            </div>

            <form onSubmit={handleSubmit} style={formContainerStyle}>
                {/* TAB 1: BASIC INFO */}
                {activeTab === 'basic' && (
                    <div style={gridTwoCol}>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>{form.client_type === 'CORPORATE' ? 'Company Name' : 'Full Name'} <span style={{ color: 'red' }}>*</span></label>
                            <input name="name" placeholder="Enter name" value={form.name} onChange={handleChange} required style={inputStyle} />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Client Code / Barcode</label>
                            <input name="code" placeholder="Auto / Custom code" value={form.code} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Phone Number <span style={{ color: 'red' }}>*</span></label>
                            <input name="phone" placeholder="Enter phone" value={form.phone} onChange={handleChange} required style={inputStyle} />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Email Address</label>
                            <input type="email" name="email" placeholder="Enter email" value={form.email} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Tax Registration Number (VAT No.)</label>
                            <input name="tax_number" placeholder="15-digit Tax/VAT No" value={form.tax_number} onChange={handleChange} style={inputStyle} />
                        </div>
                        {form.client_type === 'CORPORATE' ? (
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Commercial Register (CR Number)</label>
                                <input name="cr_number" placeholder="Enter CR Number" value={form.cr_number} onChange={handleChange} style={inputStyle} />
                            </div>
                        ) : (
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>National ID / Iqama (Uakam No)</label>
                                <input name="Uakam_no" placeholder="Enter Iqama / National ID" value={form.Uakam_no} onChange={handleChange} style={inputStyle} />
                            </div>
                        )}
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Primary Address</label>
                            <input name="address" placeholder="Enter street address" value={form.address} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>City</label>
                            <input name="city" placeholder="City" value={form.city} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Country</label>
                            <input name="country" placeholder="Country" value={form.country} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Account Status</label>
                            <Switch name="status" checked={form.status} onChange={handleChange} />
                        </div>
                    </div>
                )}

                {/* TAB 2: FINANCIAL & CREDIT */}
                {activeTab === 'finance' && (
                    <div style={gridTwoCol}>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Opening Balance Amount</label>
                            <input type="number" step="0.01" name="opening_balance" placeholder="0.00" value={form.opening_balance} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Opening Balance Type</label>
                            <select name="opening_balance_type" value={form.opening_balance_type} onChange={handleChange} style={inputStyle}>
                                <option value="DEBIT">DEBIT (Customer owes us money)</option>
                                <option value="CREDIT">CREDIT (Advance credit deposited by customer)</option>
                            </select>
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Credit Limit Amount (SAR)</label>
                            <input type="number" step="0.01" name="credit_limit" placeholder="Max allowed credit (e.g. 50000)" value={form.credit_limit} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Credit Period Limit (Days)</label>
                            <input type="number" name="credit_period_days" placeholder="Max allowed credit days (e.g. 30)" value={form.credit_period_days} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Category</label>
                            <input name="category" placeholder="e.g. Corporate, Local, International" value={form.category} onChange={handleChange} style={inputStyle} />
                        </div>
                    </div>
                )}

                {/* TAB 3: MULTIPLE ADDRESSES */}
                {activeTab === 'address' && (
                    <div>
                        <div style={addressBoxStyle}>
                            <h4 className="text-sm font-bold text-slate-800 mb-2">Add Additional Shipping/Billing Address</h4>
                            <div style={gridTwoCol}>
                                <input placeholder="Title (e.g. Warehouse 2)" value={newAddress.title} onChange={e => setNewAddress({ ...newAddress, title: e.target.value })} style={inputStyle} />
                                <input placeholder="Address Line" value={newAddress.addressLine} onChange={e => setNewAddress({ ...newAddress, addressLine: e.target.value })} style={inputStyle} />
                                <input placeholder="City" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} style={inputStyle} />
                                <input placeholder="Country" value={newAddress.country} onChange={e => setNewAddress({ ...newAddress, country: e.target.value })} style={inputStyle} />
                            </div>
                            <button type="button" onClick={handleAddAddress} style={addAddrBtn}>
                                <FaPlus className="mr-1" /> Add Address to Client
                            </button>
                        </div>

                        <div className="mt-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Added Addresses ({form.addresses.length})</h4>
                            {form.addresses.length === 0 ? (
                                <p className="text-xs text-slate-400 italic">No additional addresses added yet.</p>
                            ) : (
                                form.addresses.map((addr, idx) => (
                                    <div key={idx} style={addressItemStyle}>
                                        <div>
                                            <strong className="text-sm text-slate-800">{addr.title}:</strong> <span className="text-xs text-slate-600">{addr.addressLine}, {addr.city}, {addr.country}</span>
                                        </div>
                                        <button type="button" onClick={() => handleRemoveAddress(idx)} className="text-rose-500 hover:text-rose-700 text-xs">
                                            <FaTrash />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                <div style={submitRowStyle}>
                    <button type="submit" style={submitBtnStyle}>
                        Save Client Profile
                    </button>
                </div>
            </form>
        </div>
    );
};

const cardStyle = {
    background: '#ffffff',
    padding: '24px',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    color: '#0f172a',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
};

const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '12px',
};

const typeToggleStyle = {
    display: 'flex',
    gap: '6px',
    background: '#f1f5f9',
    padding: '4px',
    borderRadius: '10px'
};

const activeTypeBtn = {
    padding: '6px 12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer'
};

const inactiveTypeBtn = {
    padding: '6px 12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748b',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer'
};

const tabBarNav = {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    borderBottom: '2px solid #e2e8f0'
};

const activeTabStyle = {
    padding: '10px 16px',
    border: 'none',
    borderBottom: '3px solid #2563eb',
    backgroundColor: 'transparent',
    color: '#2563eb',
    fontWeight: '800',
    fontSize: '13px',
    cursor: 'pointer'
};

const inactiveTabStyle = {
    padding: '10px 16px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748b',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer'
};

const formContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
};

const gridTwoCol = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '14px'
};

const inputGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
};

const labelStyle = {
    marginBottom: '6px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#334155',
};

const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontSize: '13px',
    outline: 'none',
};

const addressBoxStyle = {
    background: '#f8fafc',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0'
};

const addAddrBtn = {
    marginTop: '10px',
    padding: '8px 14px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer'
};

const addressItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    borderRadius: '8px',
    background: '#f1f5f9',
    marginBottom: '8px'
};

const submitRowStyle = {
    marginTop: '16px'
};

const submitBtnStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
};

export default AddCustomer;
