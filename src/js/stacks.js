import { randomInRange } from './utils';

let gray;

// stacks look like [[y1, y2], [y1, y2] ...]
// colorFunc is optional; if null it draws increasingly dark gray bands
export function drawStack (ctx, stack, x, w, colorFunc) {
    stack.forEach(function(y, i) {
        if (!colorFunc) {
            gray = randomInRange(0.55, 0.85);
            ctx.fillStyle = 'rgba(0, 0, 0,' + (i + 1) * gray / stack.length + ')';
        } else {
            ctx.fillStyle = colorFunc(ctx, w, y[1] - y[0]);
        }

        ctx.beginPath();
        ctx.rect(x, y[0], x + w, y[1] - y[0]);
        ctx.closePath();

        ctx.fill();
    });
}
