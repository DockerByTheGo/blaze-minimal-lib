# Response Handling

## Overview

@blazy/http-core provides a flexible and powerful system for handling HTTP responses. This document covers how to send different types of responses, set headers, handle errors, and customize the response format.

## Basic Responses

### Sending JSON

```typescript
app.get('/user', () => {
  return {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com'
  };
  // Automatically sets Content-Type: application/json
});
```

### Sending Text

```typescript
app.get('/hello', () => {
  return 'Hello, World!';
  // Content-Type: text/plain
});

// Or explicitly
app.get('/hello', (req, res) => {
  res.type('text/plain').send('Hello, World!');
});
```

### Sending Files

```typescript
import { sendFile } from '@blazy/http-core/response';

app.get('/download', (req, res) => {
  return sendFile('/path/to/file.pdf', {
    filename: 'document.pdf',
    contentType: 'application/pdf'
  });
});
```

## Response Helpers

### Setting Status Codes

```typescript
app.post('/users', async (req) => {
  const user = await userService.create(req.body);
  return {
    status: 201, // Created
    body: user
  };
});
```

### Setting Headers

```typescript
app.get('/data', () => {
  return {
    status: 200,
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'X-Custom-Header': 'value'
    },
    body: { /* ... */ }
  };
});
```

### Redirects

```typescript
app.get('/old-route', () => {
  return {
    status: 301,
    headers: {
      'Location': '/new-route'
    }
  };
});

// Or use the helper
import { redirect } from '@blazy/http-core/response';

app.get('/old-route', () => {
  return redirect('/new-route', 301);
});
```

## Error Responses

### Throwing HTTP Errors

```typescript
import { NotFoundError, BadRequestError } from '@blazy/http-core/errors';

app.get('/users/:id', async (req) => {
  const user = await userService.getUser(req.params.id);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return user;
});
```

### Custom Error Handling

```typescript
app.onError((error, req) => {
  // Log the error
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.url}`, error);
  
  // Return a standardized error response
  return {
    status: error.status || 500,
    body: {
      error: error.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    }
  };
});
```

## Response Interceptors

### Global Response Formatting

```typescript
app.use((req, res, next) => {
  // Store the original json method
  const originalJson = res.json;
  
  // Override the json method
  res.json = function(data) {
    // Wrap the response in a standard format
    const wrapped = {
      success: res.statusCode < 400,
      data,
      timestamp: new Date().toISOString()
    };
    
    // Call the original method with the wrapped data
    originalJson.call(this, wrapped);
  };
  
  next();
});
```

## Streaming Responses

### Streaming Data

```typescript
import { createReadStream } from 'fs';
import { pipeline } from 'stream/promises';

app.get('/stream', (req, res) => {
  const fileStream = createReadStream('/path/to/large/file');
  
  res.type('application/octet-stream');
  
  // Stream the file to the response
  return pipeline(fileStream, res);
});
```

## Best Practices

1. **Be Consistent**: Use a consistent response format
2. **Set Proper Status Codes**: Use appropriate HTTP status codes
3. **Handle Errors Gracefully**: Provide meaningful error messages
4. **Use Streaming for Large Responses**: Don't load everything into memory
5. **Set Cache Headers**: When appropriate

## Next Steps
- Learn about [Performance](../performance/main.md) optimizations
- Explore [TypeScript Support](../typescript-support/main.md)
- See [Examples](../examples/main.md) for practical implementations
