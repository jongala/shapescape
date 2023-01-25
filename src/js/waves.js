import { randItem, randomInRange, randomInt, resetTransform, rotateCanvas, getGradientFunction, getLocalGradientFunction, getSolidColorFunction } from './utils';
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
    let x1,y1,x2,y2,x3,y3;

    //console.log(`${count} waves | ${wl} length`);

    ctx.fillStyle = opts.fill;
    ctx.strokeStyle = opts.stroke;
    ctx.beginPath();
    ctx.moveTo(x, y);

    y1 = y3 = y;
    y2 = y + amp;

    for (let i = 0; i < count; i++) {
        x1 = x + wl * i;
        x2 = x1 + wl/2;
        x3 = x2 + wl/2;

        y1 = y3
        y2 = y + jitter(amp, opts.jitter); // jitter the midpoint based on amp
        y3 = y + jitter(amp * opts.jitter, opts.jitter); // jitter endpoint less

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

    ctx.lineTo(x + wl * count, y + h);
    ctx.lineTo(x, y + h);

    ctx.closePath();
    opts.fill && ctx.fill();
    ctx.stroke();
}


// a series of smooth curves with a filled base layer, and then
// variants of the path.
// @w: width
// @h: height
// @count: the number of peaks
// @depth: the number of variant lines
// @amp: amplitude of the wave/trough

function waveband(ctx, x, y, w, h, count, amp, depth, options) {
    let opts = Object.assign({}, options);
    let _lineWidth = ctx.lineWidth;
    let _yoffset = 0;
    for (let i = 0; i < depth; i++) {
        if (i === 0) {
            // start with a thick solid line
            ctx.setLineDash([]);
            ctx.lineWidth = _lineWidth * randomInRange(1.5, 2);
        } else {
            // after, go thinner, and sometimes dotted
            ctx.lineWidth = _lineWidth;
            if (Math.random() < 0) {
                // dotted lines. should switch this at top level
                ctx.setLineDash([_lineWidth, _lineWidth * 2]);
            }
            opts.fill = null; // after the first pass, remove the fill, so lines overlap
        }

        _yoffset = i * amp/depth;
        wavepath(ctx, x, y + _yoffset, w, h - amp/depth * i, count, amp, opts);

    }
}


const WAVELET_DEFAULTS = {
    width: 200,
    rise: 60,
    dip: 30,
    skew: 0.5
}

// a peaky little wavelet shape, stands alone
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


// a pattern of wavelet() renderings
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

    ctx.strokeStyle = "black";
    ctx.fillStyle = "#" + Math.random().toString(16).slice(2,8);

    // setup
    let getSolidFill = getSolidColorFunction(opts.palette);

    let fg = getSolidFill();

    let getGradientFill = getLocalGradientFunction(opts.palette);



    drawCircle(ctx, cw/2, ch/3, ch/5, {fill:'red'});

    //wavecurve(ctx, 200, 200, 100, 100, {depth: 5});

    //wavelet(ctx, 200, 400, 100, 100, {depth: 5, sign: 1})

    //waveset(ctx, 0, 0, 800, 800, {wl: 120, wh: 60, dense: 0.35, skew: 0.65});

    //waveband(ctx, 0, 100, cw, 60, 4, 50, 5, {fill: getSolidFill(opts.palette)});
    //waveband(ctx, 0, 150, cw, 120, 3, 50, 5, {fill: getSolidFill(opts.palette)});


    function simpleCover() {
        let y = 0;
        let x = 0;
        let h_shift = 0;
        let amp;
        let h;
        let count;
        let steps = randomInRange(10, 40);
        let interval = ch/steps;

        let baseCount = randomInRange(20, 50); // low or high number of peaks

        ctx.lineWidth = 0.5 + interval/50;

        let strokeColor = (Math.random() > 0.5) ? 'white' : 'black';

        y = -interval; // start above the top

        for(let i=0; i<steps; i++) {
            amp = interval;
            h = amp * 3;

            // variation in wave count based on amplitude
            count = baseCount * randomInRange(3, 5) / amp;

            // horizontal offsets for natural appearance
            h_shift = randomInRange(0, 0.1);
            x = - h_shift * cw;

            if (Math.random() < 0.3) {
                let _size = SCALE/8;
                let _x = x + cw * randomInRange(0, 1);
                let _y = y + randomInRange(_size/4, _size);
                drawCircle(ctx, _x, _y, _size, {
                        stroke:strokeColor,
                        fill:getGradientFill(ctx, _x, _y, _size)
                    });
            }


            // ctx, x, y, w, h, wavecount, amp, stackdepth, opts
            waveband(ctx, x, y,
                cw * (1+h_shift), h,
                count, amp, 5,
                {
                    fill: fg,
                    stroke: strokeColor,
                    jitter: 0.2
                }
            );

            // step down
            y += amp;
        }
    }

    function nearFar() {
        let y = 0;
        let x = 0;
        let h_shift = 0;
        let amp;
        let h;
        let count;
        let steps = 34;
        let interval = ch/steps;

        for(let i=0; i<steps; i++) {
            count = Math.max(randomInRange(steps - 2 - i, steps + 2 -i), 0.5);
            //count = steps/2 + steps/2 - (i/2) + randomInt(0, 3);
            count = steps - i;
            count = Math.ceil(count);
            amp = 55/count + i * 1;
            y += amp * 1;
            h = amp * 9;

            // horizontal offsets for natural appearance
            h_shift = randomInRange(0, 0.1);
            x = - h_shift * cw;

            // make near lines thicker
            ctx.lineWidth = 0.5 + amp/50;

            // ctx, x, y, w, h, wavecount, amp, stackdepth, opts
            waveband(ctx, x, y, cw * (1+h_shift), h, count, amp, 5, {fill: getSolidFill(opts.palette)});
        }
    }

    simpleCover();
    //nearFar();



    // if new canvas child was created, append it
    if (newEl) {
        container.appendChild(el);
    }
}


