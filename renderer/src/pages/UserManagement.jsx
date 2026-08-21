import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FaUserShield, FaPlus, FaSave } from 'react-icons/fa';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userRoles, setUserRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', password: '' });

    const fetchUsers = useCallback(async () => {
        const fetchedUsers = await window.electron.ipcRenderer.invoke('get-users');
        setUsers(fetchedUsers || []);
    }, []);

    const fetchRoles = useCallback(async () => {
        const fetchedRoles = await window.electron.ipcRenderer.invoke('get-roles');
        setRoles(fetchedRoles || []);
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
                setUserRoles(fetchedRoles || []);
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
        toast.success('User roles updated successfully!');
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        if (!newUser.username || !newUser.password) {
            toast.error('Username and password are required.');
            return;
        }
        await window.electron.ipcRenderer.invoke('add-user', newUser);
        setNewUser({ username: '', password: '' });
        fetchUsers();
        toast.success('User added successfully!');
    };

    return (
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
                <FaUserShield className="text-blue-600" /> User Management
            </h1>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Users List Box */}
                <div className="w-full lg:w-1/3 bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                    <h2 className="text-sm font-extrabold uppercase text-slate-700 tracking-wider">System Users</h2>
                    <div className="space-y-1.5">
                        {users.map(user => {
                            const isSelected = selectedUser?.id === user.id;
                            return (
                                <div
                                    key={user.id}
                                    onClick={() => setSelectedUser(user)}
                                    className={`px-4 py-3 rounded-xl cursor-pointer font-bold text-sm transition-all ${
                                        isSelected
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                                            : 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-100'
                                    }`}
                                >
                                    {user.username}
                                </div>
                            );
                        })}
                    </div>

                    <hr className="border-slate-200 my-4" />

                    <h3 className="text-xs font-extrabold uppercase text-slate-600 tracking-wider">Add Staff User</h3>
                    <form onSubmit={handleAddUser} className="space-y-3">
                        <input
                            type="text"
                            placeholder="Username"
                            value={newUser.username}
                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:border-blue-600"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:border-blue-600"
                        />
                        <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2">
                            <FaPlus /> Add User
                        </button>
                    </form>
                </div>

                {/* Role Assignment Box */}
                <div className="w-full lg:w-2/3 bg-slate-50 border border-slate-200 rounded-2xl p-6">
                    {selectedUser ? (
                        <div className="space-y-4">
                            <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-200 pb-3">
                                Assign Roles for <span className="text-blue-600">{selectedUser.username}</span>
                            </h2>
                            {isLoading ? <p className="text-sm text-slate-500">Loading roles...</p> : (
                                <div className="space-y-3">
                                    {roles.map(role => (
                                        <label key={role.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={userRoles.includes(role.id)}
                                                onChange={() => handleRoleChange(role.id)}
                                                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-sm font-bold text-slate-800">{role.name}</span>
                                        </label>
                                    ))}
                                    <button
                                        onClick={handleSaveChanges}
                                        disabled={isLoading}
                                        className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center gap-2"
                                    >
                                        <FaSave /> Save Role Permissions
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-12 text-center text-slate-400 text-sm font-medium">
                            Select a user from the left list to assign roles & permissions.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserManagement;