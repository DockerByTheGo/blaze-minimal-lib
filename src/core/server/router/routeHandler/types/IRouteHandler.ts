import { URecord } from "@blazyts/better-standard-library"

export type Response = {
    body: URecord
}

export type Request = {
    body: URecord
}

export interface IRouteHandler<
    TRequest extends Request,
    TResponse extends Response
> {
    handleRequest: (arg: TRequest) => TResponse
}