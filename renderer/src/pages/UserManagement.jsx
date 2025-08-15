import { useState, useEffect, useCallback } from 'react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userRoles, setUserRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', password: '' });

    const fetchUsers = useCallback(async () => {
        const fetchedUsers = await window.electron.ipcRenderer.invoke('get-users');
        setUsers(fetchedUsers);
    }, []);

    const fetchRoles = useCallback(async () => {
        const fetchedRoles = await window.electron.ipcRenderer.invoke('get-roles');
        setRoles(fetchedRoles);
    }, []);

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, [fetchUsers, fetchRoles]);

    useEffect(() => {
        const fetchUserRoles = async () => {
            if (selectedUser) {
                setIsLoading(true);
                const fetchedRoles = await window.electron.ipcRenderer.invoke('get-user-roles', selectedUser.id);
                setUserRoles(fetchedRoles);
                setIsLoading(false);
            }
        };
        fetchUserRoles();
    }, [selectedUser]);

    const handleRoleChange = (roleId) => {
        setUserRoles(prev =>
            prev.includes(roleId)
                ? prev.filter(id => id !== roleId)
                : [...prev, roleId]
        );
    };

    const handleSaveChanges = async () => {
        if (!selectedUser) return;
        setIsLoading(true);
        await window.electron.ipcRenderer.invoke('update-user-roles', {
            userId: selectedUser.id,
            roleIds: userRoles
        });
        setIsLoading(false);
        alert('User roles updated successfully!');
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        if (!newUser.username || !newUser.password) {
            alert('Username and password are required.');
            return;
        }
        await window.electron.ipcRenderer.invoke('add-user', newUser);
        setNewUser({ username: '', password: '' });
        fetchUsers(); // Refresh user list
        alert('User added successfully!');
    };

    // Styles are similar to RoleManagement for consistency
    const containerStyle = { display: 'flex', gap: '20px', padding: '20px', fontFamily: 'Arial, sans-serif', color: '#333' };
    const listContainerStyle = { flex: 1, border: '1px solid #ccc', borderRadius: '8px', padding: '10px' };
    const listItemStyle = (isSelected) => ({
        padding: '10px',
        margin: '5px 0',
        borderRadius: '4px',
        cursor: 'pointer',
        background: isSelected ? '#282A35' : '#f0f0f0',
        color: isSelected ? 'white' : '#333'
    });
    const rolesContainerStyle = { flex: 2, border: '1px solid #ccc', borderRadius: '8px', padding: '20px' };
    const checkboxLabelStyle = { display: 'block', margin: '10px 0', cursor: 'pointer' };
    const saveButtonStyle = { background: '#282A35', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '20px' };
    const formInputStyle = { padding: '8px', margin: '5px 0', width: 'calc(100% - 16px)' };

    return (
        <div>
            <h1 style={{color: '#333'}}>User Management</h1>
            <div style={containerStyle}>
                <div style={listContainerStyle}>
                    <h2>Users</h2>
                    {users.map(user => (
                        <div
                            key={user.id}
                            style={listItemStyle(selectedUser?.id === user.id)}
                            onClick={() => setSelectedUser(user)}
                        >
                            {user.username}
                        </div>
                    ))}
                    <hr />
                    <h3>Add New User</h3>
                    <form onSubmit={handleAddUser}>
                        <input
                            type="text"
                            placeholder="Username"
                            value={newUser.username}
                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                            style={formInputStyle}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            style={formInputStyle}
                        />
                        <button type="submit" style={{...saveButtonStyle, marginTop: '10px'}}>Add User</button>
                    </form>
                </div>

                <div style={rolesContainerStyle}>
                    {selectedUser ? (
                        <>
                            <h2>Roles for {selectedUser.username}</h2>
                            {isLoading ? <p>Loading...</p> : (
                                <div>
                                    {roles.map(role => (
                                        <label key={role.id} style={checkboxLabelStyle}>
                                            <input
                                                type="checkbox"
                                                checked={userRoles.includes(role.id)}
                                                onChange={() => handleRoleChange(role.id)}
                                                style={{ marginRight: '10px' }}
                                            />
                                            {role.name}
                                        </label>
                                    ))}
                                    <button onClick={handleSaveChanges} style={saveButtonStyle} disabled={isLoading}>
                                        Save Changes
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <p>Select a user to see their roles.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserManagement;