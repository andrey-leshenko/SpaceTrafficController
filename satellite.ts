import {Point, dist} from './utils.js'
import {Space} from './space.js'

interface Path {
    length: number
    getPos(fraction: number): {x: number, y: number}
}

function interpolate(start: number, end: number, fraction: number): number {
    return (1 - fraction) * start + fraction * end
}

export class LinePath implements Path {
    length: number
    start: Point
    end: Point

    constructor(start: Point, end: Point) {
        this.start = start
        this.end = end
        this.length = dist(start, end)
    }

    getPos(fraction: number): {x: number, y: number} {
        return {x: interpolate(this.start.x, this.end.x, fraction),
                y: interpolate(this.start.y, this.end.y, fraction)}
    }
}

export class Satellite {
    pathFraction = 0
    speed = 1
    radius: number = 1
    path: Path
    space: Space

    constructor(space: Space, path: Path) {
        this.path = path
        this.space = space
    }

    update(dt: number) {
        this.pathFraction += dt * this.speed / this.path.length
        this.pathFraction -= Math.floor(this.pathFraction)
    }

    getPosAtTime(dt: number = 0) {
        let fraction = this.pathFraction + dt * this.speed / this.path.length
        fraction -= Math.floor(fraction)
        return this.path.getPos(fraction)
    }

    setNewPath(angle: number) {}

    previewNewPath(ctx: CanvasRenderingContext2D, angle: number) {}

    drawPath(ctx: CanvasRenderingContext2D) {}

    drawSelf() {
        let {x, y} = this.getPosAtTime()
        this.space.ctx.fillStyle = "#808"
        this.space.ctx.beginPath()
        this.space.ctx.arc(x, y, this.radius, 0, 2 * Math.PI)
        this.space.ctx.fill()
    }
}