import noiseUtils from './noiseutils';
import palettes from './palettes';
import { drawCircle, drawRing, drawExactTriangle, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';
import { randItem, randomInRange, getGradientFunction } from './utils';

const SILVERS = ['#ffffff','#f2f2f2','#eeeeee','#e7e7e7','#e0e0e0','#d7d7d7'];

// Tile the container
export function duos(options) {
    var defaults = {
        container: 'body',
        palette: palettes.terra_cotta_cactus,
        drawShadows: false,
        addNoise: 0.04,
        noiseInput: null,
        skew: 1, // normalized skew
        clear: true
    };
    var opts = {};
    opts = Object.assign(Object.assign(opts, defaults), options);

    let container = opts.container;
    let cw = container.offsetWidth;
    let ch = container.offsetHeight;
    let SCALE = Math.min(cw, ch);
    let LONG = Math.max(cw, ch);
    let SHORT = Math.min(cw, ch);
    const AREA = cw * ch;

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
        triangle: drawExactTriangle,
        square: drawSquare,
        ring: drawRing,
        /*pentagon: drawPentagon,
        hexagon: drawHexagon*/
    };
    var shapes = Object.keys(renderMap);

    // BEGIN RENDERING

    if (opts.drawShadows) {
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 3 * SHORT / 400;
        ctx.shadowBlur = 10 * SHORT / 400;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    }

    let shapeOpts = {};

    // draw two shape layers in some order:
    // shuffle shape list
    shapes.sort(function(a, b) {
        return randomInRange(-1, 1);
    });


    let shape1 = renderMap[randItem(shapes)];
    let r1 = SHORT * 0.33;
    let x1 = randomInRange(r1, cw - r1);
    let y1 = randomInRange(r1, ch-r1);
    let a1 = randomInRange(-1,1) * Math.PI/2;


    let shape2 = renderMap[randItem(shapes)];
    let r2 = SHORT * 0.33;
    let x2 = randomInRange(r2, cw - r2);
    let y2 = randomInRange(r2, ch-r2);
    let a2 = randomInRange(-1,1) * Math.PI/2;

    // sometimes, lock them to centerline with no angle
    if (Math.random() < 0.2) {
        x1 = x2 = cw/2;
        a1 = a2 = 0;
    }

    // draw them
    shape1(ctx,
        x1,
        y1,
        r1,
        {
            angle: a1,
            fill: getGradientFunction(opts.palette)(ctx, cw, ch)
        }
    );

    ctx.globalCompositeOperation = 'source-atop';

    shape2(ctx,
        x2,
        y2,
        r2,
        {
            angle: a2,
            fill: getGradientFunction(opts.palette)(ctx, cw, ch)
        }
    );

    ctx.globalCompositeOperation = 'destination-over';

    shape2(ctx,
        x2,
        y2,
        r2,
        {
            angle: a2,
            fill: getGradientFunction(opts.palette)(ctx, cw, ch)
        }
    );

    ctx.globalCompositeOperation = 'normal';
    ctx.lineWidth = SHORT / 800;

    drawCircle(ctx, x1, y1, 5, {fill:'black'});
    drawCircle(ctx, x2, y2, 5, {fill:'black'});
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = 'black';
    ctx.stroke();


    shape1(ctx,
        x1,
        y1,
        r1,
        {
            angle: a1,
            fill: null,
            stroke: 'black'
        }
    );

    shape2(ctx,
        x2,
        y2,
        r2,
        {
            angle: a2,
            fill: null,
            stroke: 'black'
        }
    );

    // rotate the angles for triangle matching
    a1 += Math.PI/2;
    a2 += Math.PI/2;

    // OPTIONAL DECORATIONS
    if ( Math.random() < 0.5 && x1 !== x2 ) {
        // EXTEND THE CONNECTING LINE
        //ctx.setLineDash([LONG/150, LONG/100]);
        ctx.strokeStyle = 'black';
        ctx.globalAlpha = randomInRange(0.4, 0.6);
        let m = (y2 - y1)/(x2 - x1);
        let b = y1 - m * x1;
        ctx.beginPath();
        ctx.moveTo(0, m * 0 + b);
        ctx.lineTo(cw, m * cw + b);
        ctx.stroke();
        ctx.strokeStyle = 'black';
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
    } else if (Math.random() < 0.5 && a1 !== a2) {
        // EXTEND EACH ANGLE LINE
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(
            x1 + Math.cos(a1) * LONG,
            y1 + Math.sin(a1) * LONG
        );
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(
            x2 + Math.cos(a2) * LONG,
            y2 + Math.sin(a2) * LONG
        );
        ctx.stroke();
    }



    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = getGradientFunction( (Math.random() < 0.5) ? SILVERS : opts.palette)(ctx, cw, ch);
    ctx.fillRect(0, 0, cw, ch);

    ctx.globalCompositeOperation = 'normal';


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
