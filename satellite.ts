import {Point, dist} from './utils.js'
import {Space} from './space.js'

interface Path {
    length: number
    getPos(fraction: number): {x: number, y: number}
    rotateAround(point: Point, angle: number): Path
    trace(ctx: CanvasRenderingContext2D): void
}

function interpolate(start: number, end: number, fraction: number): number {
    return (1 - fraction) * start + fraction * end
}

export class LinePath implements Path {
    length: number
    start: Point
    end: Point
    space: Space

    constructor(space: Space, start: Point, end: Point) {
        this.start = start
        this.end = end
        this.length = dist(start, end)
        this.space = space
    }

    getPos(fraction: number): {x: number, y: number} {
        return {x: interpolate(this.start.x, this.end.x, fraction),
                y: interpolate(this.start.y, this.end.y, fraction)}
    }

    trace(ctx: CanvasRenderingContext2D): void {
        ctx.moveTo(this.start.x, this.start.y)
        ctx.lineTo(this.end.x, this.end.y)
    }

    rotateAround(point: Point, angle: number): Path {
        if (Math.abs(Math.cos(angle)) < 0.001) {
            // Vertical path
            let top = {x: point.x, y: 0}  // TODO use space boundaries
            let bottom = {x: point.x, y: this.space.height}
            if (Math.sin(angle) > 0) {
                return new LinePath(this.space, top, bottom)
            } else {
                return new LinePath(this.space, bottom, top)
            }
        }

        let m = Math.tan(angle)
        let topHitX
        let bottomHitX
        if (Math.abs(m) < 0.001) {
            topHitX = -1000000
            bottomHitX = 1000000
        } else {
            topHitX = point.x - (point.y - 0) / m
            bottomHitX = point.x + (this.space.height - point.y) / m
        }
        let rightHitY = point.y + (this.space.width - point.x) * m
        let leftHitY = point.y - (point.x - 0) * m

        let end
        let start

        // Assume rightwards path
        if (m < 0 && topHitX < this.space.width) {
            end = {x: topHitX, y: 0}
        } else if (m > 0 && bottomHitX < this.space.width) {
            end = {x: bottomHitX, y: this.space.height}
        } else {
            end = {x: this.space.width, y: rightHitY}
        }

        if (m > 0 && topHitX > 0) {
            start = {x: topHitX, y: 0}
        } else if (m < 0 && bottomHitX > 0) {
            start = {x: bottomHitX, y: this.space.height}
        } else {
            start = {x: 0, y: leftHitY}
        }

        if (Math.sin(angle) < 0) {
            let tmp = start
            start = end
            end = tmp
        }
        return new LinePath(this.space, start, end)
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

    previewNewPath(angle: number) {
        let newPath = this.path.rotateAround(this.getPosAtTime(), angle)
        this.space.ctx.strokeStyle = "#505"
        this.space.ctx.lineWidth = 2
        this.space.ctx.beginPath()
        newPath.trace(this.space.ctx)
        this.space.ctx.stroke()
    }

    drawPath() {
        this.space.ctx.strokeStyle = "#505"
        this.space.ctx.lineWidth = 2
        this.space.ctx.beginPath()
        this.path.trace(this.space.ctx)
        this.space.ctx.stroke()
    }

    drawSelf() {
        let {x, y} = this.getPosAtTime()
        this.space.ctx.fillStyle = "#808"
        this.space.ctx.beginPath()
        this.space.ctx.arc(x, y, this.radius, 0, 2 * Math.PI)
        this.space.ctx.fill()
    }
}