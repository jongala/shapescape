import noiseUtils from './noiseutils';
import palettes from './palettes';
import hexScatter from './hexScatter';
import { randItem, randomInRange, randomInt, resetTransform, rotateCanvas, getGradientFunction, getSolidColorFunction, shuffle } from './utils';
import { createTransform } from './util/fieldUtils'
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';
import { speckle, donegal } from './postprocess/speckle';

import roughen from './roughen';

const DEFAULTS = {
    container: 'body',
    palette: palettes.north_beach,
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true,
    roughen: 4, // integer number of passes, or 0 for none
    density: 'coarse', // [auto, coarse, fine]
}

const PI = Math.PI;
const TWOPI = Math.PI;
const DENSITIES = ['coarse', 'fine'];


// Main function
export function doodle(options) {
    let opts = Object.assign({}, DEFAULTS, options);

    let container = opts.container;
    let cw = container.offsetWidth;
    let ch = container.offsetHeight;
    let SCALE = Math.min(cw, ch);
    let LONG = Math.max(cw, ch);
    let SHORT = Math.min(cw, ch);
    const AREA = cw * ch;

    // Find or create canvas child
    let el = container.querySelector('canvas');
    let newEl = false;
    if (!el) {
        container.innerHTML = '';
        el = document.createElement('canvas');
        newEl = true;
    }
    if (newEl || opts.clear) {
        el.width = cw;
        el.height = ch;
    }

    let ctx = el.getContext('2d');

    // modes and styles
    const DENSITY = opts.density === 'auto' ? randItem(DENSITIES) : opts.density;

    // color funcs
    let getSolidFill = getSolidColorFunction(opts.palette);

    // how many cells are in the grid?
    let countMin, countMax;
    if (DENSITY === 'coarse') {
        countMin = 15;
        countMax = 25;
    } else {
        countMin = 60;
        countMax = 100;
    }

    let cellSize = Math.round(SHORT / randomInRange( countMin, countMax ));
    //console.log(`cellSize: ${cellSize}, countMin:${countMin}, countMax:${countMax}, ${GRIDMODE}, ${DENSITY}`);

    // setup vars for each cell
    let x = 0;
    let y = 0;
    let xnorm = 0;
    let ynorm = 0;
    let renderer;

    // shared colors
    let bg = getSolidFill();

    // get palette of non-bg colors
    let contrastPalette = [].concat(opts.palette);
    contrastPalette.splice(opts.palette.indexOf(bg), 1);
    let getContrastColor = getSolidColorFunction(contrastPalette);

    // shared foregrounds
    let fg = getContrastColor();
    let fg2 = getContrastColor();


    // draw background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);
    ctx.lineJoin = 'round';

    ctx.strokeStyle = fg;


    let cellCount = cw/cellSize;
    let rateMax = 3;
    if (DENSITY === 'fine' && Math.random() < 0.5) {
        rateMax = 6;
    }


    // tail vars
    let _x,_y,len;

    // dotScale will be multiplied by 2. Keep below .25 to avoid bleed.
    // Up to 0.5 will lead to full coverage.
    let dotScale = cellSize * randomInRange(0.1, 0.2);
    // line width
    let weight = cellSize * randomInRange(0.05, 0.15);

    ctx.lineWidth = weight;
    ctx.lineCap = 'round';

    // --------------------------------------
    // BEGIN SHAPES
    // --------------------------------------

    let drawDash2 = (ctx, x, y, size, opts) => {
        let angle = opts.angle || randomInRange(0, PI);
        let d = size * randomInRange(0.75, 1);
        let gap = size / 2;
        let jitter = 0.3;

        ctx.translate(x, y);
        ctx.rotate(angle)

        ctx.beginPath();

        ctx.translate(weight * randomInRange(-jitter, jitter), weight * randomInRange(-jitter, jitter) );

        ctx.moveTo(- d, -gap);
        ctx.lineTo(d, -gap);

        ctx.translate(weight * randomInRange(-jitter, jitter), weight * randomInRange(-jitter, jitter) );

        ctx.moveTo(- d, gap);
        ctx.lineTo(d, gap);

        ctx.stroke();

        resetTransform(ctx);
    }

    let drawDash3 = (ctx, x, y, size, opts) => {
        let angle = opts.angle || randomInRange(0, PI);
        let d = size * randomInRange(0.75, 1);
        let gap = size / 3 * 1.75; // make room for extra stroke
        let jitter = 0.33;

        ctx.translate(x, y);
        ctx.rotate(angle)

        ctx.beginPath();

        // randomize between strokes
        ctx.translate(weight * randomInRange(-jitter, jitter), weight * randomInRange(-jitter, jitter) );
        d *= randomInRange(0.9, 1.1);

        ctx.moveTo(- d, -gap);
        ctx.lineTo(d, -gap);

        // randomize between strokes
        ctx.translate(weight * randomInRange(-jitter, jitter), weight * randomInRange(-jitter, jitter) );
        d *= randomInRange(0.9, 1.1);

        ctx.moveTo(- d, 0);
        ctx.lineTo(d, 0);

        // randomize between strokes
        ctx.translate(weight * randomInRange(-jitter, jitter), weight * randomInRange(-jitter, jitter) );
        d *= randomInRange(0.9, 1.1);

        ctx.moveTo(- d, gap);
        ctx.lineTo(d, gap);

        ctx.stroke();

        resetTransform(ctx);
    }

    let drawHash2 = (ctx, x, y, size, opts) => {
        let angle = opts.angle || randomInRange(0, PI);
        drawDash2(ctx, x, y, size, {angle:angle});
        drawDash2(ctx, x, y, size, {angle:angle + PI/2});
    }

    let drawHash3 = (ctx, x, y, size, opts) => {
        let angle = opts.angle || randomInRange(0, PI);
        drawDash3(ctx, x, y, size, {angle:angle});
        drawDash3(ctx, x, y, size, {angle:angle + PI/2});
    }

    let drawSpiral = (ctx, x, y, size, opts) => {
        let count = 30; // points

        let t = randomInRange(0, TWOPI);
        let arc = TWOPI * randomInRange(3, 5);

        let direction = randItem([-1, 1]);


        // func to return an x,y point for theta, r
        // bake in offset t and the direction
        let f = (theta, r) => {
            return [
                Math.cos(t + theta * direction) * r,
                Math.sin(t + theta * direction) * r
            ]
        }

        ctx.beginPath();
        ctx.moveTo(x, y);

        for (var i = 0; i < count; i++) {
            // r scaling is magic number, I don't know why the scaling to
            // count isn't working
            let [_x, _y] = f(i * arc/count, i * size/count * 0.6);
            x += _x;
            y += _y;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }


    let drawSquiggle = (ctx, x, y, size, opts) => {
        let angle = opts.angle || randomInRange(0, PI);

        ctx.translate(x, y);
        ctx.rotate(angle)

        ctx.beginPath();


        let _x = -size/2;
        let _y = -size/2;

        let steps = randomInt(3, 6);

        ctx.beginPath();
        ctx.moveTo(_x, _y);

        for (var i = 0 ; i < steps ; i++) {
            let dir = (i%2) ? 1 : -1;
            ctx.quadraticCurveTo(
              _x, _y + size/2 * dir,
              _x + size/steps, _y + size * dir
            );
            _x = _x + size/steps;
            _y = _y + size * dir;
        }

        ctx.stroke();

        resetTransform(ctx);
    }

    let drawLightning = (ctx, x, y, size, opts) => {
        let angle = opts.angle || randomInRange(0, PI * 2);

        // these look a little better a little bigger
        size *= randomInRange(1, 1.2);

        ctx.translate(x, y);
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.moveTo(0, size * -1); // top left
        ctx.lineTo(size * 0.7, size * -1); // top right
        ctx.lineTo(size * 0.26, size * -0.35); // middle right
        ctx.lineTo(size * 0.67, size * -0.35); // middle push right
        ctx.lineTo(size * -0.55, size * 1); // bottom point
        ctx.lineTo(size * -0.10, size * -0.08); // middle left
        ctx.lineTo(size * -0.42, size * -0.08); // middle push left
        ctx.closePath(); // return to top left

        ctx.stroke();
        resetTransform(ctx);
    }

    let drawStar = (ctx, x, y, size, opts) => {
        let angle = opts.angle || randomInRange(0, PI * 2);

        size *= randomInRange(1, 1.2);

        // define the star
        let pts = [];
        pts.push([0, -1]);
        pts.push([0.59, 0.95]);
        pts.push([-0.86, -0.26]);
        pts.push([0.86, -0.26]);
        pts.push([-0.59, 0.95]);
        pts.push([0, -1]);

        // scale points and add jitter
        let jitter = 0.2;
        pts = pts.map((p) => {
            return [
                p[0] * size * (1 + jitter * randomInRange(-1, 1)),
                p[1] * size * (1 + jitter * randomInRange(-1, 1))
            ]
        });

        ctx.translate(x, y);
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.moveTo(...(pts.shift()));
        while(pts.length) {
            ctx.lineTo(...(pts.shift()));
        }

        ctx.stroke();
        ctx.resetTransform(ctx);
    }


    // --------------------------------------
    // END SHAPES
    // --------------------------------------


    // a set of independent transforms to use while rendering
    let trans = {
        radius: createTransform(0, rateMax),
        angle: createTransform(0, rateMax),
        color: createTransform(0, rateMax / 4),
    }

    function randomScatter(size, w, h) {
        let pts = [];
        let xcount = Math.ceil(w / size);
        let ycount = Math.ceil(h / size);
        let count = xcount * ycount;
        while (count--) {
            pts.push([randomInRange(0, w), randomInRange(0, h)]);
        }
        return pts;
    }

    let pts = [];

    // If we are warping the grid, we should plot points outside of the canvas
    // bounds to avoid gaps at the edges. Shift them over below.
    let overscan = 1;

    pts = hexScatter(cellSize, cw * overscan, ch * overscan);

    let shapes = [drawDash2, drawDash3, drawCircle, drawTriangle, drawSquare, drawRect, drawSpiral, drawHash2, drawHash3, drawSquiggle, drawLightning, drawStar];

    shapes = shuffle(shapes);
    //shapes = [drawStar];

    let colorCount = contrastPalette.length;

    // point renderers:
    let drawPointsWithRandomColorRandomShape = function(p, i) {
        x = p[0];
        y = p[1];
        xnorm = x/cw;
        ynorm = y/ch;

        ctx.fillStyle = null;
        ctx.strokeStyle = getContrastColor();

        randItem(shapes)(ctx,
            x,
            y,
            dotScale + (1 + trans.radius(xnorm, ynorm)) * (cellSize/2 - dotScale) / 2.5,
            {
                fill: null,
                stroke: ctx.strokeStyle,//fg2,
                angle: PI * trans.angle(xnorm, ynorm)
            }
        );
    }

    let drawPointsWithColorField = function(p, i) {
        x = p[0];
        y = p[1];
        xnorm = x/cw;
        ynorm = y/ch;

        let colorIndex = Math.round((trans.color(xnorm, ynorm)+1) * colorCount) % colorCount;

        ctx.fillStyle = null;
        ctx.strokeStyle = contrastPalette[colorIndex];

        randItem(shapes)(ctx,
            x,
            y,
            dotScale + (1 + trans.radius(xnorm, ynorm)) * (cellSize/2 - dotScale) / 2.5,
            {
                fill: null,
                stroke: contrastPalette[colorIndex],//fg2,
                angle: PI * trans.angle(xnorm, ynorm)
            }
        );
    }

    let drawPointsWithShapesFromColors = function(p, i) {
        x = p[0];
        y = p[1];
        xnorm = x/cw;
        ynorm = y/ch;

        let colorIndex = Math.round((trans.color(xnorm, ynorm)+1)/2 * colorCount) % colorCount;

        let shapeFunc = shapes[ colorIndex % shapes.length ];

        ctx.fillStyle = null;
        ctx.strokeStyle = contrastPalette[colorIndex];

        shapeFunc(ctx,
            x,
            y,
            dotScale + (1 + trans.radius(xnorm, ynorm)) * (cellSize/2 - dotScale) / 2.5,
            {
                fill: null,
                stroke: contrastPalette[colorIndex],//fg2,
                angle: randomInRange(PI * 2) //PI * trans.angle(xnorm, ynorm)
            }
        );
    }

    let drawPointsWithConsistentColoredShapes = function(p, i) {
        x = p[0];
        y = p[1];
        xnorm = x/cw;
        ynorm = y/ch;

        let shapeIndex = randomInt(shapes.length - 1);

        let colorIndex = shapeIndex % contrastPalette.length;

        let shapeFunc = shapes[shapeIndex];

        ctx.fillStyle = null;
        ctx.strokeStyle = contrastPalette[colorIndex];

        shapeFunc(ctx,
            x,
            y,
            dotScale + (1 + trans.radius(xnorm, ynorm)) * (cellSize/2 - dotScale) / 2.5,
            {
                fill: null,
                stroke: contrastPalette[colorIndex],//fg2,
                angle: PI * trans.angle(xnorm, ynorm)
            }
        );
    }

    // create collection of point renderers
    let pointRenderers = {
        //drawPointsWithRandomColorRandomShape,
        drawPointsWithColorField,
        drawPointsWithShapesFromColors,
        drawPointsWithConsistentColoredShapes
    }

    // step thru points with selected renderer
    pts.forEach(pointRenderers[randItem(Object.keys(pointRenderers))]);

    // reset canvas
    ctx.globalAlpha = 1;

    // donegal roughening
    if (opts.roughen > 0) {
        donegal(el, 'random');
    }

    // classic roughen via shifting pixels
    roughen(el, opts.roughen);

    // add noise
    if (opts.addNoise) {
        if (opts.noiseInput) {
            // apply noise from supplied canvas
            noiseUtils.applyNoiseCanvas(el, opts.noiseInput);
        } else {
            // create noise pattern and apply
            noiseUtils.addNoiseFromPattern(el, opts.addNoise, cw / 3);
        }
    }

    // if new canvas child was created, append it
    if (newEl) {
        container.appendChild(el);
    }
}

