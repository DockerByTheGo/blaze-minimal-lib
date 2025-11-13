

export type HttpResponse = {
    status: number;
    body: unknown;
    headers: Record<string, string>;
}