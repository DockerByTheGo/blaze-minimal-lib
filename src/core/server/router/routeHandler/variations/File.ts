import { IRouteHandler } from "../types/IRouteHandler";
import fs from 'fs'


export class FileRouteHandler implements IRouteHandler<
    { body: { file: File }},
    {}
> {
    constructor(private filePath: string) { }

    handleRequest(): { body: {file: File} } {
        return {
            body: {
                file: fs.createReadStream(this.filePath)
            }
        }
    }
}