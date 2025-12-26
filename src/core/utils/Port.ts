import { panic } from "@blazyts/better-standard-library";

type Constructor<T = {}> = new (...args: any[]) => T;

function WithStaticNew<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    static new(
      ...args: ConstructorParameters<TBase>
    ): InstanceType<TBase> {
      return new Base(...args);
    }
  } as TBase & {
    new (...args: ConstructorParameters<TBase>): InstanceType<TBase>;
    new: (...args: ConstructorParameters<TBase>) => InstanceType<TBase>;
  };
}

function staticImplements<T>() {
    return <U extends T>(constructor: U) => {constructor};
}

type StaticNew<T> = {
    new(): T
}

export class Port<TPort extends number = number>{
    constructor(public readonly port: number){
        this.port < 0 && panic("invalid port number it must be between 0 and ... but got " + this.port)
    }
}





type Constructor<T = any> = new (...args: any[]) => T;


function h<T>(v:Constructor<T>, ...args: any[] ){
    return class T extends v {
        static new(): typeof v {

        }
    }
}

const pp = h(Port)
const p = pp.new()