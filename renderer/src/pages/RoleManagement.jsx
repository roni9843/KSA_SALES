import { useState, useEffect, useCallback } from 'react';

const RoleManagement = () => {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [rolePermissions, setRolePermissions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchRoles = useCallback(async () => {
        const fetchedRoles = await window.electron.ipcRenderer.invoke('get-roles');
        setRoles(fetchedRoles);
    }, []);

    const fetchPermissions = useCallback(async () => {
        const fetchedPermissions = await window.electron.ipcRenderer.invoke('get-permissions');
        setPermissions(fetchedPermissions);
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
                setRolePermissions(fetchedPermissions);
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
            permissionIds: rolePermissions
        });
        setIsLoading(false);
        alert('Permissions updated successfully!');
    };

    // Styles
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
    const permissionsContainerStyle = { flex: 2, border: '1px solid #ccc', borderRadius: '8px', padding: '20px' };
    const checkboxLabelStyle = { display: 'block', margin: '10px 0', cursor: 'pointer' };
    const saveButtonStyle = { background: '#282A35', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '20px' };

    return (
        <div>
            <h1 style={{color: '#333'}}>Role Management</h1>
            <div style={containerStyle}>
                <div style={listContainerStyle}>
                    <h2>Roles</h2>
                    {roles.map(role => (
                        <div
                            key={role.id}
                            style={listItemStyle(selectedRole?.id === role.id)}
                            onClick={() => setSelectedRole(role)}
                        >
                            {role.name}
                        </div>
                    ))}
                </div>

                <div style={permissionsContainerStyle}>
                    {selectedRole ? (
                        <>
                            <h2>Permissions for {selectedRole.name}</h2>
                            {isLoading ? <p>Loading...</p> : (
                                <div>
                                    {permissions.map(permission => (
                                        <label key={permission.id} style={checkboxLabelStyle}>
                                            <input
                                                type="checkbox"
                                                checked={rolePermissions.includes(permission.id)}
                                                onChange={() => handlePermissionChange(permission.id)}
                                                style={{ marginRight: '10px' }}
                                            />
                                            {permission.name}
                                            <p style={{fontSize: '0.8em', color: '#666', margin: '0 0 0 25px'}}>{permission.description}</p>
                                        </label>
                                    ))}
                                    <button onClick={handleSaveChanges} style={saveButtonStyle} disabled={isLoading}>
                                        Save Changes
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <p>Select a role to see its permissions.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoleManagement;