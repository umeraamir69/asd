const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  endDate: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        return value > Date.now();
      },
      message: 'End date must be in the future'
    }
  },
  description: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: [
      'pending', 'deleted', 'active'
    ],
    default: 'pending'
  },
  products: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }
    ], // Array of product IDs with reference to the 'Product' model
  }
}, {timestamps: true});

mongoose.models = {}
module.exports = mongoose.model('Order', orderSchema);
