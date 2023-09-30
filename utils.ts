export type Point = {x: number, y: number}
export type Rectangle = {x: number, y: number, width: number, height: number}

export function dist(p1: Point, p2: Point) {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y)
}
