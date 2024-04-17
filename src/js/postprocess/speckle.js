import hexScatter from '../hexScatter';
import { randomInRange, randomInt } from '../utils'
import { drawSquare } from '../shapes';

const PI = Math.PI;

/**
 * Speckle the canvas little squares and shapes. This redraws existing canvas
 * @canvas to speckle
 * @speckleSize the size of placed dots
 * @spacing the empty cell size around each dot, relative to speckelSize
 * @fillWith an optional function(p) which returns a color, where p = [x,y]
 * if fillWith is not supplied or is not a function, the underlying image will
 * be sampled (this is the default)
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
        speckleColor = fillWith;
    } else {
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

export function donegal(canvas, fillFunc) {
    const SCALE = Math.min(canvas.width, canvas.height);
    // coarse sampled speckles to break edges
    speckle(canvas, SCALE * randomInRange(.0015, .0040), 4, 'sample');
    // random speckles, widely spaced, for donegal look
    speckle(canvas, SCALE * randomInRange(.0010, .0020), randomInt(20, 40), fillFunc);
    // finer sampled speckles to break edges more
    speckle(canvas, SCALE * randomInRange(.0010, .0020), 3, 'sample');
}

