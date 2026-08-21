const crypto = require('crypto');
const WebhookSubscription = require('../models/WebhookSubscription');

/**
 * Dispatch Webhook Event to all active subscribers
 * @param {string} eventName - e.g. 'invoice.created', 'stock.low'
 * @param {object} payload - Data payload object
 */
const dispatchWebhookEvent = async (eventName, payload) => {
  try {
    const subscriptions = await WebhookSubscription.find({
      events: eventName,
      status: 'ACTIVE'
    });

    if (subscriptions.length === 0) return;

    for (const sub of subscriptions) {
      const dataString = JSON.stringify({
        event: eventName,
        timestamp: new Date().toISOString(),
        data: payload
      });

      // Generate HMAC SHA-256 Signature
      const signature = crypto
        .createHmac('sha256', sub.secretKey)
        .update(dataString)
        .digest('hex');

      // Dispatch async HTTP POST request
      fetch(sub.targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': eventName
        },
        body: dataString
      }).catch(err => console.error(`Webhook delivery failed to ${sub.targetUrl}:`, err.message));
    }
  } catch (err) {
    console.error('Error in dispatchWebhookEvent:', err.message);
  }
};

module.exports = { dispatchWebhookEvent };
