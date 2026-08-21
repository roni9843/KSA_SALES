/**
 * ZATCA Phase 2 E-Invoicing TLV (Tag-Length-Value) Base64 Encoder
 * Standardized for Saudi Arabia Zakat, Tax and Customs Authority (Fatoora)
 */

function stringToUtf8ByteArray(str) {
    const encoder = new TextEncoder();
    return encoder.encode(str || '');
}

function getTlvTagBuffer(tagNumber, valueString) {
    const valueBytes = stringToUtf8ByteArray(valueString);
    const tagByte = tagNumber;
    const lengthByte = valueBytes.length;

    const tlvBuffer = new Uint8Array(2 + valueBytes.length);
    tlvBuffer[0] = tagByte;
    tlvBuffer[1] = lengthByte;
    tlvBuffer.set(valueBytes, 2);

    return tlvBuffer;
}

/**
 * Generates official ZATCA Base64 TLV string for QR Code rendering
 * @param {Object} params
 * @param {string} params.sellerName - Tag 1
 * @param {string} params.vatNumber - Tag 2 (15-digit VAT ID)
 * @param {string|Date} params.timestamp - Tag 3 (Invoice Date/Time ISO)
 * @param {number|string} params.totalAmount - Tag 4 (Payable Total with 15% VAT)
 * @param {number|string} params.vatAmount - Tag 5 (Total VAT Amount)
 * @returns {string} ZATCA Base64 Encoded TLV String
 */
export function generateZatcaTlvBase64({ sellerName, vatNumber, timestamp, totalAmount, vatAmount }) {
    try {
        const sName = (sellerName || 'Moto POS Merchant').trim();
        const vNum = (vatNumber || '310123456700003').trim();

        let dateStr = '';
        if (timestamp instanceof Date) {
            dateStr = timestamp.toISOString();
        } else if (timestamp) {
            dateStr = new Date(timestamp).toISOString();
        } else {
            dateStr = new Date().toISOString();
        }

        const totalStr = Number(totalAmount || 0).toFixed(2);
        const vatStr = Number(vatAmount || 0).toFixed(2);

        const tlv1 = getTlvTagBuffer(1, sName);
        const tlv2 = getTlvTagBuffer(2, vNum);
        const tlv3 = getTlvTagBuffer(3, dateStr);
        const tlv4 = getTlvTagBuffer(4, totalStr);
        const tlv5 = getTlvTagBuffer(5, vatStr);

        // Concatenate all 5 TLV buffers
        const totalLength = tlv1.length + tlv2.length + tlv3.length + tlv4.length + tlv5.length;
        const combinedBuffer = new Uint8Array(totalLength);

        let offset = 0;
        [tlv1, tlv2, tlv3, tlv4, tlv5].forEach(buf => {
            combinedBuffer.set(buf, offset);
            offset += buf.length;
        });

        // Convert byte array to Binary string for btoa encoding
        let binaryStr = '';
        const len = combinedBuffer.byteLength;
        for (let i = 0; i < len; i++) {
            binaryStr += String.fromCharCode(combinedBuffer[i]);
        }

        return btoa(binaryStr);
    } catch (err) {
        console.error('Error generating ZATCA TLV Base64:', err);
        return '';
    }
}
