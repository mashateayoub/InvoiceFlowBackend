const router = require('express').Router();
const auth = require('../middleware/auth');
const Invoice = require('../models/Invoice');
const { logger } = require('../utils/logger');

// Get all invoices
router.get('/', auth, async (req, res) => {
  try {
    const invoices = await Invoice.find({ createdBy: req.user.id })
      .populate('client', 'name email')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    logger.error('Error fetching invoices:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new invoice
router.post('/', auth, async (req, res) => {
  try {
    const invoice = new Invoice({
      ...req.body,
      createdBy: req.user.id
    });
    await invoice.save();
    res.status(201).json(invoice);
  } catch (err) {
    logger.error('Error creating invoice:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update invoice
router.put('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    logger.error('Error updating invoice:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete invoice
router.delete('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    logger.error('Error deleting invoice:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;