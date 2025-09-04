const { ipcMain } = require('electron');
const { networkInterfaces } = require('os');
const { createHash } = require('crypto');

// Function to get the first non-internal MAC address
const getMacAddress = () => {
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === 'IPv4' && !net.internal) {
                return net.mac;
            }
        }
    }
    return null; // Return null if no MAC address found
};

// Function to create a unique, stable machine ID
const getMachineId = () => {
    const macAddress = getMacAddress();
    if (!macAddress) {
        // Fallback to a random ID if MAC address is not available
        // This is not ideal as it won't be stable across app restarts
        return createHash('sha256').update(Math.random().toString()).digest('hex');
    }
    // Hash the MAC address to create a unique and anonymous ID
    return createHash('sha256').update(macAddress).digest('hex');
};

const registerSystemIpcHandlers = function(ipcMain) {
    ipcMain.handle('get-machine-id', async () => {
        try {
            const machineId = getMachineId();
            return { success: true, machineId };
        } catch (error) {
            console.error('Failed to get machine ID:', error);
            return { success: false, message: 'Failed to generate a unique machine ID.' };
        }
    });
};

module.exports = registerSystemIpcHandlers;
module.exports.getMachineId = getMachineId;
