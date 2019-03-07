import { randItem, randomInRange, setAttrs, resetTransform, rotateCanvas, getGradientFunction, getSolidColorFunction } from './utils';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';

const DEFAULTS = {
    container: 'body',
    palette: ['#d7d7d7', '#979797', '#cabd9d', '#e4ca49', '#89bed3', '#11758e'],
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true
}

const WAVEPATH_DEFAULTS = {
    fill: '#000',
    stroke: '#fff',
    jitter: 0.25
}

function jitter (val, amount) {
    if (amount === 0) return val;
    return randomInRange(val - val * amount, val + val * amount);
}

// x, y, width, height, (wave)length, amplitude, …
function wavepath(ctx, x, y, w, h, count, amp, options) {
    let opts = Object.assign({}, WAVEPATH_DEFAULTS, options);
    const wl = w/count;
    const pts = Math.ceil(wl * 4);
    let x1,y1,x2,y2,x3,y3;

    console.log(`${count} waves | ${pts} pts | ${wl} length`);

    ctx.fillStyle = opts.fill;
    ctx.strokeStyle = opts.stroke;
    ctx.beginPath();
    ctx.moveTo(x, y);

    for (let i = 0; i < count; i++) {
        x1 = x + wl * i;
        x2 = x1 + wl/2;
        x3 = x2 + wl/2;

        y1 = y + jitter(amp * opts.jitter, opts.jitter);
        y2 = y + jitter(amp, opts.jitter);
        y3 = y + jitter(amp * opts.jitter, opts.jitter);

        ctx.bezierCurveTo(
            x1 + wl/5, y1,
            x2 - wl/5, y2,
            x2, y2
            );
        ctx.bezierCurveTo(
            x2 + wl/5, y2,
            x3 - wl/5, y3,
            x3, y3
            );
    }

    ctx.lineTo(x + wl * count, y + 2 * amp);
    ctx.lineTo(x, y + 2 * amp);

    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function waveband(ctx, x, y, w, h, count, amp, depth, options) {
    for (let i = 0; i < depth; i++) {
        wavepath(ctx, x, y + i * h/depth, w, h, count, amp, options);
    }
}


const WAVELET_DEFAULTS = {
    width: 200,
    rise: 60,
    dip: 30,
    skew: 0.5
}

function wavelet(ctx, x, y, options) {
    let {width, rise, dip, skew} = Object.assign({}, WAVELET_DEFAULTS, options);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(
        x + width * skew * .333,   y - rise / 2,
        x + width * skew * .666,   y - rise / 2,
        x + width * skew, y - rise
        );
    ctx.bezierCurveTo(
        x + width * skew * (1 + 0.333),   y - rise / 2,
        x + width * skew * (1 + 0.666),   y - rise / 2,
        x + width, y
        );
    ctx.bezierCurveTo(
        x + width * skew * (1 + 0.666),   y + dip * .5,
        x + width * skew * (1 + 0.333),   y + dip * .75,
        x + width * skew, y + dip
        );
    ctx.bezierCurveTo(
        x + width * skew * .666,   y + dip * .75,
        x + width * skew * .333,   y + dip * .5,
        x, y
        );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

}

const WAVES_DEFAULTS = {
    wl: 100,
    wh: 50,
    dense: 0.4,
    skew: 0.5
};


function waveset(ctx, x, y, width, height, opts) {
    opts = Object.assign({}, WAVES_DEFAULTS, opts);
    opts.dense = Math.max(opts.dense, 0.1);
    let cols = Math.ceil(width/(opts.wl * opts.dense));
    let rows = Math.ceil(height/(opts.wh * opts.dense));
    console.log(`${rows} rows, ${cols} cols`);
    for (var row = 0 ; row < rows ; row++) {
        for (var col = 0 ; col < (cols + 1 * (row % 2)); col++) {
            wavelet(ctx,
                x + opts.wl * col - (opts.wl/2 * (row % 2)),
                y + (opts.wh * row * opts.dense),
                {
                    width: opts.wl,
                    rise: opts.wh * 0.666,
                    dip: opts.wh * 0.333,
                    skew: opts.skew
                }
            );
        }
    }
}


export function waves(options) {
    let opts = Object.assign({}, DEFAULTS, options);

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
        setAttrs(el, {
            width: cw,
            height: ch
        });
    }

    var ctx; // canvas ctx or svg tag

    ctx = el.getContext('2d');

    ctx.strokeStyle = "white";
    ctx.fillStyle = "#" + Math.random().toString(16).slice(2,8);

    // setup
    let getSolidFill = getSolidColorFunction(opts.palette);



    //wavecurve(ctx, 200, 200, 100, 100, {depth: 5});

    //wavelet(ctx, 200, 400, 100, 100, {depth: 5, sign: 1})

    //waveset(ctx, 0, 0, 800, 800, {wl: 120, wh: 60, dense: 0.35, skew: 0.65});
    
    //waveband(ctx, 0, 100, cw, 60, 4, 50, 5, {fill: getSolidFill(opts.palette)});
    //waveband(ctx, 0, 150, cw, 60, 3, 50, 5, {fill: getSolidFill(opts.palette)});

    let y;
    let amp;
    for(let i=0; i<10; i++) {
        amp = 20 * (i + 1);
        y = amp;
        // ctx, x, y, w, h, wavecount, amp, stackdepth, opts
        waveband(ctx, 0, (i - 1) * 60, cw, 10 * (i+1), 10-i, 5 * (i + 1), 5, {fill: getSolidFill(opts.palette)});
    }


    // if new canvas child was created, append it
    if (newEl) {
        container.appendChild(el);
    }
}


