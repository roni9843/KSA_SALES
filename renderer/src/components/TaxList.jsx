import { useEffect, useState } from 'react';
import { FaClipboardList, FaEdit, FaTrash } from 'react-icons/fa';

const TaxList = ({ refresh }) => {
    const [list, setList] = useState([]);
    const [editTax, setEditTax] = useState(null);

    const fetch = async () => {
        const taxes = await window.electron.ipcRenderer.invoke('get-taxes');
        setList(taxes || []);
    };

    useEffect(() => {
        fetch();
    }, [refresh]);

    const deleteTax = async (id) => {
        if (confirm('Delete this tax rate?')) {
            await window.electron.ipcRenderer.invoke('delete-tax', id);
            fetch();
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        await window.electron.ipcRenderer.invoke('update-tax', editTax);
        setEditTax(null);
        fetch();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditTax({ ...editTax, [name]: value });
    };

    return (
        <div style={cardStyle}>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 mb-4 border-b border-slate-200 pb-3">
                <FaClipboardList className="text-blue-600" /> Configured Tax Rates List
            </h2>

            <div className="overflow-x-auto rounded-xl border border-slate-200 mt-4">
                <table style={tableStyle}>
                    <thead style={tableHeaderStyle}>
                        <tr>
                            <th style={{ ...thStyle, textAlign: 'left' }}>Tax Label</th>
                            <th style={thStyle}>Tax Percentage</th>
                            <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="p-8 text-center text-slate-500 text-sm">No tax rates configured yet.</td>
                            </tr>
                        ) : (
                            list.map((t, index) => (
                                <tr key={t.id} style={tableRowStyle(index)}>
                                    <td style={{ ...tdStyle, textAlign: 'left', fontWeight: '700', color: '#0f172a' }}>{t.tax_label}</td>
                                    <td style={{ ...tdStyle, fontWeight: '700', color: '#2563eb' }}>{t.tax_percentage}%</td>
                                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                                        <button onClick={() => setEditTax(t)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors mr-2"><FaEdit /></button>
                                        <button onClick={() => deleteTax(t.id)} className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"><FaTrash /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {editTax && (
                <div style={modalOverlay}>
                    <div style={modalBox}>
                        <h3 style={modalHeaderStyle}>Edit Tax Rate</h3>
                        <form onSubmit={handleEditSubmit} style={formStyle}>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Tax Label</label>
                                <input name="tax_label" value={editTax.tax_label} onChange={handleChange} placeholder="Tax Label" style={inputStyle} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Tax Percentage</label>
                                <input type="number" name="tax_percentage" value={editTax.tax_percentage} onChange={handleChange} placeholder="Tax Percentage" style={inputStyle} />
                            </div>

                            <div style={{ gridColumn: '1 / span 2', display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                                <button type="button" onClick={() => setEditTax(null)} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl text-sm transition-all">Cancel</button>
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
    marginTop: '20px',
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
    textAlign: 'right',
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

export default TaxList;
