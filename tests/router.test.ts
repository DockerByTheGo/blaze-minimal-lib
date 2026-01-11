import { describe, expect, expectTypeOf, it } from 'vitest';
import { RouterObject } from '../src/core/server/router/Router';
import type { RequestObjectHelper } from '../src/core/utils/RequestObjectHelper';
import { URecord } from '@blazyts/better-standard-library';

describe('Router beforeRequest first mode', () => {
    it('should place the hook at the first position when placer is "first"', () => {
        const router = RouterObject
        .empty()
        .beforeRequest({
            name: 'test' as const,
            handler: (arg) => {
                const dummyPath1 = arg.path;
                const dummyHeaders1 = arg.headers;
                
                return arg;
            },
            placer: 'first',
        });
        
        expect(router.routerHooks.beforeRequest.v.length).toBe(1);
        expect(router.routerHooks.beforeRequest.v[0].name).toBe('test');
    });

    it('should make the arg of the hook handler to be of the correct initial type when no prev hooks are present "', () => {
        const router = RouterObject
        .empty()
        .beforeRequest({
            name: 'test' as const,
            handler: (arg) => {
                // by default it should give  the empty request object 
                expectTypeOf(arg).toEqualTypeOf<{body: URecord}>()
                return arg;
            },
            placer: 'last',
        });

        expect(router.routerHooks.beforeRequest.v.length).toBe(1);
        expect(router.routerHooks.beforeRequest.v[0].name).toBe('test');
    });

    it('should place the hook at the first position when placer is "first" and hooks already exist', () => {
        const router = RouterObject
            .empty()
            .beforeRequest({
                name: 'hook1',
                handler: (arg) => { //! its importnat to add a manual arg type to the first hook since itherwise the first mode fails
                    const dummyPath3 = arg.path;
                    const dummyHeaders3 = arg.headers;

                    return { dummyHeaders3, dummyPath3 };
                },
                placer: 'last',
            })
            .beforeRequest({
                name: 'hook2',
                handler: (arg) => {
                    const dummyPath4 = arg;
                    const dummyHeaders4 = arg;
                    return { dummyHeaders4, dummyPath4 };
                },
                placer: 'last',
            })
            .beforeRequest({
                name: 'hook3',
                placer: 'first',
                handler: v => {
                    return {}
                    // this should show an error since the return type isnt matcching the retur ntype of the forst handler 
                }
            });

        
        expect(router.routerHooks.beforeRequest.v.length).toBe(3);
        expect(router.routerHooks.beforeRequest.v[0].name).toBe('hook3');
        expect(router.routerHooks.beforeRequest.v[1].name).toBe('hook1');
        expect(router.routerHooks.beforeRequest.v[2].name).toBe('hook2');
    });
});