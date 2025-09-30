
type RouteHandler = {
    RequestData: object;
    Responses: Record<number, object>;
};
export type Router = Record<string, RouteHandler>;
