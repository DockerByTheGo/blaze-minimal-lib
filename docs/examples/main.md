# Examples

## Overview

This section provides practical examples of common patterns and use cases when building applications with @blazy/http-core. Each example is self-contained and demonstrates a specific feature or integration.

## Table of Contents

1. [Basic API Server](#basic-api-server)
2. [Authentication System](#authentication-system)
3. [File Upload](#file-upload)
4. [WebSocket Integration](#websocket-integration)
5. [GraphQL API](#graphql-api)
6. [Real-time Chat](#real-time-chat)
7. [Microservices](#microservices)
8. [Serverless Functions](#serverless-functions)

## Basic API Server

A simple REST API with CRUD operations for a blog.

```typescript
// examples/basic-api/server.ts
import { Blaze } from '@blazy/http-core';
import { z } from 'zod';

interface Post {
  id: string;
  title: string;
  content: string;
  published: boolean;
  createdAt: Date;
}

// In-memory database
const db: { posts: Post[] } = {
  posts: []
};

const app = new Blaze();

// Create a new post
app.post('/posts', {
  body: z.object({
    title: z.string().min(1),
    content: z.string().min(1),
  }),
  handler: (req) => {
    const post: Post = {
      id: Math.random().toString(36).substr(2, 9),
      title: req.body.title,
      content: req.body.content,
      published: false,
      createdAt: new Date(),
    };
    
    db.posts.push(post);
    return post;
  },
});

// Get all published posts
app.get('/posts', () => {
  return db.posts.filter(post => post.published);
});

// Get a single post
app.get('/posts/:id', (req) => {
  const post = db.posts.find(p => p.id === req.params.id);
  if (!post) {
    throw new NotFoundError('Post not found');
  }
  return post;
});

// Start the server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

## Authentication System

JWT-based authentication with refresh tokens.

```typescript
// examples/auth/auth.controller.ts
import { sign, verify } from 'jsonwebtoken';
import { compare, hash } from 'bcrypt';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'your-refresh-secret';

// In-memory user store
const users: User[] = [];
const refreshTokens = new Set<string>();

interface User {
  id: string;
  email: string;
  password: string;
  name: string;
}

// Register a new user
app.post('/auth/register', {
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2),
  }),
  handler: async (req) => {
    const { email, password, name } = req.body;
    
    if (users.some(u => u.email === email)) {
      throw new BadRequestError('Email already in use');
    }
    
    const hashedPassword = await hash(password, 10);
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      password: hashedPassword,
      name,
    };
    
    users.push(user);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
});

// Login
app.post('/auth/login', {
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
  handler: async (req) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    
    if (!user || !(await compare(password, user.password))) {
      throw new UnauthorizedError('Invalid credentials');
    }
    
    const accessToken = sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    const refreshToken = sign(
      { userId: user.id },
      REFRESH_SECRET,
      { expiresIn: '7d' }
    );
    
    refreshTokens.add(refreshToken);
    
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  },
});
```

## File Upload

Handling file uploads with multer.

```typescript
// examples/file-upload/server.ts
import { Blaze } from '@blazy/http-core';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const app = new Blaze();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

// Single file upload
app.post('/upload', {
  middleware: [
    upload.single('file')
  ],
  handler: (req) => {
    if (!req.file) {
      throw new BadRequestError('No file uploaded');
    }
    
    return {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: `/uploads/${req.file.filename}`,
    };
  },
});

// Serve uploaded files
app.get('/uploads/:filename', (req, res) => {
  const filePath = path.join(__dirname, '..', 'uploads', req.params.filename);
  res.sendFile(filePath);
});
```

## WebSocket Integration

Real-time features with WebSockets.

```typescript
// examples/websocket/server.ts
import { Blaze } from '@blazy/http-core';
import { WebSocketServer } from 'ws';

const app = new Blaze();

// Create HTTP server
const server = app.listen(3000);

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Track connected clients
const clients = new Set<WebSocket>();

wss.on('connection', (ws) => {
  clients.add(ws);
  
  ws.on('message', (message) => {
    // Broadcast to all clients
    for (const client of clients) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    }
  });
  
  ws.on('close', () => {
    clients.delete(ws);
  });
});

// REST endpoint to broadcast messages
app.post('/broadcast', {
  body: z.object({
    message: z.string(),
  }),
  handler: (req) => {
    const { message } = req.body;
    
    // Broadcast to all connected clients
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'broadcast', message }));
      }
    }
    
    return { success: true };
  },
});
```

## GraphQL API

GraphQL server with Apollo Server.

```typescript
// examples/graphql/server.ts
import { Blaze } from '@blazy/http-core';
import { ApolloServer } from 'apollo-server-express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { resolvers } from './resolvers';
import { typeDefs } from './schema';

