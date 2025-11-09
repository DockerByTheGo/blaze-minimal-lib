import { ITypeMarked, Optionable } from "@blazyts/better-standard-library"

export interface RouteMAtcher<TGetContextType> extends ITypeMarked<string> {
    match: (path: string) => Optionable<TGetContextType>,
    getRouteString: () => string
    TGetContextType: TGetContextType
}
