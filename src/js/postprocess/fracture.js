import {randomInRange, randomInt, randItem, resetTransform, rotateCanvas} from '../utils';
import {drawRect, drawSquare} from '../shapes';

function copyCanvas(canvas) {
    let copy = canvas.cloneNode();
    let copyctx = copy.getContext('2d');
    copyctx.drawImage(canvas, 0, 0);
    copy.setAttribute('id', 'canvas' + (Math.random()*(1<<24)).toString(16));
    return copy;
}

export function fracture(canvas, regions=2) {

    let ctx = canvas.getContext('2d');
    let copy = copyCanvas(canvas);

    let cw = canvas.width;
    let ch = canvas.height;
    let SCALE = Math.min(cw, ch);

    // convenience for randomInRange:
    let rn = randomInRange;

    // create a series of masks
    for (var i = 0; i < regions; i++) {
        // set magnification effect for each fragment
        let magnification = randomInRange(0.02, 0.04);

        // scale offsets to mag effect, to avoid pulling edges into view
        let offsetx = cw * (randomInRange(-magnification, magnification)) / 2;
        let offsety = ch * (randomInRange(-magnification, magnification)) / 2;

        console.log(`fragment: magnification:${(magnification*100).toPrecision(2)}%, offsets:${offsetx.toPrecision(2)},${offsety.toPrecision(2)}`);

        // create clip path

        // slice the canvas across each corner, or left to right
        // we will pick one of these for each fracture path
        let vertices = [
            // left, top
            [[0, rn(ch)], [0, 0], [rn(cw), 0] ],
            // left, right
            [[rn(cw), 0], [0, 0], [cw, 0],  [cw, rn(ch)]],
            // top, right
            [[rn(cw), 0], [cw, 0],  [cw, rn(ch)]],
            // left, bottom
            [[0, rn(ch)], [0, ch], [rn(cw), ch] ],
            // right, bottom
            [[cw, rn(ch)], [cw, ch], [rn(cw), ch]],
            // top, bottom
            [[rn(cw), 0], [0, 0], [0, ch],  [rn(cw), ch]],
            // top, bottom 2
            [[rn(cw), 0], [cw, 0], [cw, ch],  [rn(cw), ch]]
        ];

        let v = randItem(vertices);
        let v2 = v.concat([]); // duplicate

        // build the mask path
        ctx.beginPath();
        ctx.moveTo(...(v.shift()));
        while (v.length) {
            ctx.lineTo(...(v.shift()));
        }
        ctx.closePath();

        let edgeGradient = ctx.createLinearGradient(
            rn(cw), rn(ch),
            rn(cw), rn(ch)
        );
        edgeGradient.addColorStop(0, '#ffffff');
        edgeGradient.addColorStop(0.5, '#666666');
        edgeGradient.addColorStop(1, '#333333');

        // draw the edge lightly
        ctx.globalCompositeOperation = 'color-dodge';
        ctx.globalAlpha = randomInRange(0.6, 0.8);
        ctx.strokeStyle = edgeGradient;
        ctx.lineWidth = SCALE/800 * randomInRange(2, 4);
        ctx.stroke();

        // fill the masked area with the gradient, lightly
        ctx.globalCompositeOperation = 'overlay';
        ctx.globalAlpha = randomInRange(0.05, 0.15);
        ctx.fillStyle = edgeGradient;
        ctx.fillRect(0, 0, cw, ch);

        // must save before clipping to be able to unclip via restore
        ctx.save();
        ctx.clip();

        // move and scale the canvas, then apply the original art
        ctx.translate(cw/2, ch/2);
        ctx.scale(magnification + 1, magnification + 1);
        ctx.translate(-cw/2, -ch/2);
        ctx.translate(offsetx, offsety);

        // Draw it
        ctx.globalCompositeOperation = 'normal';
        ctx.globalAlpha = 1;
        ctx.drawImage(copy, 0, 0);

        // debug draw
        //ctx.fillStyle = randItem(['red','blue','green','orange','yellow','purple']);
        //ctx.fillRect(0, 0, cw, ch);

        // unclip and reset
        ctx.restore();
        resetTransform(ctx);
    }

    // clean up the copy canvas node
    copy.remove();
}

