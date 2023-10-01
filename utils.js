export class PausableTimeout {
    constructor(callback, time) {
        this.paused = false;
        this.startTime = performance.now() / 1000;
        this.timeLeft = time;
        this.timeoutId = setTimeout(callback, time * 1000);
        this.callback = callback;
    }
    pause() {
        if (this.timeLeft < 0)
            return;
        console.assert(!this.paused);
        let passed = performance.now() / 1000 - this.startTime;
        this.timeLeft -= passed;
        clearTimeout(this.timeoutId);
        this.paused = true;
    }
    resume() {
        if (this.timeLeft < 0)
            return;
        console.assert(this.paused);
        this.timeoutId = setTimeout(this.callback, this.timeLeft * 1000);
        this.startTime = performance.now() / 1000;
        this.paused = false;
    }
}
export function dist(p1, p2) {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}
// Random int in [min, max)
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}
export function getRandomChunk(min, max, quantization) {
    return getRandomInt(min / quantization, max / quantization) * quantization;
}
function mod(n, m) {
    return ((n % m) + m) % m;
}
export function modpos(pos, bounds) {
    return {
        x: mod(pos.x, bounds.x),
        y: mod(pos.y, bounds.y)
    };
}
