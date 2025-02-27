const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const { logger } = require('../utils/logger');

// Get user settings
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('settings');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.settings);
  } catch (err) {
    logger.error('Error fetching settings:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user settings
router.put('/', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { settings: req.body } },
      { new: true }
    ).select('settings');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.settings);
  } catch (err) {
    logger.error('Error updating settings:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update specific setting
router.patch('/:setting', auth, async (req, res) => {
  try {
    const updatePath = `settings.${req.params.setting}`;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { [updatePath]: req.body.value } },
      { new: true }
    ).select('settings');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.settings);
  } catch (err) {
    logger.error('Error updating specific setting:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;