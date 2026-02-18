


export type IRouteHandlerMetadata =  {
  subRoute: string,
  url: string
}

export type IRouteHandler<
  TRequest extends Request,
  TResponse extends Response,
> = {
  handleRequest: (arg: TRequest) => TResponse;
  getClientRepresentation: (metadata: IRouteHandlerMetadata ) => unknown;
  metadata: unknown
};
