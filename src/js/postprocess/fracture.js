import {randomInRange, randomInt, randItem, resetTransform, rotateCanvas} from '../utils';
import {drawRect, drawSquare} from '../shapes';

function copyCanvas(canvas) {
    let copy = canvas.cloneNode();
    let copyctx = copy.getContext('2d');
    copyctx.drawImage(canvas, 0, 0);
    copy.setAttribute('id', 'canvas' + (Math.random()*(1<<24)).toString(16));
    return copy;
}

function pointsToPath(ctx, points) {
    // copy the points list, so we don't mutate
    let pts = points.concat([]);
    ctx.beginPath();
    ctx.moveTo(...(pts.shift()));
    while (pts.length) {
        ctx.lineTo(...(pts.shift()));
    }
    ctx.closePath();
    return ctx;
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

        // build the mask path
        pointsToPath(ctx, v);

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


        // draw the edge lightly
        let weight = SCALE/800 * randomInRange(1, 3);
        ctx.lineWidth = weight;

        // we will re-use these coordinates in multiple gradients for
        // edge and face decoration
        let gradientPoints = [
            rn(cw), rn(ch),
            rn(cw), rn(ch)
        ];

        // composite in color first, so we can fake chromatic aberration
        ctx.globalCompositeOperation = 'color-dodge';
        ctx.globalAlpha = 1;



        // This determines the separation of the two colors for edge hilites
        // 0 would be total overlap which composites to white.
        // 0.5 would have no overlap, and show pure color edges adjacently
        let diffract = weight * randomInRange(0.2, 0.4);

        // By compositing pink and green in overlapping strokes via color-dodge
        // we get a pink fringe, green fringe, and white overlap area

        let pinkGrad = ctx.createLinearGradient(...gradientPoints);
        pinkGrad.addColorStop(0, 'rgba(255, 0, 255, 1)');
        pinkGrad.addColorStop(0.5, 'rgba(255, 0, 255, 0.4)');
        pinkGrad.addColorStop(1, 'rgba(255, 0, 255, 0.2)');

        let greenGrad = ctx.createLinearGradient(...gradientPoints);
        greenGrad.addColorStop(0, 'rgba(0, 255, 0, 1)');
        greenGrad.addColorStop(0.5, 'rgba(0, 255, 0, 0.4)');
        greenGrad.addColorStop(1, 'rgba(0, 255, 0, 0.2)');

        let lightGrad = ctx.createLinearGradient(...gradientPoints);
        lightGrad.addColorStop(0, '#ffffff');
        lightGrad.addColorStop(0.5, '#666666');
        lightGrad.addColorStop(1, '#333333');

        // draw a pink edge offset one way
        ctx.strokeStyle = pinkGrad;
        ctx.translate(-diffract, -diffract);
        pointsToPath(ctx, v);
        ctx.stroke();
        ctx.translate(diffract, diffract);

        // then a green edge offset the other
        ctx.strokeStyle = greenGrad;
        ctx.translate(diffract, diffract);
        pointsToPath(ctx, v);
        ctx.stroke();
        ctx.translate(-diffract, -diffract);

        // fill the masked area with the white gradient, lightly
        // use overlay composite for relatively color neutral effects
        ctx.globalCompositeOperation = 'overlay';
        ctx.globalAlpha = randomInRange(0.05, 0.15);
        ctx.fillStyle = lightGrad;
        ctx.fillRect(0, 0, cw, ch);

        // reset transforms
        resetTransform(ctx);
    }

    // clean up the copy canvas node
    copy.remove();
}
