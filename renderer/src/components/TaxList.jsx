import { useEffect, useState } from 'react';

const TaxList = ({ refresh }) => {
    const [list, setList] = useState([]);

    const fetch = async () => {
        const taxes = await window.electron.ipcRenderer.invoke('get-taxes');
        setList(taxes);
    };

    useEffect(() => {
        fetch();
    }, [refresh]);

    return (
        <div style={cardStyle}>
            <h3 style={{ textAlign: 'center', fontSize: '24px', marginBottom: '20px' }}>💰 Tax List</h3>
            <table style={tableStyle}>
                <thead style={tableHeaderStyle}>
                    <tr>
                        <th style={{ ...thStyle, textAlign: 'left' }}>Tax Label</th>
                        <th style={thStyle}>Tax Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    {list.map((t, index) => (
                        <tr key={t.id} style={tableRowStyle(index)}>
                            <td style={{ ...tdStyle, textAlign: 'left' }}>{t.tax_label}</td>
                            <td style={tdStyle}>{t.tax_percentage}%</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const cardStyle = {
    background: '#2D3748',
    padding: '20px',
    borderRadius: '10px',
    color: '#fff',
    marginTop: '20px'
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
    textAlign: 'right',
    borderBottom: '1px solid #2D3748',
    textTransform: 'uppercase',
    fontSize: '12px',
};

const tableRowStyle = (index) => ({
    backgroundColor: index % 2 === 0 ? '#575F6D' : '#4A5568',
    borderBottom: '1px solid #2D3748',
});

const tdStyle = {
    padding: '12px 15px',
    textAlign: 'right',
};

export default TaxList;
