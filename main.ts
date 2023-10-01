export { }

import { Space } from './space.js'
import { EndScreen } from './endscreen.js'

let canvas: HTMLCanvasElement = document.getElementById('canvas')! as HTMLCanvasElement
let ctx = canvas.getContext('2d')!

let waitFrame = () => new Promise((resolve, reject) => requestAnimationFrame(resolve))

let space = new Space(ctx, canvas.width, canvas.height)

document.addEventListener('mousemove', (e) => {
    space.mouseMove(e.offsetX, e.offsetY)
})

let previousTimestamp: number;
let playing = true
let endScreen: EndScreen
let endTimestamp: number

document.addEventListener('mousedown', (e) => {
    if (playing)
        space.mouseDown(e.offsetX, e.offsetY)
    else if ((performance.now() - endTimestamp) / 1000 > 2) {
        space = new Space(ctx, canvas.width, canvas.height)
        playing = true
    }
})

async function drawFrame(timestamp: number) {
    let dt = (timestamp - previousTimestamp) / 1000;
    previousTimestamp = timestamp

    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (playing)
        space.update(dt)

    if (space.playerLives <= 0 && playing) {
        playing = false
        endScreen = new EndScreen(space)
        endTimestamp = timestamp
        space.pause()
    }

    space.draw()

    if (!playing)
        endScreen.draw((timestamp - endTimestamp) / 1000)
}

async function main() {
    previousTimestamp = await waitFrame() as number
    while (true) {
        drawFrame(await waitFrame() as number)
    }
}

await main()
