import { randItem, randomInRange, setAttrs, resetTransform, rotateCanvas, getGradientFunction } from './utils';
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

    //wavecurve(ctx, 200, 200, 100, 100, {depth: 5});

    //wavelet(ctx, 200, 400, 100, 100, {depth: 5, sign: 1})

    waveset(ctx, 0, 0, 800, 800, {wl: 120, wh: 60, dense: 0.35, skew: 0.65});

    // if new canvas child was created, append it
    if (newEl) {
        container.appendChild(el);
    }
}


