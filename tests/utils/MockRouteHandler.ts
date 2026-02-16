import type { Optionable } from "@blazyts/better-standard-library";
import type { IRouteHandler, Request, Response } from "../../src/core/server/router/routeHandler/types/IRouteHandler";

/**
 * A simple mock route handler for testing purposes.
 * Handles requests with customizable response generation.
 */
export class MockRouteHandler<
    TRequest extends Request = Request,
    TResponse extends Response = Response
> implements IRouteHandler<TRequest, TResponse> {
    constructor(
        private responseFactory: (request: TRequest) => TResponse,
        public getClientRepresentation: unknown = {}
    ) { }

    /**
     * Handles the request and returns a response.
     */
    handleRequest(request: TRequest): TResponse {
        return this.responseFactory(request);
    }
}


console.log(new MockRouteHandler(req => req, {}).handleRequest({body: {jo: ""}}))

/**
 * A mock route handler that always returns a fixed response.
 */
export class FixedResponseRouteHandler<
    TRequest extends Request = Request,
    TResponse extends Response = Response
> implements IRouteHandler<TRequest, TResponse> {
    constructor(
        private response: TResponse,
        public getClientRepresentation: unknown = {}
    ) { }

    handleRequest(request: TRequest): TResponse {
        return this.response;
    }
}

/**
 * A mock route handler that echoes the request body back in the response.
 */
export class EchoRouteHandler<
    TRequest extends Request = Request,
    TResponse extends Response = Response
> implements IRouteHandler<TRequest, TResponse> {
    constructor(
        public getClientRepresentation: unknown = {}
    ) { }

    handleRequest(request: TRequest): TResponse {
        return { body: request.body } as TResponse;
    }
}

/**
 * A mock route handler that throws an error when handling a request.
 */
export class ThrowingRouteHandler<
    TRequest extends Request = Request,
    TResponse extends Response = Response
> implements IRouteHandler<TRequest, TResponse> {
    constructor(
        private errorMessage: string = "Handler error",
        public getClientRepresentation: unknown = {}
    ) { }

    handleRequest(request: TRequest): TResponse {
        throw new Error(this.errorMessage);
    }
}

/**
 * Helper function to create a mock route handler with a custom handler function.
 */
export function createCustomMockRouteHandler<
    TRequest extends Request = Request,
    TResponse extends Response = Response
>(
    handleFn: (request: TRequest) => TResponse,
    clientRepresentation: unknown = {}
): IRouteHandler<TRequest, TResponse> {
    return {
        handleRequest: handleFn,
        getClientRepresentation: clientRepresentation
    };
}

/**
 * Helper to create a simple mock route handler.
 */
export function mockHandler<TRequest extends Request = Request, TResponse extends Response = Response>(
    response: TResponse
): FixedResponseRouteHandler<TRequest, TResponse>;

export function mockHandler<TRequest extends Request = Request, TResponse extends Response = Response>(
    responseFactory: (request: TRequest) => TResponse
): MockRouteHandler<TRequest, TResponse>;

export function mockHandler<TRequest extends Request = Request, TResponse extends Response = Response>(
    responseOrFactory: TResponse | ((request: TRequest) => TResponse)
): IRouteHandler<TRequest, TResponse> {
    if (typeof responseOrFactory === 'function') {
        return new MockRouteHandler(responseOrFactory);
    }

    return new FixedResponseRouteHandler(responseOrFactory);
}
