import { Space } from './space.js'
import { Path } from './path.js'
import { PausableTimeout, Point, dist, modpos } from './utils.js'
import { LinePath } from './linepath.js'


let satelliteImage = new Image()
satelliteImage.src = "assets/sat.png"
let warningImage = new Image()
warningImage.src = "assets/warn.png"

export class Satellite {
    pathFraction = 0
    speed = 30
    radius: number = 15
    warningIconSize = 15
    path: Path
    space: Space
    hue: number
    collisionWarning: boolean = false
    active: boolean = false
    activateTimeout: PausableTimeout
    createTime: number

    constructor(space: Space, path: Path, launch_pt: Point) {
        this.hue = Math.random() * 360
        this.path = path
        this.space = space
        this.pathFraction = this.path.pointToFraction(launch_pt)
        this.activateTimeout = new PausableTimeout(this.activate.bind(this), 2)
        this.createTime = performance.now()/1000
    }

    pause() {
        this.activateTimeout.pause()
    }

    resume() {
        this.activateTimeout.resume()
    }

    activate() {
        this.active = true
    }

    update(dt: number) {
        if (!this.active)
            return
        this.pathFraction += dt * this.speed / this.path.length
        this.pathFraction -= Math.floor(this.pathFraction)
    }

    getPosAtTime(dt: number = 0): Point[] {
        let fraction = this.pathFraction + dt * this.speed / this.path.length
        fraction -= Math.floor(fraction)
        let pos = this.path.getPos(fraction)

        // Line paths warping is pretty strange, so we only want to take into account
        // the alternate copies when the main copy is close to the edge

        let addAlternates: boolean

        if (this.path instanceof LinePath) {
            let distToEdge = Math.min(fraction, 1 - fraction) * this.path.length
            addAlternates = distToEdge <= this.radius
        }
        else {
            addAlternates = pos.x < this.radius || pos.y < this.radius
                || pos.x >= this.space.width - this.radius
                || pos.y >= this.space.height - this.radius
        }

        if (addAlternates)
            return [pos].concat(this.path.getAlternatePos(fraction))
        else
            return [pos]
    }

    setNewPath(pos: Point, angle: number) {
        let newPath = this.path.rotateAround(pos, angle)
        let newFraction = newPath.pointToFraction(pos)
        this.path = newPath
        this.pathFraction = newFraction
    }

    previewNewPath(pos: Point, angle: number) {
        let newPath = this.path.rotateAround(pos, angle)
        this.space.ctx.strokeStyle = `hsl(${this.hue}, 40%, 40%)`
        this.space.ctx.lineWidth = 3
        this.space.ctx.beginPath()
        newPath.trace(this.space.ctx)
        this.space.ctx.stroke()
        this.drawDirectionArrow(newPath.directionAt(newPath.pointToFraction(pos)))
    }

    drawPath() {
        this.space.ctx.strokeStyle = `hsl(${this.hue}, 40%, 40%)`
        this.space.ctx.lineWidth = 3
        this.space.ctx.beginPath()
        this.path.trace(this.space.ctx)
        this.space.ctx.stroke()
    }

    drawDirectionArrow(direction: number) {
        for (let p of this.getPosAtTime()) {
            this.space.ctx.save()
            this.space.ctx.fillStyle = "white"
            this.space.ctx.translate(p.x + Math.cos(direction) * 35, p.y + Math.sin(direction) * 35)
            this.space.ctx.rotate(direction + Math.PI / 2)
            this.space.ctx.beginPath()
            this.space.ctx.moveTo(-8, 6)
            this.space.ctx.lineTo(8, 6)
            this.space.ctx.lineTo(0, -8)
            this.space.ctx.fill()
            this.space.ctx.restore()
        }
    }

    drawSelf() {
        this.space.ctx.save()
        this.space.ctx.imageSmoothingEnabled = false
        this.space.ctx.fillStyle = `hsl(${this.hue}, 80%, 80%)`
        if (!this.active) {
            this.drawDirectionArrow(this.path.directionAt(this.pathFraction))
            let age = performance.now()/1000 - this.createTime
            this.space.ctx.globalAlpha = (Math.sin(age*6)+1)/4+0.5
        }

        let drawSelfAt = (x: number, y: number) => {
            this.space.ctx.drawImage(satelliteImage,
                x - this.radius,
                y - this.radius, this.radius * 2, this.radius * 2)
            if (this.collisionWarning) {
                this.space.ctx.drawImage(warningImage,
                    x + this.radius - this.warningIconSize / 2,
                    y - this.radius - this.warningIconSize / 2,
                    this.warningIconSize, this.warningIconSize)
            }
            this.space.ctx.restore()
        }

        for (let p of this.getPosAtTime())
            drawSelfAt(p.x, p.y)

        this.space.ctx.restore()
    }
}