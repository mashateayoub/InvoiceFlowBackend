const router = require('express').Router();
const auth = require('../middleware/auth');
const Contact = require('../models/Contact');
const { logger } = require('../utils/logger');

// Get all contacts for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const contacts = await Contact.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    logger.error('Error fetching contacts:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get contact by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const contact = await Contact.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.json(contact);
  } catch (err) {
    logger.error('Error fetching contact:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new contact
router.post('/', auth, async (req, res) => {
  try {
    const contact = new Contact({
      ...req.body,
      createdBy: req.user.id
    });
    await contact.save();
    res.status(201).json(contact);
  } catch (err) {
    logger.error('Error creating contact:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update contact
router.put('/:id', auth, async (req, res) => {
  try {
    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.json(contact);
  } catch (err) {
    logger.error('Error updating contact:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete contact
router.delete('/:id', auth, async (req, res) => {
  try {
    const contact = await Contact.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    });
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.json({ message: 'Contact deleted' });
  } catch (err) {
    logger.error('Error deleting contact:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;