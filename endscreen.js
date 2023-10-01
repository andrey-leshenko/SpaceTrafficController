export class EndScreen {
    constructor(space) {
        this.space = space;
    }
    centerText(text, y) {
        let textSize = this.space.ctx.measureText(text);
        this.space.ctx.fillText(text, this.space.width / 2 - textSize.width / 2, y);
    }
    draw() {
        this.space.ctx.save();
        this.space.ctx.globalAlpha = 0.4;
        this.space.ctx.fillStyle = "black";
        this.space.ctx.fillRect(0, 0, this.space.width, this.space.height);
        this.space.ctx.globalAlpha = 1.0;
        this.space.ctx.fillStyle = "white";
        this.space.ctx.font = "bold 50px monospace";
        this.centerText('You\'re fired!', 120);
        this.space.ctx.font = "40px sans-serif";
        this.centerText('You finished your career', 250);
        let count = this.space.satellites.length;
        this.centerText(`with ${count} satellite${count == 1 ? '' : 's'} in space`, 310);
        this.space.ctx.font = "25px sans-serif";
        this.centerText('Press anywhere to restart', 450);
        this.space.ctx.restore();
    }
}
