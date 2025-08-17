const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    getDashboardData: () => ipcRenderer.invoke('get-dashboard-data'),
    getWeeklySummary: () => ipcRenderer.invoke('get-weekly-summary'),
    ipcRenderer: {
        invoke: (channel, data) => ipcRenderer.invoke(channel, data),
        on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
    },
});
