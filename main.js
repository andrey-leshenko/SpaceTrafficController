import { Space } from './space.js';
import { EndScreen } from './endscreen.js';
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let waitFrame = () => new Promise((resolve, reject) => requestAnimationFrame(resolve));
let space = new Space(ctx, canvas.width, canvas.height);
document.addEventListener('mousemove', (e) => {
    space.mouseMove(e.offsetX, e.offsetY);
});
let previousTimestamp;
let playing = true;
let endScreen;
document.addEventListener('mousedown', (e) => {
    if (playing)
        space.mouseDown(e.offsetX, e.offsetY);
    else {
        space = new Space(ctx, canvas.width, canvas.height);
        playing = true;
    }
});
async function drawFrame(timestamp) {
    let dt = (timestamp - previousTimestamp) / 1000;
    previousTimestamp = timestamp;
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (playing)
        space.update(dt);
    if (space.playerLives <= 0 && playing) {
        playing = false;
        endScreen = new EndScreen(space);
        space.pause();
    }
    space.draw();
    if (!playing)
        endScreen.draw();
}
async function main() {
    previousTimestamp = await waitFrame();
    while (true) {
        drawFrame(await waitFrame());
    }
}
await main();
