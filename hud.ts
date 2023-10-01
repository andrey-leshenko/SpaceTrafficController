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
        this.space.ctx.imageSmoothingEnabled = false
        this.space.ctx.drawImage(heart, 15, 10, 32, 30)
        this.space.ctx.font = "bolder 30px sans-serif"
        this.space.ctx.fillStyle = "white"
        this.space.ctx.fillText(`${this.space.playerLives}`, 55, 36)
        this.space.ctx.drawImage(satellite, 95, 10, 32, 30)
        this.space.ctx.fillText(`${this.space.satellites.length}`, 140, 36)
    }
}