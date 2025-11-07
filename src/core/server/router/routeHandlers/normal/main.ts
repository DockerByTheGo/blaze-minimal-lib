import { ifNotNone, Optionable, TypeMarker, URecord } from "@blazyts/better-standard-library";
import { RouteMAtcher } from "../types";
import { RouteHandler } from "../../../types/router/RouteHandler";

type ParamType = "string" | "number" | "static";

type RemoveStringFromStringUnion<Union extends string, StringToREmove extends Union> = Union extends StringToREmove ? never : Union;

type IsDynamic<T extends string> = T extends `:${string}` ? true : false;

type ExtractParamName<T extends string> = 
  T extends `:${infer Name}` ? Name : never;

type ExtractParams<
  Path extends string,
  Acc extends Record<string, any> = {}
> = Path extends `/${infer Segment}/${infer Rest}`
  ? ExtractParams<
      `/${Rest}`,
      Acc & (IsDynamic<Segment> extends true
        ? { [K in ExtractParamName<Segment>]: string }
        : {})
    >
  : Path extends `/${infer Last}`
    ? Acc & (IsDynamic<Last> extends true
        ? { [K in ExtractParamName<Last>]: string }
        : {})
    : Acc;


type k = ExtractParams<"/users/:userId/posts/:postId/">

class RouteBuilder<RouteHandlerObject extends {type:  ParamType, name: string }[]> {
    constructor(private reqContext: RouteHandlerObject){}


    addDynamicParam<
        T extends string,
        Type extends RemoveStringFromStringUnion<ParamType, "static">
    >(
        name: T,
        type: Type
    ): T extends RouteHandlerObject[number]["name"] ? never :   RouteBuilder<[...RouteHandlerObject, {name: T, type: Type}]> {
        return new RouteBuilder([...this.reqContext, {name, type}])
    }

    addStaticParam<T extends string>(name: T): T extends  RouteHandlerObject[number]["name"] ? never : RouteBuilder<[...RouteHandlerObject, {type: "static", name: T}]> {
        return
    }

    static new<TParamType extends ParamType, TName extends string>(param: {type: TParamType, name: TName}){
            return new RouteBuilder([param])
    }

    static empty(){
        return new RouteBuilder([])
    }
}

const g  = RouteBuilder
            .new({type: "number", name: "userId"})
            .addDynamicParam("postId", "number")




export class Simple<
    T extends {name: string, paramType: "static" | "dynamic"}[]
> implements RouteMAtcher<{
    [Param in T[number] as Param["paramType"] extends "static" ? "" : Param["name"]]: Param["paramType"] extends "static" ? string : number
}>{
    typeInfo = new TypeMarker("Simple")
    constructor(private context: T){

    }

    getRouteString(){
        return this.context.map(param => param.paramType === "static" ? param.name : `:${param.name}`).join("/")
    }

    match: (path: string) => boolean;

    addDynamicParam<T extends string>(name: T): T extends  RouteHandlerObject[number]["name"] ? never : RouteBuilder<[...RouteHandlerObject, {type: "static", name: T}]> {
        return
    }

    addStaticParam<T extends string>(name: T): T extends  RouteHandlerObject[number]["name"] ? never : RouteBuilder<[...RouteHandlerObject, {type: "static", name: T}]> {
        return
    }

    static new(path: string){
        return new Simple(
            path
                .split("/")
                .map(
                    param => param.indexOf(":") !== -1 
                        ? {name: param.replace(":", ""), paramType: "dynamic"} 
                        : {name: param, paramType: "static"}
                    )
        )
    }

    static empty(){
        return new Simple([])
    }
}



export class NormalRouting<T extends string> implements RouteMAtcher<ExtractParams<T>> {
    
    type = "normal";

    constructor(private routeString: T){}


    getRouteString(){
        return this.routeString
    }

    typeInfo: TypeMarker<string>;

    match(path: string): Optionable<ExtractParams<T>>{
        return this.routeString === path ? this.routeString : undefined
    }

    TGetContextType: ExtractParams<T>

}