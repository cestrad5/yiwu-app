const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
  },
  photoUrl: {
    type: String,
    required: true,
  },
  priceRmb: {
    type: Number,
    required: true,
  },
  unitsPerPackage: {
    type: Number,
    required: true,
  },
  cbmPerPackage: {
    type: Number,
    required: true,
  },
  packagesToOrder: {
    type: Number,
    default: 0,
  },
  shop: String,
  contact: String,
  shopRef: String,
  phone: String,
  measure: String,
  weight: String,
  color: String,
  item: String,
  packagingType: String,
  barcode: String
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
