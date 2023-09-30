export {}

import {Space} from './space.js'

console.log('hello world')

let canvas: HTMLCanvasElement = document.getElementById('canvas')! as HTMLCanvasElement
let ctx = canvas.getContext('2d')!

let waitFrame = () => new Promise((resolve,reject) => requestAnimationFrame(resolve))

let space = new Space()

async function drawFrame() {
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    space.update()
}

async function main() {
    while (true) {
        await waitFrame()
        drawFrame()
    }
}

document.addEventListener('mousedown', (e) => {
    console.log('clicked')
})

await main()