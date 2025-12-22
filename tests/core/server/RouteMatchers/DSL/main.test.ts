import { DSLRouting } from "../../../../../src/core/server/router/routeMatcher/dsl/main";
import { expect, expectTypeOf, vitest } from "vitest"

const routeMatcher = new DSLRouting("/koko/:hi$/:koko$/:jiji")

function mapTest<T1, T2>(a: T1, b: T2, handler: (v: { recieved: T1, expected: T2 }) => void) {
    handler({ recieved: a, expected: b })
}



const expected = routeMatcher.match("/koko/2/3/kdoeko")
console.log(expected.unpack().raw)
const a = routeMatcher.TGetContextType
expectTypeOf(a).toEqualTypeOf<{ koko: Date; hi: number; jiji: string }>()

{
    mapTest(routeMatcher.match("/kiki/2/4/koko"), null, ({ expected, recieved }) => {
        expect(recieved.raw).toBe(null)
    })

}

{
    const expected = routeMatcher.match("/koko/2/3/kdoeko")
    console.log(expected.unpack())
    expect(expected).toBe({
        hi: 2,
        koko: 3,
        jiji: "kdoeko"
    })
}