// might be better to not be setting the protocol in here but instead manually add a protol to the end of the object by going to the last field in the generated object
export type PathStringToObject<
  TPath extends string,
  THandler,
  TProtocol extends string,
  ReturnType = {},
>
  = TPath extends `/${infer CurrentPart}/${infer Rest}`
    ? { [K in CurrentPart]: PathStringToObject<`/${Rest}`, THandler, TProtocol> }
    : TPath extends `/${infer Param}`
      ? ReturnType & { [K in Param]: { "/": { [P in TProtocol]: THandler } } }
      : ReturnType;
