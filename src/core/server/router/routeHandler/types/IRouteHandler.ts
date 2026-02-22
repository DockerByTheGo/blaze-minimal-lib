import { URecord } from "@blazyts/better-standard-library";



export type IRouteHandlerMetadata = {
  subRoute: string,
  serverUrl: string
}

export type IRouteHandler<
  TRequest extends URecord,
  TResponse extends URecord,
> = {
  handleRequest: (arg: TRequest) => TResponse;
  getClientRepresentation: (metadata: IRouteHandlerMetadata) => unknown;
  metadata: unknown
};

export type IRouteHandlerDefault = IRouteHandler<URecord, URecord>