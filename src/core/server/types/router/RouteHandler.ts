import type { HttpResponse } from "../../../client/types/HttpResponse";

export type RouteHandler = {
  RequestData: object;
  Responses: HttpResponse;
};
