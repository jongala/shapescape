import noiseUtils from './noiseutils';
import { randItem, randomInRange, setAttrs, resetTransform, rotateCanvas, getGradientFunction } from './utils';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';

const DEFAULTS = {
    container: 'body',
    palette: ['#d7d7d7', '#979797', '#cabd9d', '#e4ca49', '#89bed3', '#11758e'],
    bg: '#fff',
    overlay: null, // ['shape', 'area', 'blend', 'auto']
    drawShadows: false,
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true
}


// draw it!
function lines(options) {
    let opts = Object.assign(DEFAULTS, options);

    var container = opts.container;

    var w = container.offsetWidth;
    var h = container.offsetHeight;
    var scale = Math.min(w, h); // reference size, regardless of aspect ratio

    // Find or create canvas child
    var el = container.querySelector('canvas');
    var newEl = false;
    if (!el) {
        container.innerHTML = '';
        el = document.createElement('canvas');
        newEl = true;
    }
    if (newEl || opts.clear) {
        setAttrs(el, {
            width: container.offsetWidth,
            height: container.offsetHeight
        });
    }

    var ctx; // canvas ctx or svg tag

    ctx = el.getContext('2d');
    ctx.save();

    // optional clear
    if (opts.clear) {
        el.width = container.offsetWidth;
        el.height = container.offsetHeight;
        ctx.clearRect(0, 0, w, h);
    }

    if (opts.bg === 'auto') {
        ctx.fillStyle = randItem(opts.palette);
    } else {
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

    let stops = Math.ceil(randomInRange(minStops, maxStops));
    let lines = Math.floor(randomInRange(10, 40));

    let stopInterval = w / (stops - 1);
    let lineInterval = h / lines;

    ctx.translate(-stopInterval/2, -lineInterval/2);

    console.log(`${lines} lines @${lineInterval.toFixed(1)}px  X  ${stops} stops @${stopInterval.toFixed(1)}px`)


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
        1.3 * lines / 1000
        + 1 * stops / 1000;
    let xDrift = (x, line, stop) => {
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
    let waveCount = randomInRange(0.5, 2.5);
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

    // switch on overlay option…
    if (opts.overlay === 'auto') {
        // if auto overlay, pick one
        opts.overlay = randItem(['shape', 'area', 'blend', null]);
    }
    switch (opts.overlay) {
        case 'shape':
            ctx.globalCompositeOperation = 'color';
            let renderer = getRandomRenderer();
            renderer(ctx,
                w/2,
                h/2,
                Math.min(w, h) * randomInRange(0.3, 0.45),
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

// export
export default lines;
