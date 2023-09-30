
type Point = {x: number, y: number}

interface Path {
    length: number
    getPos(fraction: number): {x: number, y: number}
}

function dist(p1: Point, p2: Point) {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y)
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

    constructor(path: Path) {
        this.path = path
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

    drawSelf(ctx: CanvasRenderingContext2D) {
        let {x, y} = this.getPosAtTime()
        ctx.fillStyle = "purple"
        ctx.beginPath()
        ctx.arc(x, y, this.radius, 0, 2 * Math.PI)
        ctx.fill()
    }
}