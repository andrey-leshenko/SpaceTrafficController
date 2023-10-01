import { Satellite } from './satellite.js'
import { LinePath } from './linepath.js'
import { dist, getRandomChunk, PausableTimeout, modpos, Point } from './utils.js'
import { CirclePath } from './circlepath.js'

let sleep = (time: number) => new Promise((resolve, reject) => setTimeout(resolve, time * 1000))

interface Drawable {
    draw(): void
}

let explosionSprite = new Image()
explosionSprite.src = "assets/explosion.png"
const SPRITE_WIDTH = 95
const SPRITE_HEIGHT = 108
class Explosion implements Drawable {
    space: Space
    pos: Point
    step: number = 0

    async progress() {
        let i
        for (i = 0; i < 3; i++) {
            await sleep(.15)
            this.step += 1
        }
        await sleep(.15)
        this.space.drawables.splice(this.space.drawables.indexOf(this))
    }

    constructor(space: Space, pos: Point) {
        this.space = space
        this.space.drawables.push(this)
        this.pos = pos
        this.progress()
    }

    draw() {
        this.space.ctx.drawImage(explosionSprite, SPRITE_WIDTH*this.step, 0,
                                                  SPRITE_WIDTH, SPRITE_HEIGHT,
                                                  this.pos.x - SPRITE_WIDTH/2, this.pos.y - SPRITE_HEIGHT/2,
                                                  SPRITE_WIDTH, SPRITE_HEIGHT)
    }
}

export class Space {
    satellites: Satellite[] = []
    ctx: CanvasRenderingContext2D
    width: number
    height: number
    spawnInterval = (n: number) => 3 + Math.sqrt(n) * 3
    spawnTimeout: PausableTimeout
    background: HTMLImageElement
    drawables: Drawable[] = []

    playerLives: number = 5

    editedSatellite: Satellite | null = null
    editedAngle = 0

    size() {
        return {x: this.width, y: this.height}
    }

    spawnSatellite() {
        let launch_pt = null
        let i
        for (i = 0; i < 100; i++) {
            launch_pt = {
                x: getRandomChunk(0, this.width, 8),
                y: getRandomChunk(0, this.height, 8)
            }
            let j
            let ok = true
            for (j = 0; j < this.satellites.length; j++) {
                if (dist(launch_pt, this.satellites[j].getPosAtTime()) < 300) {
                    ok = false
                    break
                }
            }
            if (ok)
                break
        }

        let pathfunc = [LinePath.spawnLinePath, CirclePath.spawnCirclePath][Math.round(Math.random())]    
        let path = pathfunc(this, launch_pt!)
        this.satellites.push(new Satellite(this, path, launch_pt!));

        this.spawnTimeout = new PausableTimeout(this.spawnSatellite.bind(this), this.spawnInterval(this.satellites.length))
    }

    pause() {
        this.spawnTimeout.pause()
        for (let s of this.satellites)
            s.pause()
    }

    resume() {
        this.spawnTimeout.resume()
        for (let s of this.satellites)
            s.resume()
    }

    mouseDown(x: number, y: number) {
        if (!this.editedSatellite) {
            for (let s of this.satellites) {
                if (dist({ x, y }, s.getPosAtTime()) < s.radius) {
                    this.editedSatellite = s
                    this.pause()
                    break
                }
            }
        }
        else {
            this.editedSatellite.setNewPath(this.editedAngle)
            this.editedSatellite = null
            this.resume()
            for (let s of this.satellites) {
                s.collisionWarning = false
            }
        }
    }
    mouseMove(x: number, y: number) {
        if (this.editedSatellite) {
            let { x: satX, y: satY } = this.editedSatellite.getPosAtTime()
            this.editedAngle = Math.atan2(y - satY, x - satX)
        }
    }

    constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
        this.ctx = ctx
        this.width = width
        this.height = height
        this.spawnTimeout = new PausableTimeout(this.spawnSatellite.bind(this), 0)
        this.background = new Image()
        this.background.src = "assets/bg.png"
    }

    update(dt: number) {
        this.ctx.drawImage(this.background, 0, 0, this.width, this.height)
        if (!this.editedSatellite) {
            for (let s of this.satellites) {
                s.update(dt)
            }
        }

        // Check for future collisions
        for (let t = 0; t < 2; t += (1 / 3)) {
            for (let i = 0; i < this.satellites.length; i++) {
                if (!this.satellites[i].active)
                    continue
                for (let j = i + 1; j < this.satellites.length; j++) {
                    if (!this.satellites[j].active)
                        continue
                    let pi = this.satellites[i].getPosAtTime(t)
                    let pj = this.satellites[j].getPosAtTime(t)
                    let mpi = modpos(pi, this.size())
                    let mpj = modpos(pj, this.size())
                    if (dist(mpi, mpj) < this.satellites[i].radius + this.satellites[j].radius) {
                        this.satellites[i].collisionWarning = true
                        this.satellites[j].collisionWarning = true
                    }
                }
            }
        }

        // Check for collisions
        for (let i = 0; i < this.satellites.length; i++) {
            for (let j = i + 1; j < this.satellites.length; j++) {
                let pi = this.satellites[i].getPosAtTime()
                let pj = this.satellites[j].getPosAtTime()
                let mpi = modpos(pi, this.size())
                let mpj = modpos(pj, this.size())
                if (dist(mpi, mpj) < this.satellites[i].radius + this.satellites[j].radius) {
                    console.log('BOOM!')
                    new Explosion(this, {x: (pi.x + pj.x)/2, y: (pi.y + pj.y)/2})
                    this.satellites.splice(j, 1)
                    this.satellites.splice(i, 1)
                    this.playerLives -= 1
                }
            }
        }

        for (let s of this.satellites) {
            s.drawPath()
        }

        if (this.editedSatellite) {
            this.editedSatellite.previewNewPath(this.editedAngle)
        }

        for (let s of this.satellites) {
            s.drawSelf()
        }

        for (let d of this.drawables) {
            d.draw()
        }
    }
}