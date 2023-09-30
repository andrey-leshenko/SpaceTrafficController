export { }

import { Space } from './space.js'

let canvas: HTMLCanvasElement = document.getElementById('canvas')! as HTMLCanvasElement
let ctx = canvas.getContext('2d')!

let waitFrame = () => new Promise((resolve, reject) => requestAnimationFrame(resolve))

let space = new Space(ctx, canvas.width, canvas.height)

document.addEventListener('mousedown', (e) => {
    space.mouseDown(e.offsetX, e.offsetY)
})
document.addEventListener('mousemove', (e) => {
    space.mouseMove(e.offsetX, e.offsetY)
})

let previousTimestamp: number;

async function drawFrame(timestamp: number) {
    let dt = (timestamp - previousTimestamp) / 1000;
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
