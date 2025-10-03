import { HttpResponse } from "../../../client/client";


export type RouteHandler = {
    requestData: object;
    handler: () => {}
};
