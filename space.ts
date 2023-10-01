import { Satellite } from './satellite.js'
import { LinePath } from './linepath.js'
import { dist, getRandomChunk, PausableTimeout, modpos, Point } from './utils.js'
import { CirclePath } from './circlepath.js'
import { HUD } from './hud.js'
import { AudioEffects } from './audioEffects.js'

type Edited = {satellite: Satellite, pos: Point, angle: number}
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
        AudioEffects.audioBoom.currentTime = 0
        AudioEffects.audioBoom.play()
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

    playerLives: number = 3

    edited: Edited | null = null

    size() {
        return {x: this.width, y: this.height}
    }

    spawnSatellite() {
        let launchPt = null
        let i
        for (i = 0; i < 100; i++) {
            launchPt = {
                x: getRandomChunk(0, this.width, 8),
                y: getRandomChunk(0, this.height, 8)
            }
            let j
            let ok = true
            for (let s of this.satellites) {
                for (let p of s.getPosAtTime()) {
                    if (dist(launchPt, p) < 150) {
                        ok = false
                        break
                    }
                }
            }
            if (ok)
                break
        }

        let pathfunc = [LinePath.spawnLinePath, CirclePath.spawnCirclePath][Math.round(Math.random())]    
        let path = pathfunc(this, launchPt!)
        this.satellites.push(new Satellite(this, path, launchPt!));

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
        if (!this.edited) {
            for (let s of this.satellites) {
                for (let p of s.getPosAtTime()) {
                    if (dist({ x, y }, p) < s.radius) {
                        this.edited = {
                            satellite: s, pos: p, angle: 0
                        }
                        this.pause()
                        break
                    }
                }
            }
        }
        else {
            this.edited.satellite.setNewPath(this.edited.pos, this.edited.angle)
            this.edited = null
            this.resume()
            for (let s of this.satellites) {
                s.collisionWarning = false
            }
        }
    }
    mouseMove(x: number, y: number) {
        if (this.edited) {
            let { x: satX, y: satY } = this.edited.pos
            this.edited.angle = Math.atan2(y - satY, x - satX)
        }
    }

    constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
        this.ctx = ctx
        this.width = width
        this.height = height
        this.spawnTimeout = new PausableTimeout(this.spawnSatellite.bind(this), 0)
        this.background = new Image()
        this.background.src = "assets/bg.png"
        this.drawables.push(new HUD(this))
    }

    update(dt: number) {
        if (!this.edited) {
            for (let s of this.satellites) {
                s.update(dt)
            }
        }

        // Check for future collisions
        function collisionPointAtTime(a: Satellite, b: Satellite, t: number): Point | null {
            for (let pa of a.getPosAtTime(t))
                for (let pb of b.getPosAtTime(t))
                    if (dist(pa, pb) < a.radius + b.radius)
                        return {x: (pa.x + pb.x) / 2, y: (pa.y + pb.y) / 2}
            return null
        }

        function willCollideAtTime(a: Satellite, b: Satellite, t: number): boolean {
            return collisionPointAtTime(a, b, t) != null
        }

        for (let t = 0; t < 3; t += (1 / 3)) {
            for (let i = 0; i < this.satellites.length; i++) {
                if (!this.satellites[i].active)
                    continue
                for (let j = i + 1; j < this.satellites.length; j++) {
                    if (!this.satellites[j].active)
                        continue

                    if (willCollideAtTime(this.satellites[i], this.satellites[j], t)) {
                        this.satellites[i].collisionWarning = true
                        this.satellites[j].collisionWarning = true
                    }
                }
            }
        }

        let warningOn = this.satellites.some(s => s.collisionWarning)

        if (warningOn == AudioEffects.audioBeep.paused) {
            if (warningOn) {
                AudioEffects.audioBeep.currentTime = 0
                AudioEffects.audioBeep.play()
            }
            else {
                AudioEffects.audioBeep.pause()
            }
        }

        // Check for collisions
        for (let i = 0; i < this.satellites.length; i++) {
            if (!this.satellites[i].active)
                continue
            for (let j = i + 1; j < this.satellites.length; j++) {
                if (!this.satellites[j].active)
                    continue
                if (willCollideAtTime(this.satellites[i], this.satellites[j], 0)) {
                    console.log('BOOM!')
                    new Explosion(this, collisionPointAtTime(this.satellites[i], this.satellites[j], 0)!)
                    this.satellites.splice(j, 1)
                    this.satellites.splice(i, 1)
                    this.playerLives -= 1
                    for (let s of this.satellites) {
                        s.collisionWarning = false
                    }
                }
            }
        }
    }

    draw() {
        this.ctx.drawImage(this.background, 0, 0, this.width, this.height)

        for (let s of this.satellites) {
            s.drawPath()
        }

        if (this.edited) {
            this.edited.satellite.previewNewPath(this.edited.pos, this.edited.angle)
        }

        for (let s of this.satellites) {
            s.drawSelf()
        }

        for (let d of this.drawables) {
            d.draw()
        }
    }
}