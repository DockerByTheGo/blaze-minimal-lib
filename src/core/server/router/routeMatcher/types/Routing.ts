import type { ITypeMarked, Optionable } from "@blazyts/better-standard-library";

export type RouteMAtcher<TGetContextType> = {
  match: (path: string) => Optionable<TGetContextType>;
  getRouteString: () => string;
  TGetRouteString: unknown
  TGetContextType: TGetContextType;
} & ITypeMarked<string>;
