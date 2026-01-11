import { IRouteHandler, Request, Response } from "../../routeHandler";

export type RouteTree = {
  [segment: string]: RouteTree | IRouteHandler<Request, Response>;
};