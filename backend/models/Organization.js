const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  mission: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true,
    default: '/images/default-org.png'
  },
  carouselImages: [{
    type: String
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  paymentInfo: {
    upiId: { type: String, trim: true },
    bankName: { type: String, trim: true },
    accountNumber: { type: String, trim: true },
    ifscCode: { type: String, trim: true }
  },
  stats: [{
    label: { type: String, default: 'Impact Metric' },
    value: { type: String, default: '0' }
  }],
  views: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Organization', organizationSchema);
