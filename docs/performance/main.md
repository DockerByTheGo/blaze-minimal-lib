# Performance Optimization

## Overview

This document covers best practices and techniques for optimizing the performance of your @blazy/http-core applications. Proper optimization can significantly improve response times, reduce resource usage, and enhance the overall user experience.

## Caching Strategies

### In-Memory Caching

```typescript
import NodeCache from 'node-cache';

// Create a cache with 5-minute TTL
const cache = new NodeCache({ stdTTL: 300 });

app.get('/api/data', async (req) => {
  const cacheKey = 'data-key';
  let data = cache.get(cacheKey);
  
  if (!data) {
    data = await fetchDataFromDatabase();
    cache.set(cacheKey, data);
  }
  
  return data;
});
```

### HTTP Caching Headers

```typescript
app.get('/static/data', (req, res) => {
  res.set({
    'Cache-Control': 'public, max-age=3600', // 1 hour
    'ETag': 'unique-hash',
    'Last-Modified': new Date().toUTCString()
  });
  
  return { /* your data */ };
});
```

## Database Optimization

### Query Optimization

```typescript
// Bad: N+1 query problem
app.get('/users/posts', async () => {
  const users = await db.users.findMany();
  const usersWithPosts = await Promise.all(users.map(async user => ({
    ...user,
    posts: await db.posts.findMany({ where: { userId: user.id } })
  })));
  
  return usersWithPosts;
});

// Good: Single query with join
app.get('/users/posts', async () => {
  return db.users.findMany({
    include: {
      posts: true
    }
  });
});
```

### Connection Pooling

```typescript
// Configure database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## Response Compression

```typescript
import compression from 'compression';

// Enable gzip compression
app.use(compression());

// Or with options
app.use(compression({
  level: 6, // Compression level (0-9)
  threshold: '1kb', // Only compress responses larger than 1kb
  filter: (req) => {
    // Don't compress responses with this header
    return !req.headers['x-no-compression'];
  }
}));
```

## Load Balancing

### Horizontal Scaling

```typescript
import cluster from 'cluster';
import os from 'os';

if (cluster.isPrimary) {
  // Fork workers
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork(); // Replace the dead worker
  });
} else {
  // Worker process
  const app = new Blaze();
  // ... app setup ...
  app.listen(3000);
}
```

## Monitoring and Metrics

### Request Timing

```typescript
app.use((req, res, next) => {
  const start = process.hrtime();
  
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = (seconds * 1e9 + nanoseconds) / 1e6; // in milliseconds
    
    metrics.timing('http_request_duration_ms', duration, {
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode
    });
  });
  
  next();
});
```

## Memory Management

### Memory Leak Detection

```typescript
// Add --inspect flag to your start script
// Then use Chrome DevTools to take heap snapshots

// Or use a memory leak detection library
const memwatch = require('@airbnb/node-memwatch');

memwatch.on('leak', (info) => {
  console.error('Memory leak detected:', info);
  // Take a heap snapshot
  const heapdump = require('heapdump');
  heapdump.writeSnapshot(`./heapdump-${Date.now()}.heapsnapshot`);n});
```

## Best Practices

1. **Use Asynchronous Code**: Avoid blocking the event loop
2. **Implement Caching**: Reduce database and API calls
3. **Optimize Dependencies**: Keep them updated and minimal
4. **Use Streaming**: For large responses
5. **Monitor Performance**: Continuously track and optimize

## Next Steps
- Learn about [TypeScript Support](../typescript-support/main.md)
- Explore [Testing](../testing/main.md) strategies
- See [Deployment](../deployment/main.md) best practices
