import { panic } from "@blazyts/better-standard-library";

export class Port<TPort extends number = number> {
  constructor(public readonly port: number) {
    this.port < 0 && panic(`invalid port number it must be between 0 and ... but got ${this.port}`);
  }
}
