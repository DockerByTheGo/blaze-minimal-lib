import { ParamType } from "../../types/ParamType"
import { RemoveStringFromStringUnion } from "@blazyts/better-standard-library"

export class RouteBuilder<RouteHandlerObject extends {type:  ParamType, name: string }[]> {
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
