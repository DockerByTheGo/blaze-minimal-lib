import { panic, TypeMarker } from "@blazyts/better-standard-library";
import { NormalRouting } from "../normal/variations/NormalRouting";
import { RouteMAtcher } from "../types";
import { ExtractParams } from "./types/extractParams";
import { getParts } from "../utils/getParts";
import { Optionable } from "@blazyts/better-standard-library/src/data_structures/functional-patterns/option/main";


const IsDynamic = (s: string) => s[0] === ":"

function match<T extends string>(schema: T, config: { [K in T]: (v: K) => void }) {
    return config[schema](schema)
}

const types = [{ date: "(" }, { number: "$" }] as const

function getParamType(s: ("date" | "number") & {} ): Optionable<"date" | "number"> {
    s.length > 1 && panic("only one char accecpted");

    return [...types.values()].includes(s)
    ? Optionable.new(s) 
    : Optionable.none()

}

export class DSLRouting<TRoute extends string> implements RouteMAtcher<ExtractParams<TRoute>> {
    constructor(public readonly matcher: TRoute) {

    }

    getRouteString() { return this.matcher }
    TGetContextType: ExtractParams<TRoute>;

    typeInfo: TypeMarker<string>;

    match(path: string): Optionable<ExtractParams<TRoute>> {
        const matcherParts = getParts(this.matcher)
        const pathParts = getParts(path)

        const g: typeof this.TGetContextType = {}
        for (let i = 0; i < matcherParts.length; i++) {
            const currentMatcherPart = matcherParts[i]
            const currentRoutePart = pathParts[i]

            if (IsDynamic(currentMatcherPart)) {
                
                const paramName = currentMatcherPart.slice(1, currentMatcherPart.length - 1)
                const ParamType = getParamType(currentMatcherPart[currentMatcherPart.length - 1])
                ParamType.try({
                    ifNone: () => g[paramName] = currentRoutePart as string,
                    ifNotNone: v => match(
                        v,
                        {
                            "date": v => g[paramName] = new Date(currentRoutePart),
                            "number": v => g[paramName] = new Number(v)
                        }
                    )

                })
            } else {

                if (currentMatcherPart === currentRoutePart) {

                } else {
                    return Optionable.none()
                }
            }

        }

        return new Optionable(g)

    }
}
