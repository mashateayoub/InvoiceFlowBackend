const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/User');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('POST /api/auth/register', () => {
  const validUser = {
    email: 'test@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe'
  };

  it('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(validUser);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');

    // Verify user was created in database
    const user = await User.findOne({ email: validUser.email });
    expect(user).toBeTruthy();
    expect(user.profile.firstName).toBe(validUser.firstName);
    expect(user.profile.lastName).toBe(validUser.lastName);
  });

  it('should not allow duplicate email registration', async () => {
    // First registration
    await request(app)
      .post('/api/auth/register')
      .send(validUser);

    // Attempt duplicate registration
    const response = await request(app)
      .post('/api/auth/register')
      .send(validUser);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('User already exists');
  });

  it('should require email and password', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'John',
        lastName: 'Doe'
      });

    expect(response.status).toBe(500);
  });
});