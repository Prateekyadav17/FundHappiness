const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization');
const Campaign = require('../models/Campaign');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get all organizations
// @route   GET /api/organizations
// @access  Public
router.get('/', async (req, res) => {
  try {
    const orgs = await Organization.find().populate('owner', 'name').sort({ createdAt: -1 });
    res.json(orgs);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @desc    Get current user's organization
// @route   GET /api/organizations/my/org
// @access  Private
router.get('/my/org', protect, async (req, res) => {
  try {
    const org = await Organization.findOne({ owner: req.user.id })
      .populate('members', 'name');
    if (!org) return res.json(null);
    
    const campaigns = await Campaign.find({ organization: org._id });
    res.json({ organization: org, campaigns });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @desc    Get a single organization and its campaigns
// @route   GET /api/organizations/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id)
      .populate('owner', 'name')
      .populate('members', 'name');
      
    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Increment view count
    org.views = (org.views || 0) + 1;
    await org.save();

    const campaigns = await Campaign.find({ organization: req.params.id });
    
    res.json({ organization: org, campaigns });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @desc    Create an organization
// @route   POST /api/organizations
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { name, mission, image } = req.body;

    if (!name || !mission || !image) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    const orgExists = await Organization.findOne({ name });
    if (orgExists) {
      return res.status(400).json({ message: 'An organization with this name already exists' });
    }

    const org = await Organization.create({
      name,
      mission,
      image,
      owner: req.user.id,
      members: [req.user.id] // Owner is automatically a member
    });

    res.status(201).json(org);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @desc    Join or Leave an organization
// @route   PUT /api/organizations/:id/membership
// @access  Private
router.put('/:id/membership', protect, async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id);
    
    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const isMember = org.members.includes(req.user.id);
    const user = await require('../models/User').findById(req.user.id);
    
    if (isMember) {
      // Leave
      org.members = org.members.filter(memberId => memberId.toString() !== req.user.id.toString());
      if (user) {
        user.following = user.following.filter(orgId => orgId.toString() !== req.params.id.toString());
      }
    } else {
      // Join
      org.members.push(req.user.id);
      if (user && !user.following.includes(req.params.id)) {
        user.following.push(req.params.id);
      }
    }

    await org.save();
    if (user) await user.save();
    
    res.json({ isMember: !isMember, message: !isMember ? 'Joined successfully' : 'Left successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @desc    Update carousel images
// @route   PUT /api/organizations/:id/carousel
// @access  Private
router.put('/:id/carousel', protect, async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) return res.status(404).json({ message: 'Organization not found' });
    if (org.owner.toString() !== req.user.id.toString()) return res.status(401).json({ message: 'Not authorized' });

    org.carouselImages = req.body.carouselImages;
    await org.save();
    res.json(org);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @desc    Update payment info
// @route   PUT /api/organizations/:id/payment
// @access  Private
router.put('/:id/payment', protect, async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) return res.status(404).json({ message: 'Organization not found' });
    if (org.owner.toString() !== req.user.id.toString()) return res.status(401).json({ message: 'Not authorized' });

    org.paymentInfo = req.body.paymentInfo;
    await org.save();
    res.json(org);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @desc    Update organization stats
// @route   PUT /api/organizations/:id/stats
// @access  Private
router.put('/:id/stats', protect, async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) return res.status(404).json({ message: 'Organization not found' });
    if (org.owner.toString() !== req.user.id.toString()) return res.status(401).json({ message: 'Not authorized' });

    org.stats = req.body.stats;
    await org.save();
    res.json(org);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
