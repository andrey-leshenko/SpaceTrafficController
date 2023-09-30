import { Satellite } from './satellite.js'
import { LinePath } from './linepath.js'
import { Point, dist, getRandomChunk } from './utils.js'

export class Space {
    satellites: Satellite[] = []
    ctx: CanvasRenderingContext2D
    width: number
    height: number
    spawnInterval: number = 3
    spawnTimerStart: number = 0
    spawnTime: number = 0
    spawnTimeout: number = 0

    editedSatellite: Satellite | null = null
    editedAngle = 0

    spawnSatellite() {
        let launch_pt = {
            x: getRandomChunk(0, this.width, 8),
            y: getRandomChunk(0, this.height, 8)
        }

        let linepath = LinePath.spawnLinePath(this, launch_pt)
        this.satellites.push(new Satellite(this, linepath, launch_pt));

        this.spawnTimerStart = performance.now()/1000
        this.spawnTime = this.spawnInterval
        this.spawnTimeout = setTimeout(this.spawnSatellite.bind(this), this.spawnTime * 1000)
    }

    pause() {
        this.spawnTime -= performance.now()/1000 - this.spawnTimerStart
        clearTimeout(this.spawnTimeout)
    }

    resume() {
        this.spawnTimeout = setTimeout(this.spawnSatellite.bind(this), this.spawnTime * 1000)
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
        this.spawnSatellite()
    }

    update(dt: number) {
        if (!this.editedSatellite) {
            for (let s of this.satellites) {
                s.update(dt)
            }
        }

        // Check for collisions
        for (let i = 0; i < this.satellites.length; i++) {
            for (let j = i + 1; j < this.satellites.length; j++) {
                let pi = this.satellites[i].getPosAtTime()
                let pj = this.satellites[j].getPosAtTime()
                if (dist(pi, pj) < this.satellites[i].radius + this.satellites[j].radius) {
                    alert('BOOM!')
                }
            }
        }

        // Check for future collisions
        for (let t = 0; t < 2; t += (1 / 3)) {
            for (let i = 0; i < this.satellites.length; i++) {
                for (let j = i + 1; j < this.satellites.length; j++) {
                    let pi = this.satellites[i].getPosAtTime(t)
                    let pj = this.satellites[j].getPosAtTime(t)
                    if (dist(pi, pj) < this.satellites[i].radius + this.satellites[j].radius) {
                        this.satellites[i].collisionWarning = true
                        this.satellites[j].collisionWarning = true
                    }
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
    }
}