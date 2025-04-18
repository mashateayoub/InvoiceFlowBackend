# Backend API Documentation

## System Architecture

The backend is built using Node.js with Express.js framework and MongoDB as the database. It follows a RESTful API architecture with JWT-based authentication.

### Core Technologies
- Node.js & Express.js
- MongoDB with Mongoose ODM
- JWT for Authentication
- bcryptjs for Password Hashing
- Winston for Logging

## Authentication

The system uses JWT (JSON Web Tokens) for authentication. Tokens are valid for 24 hours.

### Authentication Endpoints

#### POST /api/auth/register
- **Purpose**: Register a new user
- **Body**:
  ```json
  {
    "email": "string",
    "password": "string",
    "firstName": "string",
    "lastName": "string"
  }
  ```
- **Response**: Returns JWT token

#### POST /api/auth/login
- **Purpose**: Authenticate user
- **Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**: Returns JWT token

#### GET /api/auth/me
- **Purpose**: Get authenticated user's information
- **Auth**: Required
- **Response**: Returns user object (excluding password)

#### POST /api/auth/forgot-password
- **Purpose**: Initiate password reset
- **Body**:
  ```json
  {
    "email": "string"
  }
  ```

#### POST /api/auth/reset-password
- **Purpose**: Reset password with token
- **Body**:
  ```json
  {
    "token": "string",
    "newPassword": "string"
  }
  ```

#### PUT /api/auth/change-password
- **Purpose**: Change password (authenticated)
- **Auth**: Required
- **Body**:
  ```json
  {
    "currentPassword": "string",
    "newPassword": "string"
  }
  ```

## Data Models

### User Model
```javascript
{
  email: String (required, unique),
  password: String (required),
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    company: String,
    address: String
  },
  role: String (enum: ['admin', 'user']),
  settings: {
    theme: String,
    language: String,
    notifications: {
      email: Boolean
    }
  },
  createdAt: Date
}
```

### Contact Model
```javascript
{
  name: String (required),
  email: String (required),
  phone: String,
  company: String,
  address: String,
  notes: String,
  createdBy: ObjectId (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

### Invoice Model
```javascript
{
  metadata: {
    invoiceNumber: String (required, unique),
    invoiceDate: Date,
    dueDate: Date,
    status: String (enum: ['draft', 'sent', 'paid', 'overdue'])
  },
  client: ObjectId (ref: 'Contact'),
  lineItems: [{
    description: String,
    quantity: Number,
    unitPrice: Number,
    taxRate: Number,
    isTaxable: Boolean,
    lineTotal: Number
  }],
  financials: {
    subtotal: Number,
    taxes: [{
      type: String,
      rate: Number,
      amount: Number
    }],
    shipping: Number,
    grandTotal: Number
  },
  notes: String,
  createdBy: ObjectId (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

## API Routes

### Invoice Routes (/api/invoices)

#### GET /
- **Purpose**: Get all invoices for authenticated user
- **Auth**: Required
- **Response**: Array of invoice objects
- **Sort**: By invoice date (descending)

#### POST /
- **Purpose**: Create new invoice
- **Auth**: Required
- **Body**: Invoice object
- **Features**:
  - Auto-generates invoice number if not provided
  - Calculates line item totals
  - Computes tax amounts and grand total
- **Response**: Created invoice object

#### GET /:id
- **Purpose**: Get invoice by ID
- **Auth**: Required
- **Response**: Invoice object

#### PUT /:id
- **Purpose**: Update invoice
- **Auth**: Required
- **Body**: Updated invoice fields
- **Features**:
  - Recalculates financials if line items updated
  - Updates timestamps
- **Response**: Updated invoice object

#### DELETE /:id
- **Purpose**: Delete invoice
- **Auth**: Required
- **Response**: Success message

### User Routes (/api/users)
- **GET /** - Get all users (admin only)
- **GET /:id** - Get user by ID
- **PUT /:id** - Update user
- **DELETE /:id** - Delete user

### Profile Routes (/api/profile)
- **GET /** - Get user profile
- **PUT /** - Update user profile
- **PATCH /:field** - Update specific profile field

### Settings Routes (/api/settings)
- **GET /** - Get user settings
- **PUT /** - Update user settings
- **PATCH /:setting** - Update specific setting

### Contact Routes (/api/contacts)
- **GET /** - Get all contacts
- **POST /** - Create new contact
- **GET /:id** - Get contact by ID
- **PUT /:id** - Update contact
- **DELETE /:id** - Delete contact

## Middleware

### Authentication Middleware
- Verifies JWT token in request header
- Adds user object to request if token is valid
- Returns 401 if token is invalid or missing

## Error Handling

The API uses a centralized error handling middleware that:
- Logs errors using Winston
- Returns appropriate HTTP status codes
- Provides detailed error messages in development
- Sanitizes error details in production

## Environment Variables

Required environment variables:
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT signing
- `NODE_ENV`: Environment ('development' or 'production')

## Security Features

- Password hashing using bcryptjs
- JWT-based authentication
- Role-based access control
- Request validation
- CORS enabled
- Secure HTTP headers

## Logging

The application uses Winston for logging:
- Error logs: ./logs/error.log
- Combined logs: ./logs/combined.log
- HTTP request logging using Morgan