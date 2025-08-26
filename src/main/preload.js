const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    getSettings: () => ipcRenderer.invoke('get-settings'),
    updateSettings: (settings) => ipcRenderer.invoke('update-settings', settings),
    getDashboardData: () => ipcRenderer.invoke('get-dashboard-data'),
    getWeeklySummary: () => ipcRenderer.invoke('get-weekly-summary'),
    getRecentInvoices: () => ipcRenderer.invoke('get-recent-invoices'),
    getTopSellingProducts: () => ipcRenderer.invoke('get-top-selling-products'),
    ipcRenderer: {
        invoke: (channel, data) => ipcRenderer.invoke(channel, data),
        on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
    },
});
