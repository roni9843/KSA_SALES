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
        setList(rows);
        setTotalPages(Math.ceil(totalCount / PAGE_SIZE));
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
                <h2><FaUsers /> Customer List</h2>
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
            <table style={tableStyle}>
                <thead style={tableHeaderStyle}>
                    <tr>
                        <th style={{ ...thStyle, textAlign: 'left' }}>Name</th>
                        <th style={thStyle}>Phone</th>
                        <th style={thStyle}>Email</th>
                        <th style={thStyle}>Tax Number</th>
                        <th style={thStyle}>Uakam No</th>
                        <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {list.map((c, index) => (
                        <tr key={c.id} style={tableRowStyle(index)}>
                            <td style={{ ...tdStyle, textAlign: 'left' }}>{c.name}</td>
                            <td style={tdStyle}>{c.phone}</td>
                            <td style={tdStyle}>{c.email}</td>
                            <td style={tdStyle}>{c.tax_number}</td>
                            <td style={tdStyle}>{c.Uakam_no}</td>
                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                                <button onClick={() => setEditCustomer(c)} className="action-button"><FaEdit /></button>
                                <button onClick={() => deleteCustomer(c.id)} className="action-button"><FaTrash /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {totalPages > 1 && (
                <div style={paginationStyle}>
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="default-button">
                        <FaChevronLeft />
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="default-button">
                        <FaChevronRight />
                    </button>
                </div>
            )}

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

                            <div style={{ gridColumn: '1 / span 2', display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="submit" className="default-button">Update</button>
                                <button type="button" onClick={() => setEditCustomer(null)} className="default-button">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const cardStyle = {
    background: '#2D3748',
    padding: '20px',
    borderRadius: '4px',
    color: '#fff'
};

const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
};

const searchContainerStyle = {
    display: 'flex',
    alignItems: 'center'
};

const searchInputStyle = {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #A0AEC0',
    backgroundColor: '#fff',
    color: '#333',
    fontSize: '14px',
    minWidth: '300px'
};

const tableStyle = {
    width: '100%',
    marginTop: '20px',
    borderCollapse: 'collapse',
    borderRadius: '8px',
    overflow: 'hidden',
};

const tableHeaderStyle = {
    backgroundColor: '#4A5568',
    color: '#fff',
};

const thStyle = {
    padding: '12px 15px',
    textAlign: 'right',
    borderBottom: '1px solid #2D3748',
    textTransform: 'uppercase',
    fontSize: '12px',
};

const tableRowStyle = (index) => ({
    backgroundColor: index % 2 === 0 ? '#575F6D' : '#4A5568',
    borderBottom: '1px solid #2D3748',
});

const tdStyle = {
    padding: '12px 15px',
    textAlign: 'right',
};

const paginationStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
    marginTop: '20px'
};

const modalOverlay = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999
};

const modalBox = {
    background: '#2D3748',
    padding: '30px',
    borderRadius: '5px',
    width: 'clamp(400px, 50vw, 600px)',
    color: '#fff',
    boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
};

const modalHeaderStyle = {
    textAlign: 'center',
    marginBottom: '20px',
    fontSize: '22px',
};

const formStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
};

const inputGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
};

const labelStyle = {
    marginBottom: '5px',
    fontSize: '14px',
    color: '#A0AEC0',
};

const inputStyle = {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #A0AEC0',
    backgroundColor: '#fff',
    color: '#333',
    fontSize: '14px',
};

export default CustomerList;