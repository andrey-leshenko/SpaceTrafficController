import { Satellite } from './satellite.js'
import { Point, dist } from './utils.js'

export class Space {
    satellites: Satellite[] = []
    ctx: CanvasRenderingContext2D
    width: number
    height: number

    editedSatellite: Satellite | null = null
    editedAngle = 0

    spawnSatellite() {
        this.satellites.push(new Satellite());
    }

    mouseDown(x: number, y: number) {
        if (!this.editedSatellite) {
            for (let s of this.satellites) {
                if (dist({x, y}, s.getPosAtTime()) < s.radius) {
                    this.editedSatellite = s
                    break
                }
            }
        }
        else {
            this.editedSatellite.setNewPath(this.editedAngle)
            this.editedSatellite = null
        }
    }
    mouseMove(x: number, y: number) {
        if (this.editedSatellite) {
            let {x:satX, y:satY} = this.editedSatellite.getPosAtTime()
            this.editedAngle = Math.atan2(x - satX, y - satY)
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