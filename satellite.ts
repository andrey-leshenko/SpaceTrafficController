import {Space} from './space.js'
import {Path} from './path.js'
import {Point} from './utils.js'


export class Satellite {
    pathFraction = 0
    speed = 1
    radius: number = 1
    path: Path
    space: Space
    hue: number
    collisionWarning: boolean = false

    constructor(space: Space, path: Path, launch_pt: Point) {
        this.hue = Math.random() * 360
        this.path = path
        this.space = space
        this.pathFraction = this.path.pointToFraction(launch_pt)
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

    setNewPath(angle: number) {
        let newPath = this.path.rotateAround(this.getPosAtTime(), angle)
        let newFraction = newPath.pointToFraction(this.getPosAtTime())
        this.path = newPath
        this.pathFraction = newFraction
    }

    previewNewPath(angle: number) {
        let newPath = this.path.rotateAround(this.getPosAtTime(), angle)
        this.space.ctx.strokeStyle = `hsl(${this.hue}, 40%, 40%)`
        this.space.ctx.lineWidth = 6
        this.space.ctx.beginPath()
        newPath.trace(this.space.ctx)
        this.space.ctx.stroke()
    }

    drawPath() {
        this.space.ctx.strokeStyle = `hsl(${this.hue}, 40%, 40%)`
        this.space.ctx.lineWidth = 6
        this.space.ctx.beginPath()
        this.path.trace(this.space.ctx)
        this.space.ctx.stroke()
    }

    drawSelf() {
        let {x, y} = this.getPosAtTime()
        this.space.ctx.fillStyle = `hsl(${this.hue}, 80%, 80%)`
        this.space.ctx.beginPath()
        this.space.ctx.arc(x, y, this.radius, 0, 2 * Math.PI)
        this.space.ctx.fill()
    }
}