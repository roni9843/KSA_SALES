/**
 * ZATCA Saudi Arabia Phase 2 QR Code Generator Service
 * Encodes Seller Name, VAT Number, Timestamp, Total, and VAT Total into TLV (Tag-Length-Value) Base64 format.
 */

function getTlvTagBuffer(tag, value) {
    const valBuf = Buffer.from(value, 'utf8');
    const tagBuf = Buffer.from([tag]);
    const lenBuf = Buffer.from([valBuf.length]);
    return Buffer.concat([tagBuf, lenBuf, valBuf]);
}

function generateZatcaQrCode({ sellerName, vatNumber, timestamp, totalAmount, vatAmount }) {
    try {
        const tag1 = getTlvTagBuffer(1, sellerName || 'KSA Enterprise POS');
        const tag2 = getTlvTagBuffer(2, vatNumber || '310123456700003');
        const tag3 = getTlvTagBuffer(3, new Date(timestamp || Date.now()).toISOString());
        const tag4 = getTlvTagBuffer(4, parseFloat(totalAmount || 0).toFixed(2));
        const tag5 = getTlvTagBuffer(5, parseFloat(vatAmount || 0).toFixed(2));

        const qrBuffer = Buffer.concat([tag1, tag2, tag3, tag4, tag5]);
        return qrBuffer.toString('base64');
    } catch (error) {
        console.error('Error generating ZATCA QR Code:', error);
        return '';
    }
}

module.exports = {
    generateZatcaQrCode
};
