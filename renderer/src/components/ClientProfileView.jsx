import { useState } from 'react';
import { FaUser, FaBuilding, FaPhone, FaEnvelope, FaWhatsapp, FaWallet, FaCreditCard, FaFileInvoice, FaPlus, FaTimes, FaMapMarkerAlt, FaStickyNote } from 'react-icons/fa';

const ClientProfileView = ({ client, onClose, onRefresh }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [newNote, setNewNote] = useState('');
    const [notesList, setNotesList] = useState(client.notes || []);

    if (!client) return null;

    const handleAddNote = () => {
        if (!newNote) return;
        const noteObj = {
            note: newNote,
            isPinned: false,
            createdAt: new Date().toISOString()
        };
        setNotesList([...notesList, noteObj]);
        setNewNote('');
    };

    const whatsappUrl = client.phone ? `https://wa.me/${client.phone.replace(/[^0-9]/g, '')}` : '#';

    return (
        <div style={modalOverlay}>
            <div style={modalBox}>
                {/* Header */}
                <div style={headerStyle}>
                    <div className="flex items-center gap-3">
                        <div style={avatarStyle}>
                            {client.client_type === 'CORPORATE' ? <FaBuilding className="text-xl text-blue-600" /> : <FaUser className="text-xl text-blue-600" />}
                        </div>
                        <div>
                            <h3 className="text-lg font-extrabold text-slate-900">{client.name}</h3>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span>Code: <strong>{client.code || 'CLI-' + client.id}</strong></span> | 
                                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold">{client.client_type || 'INDIVIDUAL'}</span> | 
                                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold">{client.status || 'ACTIVE'}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} style={closeBtnStyle}><FaTimes /></button>
                </div>

                {/* Stat Summary Cards */}
                <div style={statGrid}>
                    <div style={statCard('#eff6ff', '#2563eb')}>
                        <span className="text-xs font-semibold text-slate-500">Opening Balance</span>
                        <h4 className="text-base font-extrabold text-slate-900">{client.opening_balance || 0} SAR ({client.opening_balance_type || 'DEBIT'})</h4>
                    </div>
                    <div style={statCard('#f0fdf4', '#16a34a')}>
                        <span className="text-xs font-semibold text-slate-500">Credit Limit</span>
                        <h4 className="text-base font-extrabold text-slate-900">{client.credit_limit ? `${client.credit_limit} SAR` : 'No Limit'}</h4>
                    </div>
                    <div style={statCard('#fefce8', '#ca8a04')}>
                        <span className="text-xs font-semibold text-slate-500">Store Credit Wallet</span>
                        <h4 className="text-base font-extrabold text-slate-900">{client.wallet_balance || 0} SAR</h4>
                    </div>
                </div>

                {/* Quick Action Toolbar */}
                <div style={toolbarStyle}>
                    <a href={whatsappUrl} target="_blank" rel="noreferrer" style={waActionBtn}>
                        <FaWhatsapp className="text-base" /> Direct WhatsApp
                    </a>
                    <button style={actionBtn}>
                        <FaFileInvoice /> Create Invoice
                    </button>
                </div>

                {/* Tabs */}
                <div style={tabNav}>
                    <button onClick={() => setActiveTab('overview')} style={activeTab === 'overview' ? activeTabBtn : tabBtn}>Overview & Info</button>
                    <button onClick={() => setActiveTab('addresses')} style={activeTab === 'addresses' ? activeTabBtn : tabBtn}>Addresses ({client.addresses ? client.addresses.length : 0})</button>
                    <button onClick={() => setActiveTab('notes')} style={activeTab === 'notes' ? activeTabBtn : tabBtn}>Notes & Attachments ({notesList.length})</button>
                </div>

                {/* Tab Contents */}
                <div style={tabContent}>
                    {activeTab === 'overview' && (
                        <div style={infoGrid}>
                            <div><strong>Phone:</strong> {client.phone || '-'}</div>
                            <div><strong>Email:</strong> {client.email || '-'}</div>
                            <div><strong>Tax / VAT No:</strong> {client.tax_number || '-'}</div>
                            <div><strong>CR Number:</strong> {client.cr_number || '-'}</div>
                            <div><strong>Iqama / National ID:</strong> {client.Uakam_no || '-'}</div>
                            <div><strong>Primary Address:</strong> {client.address || '-'}, {client.city || ''}</div>
                        </div>
                    )}

                    {activeTab === 'addresses' && (
                        <div>
                            {client.addresses && client.addresses.length > 0 ? (
                                client.addresses.map((addr, idx) => (
                                    <div key={idx} style={addrCard}>
                                        <FaMapMarkerAlt className="text-blue-500" />
                                        <div>
                                            <strong className="text-xs text-slate-800">{addr.title}</strong>
                                            <p className="text-xs text-slate-600">{addr.addressLine}, {addr.city}, {addr.country}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-slate-400 italic">No additional addresses recorded.</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'notes' && (
                        <div>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    placeholder="Add a new note..."
                                    value={newNote}
                                    onChange={e => setNewNote(e.target.value)}
                                    style={noteInput}
                                />
                                <button onClick={handleAddNote} style={addNoteBtn}><FaPlus /> Add</button>
                            </div>
                            {notesList.map((n, i) => (
                                <div key={i} style={noteCard}>
                                    <FaStickyNote className="text-amber-500 mt-1" />
                                    <div>
                                        <p className="text-xs text-slate-800 font-semibold">{n.note}</p>
                                        <span className="text-[10px] text-slate-400">{new Date(n.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const modalOverlay = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999
};

const modalBox = {
    background: '#ffffff',
    padding: '24px',
    borderRadius: '20px',
    width: 'clamp(500px, 60vw, 750px)',
    color: '#0f172a',
    border: '1px solid #e2e8f0',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};

const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '12px',
    marginBottom: '16px'
};

const avatarStyle = {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    backgroundColor: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};

const closeBtnStyle = {
    border: 'none',
    background: '#f1f5f9',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#64748b'
};

const statGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '16px'
};

const statCard = (bg, border) => ({
    background: bg,
    padding: '12px 14px',
    borderRadius: '12px',
    borderLeft: `4px solid ${border}`
});

const toolbarStyle = {
    display: 'flex',
    gap: '10px',
    marginBottom: '16px'
};

const waActionBtn = {
    padding: '8px 14px',
    borderRadius: '10px',
    backgroundColor: '#25D366',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    textDecoration: 'none'
};

const actionBtn = {
    padding: '8px 14px',
    borderRadius: '10px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '13px',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer'
};

const tabNav = {
    display: 'flex',
    gap: '8px',
    borderBottom: '2px solid #e2e8f0',
    marginBottom: '14px'
};

const activeTabBtn = {
    padding: '8px 14px',
    border: 'none',
    borderBottom: '3px solid #2563eb',
    backgroundColor: 'transparent',
    color: '#2563eb',
    fontWeight: '800',
    fontSize: '13px',
    cursor: 'pointer'
};

const tabBtn = {
    padding: '8px 14px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748b',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer'
};

const tabContent = {
    minHeight: '160px'
};

const infoGrid = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    fontSize: '13px',
    color: '#334155'
};

const addrCard = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px',
    borderRadius: '10px',
    background: '#f8fafc',
    marginBottom: '8px'
};

const noteInput = {
    flex: 1,
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    outline: 'none'
};

const addNoteBtn = {
    padding: '8px 14px',
    borderRadius: '8px',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    border: 'none',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
};

const noteCard = {
    display: 'flex',
    gap: '10px',
    padding: '8px 12px',
    borderRadius: '8px',
    background: '#fffbeb',
    border: '1px solid #fef3c7',
    marginBottom: '6px'
};

export default ClientProfileView;
