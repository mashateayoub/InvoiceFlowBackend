const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  postalCode: String,
  country: String
});

const sellerSchema = new mongoose.Schema({
  businessName: String,
  address: addressSchema,
  contact: {
    phone: String,
    email: String,
    website: String
  },
  taxIdentifiers: {
    vatId: String,
    ein: String
  },
  logoUrl: String
});

const buyerSchema = new mongoose.Schema({
  clientName: String,
  address: addressSchema,
  contactPerson: {
    name: String,
    department: String,
    email: String
  },
  purchaseOrder: String
});

const lineItemSchema = new mongoose.Schema({
  itemId: String,
  description: String,
  quantity: Number,
  unitPrice: Number,
  unit: String,
  taxRate: Number,
  isTaxable: Boolean,
  lineTotal: Number
});

const taxSchema = new mongoose.Schema({
  type: String,
  rate: Number,
  amount: Number
});

const bankAccountSchema = new mongoose.Schema({
  accountName: String,
  accountNumber: String,
  routingNumber: String,
  swiftBic: String,
  iban: String
});

const invoiceSchema = new mongoose.Schema({
  metadata: {
    title: { type: String, default: 'INVOICE' },
    invoiceNumber: { type: String, required: true, unique: true },
    invoiceDate: { type: Date, default: Date.now },
    dueDate: Date,
    serviceDate: Date,
    currency: { type: String, default: 'USD' }
  },
  seller: sellerSchema,
  buyer: buyerSchema,
  lineItems: [lineItemSchema],
  financials: {
    subtotal: { type: Number, required: true },
    taxes: [taxSchema],
    discounts: [{
      description: String,
      amount: Number
    }],
    shipping: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true }
  },
  paymentDetails: {
    terms: String,
    methods: [String],
    lateFee: {
      type: String,
      value: Number,
      frequency: String
    },
    bankAccount: bankAccountSchema,
    paymentLink: String
  },
  additionalInfo: {
    notes: String,
    termsUrl: String,
    attachments: [String]
  },
  status: {
    isPaid: { type: Boolean, default: false },
    paymentDate: Date,
    paymentMethodUsed: String,
    state: {
      type: String,
      enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
      default: 'draft'
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

module.exports = mongoose.model('Invoice', invoiceSchema);