import noiseUtils from './noiseutils';
import { randItem, randomInRange, resetTransform, rotateCanvas, getGradientFunction } from './utils';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';

const BGLIST = ['white', 'white', 'white', 'solid', 'gradient'];
const OVERLAYLIST = ['shape', 'area', 'blend', 'auto'];

const DEFAULTS = {
    container: 'body',
    palette: ['#d7d7d7', '#979797', '#cabd9d', '#e4ca49', '#89bed3', '#11758e'],
    bg: 'auto', // one of BGLIST or 'auto'
    overlay: null, // one of OVERLAYLIST or 'auto'
    drawShadows: false,
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true
}

// util: random renderers
let renderMap = {
    circle: drawCircle,
    //ring: drawRing,
    triangle: drawTriangle,
    square: drawSquare,
    //box: drawBox,
    rect: drawRect,
    pentagon: drawPentagon,
    hexagon: drawHexagon
};
let shapes = Object.keys(renderMap);
let getRandomRenderer = () => {
    return renderMap[randItem(shapes)];
}

// standard renderer, takes options
export function lines(options) {
    let opts = Object.assign(DEFAULTS, options);

    var container = opts.container;
    var cw = container.offsetWidth;
    var ch = container.offsetHeight;

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

    // bg styles
    let BG;
    if (opts.bg === 'auto') {
        BG = randItem([].concat(BGLIST));
        //console.log('auto bg, picked', BG);
    } else {
        BG = opts.bg;
    }

    // rendering styles
    let drawShapeMask = (Math.random() >= 0.3333); // should we draw a shape-masked line set?

    let blendStyle = 'none'; // ['none', 'fg', 'bg']
    let blendSeed = Math.random(); // should blend overlay apply to fg, bg, or neither?

    // we set drawShapeMask and blendStyle now so we can apply the corresponding
    // overlay options when doing multi-section rendering below.
    if (drawShapeMask) {
        if (blendSeed >= 0.75) {
            blendStyle = 'fg';
        } else if (blendSeed >= 0.25) {
            blendStyle = 'bg';
        }
    }

    if (blendStyle === 'bg') {
        Object.assign(opts, {overlay: 'blend'});
    }

    let drawOpts = Object.assign({}, opts, {bg: BG});

    // divide the canvas into multiple sections?
    let splitPoint;
    let splitSeed = Math.random();
    if (splitSeed > 0.5 && !drawShapeMask) {
        // left right
        splitPoint = [randomInRange(cw * 1/4, cw * 3/4), 0];

        drawLines(ctx,
            [0, 0],
            [splitPoint[0], ch],
            drawOpts
        );
        drawLines(ctx,
            [splitPoint[0], 0],
            [cw, ch],
            drawOpts
        );
    } else {
        // single
        drawLines(ctx,
            [0,0],
            [cw, ch],
            drawOpts
        );
    }

    // draw shapemask, if specified above
    if (drawShapeMask) {
        if (blendStyle === 'fg') {
            Object.assign(opts, {overlay: 'blend'});
        } else {
            Object.assign(opts, {overlay: 'none'});
        }

        let maskScale = Math.min(cw, ch) * randomInRange(0.25, 0.6);
        // Get and use random shape for masking. No fill required.
        getRandomRenderer()(ctx,
            cw * randomInRange(0.2, 0.8),
            ch * randomInRange(0.2, 0.8),
            maskScale,
            {angle: randomInRange(0, Math.PI)}
        );
        ctx.save()
        ctx.clip();
        drawLines(ctx,
            [0,0],
            [cw, ch],
            drawOpts
        );
        ctx.restore();
        resetTransform(ctx);
    }


    // add noise
    if (opts.addNoise) {
        if (opts.noiseInput) {
            noiseUtils.applyNoiseCanvas(el, opts.noiseInput);
        } else {
            noiseUtils.addNoiseFromPattern(el, opts.addNoise, w / 3);
        }
    }

    // if new canvas child was created, append it
    if (newEl) {
        container.appendChild(el);
    }
}

