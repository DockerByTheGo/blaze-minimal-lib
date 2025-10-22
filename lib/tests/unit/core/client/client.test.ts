import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Router } from 'hono/router';
import { ClientBuilder } from '../../../../src/core/client/client';
describe('ClientBuilder', () => {
  let mockRouter: Router;
  
  beforeEach(() => {
    // Create a mock router for testing
    mockRouter = {
      routes: {},
      get: vi.fn().mockReturnThis(),
      post: vi.fn().mockReturnThis(),
      put: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      patch: vi.fn().mockReturnThis(),
      options: vi.fn().mockReturnThis(),
      head: vi.fn().mockReturnThis(),
      all: vi.fn().mockReturnThis(),
      use: vi.fn().mockReturnThis(),
      route: vi.fn().mockReturnThis(),
      getRoutes: vi.fn().mockReturnValue([])
    };
  });

  describe('hook()', () => {
    it('should register a new hook', () => {
      const client = ClientBuilder.new(mockRouter);
      const mockHandler = vi.fn();
      
      const result = client.hook({
        name: 'testHook',
        type: 'beforeSend',
        handler: mockHandler
      });

      expect(result).toBeInstanceOf(ClientBuilder);
      expect(client['hooks']).toHaveProperty('testHook');
    });

    it('should chain multiple hooks', () => {
      const client = ClientBuilder.new(mockRouter);
      const mockHandler1 = vi.fn();
      const mockHandler2 = vi.fn();
      
      const result = client
        .hook({
          name: 'hook1',
          type: 'beforeSend',
          handler: mockHandler1
        })
        .hook({
          name: 'hook2',
          type: 'afterReceive',
          handler: mockHandler2
        });

      expect(result).toBeInstanceOf(ClientBuilder);
      expect(client['hooks']).toHaveProperty('hook1');
      expect(client['hooks']).toHaveProperty('hook2');
    });
  });

  describe('beforeSend()', () => {
    it('should register a beforeSend hook', () => {
      const client = ClientBuilder.new(mockRouter);
      const mockHandler = vi.fn();
      
      const result = client.beforeSend(mockHandler);

      expect(result).toBeInstanceOf(ClientBuilder);
      expect(client['hooks'].beforeSend).toBeDefined();
    });

    it('should chain beforeSend with other methods', () => {
      const client = ClientBuilder.new(mockRouter);
      const mockHandler1 = vi.fn();
      const mockHandler2 = vi.fn();
      
      const result = client
        .beforeSend(mockHandler1)
        .hook({
          name: 'testHook',
          type: 'afterReceive',
          handler: mockHandler2
        });

      expect(result).toBeInstanceOf(ClientBuilder);
      expect(client['hooks'].beforeSend).toBeDefined();
      expect(client['hooks']).toHaveProperty('testHook');
    });
  });

  describe('static new()', () => {
    it('should create a new ClientBuilder instance with default config', () => {
      const client = ClientBuilder.new(mockRouter);
      
      expect(client).toBeInstanceOf(ClientBuilder);
      expect(client['config']).toEqual({
        retries: 3
      });
    });

    it('should initialize with empty hooks', () => {
      const client = ClientBuilder.new(mockRouter);
      
      expect(client['hooks'].afterReceive).toEqual([]);
      expect(client['hooks'].beforeSend).toEqual([]);
      expect(client['hooks'].onErrored).toEqual([]);
    });
  });
});
