const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const { logger } = require('../utils/logger');

// Get user profile
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('profile');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.profile);
  } catch (err) {
    logger.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { profile: req.body } },
      { new: true }
    ).select('profile');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.profile);
  } catch (err) {
    logger.error('Error updating profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update specific profile field
router.patch('/:field', auth, async (req, res) => {
  try {
    const updatePath = `profile.${req.params.field}`;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { [updatePath]: req.body.value } },
      { new: true }
    ).select('profile');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.profile);
  } catch (err) {
    logger.error('Error updating profile field:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;