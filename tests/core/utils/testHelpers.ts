import type { Hook } from "../../src/core/types/Hooks/Hooks";

/**
 * Creates a simple mock hook for testing.
 */
export function createMockHook<TName extends string, THandler extends (...args: any[]) => any>(
    name: TName,
    handler: THandler
): Hook<TName, THandler> {
    return {
        name,
        handler
    };
}

/**
 * Creates an identity hook that passes through its input unchanged.
 */
export function createIdentityHook<TName extends string>(name: TName) {
    return createMockHook(name, (x: any) => x);
}

/**
 * Creates a spy hook that tracks calls while passing through values.
 */
export function createSpyHook<TName extends string>(
    name: TName,
    onCall?: (arg: any) => void
) {
    const calls: any[] = [];

    const hook = createMockHook(name, (arg: any) => {
        calls.push(arg);
        onCall?.(arg);
        return arg;
    });

    return {
        hook,
        calls,
        reset: () => calls.length = 0,
        getCallCount: () => calls.length,
        getLastCall: () => calls[calls.length - 1],
        getAllCalls: () => [...calls]
    };
}

/**
 * Creates a mock request object for testing.
 */
export function createMockRequest(overrides: {
    path?: string;
    headers?: Record<string, string>;
    body?: any;
    method?: string;
} = {}) {
    return {
        path: overrides.path ?? "/",
        headers: overrides.headers ?? {},
        body: overrides.body ?? {},
        method: overrides.method ?? "GET"
    };
}

/**
 * Helper to assert that a value is defined (not undefined or null).
 */
export function assertDefined<T>(
    value: T | undefined | null,
    message = "Expected value to be defined"
): asserts value is T {
    if (value === undefined || value === null) {
        throw new Error(message);
    }
}

/**
 * Waits for a specific amount of time (useful for async tests).
 */
export function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Creates a mock handler function with tracking.
 */
export function createMockHandler<TInput, TOutput>(
    implementation: (input: TInput) => TOutput
) {
    const calls: TInput[] = [];

    const handler = (input: TInput): TOutput => {
        calls.push(input);
        return implementation(input);
    };

    return {
        handler,
        calls,
        reset: () => calls.length = 0,
        getCallCount: () => calls.length,
        getLastCall: () => calls[calls.length - 1],
        getAllCalls: () => [...calls]
    };
}
