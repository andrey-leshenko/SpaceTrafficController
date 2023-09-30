export {}

import {Space} from './space.js'

let canvas: HTMLCanvasElement = document.getElementById('canvas')! as HTMLCanvasElement
let ctx = canvas.getContext('2d')!

let waitFrame = () => new Promise((resolve,reject) => requestAnimationFrame(resolve))

let space = new Space(ctx)

document.addEventListener('mousedown', (e) => {
    space.mouseDown(e.clientX, e.clientY)
})
document.addEventListener('mousemove', (e) => {
    space.mouseMove(e.clientX, e.clientY)
})

let previousTimestamp: number;

async function drawFrame(timestamp: number) {
    let dt = timestamp - previousTimestamp;
    previousTimestamp = timestamp

    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    space.update(dt)
}

async function main() {
    previousTimestamp = await waitFrame() as number
    while (true) {
        drawFrame(await waitFrame() as number)
    }
}

await main()
