import noiseUtils from './noiseutils';
import palettes from './palettes';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';
import { randItem, randomInRange, getGradientFunction, getLocalGradientFunction } from './utils';

/**
 * Get a fill, either in solid or gradients
 * @param  {context} ctx  the canvas rendering context
 * @param {array} palette an array of color values
 * @param  {num} x    center x of shape
 * @param  {num} y    center y of shape
 * @param  {num} size half the size of the shape (r for circle)
 * @return {fillStyle}      a solid color or canvas gradient
 */
function getFill(ctx, palette, x, y, size, skew) {
    if (Math.random() > 0.9) {
        // solid
        return randItem(palette);
    } else {
        // gradient
        // pick xoffset as fraction of size to get a shallow angle
        var xoff = randomInRange(-skew / 2, skew / 2) * size;
        // build gradient, add stops
        var grad = ctx.createLinearGradient(x - xoff, y - size, x + xoff, y + size);
        grad.addColorStop(0, randItem(palette));
        grad.addColorStop(1, randItem(palette));
        return grad;
    }
}

// Tile the container
export function shapescape(options) {
    var defaults = {
        container: 'body',
        palette: palettes.candywafer,
        drawShadows: true,
        addNoise: 0.04,
        noiseInput: null,
        skew: 1, // normalized skew
        clear: true
    };
    var opts = {};
    opts = Object.assign(Object.assign(opts, defaults), options);

    var container = options.container;

    var cw = container.offsetWidth;
    var ch = container.offsetHeight;
    let SCALE = Math.min(cw, ch);
    let LONG = Math.max(cw, ch);
    let SHORT = Math.min(cw, ch);

    // Find or create canvas child
    var el = container.querySelector('canvas');
    var newEl = false;
    if (!el) {
        container.innerHTML = '';
        el = document.createElement('canvas');
        newEl = true;
    }
    if (newEl || opts.clear) {
        el.width = cw;
        el.height = ch;
    }

    var ctx; // canvas ctx or svg tag

    ctx = el.getContext('2d');

    // optional clear
    if (opts.clear) {
        el.width = container.offsetWidth;
        el.height = container.offsetHeight;
        ctx.clearRect(0, 0, cw, ch);
    }

    var renderer;
    var renderMap = {
        circle: drawCircle,
        triangle: drawTriangle,
        square: drawSquare,
        ring: drawRing,
        /*pentagon: drawPentagon,
        hexagon: drawHexagon*/
    };
    var shapes = Object.keys(renderMap);

    // BEGIN RENDERING

    if (opts.drawShadows) {
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 3 * SCALE / 400;
        ctx.shadowBlur = 10 * SCALE / 400;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    }

    let shapeOpts = {};

    // mostly, lock them to centerline. Else, nudge each left or right
    let centers = [];
    if (Math.random() < 0.66) {
        centers = [cw/2, cw/2, cw/2];
        shapeOpts.angle = 0;
    } else {
        centers = [
            cw * randomInRange(0.4, 0.6), // shape 1
            cw * randomInRange(0.4, 0.6), // shape 2
            cw * randomInRange(0.2, 0.8), // bg block
        ];
        shapeOpts.angle = randomInRange(-1,1) * Math.PI/2;
    }

    // Fill utilties
    let getGradientFill = getLocalGradientFunction(opts.palette);

    // add one or two bg blocks
    ctx.fillStyle = getGradientFill(ctx, cw/2, ch/2, LONG);
    ctx.fillRect(0, 0, cw, ch);
    if (Math.random() < 0.5) {
        var hr = randomInRange(3, 12) * cw;
        var hy = hr + randomInRange(0.5, 0.85) * ch;
        drawCircle(ctx, centers[2], hy, hr, {fill: getGradientFunction(opts.palette)(ctx, cw, ch)})
    }

    // draw two shape layers in some order:
    // shuffle shape list
    shapes.sort(function(a, b) {
        return randomInRange(-1, 1);
    });

    // pop a renderer name, get render func and execute X 2
    let _y;
    let _size;

    _y = ch * randomInRange(0.3, 0.7);
    _size = cw * randomInRange(0.25, 0.35);
    renderMap[shapes.pop()](ctx,
        centers[0],
        _y,
        _size,
        {
            angle: shapeOpts.angle,
            fill: getGradientFill(ctx, centers[0], _y, _size)
        }
    );

    _y = ch * randomInRange(0.3, 0.7);
    _size = cw * randomInRange(0.25, 0.35);
    renderMap[shapes.pop()](ctx,
        centers[1],
        _y,
        _size,
        {
            angle: shapeOpts.angle,
            fill: getGradientFill(ctx, centers[1], _y, _size)
        }
    );

    // Add effect elements
    // ...

    // add noise
    if (opts.addNoise) {
        if (opts.noiseInput) {
            noiseUtils.applyNoiseCanvas(el, opts.noiseInput);
        } else {
            noiseUtils.addNoiseFromPattern(el, opts.addNoise, cw / 3);
        }
    }

    // END RENDERING

    // if new canvas child was created, append it
    if (newEl) {
        container.appendChild(el);
    }
}
