const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const { logger } = require('./utils/logger');
const requestLogger = require('./middleware/requestLogger');
const config = require('./utils/config');
require('./models'); // This will import all your models


// Initialize express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('combined', { stream: logger.stream }));
app.use(requestLogger);

// Database connection
mongoose.connect(config.mongoUri)
  .then(() => {
    logger.info('Connected to MongoDB');
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    logger.error('Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit if database connection fails
  });



// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/invoices', require('./routes/invoice.routes'));
app.use('/api/contacts', require('./routes/contact.routes'));
app.use('/api/settings', require('./routes/setting.routes'));
app.use('/api/profile', require('./routes/profile.routes'));

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).send({
    status: 'error',
    message: 'Something broke!',
    error: config.nodeEnv === 'development' ? err.stack : {}
  });
});



// Start server
const PORT = config.port;
// Ensure connection before starting server
mongoose.connection.once('open', () => {
  // Start server only after successful database connection
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
    console.log(`Server is running on port ${PORT}`);
  });
});