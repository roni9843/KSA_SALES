import React, { useState, useEffect } from 'react';

function AddCategory() {
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [categories, setCategories] = useState([]);

    const loadCategories = async () => {
        try {
            const result = await window.electron.ipcRenderer.invoke('get-categories');
            setCategories(result);
        } catch (err) {
            console.error('Error loading categories:', err);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const handleAdd = async () => {
        if (!name.trim()) return;
        try {
            const result = await window.electron.ipcRenderer.invoke('add-category', name);
            if (result.success) {
                setMessage('Category added successfully');
                setName('');
                loadCategories(); // রিফ্রেশ
            }
        } catch (err) {
            setMessage('Error: ' + err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        try {
            const result = await window.electron.ipcRenderer.invoke('delete-category', id);
            if (result.success) {
                setMessage('Category deleted');
                loadCategories(); // রিফ্রেশ
            }
        } catch (err) {
            setMessage('Error deleting: ' + err);
        }
    };

    return (
        <div>
            <h2>Add Product Category</h2>
            <input
                type="text"
                value={name}
                placeholder="Category Name"
                onChange={(e) => setName(e.target.value)}
            />
            <button onClick={handleAdd}>Add</button>
            <p>{message}</p>

            <h3>Category List</h3>
            <table border="1" cellPadding="6" style={{ marginTop: '10px' }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Created</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map((cat) => (
                        <tr key={cat.id}>
                            <td>{cat.id}</td>
                            <td>{cat.name}</td>
                            <td>{cat.created_at}</td>
                            <td>
                                <button onClick={() => handleDelete(cat.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                    {categories.length === 0 && (
                        <tr>
                            <td colSpan="4">No categories found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default AddCategory;
