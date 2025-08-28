import { useState } from 'react';
import { FaDatabase, FaUpload, FaDownload } from 'react-icons/fa';
import toast from 'react-hot-toast';

const DatabaseBackup = () => {
    const [isLoading, setIsLoading] = useState(false);

    const handleExport = async () => {
        setIsLoading(true);
        try {
            const result = await window.electron.ipcRenderer.invoke('export-database');
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message || 'Export failed.');
            }
        } catch (error) {
            toast.error(`An error occurred: ${error.message}`);
        }
        setIsLoading(false);
    };

    const handleImport = () => {
        const isConfirmed = window.confirm(
            'Are you sure you want to import a new database?\n\n' +
            'This action will OVERWRITE all current data and cannot be undone. ' +
            'The application will restart automatically after the import.'
        );

        if (isConfirmed) {
            setIsLoading(true);
            // No need to handle success/error here as the app will restart
            window.electron.ipcRenderer.invoke('import-database').catch(err => {
                toast.error(`An error occurred: ${err.message}`);
                setIsLoading(false);
            });
        }
    };

    return (
        <div style={cardStyle}>
            <h2><FaDatabase /> Database Backup & Restore</h2>
            <p style={{ margin: '20px 0' }}>
                Export your database to create a backup file. You can restore your application data at any time by importing this file.
            </p>
            
            <div style={buttonContainerStyle}>
                <button onClick={handleExport} disabled={isLoading} style={exportButtonStyle}>
                    <FaDownload style={{ marginRight: '8px' }} />
                    {isLoading ? 'Exporting...' : 'Export Database'}
                </button>
                
                <button onClick={handleImport} disabled={isLoading} style={importButtonStyle}>
                    <FaUpload style={{ marginRight: '8px' }} />
                    {isLoading ? 'Importing...' : 'Import Database'}
                </button>
            </div>

            <div style={warningStyle}>
                <strong>Warning:</strong> Importing a database will completely overwrite your existing data. This action is irreversible. The application will restart after a successful import.
            </div>
        </div>
    );
};

// Styles
const cardStyle = {
    background: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    color: '#333',
};

const buttonContainerStyle = {
    display: 'flex',
    gap: '20px',
    marginTop: '20px',
};

const baseButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 20px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
};

const exportButtonStyle = {
    ...baseButtonStyle,
    backgroundColor: '#27ae60',
    color: 'white',
};

const importButtonStyle = {
    ...baseButtonStyle,
    backgroundColor: '#c0392b',
    color: 'white',
};

const warningStyle = {
    marginTop: '30px',
    padding: '15px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb',
    borderRadius: '5px',
};

export default DatabaseBackup;
