const express = require('express');
const router = express.Router();
const Update = require('../models/Update');
const Organization = require('../models/Organization');
const { protect } = require('../middleware/authMiddleware');

// @desc    Create a new update
// @route   POST /api/updates
// @access  Private (Organization owner only)
router.post('/', protect, async (req, res) => {
  try {
    const { title, content, image, organizationId, campaignId } = req.body;

    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Check if user is the owner
    if (organization.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to post updates for this organization' });
    }

    const update = await Update.create({
      title,
      content,
      image,
      organization: organizationId,
      campaign: campaignId || null
    });

    res.status(201).json(update);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all updates for an organization
// @route   GET /api/updates/organization/:id
// @access  Public
router.get('/organization/:id', async (req, res) => {
  try {
    const updates = await Update.find({ organization: req.params.id }).sort({ createdAt: -1 });
    res.json(updates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete an update
// @route   DELETE /api/updates/:id
// @access  Private (Organization owner only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const update = await Update.findById(req.params.id);

    if (!update) {
      return res.status(404).json({ message: 'Update not found' });
    }

    const organization = await Organization.findById(update.organization);

    if (organization.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await update.deleteOne();
    res.json({ message: 'Update removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
