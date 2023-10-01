import { getRandomChunk, modpos } from './utils.js';
export class CirclePath {
    constructor(space, radius, launch_pt, angle) {
        // angle is the angle the spaceship is facing while on the path
        // i.e. it's the tangent to the circle at launch_point
        this.space = space;
        this.radius = radius;
        this.length = 2 * Math.PI * radius;
        this.center = {
            x: launch_pt.x + Math.cos(angle) * radius,
            y: launch_pt.y + Math.sin(angle) * radius
        };
    }
    static spawnCirclePath(space, launch_pt) {
        let radius = getRandomChunk(24, 240, 8);
        let angle = getRandomChunk(0, 360, 15) * Math.PI / 180.0;
        return new CirclePath(space, radius, launch_pt, angle);
    }
    getPos(fraction) {
        let phase = fraction * 2 * Math.PI;
        let pos = {
            x: this.center.x + this.radius * Math.cos(phase),
            y: this.center.y + this.radius * Math.sin(phase)
        };
        return modpos(pos, this.space.size());
    }
    getAlternatePos(fraction) {
        let pos = this.getPos(fraction);
        let positions = [];
        for (let i = -1; i <= 1; i++)
            for (let j = -1; j <= 1; j++)
                if (i != 0 || j != 0)
                    positions.push({ x: pos.x + i * this.space.width, y: pos.y + j * this.space.height });
        return positions;
    }
    trace(ctx) {
        [-1, 0, 1].forEach(xmult => [-1, 0, 1].forEach(ymult => {
            ctx.moveTo(this.center.x + xmult * this.space.width + this.radius, this.center.y + ymult * this.space.height);
            ctx.arc(this.center.x + xmult * this.space.width, this.center.y + ymult * this.space.height, this.radius, 0, 2 * Math.PI);
        }));
    }
    pointToFraction(point) {
        let radius_vector = {
            x: point.x - this.center.x,
            y: point.y - this.center.y
        };
        let phase = Math.atan2(radius_vector.y, radius_vector.x);
        return phase / (2 * Math.PI);
    }
    rotateAround(point, angle) {
        return new CirclePath(this.space, this.radius, point, angle);
    }
    directionAt(fraction) {
        return fraction * Math.PI * 2 + Math.PI / 2;
    }
}
