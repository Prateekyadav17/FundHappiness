const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');
const Organization = require('../models/Organization');
const { protect } = require('../middleware/authMiddleware');
const sendEmail = require('../utils/emailService');

// @desc    Create a Razorpay Order
// @route   POST /api/donations/create-order
// @access  Private
router.post('/create-order', protect, async (req, res) => {
  try {
    const { amount, campaignId, organizationId } = req.body;

    if (!amount || (!campaignId && !organizationId)) {
      return res.status(400).json({ message: 'Amount and (Campaign ID or Organization ID) are required' });
    }

    const options = {
      amount: Math.round(amount * 100), // amount in paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: {
        campaignId: campaignId || '',
        organizationId: organizationId || '',
        userId: req.user.id
      }
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Razorpay Error', error: error.message });
  }
});

// @desc    Record a successful donation
// @route   POST /api/donations/record
// @access  Private
router.post('/record', protect, async (req, res) => {
  try {
    const { campaignId, organizationId, amount, paymentId } = req.body;

    let targetName = 'Initiative';
    let targetOrg = null;

    if (campaignId) {
      const campaign = await Campaign.findById(campaignId).populate('organization');
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }
      campaign.raisedAmount += Number(amount);
      await campaign.save();
      targetName = campaign.title;
      targetOrg = campaign.organization;
    } else if (organizationId) {
      targetOrg = await Organization.findById(organizationId);
      if (targetOrg) targetName = targetOrg.name;
    }

    // Create donation record
    const donation = await Donation.create({
      campaign: campaignId || null,
      organization: organizationId || (targetOrg ? targetOrg._id : null),
      user: req.user.id,
      amount,
      paymentId
    });

    // Send Thank You Email
    if (req.user.email) {
      try {
        await sendEmail({
          email: req.user.email,
          subject: `Thank you for your support - FundHappiness`,
          message: `Hi ${req.user.name || 'there'},\n\nThank you for your generous donation of ₹${amount} towards ${targetName}.\n\nYour contribution makes a real difference!\n\nBest regards,\nFundHappiness Team`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #4caf50;">Thank You for Your Support!</h2>
              <p>Hi <strong>${req.user.name || 'Supporter'}</strong>,</p>
              <p>We've received your generous donation of <strong>₹${amount}</strong> towards <strong>${targetName}</strong>.</p>
              <p>Your contribution helps us continue our mission of spreading happiness and support to those who need it most.</p>
              <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Donation Details:</strong></p>
                <p style="margin: 5px 0;">Amount: ₹${amount}</p>
                <p style="margin: 5px 0;">Transaction ID: ${paymentId}</p>
                <p style="margin: 5px 0;">Date: ${new Date().toLocaleDateString()}</p>
              </div>
              <p>Best regards,<br><strong>FundHappiness Team</strong></p>
            </div>
          `
        });
      } catch (emailErr) {
        console.error('Failed to send thank you email:', emailErr);
      }
    }

    res.status(201).json(donation);
  } catch (error) {
    console.error('Donation record error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @desc    Get current user's donations
// @route   GET /api/donations/my/donations
// @access  Private
router.get('/my/donations', protect, async (req, res) => {
  try {
    const donations = await Donation.find({ user: req.user.id })
      .populate('campaign', 'title image')
      .populate('organization', 'name image')
      .sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @desc    Get donor list for an organization
// @route   GET /api/donations/organization/:id
// @access  Private (Owner only)
router.get('/organization/:id', protect, async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) return res.status(404).json({ message: 'Organization not found' });
    
    // Check if user is the owner
    if (org.owner.toString() !== req.user.id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const donations = await Donation.find({ organization: req.params.id })
      .populate('user', 'name email')
      .populate('campaign', 'title')
      .sort({ createdAt: -1 });
      
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
