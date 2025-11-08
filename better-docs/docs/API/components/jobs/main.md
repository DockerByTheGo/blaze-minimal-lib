# Jobs

## Overview

Jobs in @blazy/http-core provide a way to run background tasks, scheduled jobs, and long-running processes outside the request/response cycle. This is essential for tasks like sending emails, processing uploads, or performing periodic maintenance.

## Creating Jobs

### Basic Job

```typescript
import { Job } from '@blazy/http-core/jobs';

const sendWelcomeEmail = new Job({
  name: 'send-welcome-email',
  handler: async (payload: { userId: string }) => {
    const user = await userService.getUser(payload.userId);
    await emailService.sendWelcomeEmail(user);
  },
  retry: 3, // Number of retry attempts
  timeout: 30000, // 30 seconds
});

// Queue the job
await sendWelcomeEmail.dispatch({ userId: '123' });
```

### Scheduled Jobs

```typescript
import { Job, schedule } from '@blazy/http-core/jobs';

const cleanupJob = new Job({
  name: 'cleanup-old-data',
  schedule: schedule.everyDayAt(3, 0), // 3 AM daily
  handler: async () => {
    // Delete records older than 30 days
    await db.logs.deleteMany({
      where: { createdAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
    });
  }
});

// Start the scheduler
import { startScheduler } from '@blazy/http-core/jobs';
startScheduler([cleanupJob]);
```

## Job Queue

### Using Bull/Redis

```typescript
import { Queue } from 'bull';
import { createQueue } from '@blazy/http-core/jobs/queue';

// Create a queue
const emailQueue = createQueue('emails', {
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT)
  }
});

// Define job processor
emailQueue.process('send-welcome-email', async (job) => {
  const { userId } = job.data;
  const user = await userService.getUser(userId);
  await emailService.sendWelcomeEmail(user);
});

// Add job to queue
await emailQueue.add('send-welcome-email', { userId: '123' });
```

## Job Events

```typescript
const job = sendWelcomeEmail.dispatch({ userId: '123' });

job
  .on('started', () => {
    console.log('Job started');
  })
  .on('progress', (progress) => {
    console.log(`Progress: ${progress}%`);
  })
  .on('completed', (result) => {
    console.log('Job completed:', result);
  })
  .on('failed', (error) => {
    console.error('Job failed:', error);
  });
```

## Job Middleware

```typescript
// Log all job executions
app.jobs.use(async (job, next) => {
  const start = Date.now();
  
  try {
    logger.info(`Starting job: ${job.name}`, { jobId: job.id });
    const result = await next();
    logger.info(`Completed job: ${job.name} in ${Date.now() - start}ms`, {
      jobId: job.id,
      duration: Date.now() - start
    });
    return result;
  } catch (error) {
    logger.error(`Job failed: ${job.name}`, {
      jobId: job.id,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
});
```

## Best Practices

1. **Idempotency**: Design jobs to be idempotent
2. **Error Handling**: Implement proper error handling and retries
3. **Monitoring**: Track job execution and failures
4. **Resource Management**: Be mindful of resource usage
5. **Testing**: Test your jobs in isolation

## Next Steps
- Learn about [Router](../router/main.md) for request routing
- Explore [Request Lifecycle](../request-lifecycle/main.md)
- See [Examples](../examples/main.md) for practical implementations
