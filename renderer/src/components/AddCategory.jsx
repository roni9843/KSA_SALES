import React, { useState } from 'react';

function AddCategory() {
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');

    const handleAdd = async () => {
        if (!name.trim()) return;
        try {
            const result = await window.electron.ipcRenderer.invoke('add-category', name);
            if (result.success) {
                setMessage('Category added successfully with ID: ' + result.id);
                setName('');
            }
        } catch (err) {
            setMessage('Error: ' + err);
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
        </div>
    );
}

export default AddCategory;
