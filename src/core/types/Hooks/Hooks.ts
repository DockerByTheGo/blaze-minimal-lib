import { LastOf, TypeMarker } from "@blazyts/better-standard-library";

export type Hook = (v: unknown) => unknown;

export class Hooks<THook extends Hook[]> implements TypeMarker<"Hooks">{
    type = "Hooks";
    getType() {
        return this.type;
    }
    TGetType() {
        return THook;
    }
    constructor(){
        
    }

    TGetLastHook: LastOf<THook>
}