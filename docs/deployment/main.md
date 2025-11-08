# Deployment

## Overview

This guide covers the deployment of @blazy/http-core applications to various platforms. We'll explore different deployment strategies, environment configurations, and best practices for running your application in production.

## Prerequisites

Before deploying, ensure your application:

1. Has all environment variables properly configured
2. Has proper error handling and logging
3. Has been tested in a staging environment
4. Has appropriate monitoring and alerting set up

## Environment Configuration

### Environment Variables

```bash
# .env.production
NODE_ENV=production
PORT=3000
DATABASE_URL=postgres://user:password@host:5432/dbname
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
```

### Configuration Management

```typescript
// config/index.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(32),
});

export const config = envSchema.parse(process.env);
```

## Deployment Targets

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application files
COPY . .

# Build the application (if needed)
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://user:password@db:5432/app
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    restart: unless-stopped
    
  db:
    image: postgres:13-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=app
    volumes:
      - postgres_data:/var/lib/postgresql/data
    
  redis:
    image: redis:6-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## Platform-Specific Guides

### AWS (Elastic Beanstalk)

1. Install EB CLI:
   ```bash
   pip install awsebcli
   ```

2. Initialize EB:
   ```bash
   eb init -p node.js my-app
   ```

3. Create environment:
   ```bash
   eb create my-app-production --single
   ```

4. Deploy:
   ```bash
   eb deploy
   ```

### Heroku

1. Create a Procfile:
   ```
   web: node dist/index.js
   ```

2. Deploy:
   ```bash
   heroku create
   git push heroku main
   ```

3. Set environment variables:
   ```bash
   heroku config:set NODE_ENV=production DATABASE_URL=...
   ```

### Vercel

1. Create `vercel.json`:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "dist/index.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/dist/index.js"
       }
     ]
   }
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

## Continuous Deployment

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Use Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Run tests
        run: npm test
        
      - name: Deploy to production
        if: github.ref == 'refs/heads/main'
        run: |
          # Add your deployment commands here
          echo "Deploying to production..."
```

## Monitoring and Logging

### Application Logs

```typescript
import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' })
  ]
});

// In your error handling middleware
app.use((err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });
  
  next(err);
});
```

## Best Practices

1. **Use Environment Variables**: Never hardcode sensitive information
2. **Enable HTTPS**: Use Let's Encrypt for free SSL certificates
3. **Set Up Monitoring**: Use tools like Prometheus and Grafana
4. **Implement Health Checks**: Add a `/health` endpoint
5. **Use Process Manager**: Like PM2 for Node.js applications

## Next Steps
- Learn about [Performance](../performance/main.md) optimizations
- Explore [Examples](../examples/main.md) for practical implementations
