import { LastOf } from "bun-types/vendor/expect-type";
import { Config } from "./types/Config";
import { ClientHooks } from "./types/ClientHooks";
import { Router } from "../server/Router";
import { GetLastHookReturnType } from "../types/Hooks/GetLastHooks";

export type Range400to499 =
  | 400 | 401 | 402 | 403 | 404 | 405 | 406 | 407 | 408 | 409
  | 410 | 411 | 412 | 413 | 414 | 415 | 416 | 417 | 418 | 419
  | 420 | 421 | 422 | 423 | 424 | 425 | 426 | 427 | 428 | 429
  | 430 | 431 | 432 | 433 | 434 | 435 | 436 | 437 | 438 | 439
  | 440 | 441 | 442 | 443 | 444 | 445 | 446 | 447 | 448 | 449
  | 450 | 451 | 452 | 453 | 454 | 455 | 456 | 457 | 458 | 459
  | 460 | 461 | 462 | 463 | 464 | 465 | 466 | 467 | 468 | 469
  | 470 | 471 | 472 | 473 | 474 | 475 | 476 | 477 | 478 | 479
  | 480 | 481 | 482 | 483 | 484 | 485 | 486 | 487 | 488 | 489
  | 490 | 491 | 492 | 493 | 494 | 495 | 496 | 497 | 498 | 499;

export type Range200to300 =
  200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 209
| 210 | 211 | 212 | 213 | 214 | 215 | 216 | 217 | 218 | 219
| 220 | 221 | 222 | 223 | 224 | 225 | 226 | 227 | 228 | 229
| 230 | 231 | 232 | 233 | 234 | 235 | 236 | 237 | 238 | 239
| 240 | 241 | 242 | 243 | 244 | 245 | 246 | 247 | 248 | 249
| 250 | 251 | 252 | 253 | 254 | 255 | 256 | 257 | 258 | 259
| 260 | 261 | 262 | 263 | 264 | 265 | 266 | 267 | 268 | 269
| 270 | 271 | 272 | 273 | 274 | 275 | 276 | 277 | 278 | 279
| 280 | 281 | 282 | 283 | 284 | 285 | 286 | 287 | 288 | 289
| 290 | 291 | 292 | 293 | 294 | 295 | 296 | 297 | 298 | 299
| 300;

export type HttpResponse = {
    status: number;
    body: unknown;
}

export class ClientBuilder<
    TRouter extends Router,
    THooks extends ClientHooks
> {
    constructor(
        private hooks: THooks,
        private config: Config,
        protected router: TRouter
    ){}

    hook<
        THookType extends keyof ClientHooks,
        THookName extends string,
        TReturn
    >(args: {
        name: THookName;
        type: THookType;
        handler: (v: GetLastHookReturnType<THooks[THookType]>) => TReturn;
    }): ClientBuilder<
        TRouter,
        THooks & { [K in THookType]: { handler: (v: GetLastHookReturnType<THooks[THookType]>) => TReturn } }
    > {
        this.hooks[args.name] = args;
        return this;
    }
    
    beforeSend< // make it so that if we add a certain header here it removes it from the requored parameters
        TReturn
    >(
        func: (arg: LastOf<THooks["beforeSend"]>) => TReturn
    ): ClientBuilder<
        TRouter,
        THooks & { beforeSend: { handler: (arg: LastOf<THooks["beforeSend"]>) => TReturn } }
    > {
        this.hooks["beforeSend"] = {
            handler: func,
            type: "beforeSend"
        };
        return this;
    }

    static new<TRouter extends Router>(router: TRouter){
        return new ClientBuilder<
            TRouter,
            ClientHooks
        >(
            {
                "afterReceive": [],
                "beforeSend": [],
                "onErrored": []
            }, 
            {
                retries: 3,
            },
            router
        );
    }
}

