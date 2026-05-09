const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    default: 'Technology'
  },
  goalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  raisedAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  image: {
    type: String,
    required: true,
    default: '/images/default-org.png'
  },
  gallery: [{
    type: String
  }],
  deadline: {
    type: Date,
    required: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  views: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Virtual to calculate if the campaign is active
campaignSchema.virtual('isActive').get(function() {
  return new Date() < this.deadline;
});

module.exports = mongoose.model('Campaign', campaignSchema);
