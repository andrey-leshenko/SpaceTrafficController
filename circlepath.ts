import { Point, dist, getRandomChunk } from './utils.js'
import { Space } from './space.js'
import { Path } from './path.js'

export class CirclePath implements Path {
    length: number
    center: Point
    radius: number
    space: Space

    constructor(space: Space, center: Point, radius: number) {
        this.center = center
        this.radius = radius
        this.length = 2 * Math.PI * radius
        this.space = space
    }

    getPos(fraction: number): Point {
        return { x: 0, y: 0 }
    }

    trace(ctx: CanvasRenderingContext2D): void {
        ctx.moveTo(this.center.x, this.center.y)
        ctx.lineTo(this.center.x, this.center.y)
    }

    pointToFraction(point: Point): number {
        let distFromStart = dist(point, this.center)
        return distFromStart / this.length
    }

    rotateAround(point: Point, angle: number): Path {
        return this;
    }
}