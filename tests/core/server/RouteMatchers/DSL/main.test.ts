import { DSLRouting } from "../../../../../src/core/server/router/routeMatcher/dsl/main";
import {expectTypeOf} from "vitest"

const routeMatcher = new DSLRouting("/:hi$/:koko$/:jiji")

// const a = routeMatcher.TGetContextType
// expectTypeOf(a).toEqualTypeOf<{koko: Date;hi: number; jiji: string}>()

routeMatcher.match("/2/4/koko").expect("").map(console.log)