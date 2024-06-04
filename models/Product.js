const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  STYLE: {
    type: String
  },
  FABRIC: {
    type: String
  },
  VENDOR: {
    type: String
  },
  AUDIT: {
    type: String
  },

  XXS: {
    type: Number
  },
  XS: {
    type: Number
  },
  S: {
    type: Number
  },
  M: {
    type: Number
  },
  L: {
    type: Number
  },
  XL: {
    type: Number
  },
  XXL: {
    type: Number
  },
  TOTAL: {
    type: Number
  },

  PODATE: {
    type: Date // Use Date type for order date
  },
  LAB: {
    type: String,
    default: null
  },
  PROTO: {
    type: String,
    default: null
  },
  PPS: {
    type: String
  },
  YARN: {
    type: String,
    default: null
  },

  knittingstartDate: {
    type: String
  },
  knittingendDate: {
    type: String
  },

  dyeingstartDate: {
    type: String
  },
  dyeingendDate: {
    type: String
  },

  cuttingstartDate: {
    type: String
  },
  cuttingendDate: {
    type: String
  },

  emblishmentstartDate: {
    type: String
  },
  emblishmentendDate: {
    type: String
  },
  sewingstartDate: {
    type: String
  },
  sewingendDate: {
    type: String
  },
  finishingstartDate: {
    type: String
  },
  finishingendDate: {
    type: String
  },
  packingstartDate: {
    type: String
  },
  packingendDate: {
    type: String
  },
  AUDIT: {
    type: String,
    default: null
  },
  REMARKS: {
    type: String,
    default: null
  }
});

mongoose.models = {};
module.exports = mongoose.model('Product', productSchema);
