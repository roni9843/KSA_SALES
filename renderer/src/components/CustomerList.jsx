import { useEffect, useState } from 'react';
import Switch from './common/Switch';
import { FaEdit, FaTrash, FaUsers, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const PAGE_SIZE = 10;

const CustomerList = ({ refresh }) => {
    const [list, setList] = useState([]);
    const [editCustomer, setEditCustomer] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchCustomers = async (page, search) => {
        const { rows, totalCount } = await window.electron.ipcRenderer.invoke('get-customers', {
            page,
            limit: PAGE_SIZE,
            searchTerm: search,
        });
        setList(rows || []);
        setTotalPages(Math.ceil((totalCount || 0) / PAGE_SIZE));
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchCustomers(currentPage, searchTerm);
        }, 300);
        return () => clearTimeout(handler);
    }, [refresh, currentPage, searchTerm]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const deleteCustomer = async (id) => {
        if (confirm('Delete this customer?')) {
            await window.electron.ipcRenderer.invoke('delete-customer', id);
            fetchCustomers(currentPage, searchTerm);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        await window.electron.ipcRenderer.invoke('update-customer', editCustomer);
        setEditCustomer(null);
        fetchCustomers(currentPage, searchTerm);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditCustomer({ ...editCustomer, [name]: type === 'checkbox' ? checked : value });
    };

    return (
        <div style={cardStyle}>
            <div style={headerStyle}>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <FaUsers className="text-blue-600" /> Customer List
                </h2>
                <div style={searchContainerStyle}>
                    <input
                        type="text"
                        placeholder="Search by name, phone, tax, uakam..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        style={searchInputStyle}
                    />
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 mt-4">
                <table style={tableStyle}>
                    <thead style={tableHeaderStyle}>
                        <tr>
                            <th style={{ ...thStyle, textAlign: 'left' }}>Customer Name</th>
                            <th style={thStyle}>Phone</th>
                            <th style={thStyle}>Email</th>
                            <th style={thStyle}>Tax Number</th>
                            <th style={thStyle}>Uakam No</th>
                            <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-slate-500 text-sm">No customers registered yet.</td>
                            </tr>
                        ) : (
                            list.map((c, index) => (
                                <tr key={c.id} style={tableRowStyle(index)}>
                                    <td style={{ ...tdStyle, textAlign: 'left', fontWeight: '700', color: '#0f172a' }}>{c.name}</td>
                                    <td style={{ ...tdStyle, fontWeight: '600' }}>{c.phone || '-'}</td>
                                    <td style={tdStyle}>{c.email || '-'}</td>
                                    <td style={tdStyle}>{c.tax_number || '-'}</td>
                                    <td style={tdStyle}>{c.Uakam_no || '-'}</td>
                                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                                        <button onClick={() => setEditCustomer(c)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors mr-2"><FaEdit /></button>
                                        <button onClick={() => deleteCustomer(c.id)} className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"><FaTrash /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div style={paginationStyle}>
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm disabled:opacity-50">
                        <FaChevronLeft />
                    </button>
                    <span className="text-xs font-semibold text-slate-600">Page {currentPage} of {totalPages}</span>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm disabled:opacity-50">
                        <FaChevronRight />
                    </button>
                </div>
            )}

            {/* Modal */}
            {editCustomer && (
                <div style={modalOverlay}>
                    <div style={modalBox}>
                        <h3 style={modalHeaderStyle}>Edit Customer</h3>
                        <form onSubmit={handleEditSubmit} style={formStyle}>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Name <span style={{ color: 'red' }}>*</span></label>
                                <input name="name" value={editCustomer.name} onChange={handleChange} placeholder="Name" required style={inputStyle} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Code</label>
                                <input name="code" value={editCustomer.code} onChange={handleChange} placeholder="Code" style={inputStyle} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Phone <span style={{ color: 'red' }}>*</span></label>
                                <input name="phone" value={editCustomer.phone} onChange={handleChange} placeholder="Phone" required style={inputStyle} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Email</label>
                                <input type="email" name="email" value={editCustomer.email} onChange={handleChange} placeholder="Email" style={inputStyle} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Address</label>
                                <input name="address" value={editCustomer.address} onChange={handleChange} placeholder="Address" style={inputStyle} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Zip Code</label>
                                <input name="zip_code" value={editCustomer.zip_code} onChange={handleChange} placeholder="Zip Code" style={inputStyle} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>City</label>
                                <input name="city" value={editCustomer.city} onChange={handleChange} placeholder="City" style={inputStyle} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Country</label>
                                <input name="country" value={editCustomer.country} onChange={handleChange} placeholder="Country" style={inputStyle} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Tax Number</label>
                                <input name="tax_number" value={editCustomer.tax_number} onChange={handleChange} placeholder="Tax Number" style={inputStyle} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Uakam No</label>
                                <input name="Uakam_no" value={editCustomer.Uakam_no} onChange={handleChange} placeholder="Enter Uakam No" style={inputStyle} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Status</label>
                                <Switch name="status" checked={editCustomer.status} onChange={handleChange} />
                            </div>

                            <div style={{ gridColumn: '1 / span 2', display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                                <button type="button" onClick={() => setEditCustomer(null)} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl text-sm transition-all">Cancel</button>
                                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md transition-all">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
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

const searchContainerStyle = {
    display: 'flex',
    alignItems: 'center'
};

const searchInputStyle = {
    padding: '8px 14px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    fontSize: '13px',
    minWidth: '280px',
    outline: 'none',
};

const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
};

const tableHeaderStyle = {
    backgroundColor: '#f8fafc',
    color: '#475569',
};

const thStyle = {
    padding: '12px 16px',
    textAlign: 'left',
    borderBottom: '1px solid #e2e8f0',
    textTransform: 'uppercase',
    fontSize: '11px',
    fontWeight: '700',
};

const tableRowStyle = (index) => ({
    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc',
});

const tdStyle = {
    padding: '12px 16px',
    borderBottom: '1px solid #e2e8f0',
    color: '#334155',
    fontSize: '14px',
};

const paginationStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '12px',
    marginTop: '20px'
};

const modalOverlay = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999
};

const modalBox = {
    background: '#ffffff',
    padding: '28px',
    borderRadius: '20px',
    width: 'clamp(400px, 50vw, 600px)',
    color: '#0f172a',
    border: '1px solid #e2e8f0',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};

const modalHeaderStyle = {
    textAlign: 'left',
    marginBottom: '16px',
    fontSize: '18px',
    fontWeight: '800',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '10px',
};

const formStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
};

const inputGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
};

const labelStyle = {
    marginBottom: '4px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
};

const inputStyle = {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontSize: '13px',
    outline: 'none',
};

export default CustomerList;