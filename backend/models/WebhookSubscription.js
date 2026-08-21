const mongoose = require('mongoose');

const WebhookSubscriptionSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
  targetUrl: { type: String, required: true },
  events: [{ type: String, required: true }], // ['invoice.created', 'stock.low', 'customer.added', 'payment.received']
  secretKey: { type: String, required: true },
  status: { type: String, enum: ['ACTIVE', 'PAUSED'], default: 'ACTIVE' }
}, { timestamps: true });

module.exports = mongoose.model('WebhookSubscription', WebhookSubscriptionSchema);
