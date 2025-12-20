export function getParts(s: string): string[] {
    return s.split("/").filter(v => v !== "")
}

console.log(getParts("/hihi/lplp/jiji"))