import hexScatter from '../hexScatter';
import { randomInRange, randomInt } from '../utils'
import { drawSquare, drawCircle } from '../shapes';

const PI = Math.PI;

/**
 * Speckle the canvas little squares and shapes. This redraws existing canvas
 * @canvas to speckle
 * @speckleSize the size of placed dots
 * @spacing the empty cell size around each dot, relative to speckelSize
 * @fillWith an optional param, accepts "sample", "random", or
 * a function(p) which returns a color, where p = [x,y].
 * If fillWith is not supplied or is not a function, it defaults to "sample"
 * The "random" mode still samples, but from another random point.
 */
export function speckle(canvas, speckleSize=5, spacing=4, fillWith='sample') {
    let ctx = canvas.getContext('2d');
    let cw = canvas.width;
    let ch = canvas.height;
    
    // create speckle points
    let speckles = hexScatter(speckleSize * spacing, cw, ch);
    // placeholder coloring func
    let speckleColor;

    // if custom color func was passed, use that.
    // otherwise sample from the image data
    if ((typeof fillWith) === 'function') {
        // use supplied color generator
        speckleColor = fillWith;
    } else if (fillWith === 'random') {
        // random mode samples from random other points on canvas
        let px = ctx.getImageData(0, 0, cw, ch).data;
        speckleColor = (p) => {
            // sample from random point
            p = [randomInt(0, cw), randomInt(0, ch)];
            let i = 4 * (Math.round(p[0]) + Math.round(p[1]) * cw);
            var sample = px.slice(i, i+3);
            return `rgba(${sample.join(',')})`;
        };
    } else {
        // default is "sample" mode
        let px = ctx.getImageData(0, 0, cw, ch).data;
        speckleColor = (p) => {
            let i = 4 * (Math.round(p[0]) + Math.round(p[1]) * cw);
            var sample = px.slice(i, i+3);
            return `rgba(${sample.join(',')})`;
        };
    }

    // draw a speckle at each point
    speckles.forEach((p, i) => {
        // skip a fraction of pts for more irregularity
        if (Math.random() < 0.8 ) {
            drawSquare(ctx, p[0], p[1], speckleSize, {
                fill: speckleColor(p),
                angle: randomInRange(0, PI)
            });
        };
    });
}

/**
 * Run multiple passes of speckle(), designed to make a nice donegal fabric
 * appearance. Runs in dense "sample" mode to break up edges, and does a
 * sparse pass in "random" mode or another func supplied in @fillWith
 */
export function donegal(canvas, fillWith="random") {
    const SCALE = Math.min(canvas.width, canvas.height);
    // coarse sampled speckles to break edges
    speckle(canvas, SCALE * randomInRange(.0015, .0030), 4, 'sample');
    // random speckles, widely spaced, for donegal look
    speckle(canvas, SCALE * randomInRange(.0010, .0020), randomInt(20, 40), fillWith);
    // finer sampled speckles to break edges more
    speckle(canvas, SCALE * randomInRange(.0010, .0020), 3, 'sample');

    // conditional, finer still:
    if (SCALE > 1600) {
        // finer sampled speckles to break edges more
        speckle(canvas, SCALE * randomInRange(.0005, .0010), 3, 'sample');
    }
}

export function dapple(canvas) {
    const SCALE = Math.min(canvas.width, canvas.height);
    // coarse sampled speckles to break edges
    speckle(canvas, SCALE * randomInRange(.0016, .0032), randomInt(5, 8), 'sample');
    // medium
    speckle(canvas, SCALE * randomInRange(.0012, .0024), randomInt(4, 7), 'sample');
    // finer sampled speckles to break edges more
    speckle(canvas, SCALE * randomInRange(.0008, .0016), randomInt(3, 5), 'sample');

    // conditional, finer still:
    if (SCALE > 1600) {
        // finer sampled speckles to break edges more
        speckle(canvas, SCALE * randomInRange(.0004, .0008), randomInt(3, 5), 'sample');
    }
}

