export type Point = {x: number, y: number}

export function dist(p1: Point, p2: Point) {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y)
}

// Random int in [min, max)
function getRandomInt(min: number, max: number) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min) + min)
}

export function getRandomChunk(min: number, max: number, quantization: number) {
    return getRandomInt(min / quantization, max / quantization) * quantization;
}
