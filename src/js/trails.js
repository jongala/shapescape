import noiseUtils from './noiseutils';
import palettes from './palettes';
import hexScatter from './hexScatter';
import { randItem, randomInRange, resetTransform, rotateCanvas, getGradientFunction, getSolidColorFunction } from './utils';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';
import { createTransform, createSourceSinkTransform, opacityTransforms } from './util/fieldUtils';

const PI = Math.PI;
const FIELDMODES = ['harmonic', 'flow'];
const GRIDMODES = ['normal', 'scatter', 'random'];
const COLORMODES = ['length', 'curve', 'change', /*'origin',*/ 'mono', 'duo', 'random' ];
const STYLES = ['round', 'square'];

const DEFAULTS = {
    container: 'body',
    palette: palettes.de_stijl,
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true,
    fieldMode: 'auto', // [auto, harmonic, flow]
    gridMode: 'scatter', // from GRIDMODES
    colorMode: 'auto', // from COLORMODES
    style: 'auto', // from STYLES
    mixWeight: false,
    isolate: true
}

// Main function
export function trails(options) {
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
    const FIELDMODE = opts.fieldMode === 'auto' ? randItem(FIELDMODES) : opts.fieldMode;
    const GRIDMODE = opts.gridMode === 'auto' ? randItem(GRIDMODES) : opts.gridMode;
    const COLORMODE = opts.colorMode === 'auto' ? randItem(COLORMODES) : opts.colorMode;
    const STYLE = opts.style === 'auto' ? randItem(STYLES) : opts.style;

    console.log('==================================\nTrails:', FIELDMODE, GRIDMODE, COLORMODE, STYLE);

    // color funcs
    let getSolidFill = getSolidColorFunction(opts.palette);

    // how many cells are in the grid?
    let countMin, countMax;
    countMin = 80;
    countMax = 160;

    let cellSize = Math.round(SHORT / randomInRange( countMin, countMax ));

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
    //contrastPalette.sort(()=>(randomInRange(-1, 1)));
    let getContrastColor = getSolidColorFunction(contrastPalette);
    let colorCount = contrastPalette.length;

    // shared foregrounds
    let fg = getContrastColor();
    let fg2 = getContrastColor();

    // draw background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);

    ctx.strokeStyle = fg;

    // trails:
    let rateMax = randomInRange(0.5, 5); // this is a bit meta and silly

    // tail vars
    let _x,_y,len;

    // line width
    let weight = SHORT / randomInRange(400, 75);

    ctx.lineWidth = weight;
    ctx.lineCap = STYLE;

    // const used in normalizing transforms
    let maxLen = 2 * Math.sqrt(2);

    // It looks nice to extend lines beyond their cells. how much?
    // Scaled against cellSize
    let lineScale = randomInRange(0.7, 3);

    // Displace the center point of each cell by this factor
    // Only do this sometimes, and not when scattering
    let warp = 0;
    if (GRIDMODE !== 'scatter' && (Math.random() < 0.5)) {
        warp = randomInRange(0, Math.sqrt(2));
    }

    // Pick an opacity transform to use
    let opacityFunc = randItem(opacityTransforms(maxLen));

    // a set of independent transforms to use while rendering
    let trans = {
        //xbase: createTransform(0, rateMax),
        //ybase: createTransform(0, rateMax),
        xtail: createTransform(0, rateMax),
        ytail: createTransform(0, rateMax),
        //radius: createTransform(0, rateMax),
        color: createTransform(0, 5/SHORT) // change colors slowly
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

    function placeNormal(size, w, h) {
        let pts = [];
        let xcount = Math.ceil(w / size) + 2;
        let ycount = Math.ceil(h / size) + 2;
        let count = xcount * ycount;
        let x,y;
        for (var i = 0 ; i < count ; i++) {
            x = size * ((i % xcount) - 1) + size / 2;
            y = size * (Math.floor(i/ycount) - 1) + size / 2;
            pts.push([x, y]);
        }
        return pts;
    }

    let pts = [];

    switch (GRIDMODE) {
        case 'scatter':
            //pts = hexScatter(Math.round(SCALE/randomInRange(60,120)), cw, ch);
            pts = hexScatter(cellSize, cw, ch);
            break;
        case 'random':
            pts = randomScatter(cellSize, cw, ch);
            break;
        default:
            pts = placeNormal(cellSize, cw, ch);
    }

    // shuffle the points so trails are initialized randomly
    pts.sort(()=>randomInRange(-1,1));

    // Create another canvas

    let ref = document.querySelector('#ref');
    if (!ref) {
        ref = document.createElement('canvas');
        ref.setAttribute('id','ref');
        ref.setAttribute('width', cw);
        ref.setAttribute('height', ch);
        ref.className = 'artContainer';
        //document.querySelector('body').appendChild(ref);
    }
    let rctx = ref.getContext('2d');

    rctx.fillStyle = 'black';
    rctx.fillRect(0, 0, cw, ch);

    rctx.strokeStyle = 'white';
    rctx.lineWidth = weight * 2; // exclusion based on stroke
    rctx.lineCap = STYLE;


    // Field trails: for each point, follow the tail functions for
    // a bunch of steps. Seems to work well for 20-100 steps. With more steps
    // you have to fade out opacity as you go to remain legible
    let steps;
    let stepBase = randomInRange(6, 30); // vary this for each trail. See loop.
    lineScale = 0.7; // scalar of the function at each step. small=smooth.

    let dx, dy;

    ctx.globalAlpha = 1;
    //ctx.globalAlpha = 0.5;
    //ctx.globalCompositeOperation = 'overlay';

    ctx.lineWidth = weight;

    let colorVal; // color transform value
    let colorNorm; // color val normalized to palette

    let trace = [0, 0]; // color sample

    let tStart = new Date().getTime();

    // source/sink stuff
    let sourceTransform = createSourceSinkTransform(Math.round(randomInRange(5, 15)));
    if (FIELDMODE === 'flow') {
        let totalStrength = 0;
        sourceTransform.sources.forEach((source) => {
            totalStrength += source.strength;
        });
        lineScale = 1/totalStrength;
    }


    // to avoid self blocking,
    // hold each trail and defer reference rendering till each is done.
    // This allows self intersection, but avoids self-interference when
    // each step is too small to avoid colliding with the last.
    let trail = [];

    if (!opts.isolate) {
        ctx.globalAlpha = randomInRange(0.5, 0.75);
        //ctx.globalCompositeOperation = 'overlay';
        stepBase = randomInRange(20, 40); // near normal max. TODO make this more interesting
        weight = randomInRange(0.5, 1.5); // thinner lines
        ctx.lineWidth = weight;
    }

    pts.forEach((p, i) => {
        //ctx.strokeStyle = (i%2)? fg : fg2;
        //ctx.strokeStyle = (i%2)? 'white' : 'black';
        //ctx.strokeStyle = getContrastColor();

        steps = stepBase * randomInRange(1, 2);

        x = p[0];
        y = p[1];

        // check reference canvas at start point.
        if (opts.isolate) trace = rctx.getImageData(x, y, 1, 1).data;
        if (trace[0] > 5) {
            return;
        }

        let tlen = 0;
        let tCurve = 0;
        let tChange = 0;
        let angle = 0;
        let lastAngle = 0;
        let ddx, ddy;
        let lastDelta = [0, 0];

        if (opts.mixWeight) {
            ctx.lineWidth = weight * Math.tan(PI * randomInRange(0, 0.27));
            rctx.lineWidth = ctx.lineWidth * 2;
        }

        for (var z=0; z<=steps; z++) {
            x = p[0];
            y = p[1];
            xnorm = x/cw;
            ynorm = y/ch;

            if (FIELDMODE === 'flow') {
                // flow fields (source-sink)
                let flow = sourceTransform.t(xnorm, ynorm);
                _x = flow[0];
                _y = flow[1];
            } else {
                // harmonic fields
                _x = trans.xtail(xnorm, ynorm);
                _y = trans.ytail(xnorm, ynorm);
            }

            dx = cellSize * _x * lineScale;
            dy = cellSize * _y * lineScale

            // get ref sample
            if (opts.isolate) trace = rctx.getImageData(x + dx, y + dy, 1, 1).data;
            // stop if white
            if (trace[0] > 5) {
                continue;
            }

            // direct draw
            //ctx.beginPath();
            //ctx.moveTo(x, y);
            //ctx.lineTo(
            //    x + dx,
            //    y + dy
            //);
            //ctx.stroke();

            trail.push([x + dx, y + dy]);
            if ( COLORMODE === 'length' ) {
                // tally up the length
                tlen += Math.sqrt(dx * dx + dy * dy);
            }
            if ( COLORMODE === 'curve') {
                // add abs change in angle
                // tCurve += Math.abs((Math.atan((y+dy)/(x+dx)) - Math.atan(y/x)));
                angle = Math.atan(dy/dx);
                if (z > 0) {
                    // don't accumulate until second point, otherwise we include
                    // the initial angle of the root position in the tally
                    tCurve += Math.abs(angle - lastAngle);
                }
                lastAngle = angle;
            }
            if (COLORMODE === 'change') {
                ddx = dx - lastDelta[0];
                ddy = dy - lastDelta[1];
                tChange += Math.sqrt( ( ddx * ddx ) + ( ddy * ddy) );
                lastDelta = [dx, dy];
            }

            p[0] = x + dx;
            p[1] = y + dy;
        }

        let trailStart;
        let trailEnd;


        // Deferred drawing
        // foreach trail, render it
        if (trail.length) {
            trailStart = trail.shift();
            trailEnd = trail[trail.length - 1];

            // Colors

            if (COLORMODE === 'origin') {
                // set color as a function of position of trail origin
                colorVal = (trans.color(x, y) + 1) / 2;
                colorNorm = Math.round(colorVal * (contrastPalette.length - 1));
                ctx.strokeStyle = contrastPalette[colorNorm] || 'green';
            }


            if (COLORMODE === 'length') {
                colorVal = tlen / (stepBase * 2 * 3); // roughly the expected max length
                //console.log(colorVal);
                colorNorm = Math.round(colorVal * (colorCount - 1));
                ctx.strokeStyle = contrastPalette[colorNorm % colorCount] || 'green';
            }

            if (COLORMODE === 'curve') {
                colorVal = tCurve * 1.2; // magic number
                colorVal = colorVal % PI;
                //console.log(colorVal.toFixed(1));
                colorNorm = Math.round(colorVal * (colorCount - 1));
                ctx.strokeStyle = contrastPalette[colorNorm % colorCount] || 'green';
            }

            if (COLORMODE === 'change') {
                colorVal = tChange * 0.2; // magic number
                //console.log(colorVal.toFixed(1));
                colorNorm = Math.round(colorVal * (colorCount - 1));
                ctx.strokeStyle = contrastPalette[colorNorm % colorCount] || 'green';
            }

            if (COLORMODE === 'mono') {
                ctx.strokeStyle = fg;
            }

            if (COLORMODE === 'duo') {
                ctx.strokeStyle = randItem([fg, fg2]);
            }

            if (COLORMODE === 'random') {
                ctx.strokeStyle = getContrastColor();
            }

            // Start drawing

            ctx.beginPath();
            ctx.moveTo(...trailStart);

            if(opts.isolate) {
                rctx.beginPath();
                rctx.moveTo(...trailStart);
            }

            trail.forEach((pt, i) => {
                ctx.lineTo(
                    pt[0],
                    pt[1]
                );
                opts.isolate && rctx.lineTo(
                    pt[0],
                    pt[1]
                );
            });
            ctx.stroke();
            opts.isolate && rctx.stroke();
            trail = [];
        }

    });

    ctx.globalAlpha = 1;

    let tEnd = new Date().getTime();

    console.log('rendered in ' + (tEnd - tStart) + 'ms');

    window.ctx = ctx;

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


