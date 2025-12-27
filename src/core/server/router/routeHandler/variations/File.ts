import fs from "node:fs";

import type { IRouteHandler } from "../types/IRouteHandler";

export class FileRouteHandler implements IRouteHandler<
  { body: { file: File } },
  {}
> {
  constructor(private filePath: string) { }

  handleRequest(): { body: { file: File } } {
    return {
      body: {
        file: fs.createReadStream(this.filePath),
      },
    };
  }
}
