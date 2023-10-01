import { Space } from "./space.js"

let heart = new Image()
heart.src = "assets/heart.png"
let satellite = new Image()
satellite.src = "assets/sat.png"

export class HUD {
    space: Space

    constructor(space: Space) {
        this.space = space
    }

    draw() {
        this.space.ctx.drawImage(heart, 10, 10, 32, 30)
        this.space.ctx.font = "30px sans-serif"
        this.space.ctx.strokeStyle = "white"
        this.space.ctx.strokeText(`${this.space.playerLives}`, 50, 36)
        this.space.ctx.drawImage(satellite, 100, 10, 32, 30)
        this.space.ctx.font = "30px sans-serif"
        this.space.ctx.strokeStyle = "white"
        this.space.ctx.strokeText(`${this.space.satellites.length}`, 140, 36)
    }
}