# Testing

## Overview

This guide covers testing strategies and best practices for @blazy/http-core applications. We'll explore unit testing, integration testing, and end-to-end testing approaches to ensure your application is reliable and maintainable.

## Setup

### Test Dependencies

```bash
npm install --save-dev jest @types/jest ts-jest supertest @testing-library/jest-dom
```

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts'],
  coveragePathIgnorePatterns: ['/node_modules/', '/test/'],
};
```

## Unit Testing

### Testing Services

```typescript
// services/userService.test.ts
import { UserService } from './userService';
import { createMock } from 'ts-jest-mock';

describe('UserService', () => {
  let userService: UserService;
  let mockDb: jest.Mocked<DbClient>;

  beforeEach(() => {
    mockDb = {
      findUser: jest.fn(),
      createUser: jest.fn(),
    } as any;
    
    userService = new UserService(mockDb);
  });

  describe('getUser', () => {
    it('should return a user when found', async () => {
      const mockUser = { id: '1', name: 'Test User' };
      mockDb.findUser.mockResolvedValue(mockUser);
      
      const user = await userService.getUser('1');
      
      expect(user).toEqual(mockUser);
      expect(mockDb.findUser).toHaveBeenCalledWith('1');
    });
    
    it('should throw when user is not found', async () => {
      mockDb.findUser.mockResolvedValue(null);
      
      await expect(userService.getUser('999'))
        .rejects
        .toThrow('User not found');
    });
  });
});
```

## Integration Testing

### Testing API Endpoints

```typescript
// api/users.test.ts
import request from 'supertest';
import { app } from '../src/app';
import { User } from '../src/models/User';

// Mock the database module
jest.mock('../src/db', () => ({
  users: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
}));

describe('Users API', () => {
  describe('GET /users', () => {
    it('should return a list of users', async () => {
      const mockUsers: User[] = [
        { id: '1', name: 'User 1', email: 'user1@example.com' },
        { id: '2', name: 'User 2', email: 'user2@example.com' },
      ];
      
      // Mock the database response
      (require('../src/db').users.findMany as jest.Mock).mockResolvedValue(mockUsers);
      
      const response = await request(app)
        .get('/api/users')
        .expect('Content-Type', /json/)
        .expect(200);
        
      expect(response.body).toEqual(mockUsers);
    });
  });
  
  describe('POST /users', () => {
    it('should create a new user', async () => {
      const newUser = { name: 'New User', email: 'new@example.com' };
      const createdUser = { id: '3', ...newUser };
      
      (require('../src/db').users.create as jest.Mock).mockResolvedValue(createdUser);
      
      const response = await request(app)
        .post('/api/users')
        .send(newUser)
        .expect('Content-Type', /json/)
        .expect(201);
        
      expect(response.body).toEqual(createdUser);
    });
    
    it('should validate input', async () => {
      const invalidUser = { name: '' }; // Missing required email
      
      const response = await request(app)
        .post('/api/users')
        .send(invalidUser)
        .expect(400);
        
      expect(response.body).toHaveProperty('errors');
    });
  });
});
```

## Mocking

### Mocking Dependencies

```typescript
// __mocks__/emailService.ts
export const emailService = {
  sendWelcomeEmail: jest.fn().mockResolvedValue(true),
  sendPasswordReset: jest.fn().mockResolvedValue(true),
};

// In your test file
jest.mock('../services/emailService');

// In your test
test('sends welcome email on user creation', async () => {
  const { emailService } = require('../services/emailService');
  
  await userService.createUser({ /* test data */ });
  
  expect(emailService.sendWelcomeEmail).toHaveBeenCalled();
});
```

## Test Utilities

### Test Setup Helper

```typescript
// test/test-utils.ts
import { Blaze } from '@blazy/http-core';
import { createTestApp } from '@blazy/http-core/test-utils';

export async function setupTestApp() {
  const app = new Blaze();
  
  // Add test-specific middleware
  app.use((req, res, next) => {
    req.testing = true;
    next();
  });
  
  // Initialize your app components here
  
  return createTestApp(app);
}

// In your test
const { app, close } = await setupTestApp();
// Run your tests
await close();
```

## Best Practices

1. **Isolate Tests**: Each test should be independent
2. **Use Mocks**: For external services and dependencies
3. **Test Edge Cases**: Don't just test the happy path
4. **Keep Tests Fast**: Avoid I/O in unit tests
5. **Test Coverage**: Aim for high coverage but focus on important paths

## Next Steps
- Learn about [Deployment](../deployment/main.md)
- Explore [Examples](../examples/main.md) for practical implementations
