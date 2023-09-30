import { Space } from './space.js'
import { Path } from './path.js'
import { Point } from './utils.js'


let satelliteImage = new Image()
satelliteImage.src = "assets/sat.png"
let warningImage = new Image()
warningImage.src = "assets/warn.png"

export class Satellite {
    pathFraction = 0
    speed = 20
    radius: number = 15
    warningIconSize = 15
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
        this.space.ctx.imageSmoothingEnabled = false
        let { x, y } = this.getPosAtTime()
        this.space.ctx.fillStyle = `hsl(${this.hue}, 80%, 80%)`
        this.space.ctx.drawImage(satelliteImage,
            x - this.radius,
            y - this.radius, this.radius * 2, this.radius * 2)
        if (this.collisionWarning) {
            this.space.ctx.drawImage(warningImage,
                x + this.radius - this.warningIconSize / 2,
                y - this.radius - this.warningIconSize / 2,
                this.warningIconSize, this.warningIconSize)
        }
    }
}