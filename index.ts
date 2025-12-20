export { RouterObject } from "./src/core/server/router/Router";




type TypeMarked = {type: string}

function typeBasedMatch<T extends TypeMarked>(
  g: T,
  v: { [Case in T['type']]: (v: Extract<T, { type: Case }>) => void }
): void {
  // Use the type of `g` to call the appropriate function from `v`
  const handler = v[g.type as keyof typeof v]; // Get the handler by `g.type`
  if (handler) {
    handler(g); // Call the handler with the object
  } else {
    throw new Error(`No handler found for type: ${g.type}`);
  }
}



type MapUnionToTuple<U> = [U] extends [never] ? [] : [U, ...MapUnionToTuple<Exclude<U, U>>];

const g: {type: "string"} | {type: "number"} = 0;

type k = MapUnionToTuple<typeof g>
typeBasedMatch(g, {
    "number": v => v.type,
    "string": v => v.type
})