// Renderer:
// In context @ctx draw artwork in the rectangle between @p1 and @p2
// with passed options @opts
export function drawLines(ctx, p1, p2, opts) {
    var w = p2[0] - p1[0];
    var h = p2[1] - p1[1];
    var scale = Math.min(w, h); // reference size, regardless of aspect ratio
    let aspect = w/h;

    // translate to the origin point
    ctx.translate(p1[0], p1[1]);

    // mark it, dude
    ctx.save();

    // clip within the region
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    ctx.clip();
    p1 = p1.map((v)=>v.toFixed(1));
    p2 = p2.map((v)=>v.toFixed(1));

    // optional clear
    if (opts.clear) {
        ctx.clearRect(0, 0, w, h);
    }

    switch (opts.bg) {
        case 'solid':
            ctx.fillStyle = randItem(opts.palette);
            break;
        case 'gradient':
            ctx.fillStyle = getGradientFunction(opts.palette)(ctx, w, h);
            break;
        case 'white':
            ctx.fillStyle = 'white';
            break;
        default:
            // set passed value of bg and hope it's a color!
            ctx.fillStyle = opts.bg;

    }
    ctx.fillRect(0, 0, w, h);


    // Pick a render style, which determines some of the values for
    // the primitive params
    // --------------------------------------

    let minStops;
    let maxStops;
    let renderStyle = '';

    if (Math.random() > 0.5) {
        renderStyle = 'wave';
    } else {
        renderStyle = 'jagged';
    }

    // debug!
    //renderStyle = 'jagged';
    //renderStyle = 'wave';

    switch (renderStyle) {
        case 'wave':
            minStops = 50;
            maxStops = 200;
            ctx.lineJoin = 'round';
            break;
        case 'jagged':
            minStops = 2;
            maxStops = 30;
            ctx.lineJoin = 'miter';
            break;
    }

    // Set up basic params
    // --------------------------------------

    let stops = Math.ceil(randomInRange(minStops, maxStops) * aspect);
    let lines = Math.floor(randomInRange(10, 40) / aspect);

    let stopInterval = w / (stops - 1);
    let lineInterval = h / lines;

    // move endpoints out of frame
    ctx.translate(-stopInterval/2, -lineInterval/2);

    //console.log(`${lines} lines @${lineInterval.toFixed(1)}px  X  ${stops} stops @${stopInterval.toFixed(1)}px`)


    let pts = [];
    // create array of zeroes
    for (let i = 0; i <= stops; i++) {
        pts.push([i * stopInterval, 0]);
    }
    let pt;


    // Assign a line transform function
    // --------------------------------------

    let widthSeed = Math.random();
    let widthFunc;
    let widthStyle = ''; // ['CONSTANT','INCREASING','DECREASING']
    let minWidth;
    let maxWidth;
    let widthStep;

    if (widthSeed >= 0.66) {
        widthStyle = 'CONSTANT';
    } else if (widthSeed >= 0.33) {
        widthStyle = 'INCREASING';
    } else {
        widthStyle = 'DECREASING';
    }

    switch (widthStyle) {
        case 'CONSTANT':
            let widthScale = randomInRange(0.4, 0.5);
            widthFunc = (l) => lineInterval * widthScale;
            break;
        case 'INCREASING':
            maxWidth = lineInterval * randomInRange(0.6, 1.1);
            minWidth = 1 + lineInterval * randomInRange(0, 0.15);
            widthStep = (maxWidth - minWidth)/(lines - 1);
            widthFunc = (l) => minWidth + l * widthStep;
            break;
        case 'DECREASING':
            maxWidth = lineInterval * randomInRange(0.6, 1.1);
            minWidth = 1 + lineInterval * randomInRange(0, 0.15);
            widthStep = (maxWidth - minWidth)/(lines - 1);
            widthFunc = (l) => maxWidth - l * widthStep;
            break;
    }


    // Assign a points transform function -- these functions deviate
    // from straight lines.
    // --------------------------------------

    // component pt transform func
    // left/right drift of the line points. Easy to collide, so keep small.
    // Drift looks better with more lines and stops to reveal
    // the resulting patterns, so scale gently with those counts.
    let _xScale =
        0.9 * lines / 1000
        + 1.3 * stops / 1000;
    let xDrift = (x, line, stop) => {
        if (stop === 0 || stop === stops) {
            // do not drift the endpoints
            return x;
        }
        return x + stopInterval * randomInRange(-_xScale, _xScale);
    }

    // component pt transform func
    // Vertical drift of the line points
    // Baseline value plus some adjustment for line/stop density
    let _yScale = randomInRange(0.08, 0.12) + (randomInRange(17, 23) / (lines * stops));
    let yDrift = (y, line, stop) => {
        return y + lineInterval * randomInRange(-_yScale, _yScale);
    }

    // component pt transform func
    // Waves with drifting phase, to make nice ripples
    let TWOPI = Math.PI * 2;
    let waveCount = randomInRange(0.5, 2.5) * aspect;
    let wavePhase = randomInRange(lines/10,lines/1);
    let yWave = (y, line, stop) => {
        let factor = 0.2 * lineInterval * // scale the wave
            Math.sin(
                stop/stops * TWOPI * waveCount + // number of waves
                line/wavePhase * TWOPI // move phase with each line
            );
        return y + factor;
    }

    // sample pt transform func
    // Combines lateral and vertical drift functions.
    let drift = (pt, line, stop) => {
        return [
            xDrift(pt[0], line, stop),
            yDrift(pt[1], line, stop)
        ]
    }

    // sample sin wave transform
    let wave = (pt, line, stop) => {
        return [
            pt[0],
            yWave(pt[1], line, stop)
        ]
    }

    let styleTransformMap = {
        'wave': wave,
        'jagged': drift
    }


    // assign pt transform func
    let ptTransform = styleTransformMap[renderStyle];

    // Color transform
    // --------------------------------------
    // ...

    // Draw the lines!
    // --------------------------------------
    // Step through the lines, modifying the pts array as you go.

    // For blend overlays, we need black lines so we can apply true palette
    // colors using screen.
    if (opts.overlay === 'blend') {
        ctx.strokeStyle = 'black';
    } else {
        ctx.strokeStyle = randItem(opts.palette);
    }

    for (let l = 0 ; l <= lines ; l++) {
        ctx.lineWidth = widthFunc(l);
        ctx.translate(0, lineInterval)
        ctx.moveTo(0, 0);
        ctx.beginPath();
        for (let s = 0; s <= stops; s++) {
            pts[s] = ptTransform(pts[s], l, s);

            ctx.lineTo(pts[s][0], pts[s][1]);
        }
        ctx.stroke();
    }


    // Add effect elements
    // ...

    // Overlay a shape or area, according to opts.overlay
    // Prepare ctx and render tools:
    resetTransform(ctx);
    ctx.translate(p1[0], p1[1]);


    // switch on overlay option…
    if (opts.overlay === 'auto') {
        // if auto overlay, pick one
        opts.overlay = randItem([null].concat(OVERLAYLIST));
    }
    switch (opts.overlay) {
        case 'shape':
            ctx.globalCompositeOperation = 'color';
            let renderer = getRandomRenderer();
            renderer(ctx,
                w/2,
                h/2,
                scale * randomInRange(0.3, 0.45),
                {fill: randItem(opts.palette)}
            );
            break;
        case 'area':
            ctx.globalCompositeOperation = 'color';
            ctx.fillStyle = randItem(opts.palette);
            ctx.fillRect(0, 0, w * randomInRange(0.25, 0.75), h);
            break;
        case 'blend':
            ctx.globalCompositeOperation = 'screen';
            ctx.fillStyle = getGradientFunction(opts.palette)(ctx, w, h);
            ctx.fillRect(0, 0, w, h);
            break;
    }
    // …clean up blending and finish.
    ctx.globalCompositeOperation = 'normal';



    // END RENDERING

    // unclip and remove translation
    ctx.restore();
    resetTransform(ctx);
}
