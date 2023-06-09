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

function line(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
}

export function fracture(canvas, regions=2) {

    let ctx = canvas.getContext('2d');
    let copy = copyCanvas(canvas);

    let cw = canvas.width;
    let ch = canvas.height;
    let SCALE = Math.min(cw, ch);

    // draw the edge lightly
    let weight = SCALE/800 * randomInRange(1, 3);
    ctx.lineWidth = weight;

    // convenience for randomInRange:
    let rn = randomInRange;

    // create a series of masks
    for (var i = 0; i < regions; i++) {
        // set magnification effect for each fragment
        let magnification = randomInRange(0.01, 0.03);

        // scale offsets to mag effect, to avoid pulling edges into view
        let offsetx = cw * (randomInRange(-magnification, magnification)) / 2;
        let offsety = ch * (randomInRange(-magnification, magnification)) / 2;

        console.log(`fragment: magnification:${(magnification*100).toPrecision(2)}%, offsets:${offsetx.toPrecision(2)},${offsety.toPrecision(2)}`);

        // create clip path

        // slice the canvas across each corner, or left to right
        // we will pick one of these for each fracture path
        let xmin, ymin;
        let xmax, ymax;
        xmin = ymin = -10;
        xmax = cw + 10;
        ymax = ch + 10;
        let vertices = [
            // left, top
            [[xmin, rn(ymax)], [xmin, ymin], [rn(xmax), ymin] ],
            // left, right
            [[rn(xmax), ymin], [xmin, ymin], [xmax, ymin],  [xmax, rn(ymax)]],
            // top, right
            [[rn(xmax), ymin], [xmax, ymin],  [xmax, rn(ymax)]],
            // left, bottom
            [[xmin, rn(ymax)], [xmin, ymax], [rn(xmax), ymax] ],
            // right, bottom
            [[xmax, rn(ymax)], [xmax, ymax], [rn(xmax), ymax]],
            // top, bottom
            [[rn(xmax), ymin], [xmin, ymin], [xmin, ymax],  [rn(xmax), ymax]],
            // top, bottom 2
            [[rn(xmax), ymin], [xmax, ymin], [xmax, ymax],  [rn(xmax), ymax]]
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

        // reset but don't unclip until after face hilite
        resetTransform(ctx);


        // Glass decorations
        // --------------------------------------


        // we will re-use these coordinates in multiple gradients for
        // edge and face decoration
        let gradientPoints = [
            rn(cw), rn(ch),
            rn(cw), rn(ch)
        ];

        // This determines the separation of the two colors for edge hilites
        // 0 would be total overlap which composites to white.
        // 0.5 would have no overlap, and show pure color edges adjacently
        let diffract = weight * randomInRange(0.25, 0.55);

        // By compositing pink and green in overlapping strokes via color-dodge
        // we get a pink fringe, green fringe, and white overlap area
        // Create a light gradient to overlay the whole area

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

        let darkGrad = ctx.createLinearGradient(...gradientPoints);
        darkGrad.addColorStop(0, '#333333');
        darkGrad.addColorStop(0.5, '#555555');
        darkGrad.addColorStop(1, '#666666');

        // get edge direction for offsets
        let edgePts = [v[0], v[v.length-1]];
        let theta = Math.atan2(
            edgePts[1][1] - edgePts[0][1],
            edgePts[1][0] - edgePts[0][0],
        );
        theta += Math.PI/2;

        // fill the masked area with the white gradient, lightly
        // use overlay composite for relatively color neutral effects
        ctx.globalCompositeOperation = 'overlay';
        ctx.globalAlpha = randomInRange(0.05, 0.15);
        ctx.fillStyle = lightGrad;
        ctx.fillRect(0, 0, cw, ch);

        // After drawing face hilite, unclip
        ctx.restore();

        // dark edge at the far side
        ctx.globalCompositeOperation = 'overlay';
        ctx.globalAlpha = randomInRange(0.3, 0.7);
        ctx.strokeStyle = darkGrad;
        ctx.translate(2 * diffract * Math.cos(theta), 2 * diffract * Math.sin(theta));
        line(ctx, edgePts[0][0], edgePts[0][1], edgePts[1][0], edgePts[1][1]);
        ctx.stroke();
        ctx.translate(-2 * diffract * Math.cos(theta), -2 * diffract * Math.sin(theta));

        // light inner edge for plate thickness
        // TODO come back to this
        // ctx.globalAlpha = randomInRange(0.0, 0.2);
        // ctx.strokeStyle = lightGrad;
        // let thickness = randomInRange(7, 14);
        // ctx.translate(thickness * diffract * Math.cos(theta), thickness * diffract * Math.sin(theta));
        // line(ctx, edgePts[0][0], edgePts[0][1], edgePts[1][0], edgePts[1][1]);
        // ctx.stroke();
        // ctx.translate(-thickness * diffract * Math.cos(theta), -thickness * diffract * Math.sin(theta));

        // composite in color for fake chromatic aberration
        ctx.globalCompositeOperation = 'color-dodge';
        ctx.globalAlpha = 0.9;

        // draw a pink edge at the reference path
        ctx.strokeStyle = pinkGrad;
        pointsToPath(ctx, v);
        ctx.stroke();

        // then a green edge offset by a fraction of stroke width
        ctx.strokeStyle = greenGrad;
        ctx.translate(diffract * Math.cos(theta), diffract * Math.sin(theta));
        pointsToPath(ctx, v);
        ctx.stroke();
        ctx.translate(-diffract * Math.cos(theta), -diffract * Math.sin(theta));



        // reset transforms
        resetTransform(ctx);
    }

    ctx.globalCompositeOperation = 'normal';
    ctx.globalAlpha = 1;
    // clean up the copy canvas node
    copy.remove();
}
