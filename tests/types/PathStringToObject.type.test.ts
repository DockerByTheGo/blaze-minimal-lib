import { expectTypeOf } from 'vitest';
import type { PathStringToObject } from '../../src/core/server/router/types/PathStringToObject';

describe('PathStringToObject', () => {
    it('should resolve single segment path', () => {
        {
            type Expected = { user: string };
            type Gotten = PathStringToObject<'/user', string>;
            expectTypeOf<Gotten>().toEqualTypeOf<Expected>();
        }
    });

    it('should resolve nested path with two segments', () => {
        {
            type Expected = { user: { id: string } };
            type Gotten = PathStringToObject<'/user/:id', string>;
            expectTypeOf<Gotten>().toEqualTypeOf<Expected>();
        }
    });

    it('should resolve nested path with three segments', () => {
        {
            type Expected = { user: { userId: { token: string } } };
            type Gotten = PathStringToObject<'/user/:userId/token/:tokenId', string>;
            expectTypeOf<Gotten>().toEqualTypeOf<Expected>();
        }
    });

    it('should work with custom return type', () => {
        {
            type Expected = { api: { v1: { handler: boolean } } };
            type Gotten = PathStringToObject<'/api/v1/:handler', boolean>;
            expectTypeOf<Gotten>().toEqualTypeOf<Expected>();
        }
    });

    it('should handle complex path', () => {
        {
            type Expected = { users: { profile: { settings: string } } };
            type Gotten = PathStringToObject<'/users/profile/settings', string>;
            expectTypeOf<Gotten>().toEqualTypeOf<Expected>();
        }
    });

    it('should preserve parameter names', () => {
        {
            type Expected = { api: { posts: { postId: { comments: { commentId: string } } } } };
            type Gotten = PathStringToObject<'/api/posts/:postId/comments/:commentId', string>;
            expectTypeOf<Gotten>().toEqualTypeOf<Expected>();
        }
    });
});