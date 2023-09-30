import { Point } from './utils.js'

export interface Path {
    length: number
    getPos(fraction: number): { x: number, y: number }
    pointToFraction(point: Point): number
    rotateAround(point: Point, angle: number): Path
    trace(ctx: CanvasRenderingContext2D): void
}
