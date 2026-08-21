import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FaUserShield, FaPlus, FaSave } from 'react-icons/fa';

const RoleManagement = () => {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [rolePermissions, setRolePermissions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');

    const fetchRoles = useCallback(async () => {
        const fetchedRoles = await window.electron.ipcRenderer.invoke('get-roles');
        setRoles(fetchedRoles || []);
    }, []);

    const fetchPermissions = useCallback(async () => {
        const fetchedPermissions = await window.electron.ipcRenderer.invoke('get-permissions');
        setPermissions(fetchedPermissions || []);
    }, []);

    useEffect(() => {
        fetchRoles();
        fetchPermissions();
    }, [fetchRoles, fetchPermissions]);

    useEffect(() => {
        const fetchRolePermissions = async () => {
            if (selectedRole) {
                setIsLoading(true);
                const fetchedPermissions = await window.electron.ipcRenderer.invoke('get-role-permissions', selectedRole.id);
                setRolePermissions(fetchedPermissions || []);
                setIsLoading(false);
            }
        };
        fetchRolePermissions();
    }, [selectedRole]);

    const handlePermissionChange = (permissionId) => {
        setRolePermissions(prev =>
            prev.includes(permissionId)
                ? prev.filter(id => id !== permissionId)
                : [...prev, permissionId]
        );
    };

    const handleSaveChanges = async () => {
        if (!selectedRole) return;
        setIsLoading(true);
        await window.electron.ipcRenderer.invoke('update-role-permissions', {
            roleId: selectedRole.id,
            roleName: selectedRole.name,
            permissionIds: rolePermissions
        });
        setIsLoading(false);
        toast.success('Permissions updated successfully!');
    };

    const handleAddRole = async (e) => {
        e.preventDefault();
        if (!newRoleName.trim()) {
            toast.error('Role name cannot be empty.');
            return;
        }
        await window.electron.ipcRenderer.invoke('add-role', newRoleName);
        setNewRoleName('');
        fetchRoles();
        toast.success(`Role '${newRoleName}' added successfully!`);
    };

    return (
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
                <FaUserShield className="text-blue-600" /> Role & Permission Management
            </h1>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Roles List Box */}
                <div className="w-full lg:w-1/3 bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                    <h2 className="text-sm font-extrabold uppercase text-slate-700 tracking-wider">User Roles</h2>
                    <div className="space-y-1.5">
                        {roles.map(role => {
                            const isSelected = selectedRole?.id === role.id;
                            return (
                                <div
                                    key={role.id}
                                    onClick={() => setSelectedRole(role)}
                                    className={`px-4 py-3 rounded-xl cursor-pointer font-bold text-sm transition-all ${
                                        isSelected
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                                            : 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-100'
                                    }`}
                                >
                                    {role.name}
                                </div>
                            );
                        })}
                    </div>

                    <hr className="border-slate-200 my-4" />

                    <h3 className="text-xs font-extrabold uppercase text-slate-600 tracking-wider">Create New Role</h3>
                    <form onSubmit={handleAddRole} className="space-y-3">
                        <input
                            type="text"
                            placeholder="New role name"
                            value={newRoleName}
                            onChange={(e) => setNewRoleName(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:border-blue-600"
                        />
                        <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2">
                            <FaPlus /> Add Role
                        </button>
                    </form>
                </div>

                {/* Permissions Matrix Box */}
                <div className="w-full lg:w-2/3 bg-slate-50 border border-slate-200 rounded-2xl p-6">
                    {selectedRole ? (
                        <div className="space-y-4">
                            <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-200 pb-3">
                                Permissions for Role: <span className="text-blue-600">{selectedRole.name}</span>
                            </h2>
                            {isLoading ? <p className="text-sm text-slate-500">Loading permissions...</p> : (
                                <div className="space-y-3">
                                    {permissions.map(permission => (
                                        <label key={permission.id} className="block p-3.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={rolePermissions.includes(permission.id)}
                                                    onChange={() => handlePermissionChange(permission.id)}
                                                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                                />
                                                <span className="text-sm font-bold text-slate-900">{permission.name}</span>
                                            </div>
                                            {permission.description && (
                                                <p className="text-xs text-slate-500 ml-7 mt-0.5">{permission.description}</p>
                                            )}
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
                            Select a role from the left list to configure its permissions.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoleManagement;