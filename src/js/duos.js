import noiseUtils from './noiseutils';
import palettes from './palettes';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';
import { randItem, randomInRange, getGradientFunction } from './utils';


// Tile the container
export function duos(options) {
    var defaults = {
        container: 'body',
        palette: palettes.candywafer,
        drawShadows: false,
        addNoise: 0.04,
        noiseInput: null,
        skew: 1, // normalized skew
        clear: true
    };
    var opts = {};
    opts = Object.assign(Object.assign(opts, defaults), options);

    var container = options.container;

    var w = container.offsetWidth;
    var h = container.offsetHeight;

    // Find or create canvas child
    var el = container.querySelector('canvas');
    var newEl = false;
    if (!el) {
        container.innerHTML = '';
        el = document.createElement('canvas');
        newEl = true;
    }
    if (newEl || opts.clear) {
        el.width = w;
        el.height = h;
    }

    var ctx; // canvas ctx or svg tag

    ctx = el.getContext('2d');

    // optional clear
    if (opts.clear) {
        el.width = container.offsetWidth;
        el.height = container.offsetHeight;
        ctx.clearRect(0, 0, w, h);
    }

    var renderer;
    var renderMap = {
        circle: drawCircle,
        triangle: drawTriangle,
        square: drawSquare,
        ring: drawRing,
        pentagon: drawPentagon,
        hexagon: drawHexagon
    };
    var shapes = Object.keys(renderMap);

    // BEGIN RENDERING

    if (opts.drawShadows) {
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 3 * Math.min(w, h) / 400;
        ctx.shadowBlur = 10 * Math.min(w, h) / 400;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    }

    let shapeOpts = {};

    // sometimes, lock them to centerline. Else, nudge each left or right
    let centers = [];
    if (Math.random() < 0.33) {
        centers = [w/2, w/2, w/2];
        shapeOpts.angle = 0;
    } else {
        centers = [
            w * randomInRange(0.33, 0.66), // shape 1
            w * randomInRange(0.33, 0.66), // shape 2
            w * randomInRange(0.2, 0.8), // bg block
        ];
        shapeOpts.angle = randomInRange(-1,1) * Math.PI/2;
    }


    // draw two shape layers in some order:
    // shuffle shape list
    shapes.sort(function(a, b) {
        return randomInRange(-1, 1);
    });


    let shape1 = renderMap[randItem(shapes)];
    let y1 = h * randomInRange(0.3, 0.7);
    let r1 = w * 0.33;

    let shape2 = renderMap[randItem(shapes)];
    let y2 = h * randomInRange(0.3, 0.7);
    let r2 = w * 0.33;

    // draw them
    shape1(ctx,
        centers[0],
        y1,
        r1,
        {
            angle: shapeOpts.angle,
            fill: getGradientFunction(opts.palette)(ctx, w, h)
        }
    );

    ctx.globalCompositeOperation = 'source-atop';

    shape2(ctx,
        centers[1],
        y2,
        r2,
        {
            angle: shapeOpts.angle,
            fill: getGradientFunction(opts.palette)(ctx, w, h)
        }
    );

    ctx.globalCompositeOperation = 'destination-over';

    shape2(ctx,
        centers[1],
        y2,
        r2,
        {
            angle: shapeOpts.angle,
            fill: getGradientFunction(opts.palette)(ctx, w, h)
        }
    );

    ctx.globalCompositeOperation = 'normal';


    drawCircle(ctx, centers[0], y1, 5, {fill:'black'});
    drawCircle(ctx, centers[1], y2, 5, {fill:'black'});
    ctx.beginPath();
    ctx.moveTo(centers[0], y1);
    ctx.lineTo(centers[1], y2);
    ctx.strokeStyle = 'black';
    ctx.stroke();


    shape1(ctx,
        centers[0],
        y1,
        r1,
        {
            angle: shapeOpts.angle,
            fill: null,
            stroke: 'black'
        }
    );

    shape2(ctx,
        centers[1],
        y2,
        r2,
        {
            angle: shapeOpts.angle,
            fill: null,
            stroke: 'black'
        }
    );




    // Add effect elements
    // ...

    // add noise
    if (opts.addNoise) {
        if (opts.noiseInput) {
            noiseUtils.applyNoiseCanvas(el, opts.noiseInput);
        } else {
            noiseUtils.addNoiseFromPattern(el, opts.addNoise, w / 3);
        }
    }

    // END RENDERING

    // if new canvas child was created, append it
    if (newEl) {
        container.appendChild(el);
    }
}
