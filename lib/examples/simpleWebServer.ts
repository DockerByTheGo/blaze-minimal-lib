import { z } from "zod";

import { ResponseStatus, WebRouter } from "../src/app";
import { builtIns } from "../src/builtins/main";
import { ApiPath } from "../src/types/apiApth";
import { FileName } from "../src/types/filename";
import { Port } from "../src/types/networking/port";
import { Url } from "../src/types/networking/url";
import { SubrouteDefinition } from "../src/types/openapi/main";
import { GetSet } from "../src/utils/getSetClass";

type DB = {
    getUser: (userId: string) => string | null;
};

const port = 3003;

class ExampleDb implements DB {
    getUser(userId: string): string | null {
        return "hi";
    }
}

const app = new WebRouter({ db: new ExampleDb() }, new SubrouteDefinition(new Url(new GetSet(`http://localhost:${port}`)))); // TODO make the second argumnt to instead be amde internally

app.withMiddlewares(
    builtIns.middlewares.fileUploading.defaultFileUpload(new FileName("file")),
);

const userRouter = app.createChildRouter({ usersRepo: {} }, new ApiPath("/users"));

userRouter.post(
    new ApiPath("/user"),
    {
        body: z.object({
            name: z.string(),
        }),
        responses: z.union(
            [
                z.object({
                    statusCode: z.literal(201),
                    message: z.string().min(20),
                }),
                z.object({
                    statusCode: z.literal(400),
                    hui: z.string().min(20),
                }),
            ],
        ),
        params: z.object({
            hui: z.string(),
            userId: z.string(),
        }),
        query: z.object({
            gg: z.string().min(30),
        }),
    },
    async (r) => {
        r.query.gg;
        return {
            status: new ResponseStatus(201),
            data: {
                statusCode: 201 as 400,
                hui: "User created",
            },
        };
    },
);

export const cleint = await app.generateClient();

app.start(new Port(port));
