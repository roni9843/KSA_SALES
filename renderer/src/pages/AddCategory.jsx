import { useState, useEffect } from 'react';
import { FaEdit, FaFolder, FaTrash } from 'react-icons/fa';
import '../App.css';

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
            <h2><FaFolder /> Category Management</h2>

            <form onSubmit={handleSubmit} style={formStyle}>
                <input
                    type="text"
                    placeholder="Category Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={inputStyle}
                />
                <button type="submit" className="default-button">
                    {editId ? 'Update' : 'Add'}
                </button>
                {editId && (
                    <button type="button" onClick={() => { setEditId(null); setName(''); }} className="default-button">
                        Cancel
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
                                <button onClick={() => handleEdit(cat)} className="action-button"><FaEdit /></button>
                                <button onClick={() => handleDelete(cat.id)} className="action-button"><FaTrash /></button>
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
    borderRadius: '4px',
    color: '#fff'
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




