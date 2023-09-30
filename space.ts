import { Satellite } from './satellite.js'
import { LinePath } from './linepath.js'
import { dist, getRandomChunk, PausableTimeout, modpos } from './utils.js'
import { CirclePath } from './circlepath.js'

export class Space {
    satellites: Satellite[] = []
    ctx: CanvasRenderingContext2D
    width: number
    height: number
    spawnInterval = (n: number) => 3 + Math.sqrt(n) * 3
    spawnTimeout: PausableTimeout

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
    }

    update(dt: number) {
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
                    this.satellites[i].collisionWarning = false
                    this.satellites[j].collisionWarning = false
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