import { URecord } from "@blazyts/better-standard-library"

class RequestObjectHelper<
TBodySchema extends URecord,
THeaders extends URecord,
TPath extends String
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
}
