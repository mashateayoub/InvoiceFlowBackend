const router = require('express').Router();
const auth = require('../middleware/auth');
const Invoice = require('../models/Invoice');
const { logger } = require('../utils/logger');

// Get all invoices
router.get('/', auth, async (req, res) => {
  try {
    const invoices = await Invoice.find({ createdBy: req.user.id })
      .sort({ 'metadata.invoiceDate': -1 });
    res.json(invoices);
  } catch (err) {
    logger.error('Error fetching invoices:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get invoice by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    logger.error('Error fetching invoice:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new invoice
router.post('/', auth, async (req, res) => {
  try {
    // Generate invoice number if not provided
    if (!req.body.metadata?.invoiceNumber) {
      const count = await Invoice.countDocuments();
      req.body.metadata = {
        ...req.body.metadata,
        invoiceNumber: `INV-${Date.now()}-${count + 1}`
      };
    }

    // Calculate line item totals and invoice financials
    if (req.body.lineItems) {
      req.body.lineItems = req.body.lineItems.map(item => ({
        ...item,
        lineTotal: item.quantity * item.unitPrice
      }));

      const subtotal = req.body.lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
      const taxAmount = req.body.lineItems
        .filter(item => item.isTaxable)
        .reduce((sum, item) => sum + (item.lineTotal * item.taxRate / 100), 0);

      req.body.financials = {
        ...req.body.financials,
        subtotal,
        taxes: [{
          type: 'Tax',
          rate: req.body.lineItems[0]?.taxRate || 0,
          amount: taxAmount
        }],
        grandTotal: subtotal + taxAmount + (req.body.financials?.shipping || 0)
      };
    }

    const invoice = new Invoice({
      ...req.body,
      createdBy: req.user.id,
      updatedAt: Date.now()
    });

    await invoice.save();
    res.status(201).json(invoice);
  } catch (err) {
    logger.error('Error creating invoice:', err);
    return res.status(400).json({ message: 'Error creating invoice ', error: err });
  }
});

// Update invoice
router.put('/:id', auth, async (req, res) => {
  try {
    // Recalculate financials if line items are updated
    if (req.body.lineItems) {
      req.body.lineItems = req.body.lineItems.map(item => ({
        ...item,
        lineTotal: item.quantity * item.unitPrice
      }));

      const subtotal = req.body.lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
      const taxAmount = req.body.lineItems
        .filter(item => item.isTaxable)
        .reduce((sum, item) => sum + (item.lineTotal * item.taxRate / 100), 0);

      req.body.financials = {
        ...req.body.financials,
        subtotal,
        taxes: [{
          type: 'Tax',
          rate: req.body.lineItems[0]?.taxRate || 0,
          amount: taxAmount
        }],
        grandTotal: subtotal + taxAmount + (req.body.financials?.shipping || 0)
      };
    }

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