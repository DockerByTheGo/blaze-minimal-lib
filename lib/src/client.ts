


export type isSucessfull<N extends number> = true

export type Route<T extends Record<number, Record<string, unknown>>> = T

export type Client<T extends Record<number, Record<string, unknown>>>= {
    [StatusCode in keyof T]: (v: T[StatusCode]) => void
}

export type j = Client<{
    200: {jo: string}
}>



const g: j =  {}




