const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const ApiKey = require('../models/ApiKey');
const WebhookSubscription = require('../models/WebhookSubscription');
const { protect } = require('../middleware/auth');
const apiKeyAuth = require('../middleware/apiKeyAuth');

// --- MANAGEMENT ROUTES (JWT PROTECTED) ---

// @route   GET /api/developers/keys
// @desc    Get all developer API keys
router.get('/keys', protect, async (req, res) => {
  try {
    const keys = await ApiKey.find().sort({ createdAt: -1 });
    res.json({ success: true, keys });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/developers/keys
// @desc    Generate a new Developer API Key
router.post('/keys', protect, async (req, res) => {
  try {
    const { keyName, permissions } = req.body;
    const randomSecret = 'sec_live_' + crypto.randomBytes(20).toString('hex');

    const apiKey = await ApiKey.create({
      keyName,
      keySecret: randomSecret,
      permissions: permissions || ['read:products', 'read:invoices', 'write:invoices']
    });

    res.status(201).json({ success: true, apiKey });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/developers/keys/:id/revoke
// @desc    Revoke an API Key
router.put('/keys/:id/revoke', protect, async (req, res) => {
  try {
    const apiKey = await ApiKey.findByIdAndUpdate(
      req.params.id,
      { status: 'REVOKED' },
      { new: true }
    );
    res.json({ success: true, apiKey });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/developers/webhooks
// @desc    Get all webhook subscriptions
router.get('/webhooks', protect, async (req, res) => {
  try {
    const webhooks = await WebhookSubscription.find().sort({ createdAt: -1 });
    res.json({ success: true, webhooks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/developers/webhooks
// @desc    Create a new Webhook Subscription
router.post('/webhooks', protect, async (req, res) => {
  try {
    const { targetUrl, events } = req.body;
    const secretKey = 'whsec_' + crypto.randomBytes(16).toString('hex');

    const webhook = await WebhookSubscription.create({
      targetUrl,
      events,
      secretKey
    });

    res.status(201).json({ success: true, webhook });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- OPEN API V1 ENDPOINTS (X-API-KEY PROTECTED FOR EXTERNAL INTEGRATIONS) ---

// @route   GET /api/developers/v1/ping
// @desc    Test ping external API connection
router.get('/v1/ping', apiKeyAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Moto POS Cloud Open API v1 is active and authenticated!',
    keyName: req.apiKey.keyName
  });
});

module.exports = router;
