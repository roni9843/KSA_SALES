const mongoose = require('mongoose');

const ApiKeySchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
  keyName: { type: String, required: true },
  keySecret: { type: String, required: true, unique: true }, // e.g. sec_live_...
  permissions: [{ type: String }], // e.g. ['read:products', 'write:invoices']
  rateLimitPerMin: { type: Number, default: 100 },
  status: { type: String, enum: ['ACTIVE', 'REVOKED'], default: 'ACTIVE' },
  lastUsedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('ApiKey', ApiKeySchema);
