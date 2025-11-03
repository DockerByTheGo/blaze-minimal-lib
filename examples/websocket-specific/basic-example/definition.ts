import { z } from "zod";

import { CustomWebSocketRouter } from "../../../src/builtins/websocket/server";

export const wsRouter = new CustomWebSocketRouter(
    {
        helloRoute: {
            messagesItCanReceive: {
                newData: z.object({
                    message: z.string().min(20),
                }),
                newNotification: z.object({
                    authToken: z.string(),
                    data: z.object({
                        metadata: z.string(),
                        message: z.string(),
                    }),
                }),
            },
            messagesItCanSend: {
                sendHelloTheOtherListeners: z.object({
                    message: z.string().nonempty(),
                }),
                sayByeToRestOfTheListeners: z.object({
                    byeConfig: z.object({
                        people: z.array(z.string()),
                    }),
                }),
            },
        },
        userRoute: {
            messagesItCanReceive: {
                checkForInvalidUsersInRoom: z.object({
                    roomId: z.number(),
                    authKey: z.string(),
                    userId: z.number(),
                }),
                deleteUser: z.object({
                    userId: z.string(),
                    authKey: z.string(),
                }),
            },
            messagesItCanSend: {
                invalidUserDetected: z.object({
                    userId: z.string(),
                }),
                deletedUser: z.object({
                    userId: z.string(),
                }),
            },
        },
    },
);
