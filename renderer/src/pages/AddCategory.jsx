import { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

const AddCategory = () => {
    const [name, setName] = useState('');
    const [list, setList] = useState([]);
    const [editId, setEditId] = useState(null);

    const fetchCategories = async () => {
        const res = await window.electron.ipcRenderer.invoke('get-categories');
        setList(res);
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
            <h2>📂 Category Management</h2>

            <form onSubmit={handleSubmit} style={formStyle}>
                <input
                    type="text"
                    placeholder="Category Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={inputStyle}
                />
                <button type="submit" style={buttonStyle}>
                    {editId ? '✏️ Update' : '➕ Add'}
                </button>
                {editId && (
                    <button type="button" onClick={() => { setEditId(null); setName(''); }} style={cancelButtonStyle}>
                        ❌ Cancel
                    </button>
                )}
            </form>

            <table style={tableStyle}>
                <thead style={tableHeaderStyle}>
                    <tr>
                        <th style={{ ...thStyle, width: '50px' }}>#</th>
                        <th style={thStyle}>Name</th>
                        <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {list.map((cat, index) => (
                        <tr key={cat.id} style={tableRowStyle(index)}>
                            <td style={tdStyle}>{index + 1}</td>
                            <td style={tdStyle}>{cat.name}</td>
                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                                <button onClick={() => handleEdit(cat)} style={iconButtonStyle}><FaEdit /></button>
                                <button onClick={() => handleDelete(cat.id)} style={iconButtonStyle}><FaTrash /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AddCategory;


const cardStyle = {
    background: '#2D3748',
    padding: '20px',
    borderRadius: '10px',
    color: '#fff',
    marginTop: '20px'
};

const formStyle = {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px'
};

const inputStyle = {
    flex: 1,
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    backgroundColor: '#eeeeee',
    color: '#333',
};

const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
};

const cancelButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#e74c3c'
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
    textAlign: 'left',
    borderBottom: '1px solid #2D3748',
    textTransform: 'uppercase',
    fontSize: '12px',
};

const tableRowStyle = (index) => ({
    backgroundColor: index % 2 === 0 ? '#575F6D' : '#4A5568',
});

const tdStyle = {
    padding: '12px 15px',
    borderBottom: '1px solid #2D3748',
};

const iconButtonStyle = {
    background: 'none',
    border: '1px solid',
    borderRadius: '5px',
    padding: '8px 12px',
    cursor: 'pointer',
    marginRight: '5px',
    transition: 'all 0.3s ease',
    color: '#fff',
};


