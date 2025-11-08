this is the the thing which manages all your other services andis responsible for the server 


## Creating an Application

```typescript
import { Blaze } from '@blazy/http-core';

const app = new Blaze({
  // Optional configuration
  env: process.env.NODE_ENV || 'development',
  port: 3000,
  // ... other options
});
```