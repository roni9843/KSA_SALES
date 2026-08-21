import { useState, useEffect } from 'react';
import { FaEdit, FaFolder, FaTrash } from 'react-icons/fa';
import '../App.css';

const AddCategory = () => {
    const [name, setName] = useState('');
    const [list, setList] = useState([]);
    const [editId, setEditId] = useState(null);

    const fetchCategories = async () => {
        const res = await window.electron.ipcRenderer.invoke('get-categories');
        setList(res || []);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        if (editId) {
            await window.electron.ipcRenderer.invoke('update-category', { id: editId, name });
        } else {
            await window.electron.ipcRenderer.invoke('add-category', name);
        }

        setName('');
        setEditId(null);
        fetchCategories();
    };

    const handleEdit = (cat) => {
        setName(cat.name);
        setEditId(cat.id);
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure to delete this category?')) {
            await window.electron.ipcRenderer.invoke('delete-category', id);
            fetchCategories();
        }
    };

    return (
        <div style={cardStyle}>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4 border-b border-slate-200 pb-3">
                <FaFolder className="text-blue-600" /> Category Management
            </h2>

            <form onSubmit={handleSubmit} style={formStyle}>
                <input
                    type="text"
                    placeholder="Category Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={inputStyle}
                />
                <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm text-sm transition-all">
                    {editId ? 'Update' : 'Add Category'}
                </button>
                {editId && (
                    <button type="button" onClick={() => { setEditId(null); setName(''); }} className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl text-sm transition-all">
                        Cancel
                    </button>
                )}
            </form>

            <div className="overflow-x-auto rounded-xl border border-slate-200 mt-4">
                <table style={tableStyle}>
                    <thead style={tableHeaderStyle}>
                        <tr>
                            <th style={{ ...thStyle, width: '50px' }}>#</th>
                            <th style={thStyle}>Category Name</th>
                            <th style={{ ...thStyle, textAlign: 'center', width: '120px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="p-8 text-center text-slate-500 text-sm">No categories found. Add one above!</td>
                            </tr>
                        ) : (
                            list.map((cat, index) => (
                                <tr key={cat.id} style={tableRowStyle(index)}>
                                    <td style={tdStyle}>{index + 1}</td>
                                    <td style={{ ...tdStyle, fontWeight: '600' }}>{cat.name}</td>
                                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                                        <button onClick={() => handleEdit(cat)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors mr-2"><FaEdit /></button>
                                        <button onClick={() => handleDelete(cat.id)} className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"><FaTrash /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AddCategory;

const cardStyle = {
    background: '#ffffff',
    padding: '24px',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    color: '#0f172a',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
};

const formStyle = {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px'
};

const inputStyle = {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '12px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    fontSize: '14px',
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
    color: '#0f172a',
    fontSize: '14px',
};
