export type Point = { x: number, y: number }

export class PausableTimeout {
    startTime: number
    timeLeft: number
    paused: boolean = false
    timeoutId: number
    callback: Function
    constructor(callback: Function, time: number) {
        this.startTime = performance.now()/1000
        this.timeLeft = time
        this.timeoutId = setTimeout(callback, time * 1000)
        this.callback = callback
    }

    pause() {
        if (this.timeLeft < 0)
            return

        console.assert(!this.paused)
        let passed = performance.now()/1000 - this.startTime
        this.timeLeft -= passed
        clearTimeout(this.timeoutId)
        this.paused = true
    }

    resume() {
        if (this.timeLeft < 0)
            return

        console.assert(this.paused)
        this.timeoutId = setTimeout(this.callback, this.timeLeft * 1000)
        this.startTime = performance.now()/1000
        this.paused = false
    }
}

export function dist(p1: Point, p2: Point) {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y)
}

// Random int in [min, max)
function getRandomInt(min: number, max: number) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min) + min)
}

export function getRandomChunk(min: number, max: number, quantization: number) {
    return getRandomInt(min / quantization, max / quantization) * quantization;
}

function mod(n: number, m: number) {
    return ((n % m) + m) % m;
}

export function modpos(pos: Point, bounds: Point) {
    return {
        x: mod(pos.x, bounds.x),
        y: mod(pos.y, bounds.y)
    }
}

export function interpolate(start: number, end: number, fraction: number): number {
    return (1 - fraction) * start + fraction * end
}

export function interpolateClamped(start: number, end: number, fraction: number): number {
    return interpolate(start, end, Math.max(Math.min(fraction, 1), 0))
}
