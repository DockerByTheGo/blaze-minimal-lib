import type { ITypeMarked, Optionable, URecord } from "@blazyts/better-standard-library";

export type RouteMAtcher<TGetContextType extends URecord> = {
  match: (path: string) => Optionable<TGetContextType>;
  getRouteString: () => string;
  TGetRouteString:string 
  TGetContextType: TGetContextType;
} & ITypeMarked<string>;
