import { Point, dist, getRandomChunk } from './utils.js'
import { Space } from './space.js'
import { Path } from './path.js'

function interpolate(start: number, end: number, fraction: number): number {
    return (1 - fraction) * start + fraction * end
}

export class LinePath implements Path {
    length: number
    start: Point
    end: Point
    space: Space

    static spawnLinePath(space: Space, launch_pt: Point) {
        let angle_rad = getRandomChunk(0, 360, 15) * Math.PI / 180.0
        return new LinePath(space, launch_pt, angle_rad)
    }

    constructor(space: Space, point: Point, angle: number) {
        this.space = space

        if (Math.abs(Math.cos(angle)) < 0.001) {
            // Vertical path
            let top = { x: point.x, y: 0 }  // TODO use space boundaries
            let bottom = { x: point.x, y: this.space.height }
            if (Math.sin(angle) > 0) {
                this.start = top
                this.end = bottom
            } else {
                this.start = bottom
                this.end = top
            }
        } else {

            let m = Math.tan(angle)
            let topHitX
            let bottomHitX
            if (Math.abs(m) < 0.001) {
                topHitX = -1000000
                bottomHitX = 1000000
            } else {
                topHitX = point.x - (point.y - 0) / m
                bottomHitX = point.x + (space.height - point.y) / m
            }
            let rightHitY = point.y + (space.width - point.x) * m
            let leftHitY = point.y - (point.x - 0) * m

            let end
            let start

            // Assume rightwards path
            if (m < 0 && topHitX < space.width && topHitX > 0) {
                end = { x: topHitX, y: 0 }
            } else if (m > 0 && bottomHitX < space.width) {
                end = { x: bottomHitX, y: space.height }
            } else {
                end = { x: space.width, y: rightHitY }
            }

            if (m > 0 && topHitX > 0) {
                start = { x: topHitX, y: 0 }
            } else if (m < 0 && bottomHitX > 0 && bottomHitX < space.width) {
                start = { x: bottomHitX, y: space.height }
            } else {
                start = { x: 0, y: leftHitY }
            }

            if (Math.cos(angle) < 0) {
                let tmp = start
                this.start = end
                this.end = start
            } else {
                this.start = start
                this.end = end
            }
        }

        this.length = dist(this.start, this.end)
        this.space = space
    }

    getPos(fraction: number): { x: number, y: number } {
        return {
            x: interpolate(this.start.x, this.end.x, fraction),
            y: interpolate(this.start.y, this.end.y, fraction)
        }
    }

    getAlternatePos(fraction: number): Point[] {
        if (fraction < 0.5)
            return [this.getPos(fraction + 1)]
        else
            return [this.getPos(fraction - 1)]
    }

    pointToFraction(point: Point): number {
        let distFromStart = dist(point, this.start)
        return distFromStart / this.length
    }

    trace(ctx: CanvasRenderingContext2D): void {
        ctx.moveTo(this.start.x, this.start.y)
        ctx.lineTo(this.end.x, this.end.y)
    }

    rotateAround(point: Point, angle: number): Path {
        return new LinePath(this.space, point, angle)
    }
}