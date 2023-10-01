// Random int in [min, max)
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}
function getRandomChunk(min, max, quantization) {
    return getRandomInt(min / quantization, max / quantization) * quantization;
}
function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}
function pointInBounds(point, bounds) {
    return (point.x >= bounds.x &&
        point.x <= bounds.x + bounds.width &&
        point.y >= bounds.y &&
        point.y >= bounds.y + bounds.height);
}
export function spawnLinePath(bounds) {
    let launch_pt = {
        x: getRandomChunk(bounds.x, bounds.x + bounds.width, 8),
        y: getRandomChunk(bounds.y, bounds.y + bounds.height, 8)
    };
    let angle_rad = getRandomChunk(0, 360, 15) * Math.PI / 180.0;
    return {
        launch: launch_pt,
        angle: angle_rad
    };
}
export function spawnCirclePath(bounds) {
    let launch_pt = {
        x: getRandomChunk(bounds.x, bounds.x + bounds.width, 8),
        y: getRandomChunk(bounds.y, bounds.y + bounds.height, 8)
    };
    let radius = getRandomChunk(24, 240, 8);
    let phase_rad = getRandomChunk(0, 360, 15) * Math.PI / 180.0;
    let center = {
        x: launch_pt.x - radius * Math.cos(phase_rad),
        y: launch_pt.y - radius * Math.sin(phase_rad)
    };
    return {
        launch: launch_pt,
        center: center,
        radius: radius,
        phase: phase_rad
    };
}
