import { randItem, randomInRange } from './utils';

export default function roughen(canvas, steps=3) {
    if (!steps) return;
    let ctx = canvas.getContext('2d');
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let px = imageData.data; // px to manipulate

    let refCtx = canvas.getContext('2d');
    let ref = refCtx.getImageData(0, 0, canvas.width, canvas.height).data; // reference copy

    let n = px.length;
    let w = canvas.width;
    let h = canvas.height;
    let newIdx;

    let scratch = document.createElement('canvas');
    scratch.width = w;
    scratch.height = h;
    let scratchCtx = scratch.getContext('2d');


    let directions = [-1, 1, -w, w];
    let distances = [1, 2, 3];

    function shift_pixels(alpha) {
        for (var i = 0; i<=n ; i+=4) {
            newIdx = 4 * randItem(directions) * randItem(distances);
            newIdx += i;
            if (newIdx > n) {
                newIdx = newIdx % n;
            }
            if (newIdx < 0) {
                newIdx = n - newIdx;
            }
            px[newIdx + 0] = ref[i + 0];
            px[newIdx + 1] = ref[i + 1];
            px[newIdx + 2] = ref[i + 2];
            px[newIdx + 3] = ref[i + 3];
        }

        scratchCtx.putImageData(imageData, 0, 0);
        ctx.globalAlpha = alpha;

        ctx.fillStyle = ctx.createPattern(scratch, 'repeat');
        ctx.fillRect(0, 0, w, h);
    }

    var eachAlpha = 1/(steps + 2);
    while (steps) {
        shift_pixels(eachAlpha);
        steps--;
    }

    ctx.globalAlpha = 1;
}

