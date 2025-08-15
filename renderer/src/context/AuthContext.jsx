import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const currentUser = await window.electron.ipcRenderer.invoke('auth:check');
            setUser(currentUser);
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (username, password) => {
        const result = await window.electron.ipcRenderer.invoke('auth:login', { username, password });
        if (result.success) {
            setUser(result.user);
        }
        return result;
    };

    const logout = async () => {
        await window.electron.ipcRenderer.invoke('auth:logout');
        setUser(null);
    };

    const value = {
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};