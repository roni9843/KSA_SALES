import { useState, useEffect } from 'react';

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
                <thead>
                    <tr>
                        <th style={thTdStyle}>#</th>
                        <th style={thTdStyle}>Name</th>
                        <th style={thTdStyle}>🛠️ Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {list.map((cat, index) => (
                        <tr key={cat.id}>
                            <td style={thTdStyle}>{index + 1}</td>
                            <td style={thTdStyle}>{cat.name}</td>
                            <td style={{ ...thTdStyle }}>
                                <div style={actionButtonStyle}>
                                    <button onClick={() => handleEdit(cat)}>✏️</button>
                                    <button onClick={() => handleDelete(cat.id)}>🗑</button>
                                </div>
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
    background: '#2c3e50',
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
    borderCollapse: 'collapse',
    backgroundColor: '#34495e',
    color: '#fff',
    marginTop: '10px'
};

const thTdStyle = {
    padding: '10px 15px',
    borderBottom: '1px solid #2c3e50',
    textAlign: 'left',
};

const actionButtonStyle = {
    display: 'flex',
    gap: '10px',
};

