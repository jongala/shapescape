import {randomInRange, randomInt, randItem, resetTransform, rotateCanvas} from '../utils';
import {drawRect, drawSquare, drawCircle} from '../shapes';

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

function averagePoints(points) {
    let avg = [0, 0];
    for (var i = 0; i < points.length; i++) {
        avg[0] += points[i][0];
        avg[1] += points[i][1];
    }
    avg[0] /= points.length;
    avg[1] /= points.length;
    return avg;
}


export function fracture(canvas, regions=2) {

    let ctx = canvas.getContext('2d');
    let copy = copyCanvas(canvas);

    let cw = canvas.width;
    let ch = canvas.height;
    let SCALE = Math.min(cw, ch);

    let magSteps = 10;
    // scale offsets to mag effect, to avoid pulling edges into view
    let offset = SCALE/800 * randomInRange(0.3, 0.7);

    // convenience for randomInRange:
    let rn = randomInRange;

    let THICK = (Math.random() < 0.3);

    console.log(`fragment, ${regions} regions`);

    // create a series of masks
    for (var i = 0; i < regions; i++) {
        // set magnification effect for each fragment
        let magnification = randomInRange(0.01, 0.03);



        //console.log(`fragment: magnification:${(magnification*100).toPrecision(2)}%, offsets:${offsetx.toPrecision(2)},${offsety.toPrecision(2)}`);

        // create clip path and draw inside
        // --------------------------------------

        // slice the canvas across each corner, or left to right
        // we will pick one of these for each fracture path
        // move the boundaries outside the canvas to avoid drawing visible
        // strokes along the canvas edges
        let xmin, ymin;
        let xmax, ymax;
        xmin = ymin = -10;
        xmax = cw + 10;
        ymax = ch + 10;
        // we define these in the loop so the random values differ for each
        // fragment region
        let vertices = [
            // left, top
            [[xmin, rn(ymax)], [xmin, ymin], [rn(xmax), ymin] ],
            // left, right
            [[rn(xmax), ymin], [xmin, ymin], [xmax, ymin],  [xmax, rn(ymax)]],
            // right, left
            [[xmax, rn(ymax)], [xmax, ymax], [xmin, ymax],  [rn(xmax), ymin]],
            // top, right
            [[rn(xmax), ymin], [xmax, ymin],  [xmax, rn(ymax)]],
            // left, bottom
            [[rn(xmax), ymax], [xmin, ymax],  [xmin, rn(ymax)]],
            // right, bottom
            [[xmax, rn(ymax)], [xmax, ymax], [rn(xmax), ymax]],
            // top, bottom
            [[rn(xmax), ymin], [xmin, ymin], [xmin, ymax],  [rn(xmax), ymax]],
            // top, bottom 2
            [[rn(xmax), ymin], [xmax, ymin], [xmax, ymax],  [rn(xmax), ymax]]
        ];

        // select a set of vertices
        let v = randItem(vertices);
        // get centerpoint for scaling
        let [cx, cy] = averagePoints(v);

        // get edge direction so we can offset at 90deg from it
        let edgePts = [v[0], v[v.length-1]];
        let theta = Math.atan2(
            edgePts[1][1] - edgePts[0][1],
            edgePts[1][0] - edgePts[0][0],
        );
        theta += Math.PI/2;

        // debug: boundary of original region path
        // line(ctx, ...edgePts[0], ...edgePts[1]);
        // ctx.globalCompositeOperation = 'normal';
        // ctx.globalAlpha = 1;
        // ctx.strokeStyle = 'red';
        // ctx.stroke();
        // let [px, py] = averagePoints(edgePts);
        // drawCircle(ctx, px, py, 10, {stroke:'red'});

        // must save before clipping to be able to unclip via restore
        ctx.save();

        // build the mask path at translated coords and re-clip
        pointsToPath(ctx, v);
        ctx.clip();

        // translate to fragment center point and magnify
        ctx.translate(cx, cy);
        ctx.scale(magnification + 1, magnification + 1);
        ctx.translate(-cx, -cy);

        ctx.globalCompositeOperation = 'normal';
        ctx.globalAlpha = 1;




        // repeat steps to drag copies of the image away from
        // the fragment edge, to create refractive effect
        let steps;
        if (THICK) {
            steps = magSteps;
        } else {
            steps = 1;
            offset *= randomInRange(5);
        }

        while (steps--) {
            // offset the canvas at 90deg from its edge, one step at a time
            ctx.translate(-offset * Math.cos(theta), -offset * Math.sin(theta));

            // build the mask path at translated coords and re-clip
            pointsToPath(ctx, v);
            ctx.clip();

            // Draw it
            ctx.drawImage(copy, 0, 0);
        }

        // unclip and reset
        resetTransform(ctx);
        ctx.restore();



        // Glass decorations
        // --------------------------------------

        // draw the edge lightly
        let weight = SCALE/800 * randomInRange(1, 3);
        ctx.lineWidth = weight;

        // we will re-use these coordinates in multiple gradients for
        // edge and face decoration
        let gradientPoints = [
            rn(cw), rn(ch),
            rn(cw), rn(ch)
        ];

        // By compositing pink and green in overlapping strokes via color-dodge
        // we get a pink fringe, green fringe, and white overlap area
        // Create a light gradient to overlay the whole area


        // This determines the separation of the two colors for edge hilites
        // 0 would be total overlap which composites to white.
        // 0.5 would have no overlap, and show pure color edges adjacently.
        let diffract = weight * randomInRange(0.25, 0.55);

        // Create gradients for the edges, using common coordinates but
        // different colors to align them and suggest unified light source
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

        // fill the masked area with the white gradient, lightly.
        // use overlay composite for relatively color neutral effects
        ctx.globalCompositeOperation = 'overlay';
        ctx.globalAlpha = randomInRange(0.05, 0.15);
        ctx.fillStyle = lightGrad;
        ctx.fillRect(0, 0, cw, ch);

        // dark edge at the far side.
        ctx.globalAlpha = randomInRange(0.1, 0.5);
        ctx.strokeStyle = darkGrad;
        ctx.translate(2 * diffract * Math.cos(theta), 2 * diffract * Math.sin(theta));
        line(ctx, ...edgePts[0], ...edgePts[1]);
        ctx.stroke();
        ctx.translate(-2 * diffract * Math.cos(theta), -2 * diffract * Math.sin(theta));


        // TODO come back to this
        if (THICK) {
            let thickness = offset * magSteps;

            // heavy stroke along thickness
            ctx.globalCompositeOperation = 'overlay';
            ctx.globalAlpha = randomInRange(0.0, 0.4);
            ctx.lineWidth = thickness;
            ctx.translate(
                -(thickness/2 + diffract) * Math.cos(theta),
                -(thickness/2 + diffract) * Math.sin(theta)
            );
            line(ctx, ...edgePts[0], ...edgePts[1]);
            ctx.strokeStyle = lightGrad;
            ctx.stroke();
            ctx.translate(
                (thickness/2 + diffract) * Math.cos(theta),
                (thickness/2 + diffract) * Math.sin(theta)
            );
            // restore standard line weight
            ctx.lineWidth = weight;

            // light inner edge for plate thickness
            ctx.globalCompositeOperation = 'color-dodge';
            ctx.globalAlpha = randomInRange(0.2, 0.4);
            ctx.strokeStyle = lightGrad;
            ctx.translate(-thickness * diffract * Math.cos(theta), -thickness * diffract * Math.sin(theta));
            line(ctx, ...edgePts[0], ...edgePts[1]);
            ctx.stroke();
            ctx.translate(thickness * diffract * Math.cos(theta), thickness * diffract * Math.sin(theta));
        }


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

        //console.log(`fragment THICK:${THICK} offset:${offset.toPrecision(2)} diffract:${diffract.toPrecision(2)}, magnification:${(magnification*100).toPrecision(2)}%`)

        // reset transforms
        resetTransform(ctx);
    }

    // reset basic canvas params before exiting
    ctx.globalCompositeOperation = 'normal';
    ctx.globalAlpha = 1;
    // clean up the copy canvas node
    copy.remove();
}
