import { randomInRange } from './utils';

export function createStack (start, end , steps=2) {
    let step = (end - start) / steps;
    let stack = [];
    let y = start;
    let block;
    while (steps) {
        block = [y, y + step * randomInRange(0.25, 1)];
        y = block[1];
        stack.push(block);
        steps--;
    }
    stack.push([y, end * 1.5]); // tack on an end block to bleed off canvas
    return stack;
}

// stacks look like [[y1, y2], [y1, y2] ...]
// colorFunc is optional; if null it draws increasingly dark gray bands
export function drawStack (ctx, stack, x, w, colorFunc) {
    let gray;
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
