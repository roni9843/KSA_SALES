const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { protect, authorize } = require('../middleware/auth');

// Helper to format settings object with both camelCase and snake_case aliases
function formatSettingsResponse(doc) {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    ...obj,
    shop_name: obj.shopName || obj.shop_name || '',
    shop_address: obj.shopAddress || obj.shop_address || '',
    shop_phone: obj.shopPhone || obj.shop_phone || '',
    shop_email: obj.shopEmail || obj.shop_email || '',
    shop_logo: obj.shopLogo || obj.shop_logo || '',
    tax_number: obj.taxNumber || obj.tax_number || '310123456700003',
    zatca_environment: obj.zatcaEnvironment || obj.zatca_environment || 'sandbox',
    zatca_otp: obj.zatcaOtp || obj.zatca_otp || '',
    zatca_connected: obj.zatcaConnected ?? obj.zatca_connected ?? false,
    zatcaConnected: obj.zatcaConnected ?? obj.zatca_connected ?? false,
    zatcaEnvironment: obj.zatcaEnvironment || obj.zatca_environment || 'sandbox',
    zatcaOtp: obj.zatcaOtp || obj.zatca_otp || ''
  };
}

// @route   GET /api/settings
// @desc    Get store settings
router.get('/', protect, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json({ success: true, settings: formatSettingsResponse(settings) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/settings
// @desc    Update store settings
router.put('/', protect, authorize('page:view:my-company'), async (req, res) => {
  try {
    let settings = await Settings.findOne();

    const updateData = {
      ...(req.body.shop_name && { shopName: req.body.shop_name }),
      ...(req.body.shopName && { shopName: req.body.shopName }),
      ...(req.body.shop_address && { shopAddress: req.body.shop_address }),
      ...(req.body.shopAddress && { shopAddress: req.body.shopAddress }),
      ...(req.body.shop_phone && { shopPhone: req.body.shop_phone }),
      ...(req.body.shopPhone && { shopPhone: req.body.shopPhone }),
      ...(req.body.shop_email && { shopEmail: req.body.shop_email }),
      ...(req.body.shopEmail && { shopEmail: req.body.shopEmail }),
      ...(req.body.shop_logo !== undefined && { shopLogo: req.body.shop_logo }),
      ...(req.body.shopLogo !== undefined && { shopLogo: req.body.shopLogo }),
      ...(req.body.tax_number && { taxNumber: req.body.tax_number }),
      ...(req.body.taxNumber && { taxNumber: req.body.taxNumber }),
      ...(req.body.language && { language: req.body.language }),
      ...(req.body.writing_direction && { writingDirection: req.body.writing_direction }),
      ...(req.body.color_scheme && { colorScheme: req.body.color_scheme }),
      ...(req.body.zatca_environment && { zatcaEnvironment: req.body.zatca_environment }),
      ...(req.body.zatcaEnvironment && { zatcaEnvironment: req.body.zatcaEnvironment }),
      ...(req.body.zatca_otp && { zatcaOtp: req.body.zatca_otp }),
      ...(req.body.zatcaOtp && { zatcaOtp: req.body.zatcaOtp }),
      ...(req.body.zatcaConnected !== undefined && { zatcaConnected: req.body.zatcaConnected }),
      ...(req.body.zatca_connected !== undefined && { zatcaConnected: req.body.zatca_connected })
    };

    if (!settings) {
      settings = await Settings.create(updateData);
    } else {
      settings = await Settings.findByIdAndUpdate(
        settings._id,
        { $set: updateData },
        { new: true }
      );
    }
    res.json({ success: true, settings: formatSettingsResponse(settings) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/settings/zatca-connect
// @desc    Connect & Onboard Merchant to Saudi ZATCA Government Portal via OTP
router.post('/zatca-connect', protect, async (req, res) => {
  try {
    const { otp, environment } = req.body;
    const zatcaService = require('../services/zatcaService');

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    const onboardResult = await zatcaService.onboardZatcaMerchant({
      otp,
      environment: environment || 'sandbox',
      shopName: settings.shopName,
      vatNumber: settings.taxNumber
    });

    settings.zatcaOtp = otp;
    settings.zatcaEnvironment = environment || 'sandbox';
    settings.zatcaBinaryToken = onboardResult.zatcaBinaryToken;
    settings.zatcaSecret = onboardResult.zatcaSecret;
    settings.zatcaConnected = true;
    settings.zatcaRegisteredAt = new Date();

    await settings.save();

    res.json({
      success: true,
      message: 'Successfully connected & registered with Saudi ZATCA Government Server!',
      settings: formatSettingsResponse(settings)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
