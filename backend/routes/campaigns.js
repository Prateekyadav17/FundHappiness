const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get all active campaigns
// @route   GET /api/campaigns
// @access  Public
router.get('/', async (req, res) => {
  try {
    const campaigns = await Campaign.find()
      .populate('creator', 'name')
      .populate('organization', 'name image')
      .sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @desc    Get single campaign
// @route   GET /api/campaigns/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('creator', 'name')
      .populate('organization', 'name image');
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Increment view count
    campaign.views = (campaign.views || 0) + 1;
    await campaign.save();

    res.json(campaign);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @desc    Create a campaign
// @route   POST /api/campaigns
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, goalAmount, image, deadline, category, organizationId } = req.body;

    if (!title || !description || !goalAmount || !image || !deadline || !organizationId) {
      return res.status(400).json({ message: 'Please provide all required fields including the organization' });
    }

    const campaign = await Campaign.create({
      title,
      description,
      goalAmount,
      image,
      gallery: req.body.gallery || [],
      deadline,
      category,
      organization: organizationId,
      creator: req.user.id
    });

    res.status(201).json(campaign);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
