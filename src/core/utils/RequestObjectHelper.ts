import { URecord } from "@blazyts/better-standard-library"
import { Path } from "../server/router/utils/path/Path"

// here we are doing transformation on demand so that we wrap the core object around this helers inly when needed to not hurt performace 

export class RequestObjectHelper<
TBodySchema extends URecord,
THeaders extends URecord,
TPath extends string
> {
    constructor(
        private readonly v: {
            body: TBodySchema, 
            headers: THeaders
        }
    ){

    }

    get body(): TBodySchema & {
        getUnsafe<T = unknown>(property: string): T,
        safeAccess: TBodySchema
    }{
        return {
            ...this.v,
            getUnsafe: (property: string) => {
                return this.v.body[property]
            }
        }
    }

    get path(): Path<TPath> {
        return
    }


}
