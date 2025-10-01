import { HttpResponse } from "../client";
import { isSuccess } from "../isSuccess";
import { isError } from "./isError";


export class ClientReponse<ResponseData extends HttpResponse> {
    constructor(public readonly rawData: ResponseData) { }

    match<
        Handler extends {
            [Key in keyof ResponseData as ResponseData[Key] extends isError<number> ? "ifError" : ResponseData[Key] extends isSuccess<number> ? "ifSuccess" : never]: (arg: ResponseData[Key]) => void;
        }
    >(handler: Handler): void {
    }

    isSuccesfull(): boolean {
        return this.rawData.status >= 200 && this.rawData.status < 300;
    }

    isEror(): boolean {
        return this.rawData.status >= 400 && this.rawData.status < 500;
    }
}
