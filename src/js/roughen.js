import { randItem, randomInRange } from './utils';

export default function roughen(canvas, strength) {
	let ctx = canvas.getContext('2d');
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let px = imageData.data; // px to manipulate
    
    let refCtx = canvas.getContext('2d');
    let ref = refCtx.getImageData(0, 0, canvas.width, canvas.height).data; // reference copy

    let n = px.length;
    let w = canvas.width;
    let newIdx;

    // to offset left
    // i -= 4
    // offset right
    // i += 4
    // offset down
    // i += 4 * width
    // offset up
    // i -= 4 * width

    let offsets = [-1, 1, -w, w];

    for (var i = 0; i<=n ; i+=4) {
        newIdx = 4 * randItem(offsets);
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

    ctx.putImageData(imageData, 0, 0);
}

