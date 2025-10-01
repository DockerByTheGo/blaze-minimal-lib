import { HttpResponse } from "../client/client";


export type RouteHandler = {
    RequestData: object;
    Responses: HttpResponse;
};
