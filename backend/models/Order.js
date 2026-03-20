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
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
