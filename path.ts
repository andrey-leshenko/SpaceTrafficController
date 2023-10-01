import { Point } from './utils.js'

export interface Path {
    length: number
    getPos(fraction: number): Point
    getAlternatePos(fraction: number): Point[]
    pointToFraction(point: Point): number
    rotateAround(point: Point, angle: number): Path
    trace(ctx: CanvasRenderingContext2D): void
    directionAt(fraction: number): number
}
