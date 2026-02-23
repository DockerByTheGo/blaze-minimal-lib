
// might be better to not be setting the protocol in here but instead manually add a protol to the end of the object by going to the last field in the generated object 
export type PathStringToObject<T extends string, C, TProtocol extends string , ReturnType = {}> =
    T extends `/${infer CurrentPart}/${infer Rest}`
    ? { [K in CurrentPart]: PathStringToObject<`/${Rest}`, C, TProtocol> }
    : T extends `/${infer Param}`
    ? ReturnType & { [K in Param]: { "/": { [P in TProtocol]: C } } }
    : ReturnType