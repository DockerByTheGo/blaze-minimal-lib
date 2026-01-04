## Hook Execution Order

1. `beforeStart`
2. `beforeRequest`
3. Route-specific middleware
4. Route handler
5. `afterResponse`
6. `onError` (if an error occurs)
7. `afterStart` (only once during application startup)
