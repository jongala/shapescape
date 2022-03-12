import noiseUtils from './noiseutils';
import palettes from './palettes';
import hexScatter from './hexScatter';
import { randItem, randomInRange, resetTransform, rotateCanvas, getGradientFunction, getSolidColorFunction } from './utils';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';

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
    let dotScale = cellSize * randomInRange(0.15, 0.25);
    // line width
    let weight = cellSize * randomInRange(0.05, 0.15);

    ctx.lineWidth = weight;
    ctx.lineCap = 'round';

    let drawDash2 = (ctx, x, y, size, opts) => {
        let angle = opts.angle || randomInRange(0, PI);
        let d = size * randomInRange(0.6, 1);
        let gap = size / 2;
        ctx.translate(x, y);
        ctx.rotate(angle)

        ctx.beginPath();

        ctx.translate(weight * randomInRange(0, 1), weight * randomInRange(0, 1) );

        ctx.moveTo(- d * Math.cos(angle), -gap);
        ctx.lineTo(d * Math.cos(angle), -gap);

        ctx.translate(weight * randomInRange(0, 1), weight * randomInRange(0, 1) );

        ctx.moveTo(- d * Math.cos(angle), gap);
        ctx.lineTo(d * Math.cos(angle), gap);

        ctx.stroke();

        resetTransform(ctx);
    }

    let drawDash3 = (ctx, x, y, size, opts) => {
        let angle = opts.angle || randomInRange(0, PI);
        let d = size * randomInRange(0.6, 1);
        let gap = size / 3;
        ctx.translate(x, y);
        ctx.rotate(angle)

        ctx.beginPath();

        // randomize between strokes
        ctx.translate(weight * randomInRange(0, 0.8), weight * randomInRange(0, 0.8) );
        d *= randomInRange(0.9, 1.1);

        ctx.moveTo(- d * Math.cos(angle), -gap);
        ctx.lineTo(d * Math.cos(angle), -gap);

        // randomize between strokes
        ctx.translate(weight * randomInRange(0, 0.8), weight * randomInRange(0, 0.8) );
        d *= randomInRange(0.9, 1.1);

        ctx.moveTo(- d * Math.cos(angle), 0);
        ctx.lineTo(d * Math.cos(angle), 0);

        // randomize between strokes
        ctx.translate(weight * randomInRange(0, 0.8), weight * randomInRange(0, 0.8) );
        d *= randomInRange(0.9, 1.1);

        ctx.moveTo(- d * Math.cos(angle), gap);
        ctx.lineTo(d * Math.cos(angle), gap);

        ctx.stroke();

        resetTransform(ctx);
    }


    // const used in normalizing transforms
    let maxLen = 2 * Math.sqrt(2);

    // set of functions to transform opacity across grid
    const opacityTransforms = [
        () => 1,
        (_x, _y) => Math.abs(_y/_x)/maxLen,
        (_x, _y) => (1 - Math.abs(_y/_x)/maxLen),
        (_x, _y) => Math.abs(_x/_y), // hides verticals
        (_x, _y) => Math.abs(_y/_x), // hides horizontals
        (_x, _y) => (_x / _y),
        (_x, _y) => (_y / _x),
        (_x, _y) => (_y - _x),
        (_x, _y) => (_x - _y)
    ]
    // now pick one
    let opacityFunc = randItem(opacityTransforms);

    // Create a function which is a periodic transform of x, y
    function createTransform (rateMin = 0, rateMax = 1) {
        let rate1 = randomInRange(0, rateMax/2);
        let rate2 = randomInRange(0, rateMax/2);
        let rate3 = randomInRange(rateMax/2, rateMax);
        let rate4 = randomInRange(rateMax/2, rateMax);

        let phase1 = randomInRange(-PI, PI);
        let phase2 = randomInRange(-PI, PI);
        let phase3 = randomInRange(-PI, PI);
        let phase4 = randomInRange(-PI, PI);

        let c1 = randomInRange(0, 1);
        let c2 = randomInRange(0, 1);
        let c3 = randomInRange(0, 1);
        let c4 = randomInRange(0, 1);
        return (xnorm, ynorm) => {
            let t1 = Math.sin(xnorm * rate1 * 2 * PI + phase1);
            let t2 = Math.sin(ynorm * rate2 * 2 * PI + phase2);
            let t3 = Math.sin(xnorm * rate3 * 2 * PI + phase3);
            let t4 = Math.sin(ynorm * rate4 * 2 * PI + phase4);
            return (c1 * t1 + c2 * t2 + c3 * t3 + c4 * t4)/(c1 + c2 + c3 + c4);
        }
    }

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

    let shapes = [drawDash2, drawDash2, drawDash3, drawCircle, drawTriangle, drawSquare, drawRect];

    let colorCount = contrastPalette.length;

    // step thru points
    pts.forEach((p, i) => {
        x = p[0];
        y = p[1];
        xnorm = x/cw;
        ynorm = y/ch;

        let colorIndex = Math.round((trans.color(xnorm, ynorm)+1) * colorCount) % colorCount;
        //colorIndex = Math.round(opacityFunc(xnorm, ynorm) * colorCount) % colorCount;;

        randItem(shapes)(ctx,
            x,
            y,
            (trans.radius(xnorm, ynorm) + randomInRange(1.0, 1.2)) * dotScale,
            {
                fill: null,
                stroke: contrastPalette[colorIndex],//fg2,
                angle: PI * trans.angle(xnorm, ynorm)
            }
        );

        //ctx.globalAlpha = opacityFunc(xnorm, ynorm);
    });

    ctx.globalAlpha = 1;

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

