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

    let magnification = randomInRange(0, 0.05);

    let offsetx = cw * (randomInRange(-magnification, magnification)) / 2;
    let offsety = ch * (randomInRange(-magnification, magnification)) / 2;


    // create a series of masks
    let rn = randomInRange;

    for (var i = 0; i < regions; i++) {
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

        // build the mask path
        ctx.beginPath();
        ctx.moveTo(...(v.shift()));
        while (v.length) {
            ctx.lineTo(...(v.shift()));
        }
        ctx.closePath();

        // draw the edge lightly
        ctx.globalCompositeOperation = 'color-dodge';
        ctx.globalAlpha = 0.7;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = SCALE/800 * randomInRange(2, 4);
        ctx.stroke();

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

