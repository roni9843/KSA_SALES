const ApiKey = require('../models/ApiKey');

const apiKeyAuth = async (req, res, next) => {
  const apiKeySecret = req.headers['x-api-key'] || req.headers['X-API-KEY'];

  if (!apiKeySecret) {
    return res.status(401).json({ success: false, message: 'API Key missing. Pass X-API-KEY header.' });
  }

  try {
    const keyRecord = await ApiKey.findOne({ keySecret: apiKeySecret, status: 'ACTIVE' });
    if (!keyRecord) {
      return res.status(403).json({ success: false, message: 'Invalid or Revoked API Key.' });
    }

    keyRecord.lastUsedAt = new Date();
    await keyRecord.save();

    req.apiKey = keyRecord;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = apiKeyAuth;
