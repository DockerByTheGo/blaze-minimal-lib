

export type PathStringToObject<T extends string, C, ReturnType = {}> =
    T extends `/${infer CurrentPart}/${infer Rest}`
    ? { [K in CurrentPart]: PathStringToObject<`/${Rest}`, C> }
    : T extends `/${infer Param}`
    ? ReturnType & { [K in Param]: { "/": C } }
    : ReturnType