const app = new Blaze();

// Create GraphQL schema
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Create Apollo Server
const server = new ApolloServer({
  schema,
  context: ({ req }) => ({
    // Add your context here (user info, data loaders, etc.)
    userId: req.headers['x-user-id'],
  }),
});

// Apply Apollo middleware
await server.start();
server.applyMiddleware({ app });

// Start the server
app.listen(3000, () => {
  console.log(`🚀 Server ready at http://localhost:3000${server.graphqlPath}`);
});
```

## Real-time Chat

A simple chat application with WebSockets and rooms.

```typescript
// examples/chat/server.ts
import { Blaze } from '@blazy/http-core';
import { WebSocketServer } from 'ws';

const app = new Blaze();
const server = app.listen(3000);
const wss = new WebSocketServer({ server });

// Track chat rooms and users
const rooms = new Map<string, Set<WebSocket>>();

wss.on('connection', (ws, req) => {
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const roomId = url.searchParams.get('room') || 'default';
  
  // Add to room
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }
  const room = rooms.get(roomId)!;
  room.add(ws);
  
  // Handle messages
  ws.on('message', (message) => {
    const data = JSON.parse(message.toString());
    
    // Broadcast to all clients in the room
    for (const client of room) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'message',
          room: roomId,
          user: data.user,
          text: data.text,
          timestamp: new Date().toISOString(),
        }));
      }
    }
  });
  
  // Handle disconnection
  ws.on('close', () => {
    room.delete(ws);
    if (room.size === 0) {
      rooms.delete(roomId);
    }
  });
});
```

## Microservices

Basic microservice with message broker.

```typescript
// examples/microservices/auth.service.ts
import { Blaze } from '@blazy/http-core';
import { connect, Connection, Channel } from 'amqplib';

const app = new Blaze();

// RabbitMQ connection
let connection: Connection;
let channel: Channel;

// Connect to RabbitMQ
async function connectToBroker() {
  connection = await connect(process.env.RABBITMQ_URL || 'amqp://localhost');
  channel = await connection.createChannel();
  
  // Declare queues
  await channel.assertQueue('auth:register');
  await channel.assertQueue('auth:login');
  
  // Consume messages
  channel.consume('auth:register', async (msg) => {
    if (!msg) return;
    
    try {
      const { email, password } = JSON.parse(msg.content.toString());
      // Process registration
      // ...
      
      // Acknowledge message
      channel.ack(msg);
    } catch (error) {
      console.error('Error processing message:', error);
      channel.nack(msg, false, false); // Don't requeue on error
    }
  });
}

// Start the service
async function start() {
  await connectToBroker();
  
  // Health check endpoint
  app.get('/health', () => ({
    status: 'ok',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
  }));
  
  app.listen(3001, () => {
    console.log('Auth service running on port 3001');
  });
}

start().catch(console.error);
```

## Serverless Functions

Deploying as serverless functions.

```typescript
// examples/serverless/handler.ts
import { createHandler } from '@blazy/http-core/serverless';
import { Blaze } from '@blazy/http-core';

const app = new Blaze();

// Define your routes
app.get('/api/hello', () => ({
  message: 'Hello from serverless!',
  timestamp: new Date().toISOString(),
}));

// Export the serverless handler
export const handler = createHandler(app);
```

## Next Steps

Explore more examples in the [official documentation](https://docs.blazy.dev) or check out the [GitHub repository](https://github.com/blazyjs/blazy) for additional resources and community examples.
