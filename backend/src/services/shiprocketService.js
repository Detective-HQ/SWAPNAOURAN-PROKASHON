const axios = require('axios');
const env = require('../config/env');

const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/payload';

let shiprocketToken = null;
let tokenExpiry = null;

const authenticateShiprocket = async () => {
  if (!env.shiprocketEmail || !env.shiprocketPassword) {
    throw new Error('Shiprocket credentials not configured');
  }

  // Reuse token if still valid (tokens usually last 10 days, but we refresh if older than 24h)
  if (shiprocketToken && tokenExpiry && new Date() < tokenExpiry) {
    return shiprocketToken;
  }

  try {
    const response = await axios.post(`${SHIPROCKET_BASE_URL}/auth/login`, {
      email: env.shiprocketEmail,
      password: env.shiprocketPassword
    });

    shiprocketToken = response.data.token;
    // Set expiry to 24 hours from now
    tokenExpiry = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    return shiprocketToken;
  } catch (error) {
    console.error('Shiprocket Auth Error:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with Shiprocket');
  }
};

const createShiprocketOrder = async (order, userDetails) => {
  const token = await authenticateShiprocket();
  
  // Basic payload matching Shiprocket's required custom order format
  const payload = {
    order_id: order.id,
    order_date: new Date(order.createdAt).toISOString().split('T')[0],
    pickup_location: "Primary", // Must match the pickup location registered in Shiprocket dashboard
    billing_customer_name: order.shippingAddress?.name || userDetails?.fullName || "Customer",
    billing_last_name: "",
    billing_address: order.shippingAddress?.address || "Address",
    billing_city: order.shippingAddress?.city || "City",
    billing_pincode: order.shippingAddress?.pincode || "000000",
    billing_state: order.shippingAddress?.state || "State",
    billing_country: "India",
    billing_email: order.shippingAddress?.email || userDetails?.email || "customer@example.com",
    billing_phone: order.shippingAddress?.phone || "0000000000",
    shipping_is_billing: true,
    order_items: order.items.map(item => ({
      name: item.book.title,
      sku: item.book.id.substring(0, 10),
      units: item.quantity,
      selling_price: item.price,
      discount: "",
      tax: "",
      hsn: ""
    })),
    payment_method: "Prepaid", // Assuming all orders are prepaid via Razorpay
    shipping_charges: 0,
    giftwrap_charges: 0,
    transaction_charges: 0,
    total_discount: 0,
    sub_total: order.totalAmount,
    length: 10,
    breadth: 15,
    height: 20,
    weight: 0.5 * order.items.length // Default 500g per book if not specified
  };

  try {
    const response = await axios.post(`${SHIPROCKET_BASE_URL}/orders/create/adhoc`, payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return {
      shiprocketOrderId: response.data.order_id,
      shipmentId: response.data.shipment_id,
      status: response.data.status,
      awbCode: response.data.awb_code
    };
  } catch (error) {
    console.error('Shiprocket Create Order Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to create order in Shiprocket');
  }
};

module.exports = {
  authenticateShiprocket,
  createShiprocketOrder
};
