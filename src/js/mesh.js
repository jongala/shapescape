import noiseUtils from './noiseutils';
import { randItem, randomInRange, setAttrs, resetTransform, rotateCanvas, getGradientFunction, getSolidColorFunction } from './utils';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';

const DEFAULTS = {
    container: 'body',
    palette: ['#222', '#666', '#bbb', '#f2f2f2' ],
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true
}

export function mesh(options) {
    let opts = Object.assign({}, DEFAULTS, options);

    let container = opts.container;
    let cw = container.offsetWidth;
    let ch = container.offsetHeight;
    let SCALE = Math.min(cw, ch);

    // Find or create canvas child
    let el = container.querySelector('canvas');
    let newEl = false;
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

    let ctx = el.getContext('2d');

    // DRAW --------------------------------------

    // define grid
    let count = Math.round(randomInRange(3, 19));
    let w = Math.ceil(cw/count);
    let h = w;
    let vcount = Math.ceil(ch/h);

    // setup vars for each cell
    let x = 0;
    let y = 0;
    let xnorm = 0;
    let ynorm = 0;
    let renderer;


    // play with these random seeds
    let a,b,c;
    a = Math.random();
    b = Math.random();
    c = Math.random();

    let getSolidFill = getSolidColorFunction(opts.palette);

    // get palette of non-bg colors
    let contrastPalette = [].concat(opts.palette);
    contrastPalette.splice(opts.palette.indexOf(bg), 1);
    let getContrastColor = getSolidColorFunction(contrastPalette);

    // shared colors
    let fg = getContrastColor();
    let bg = getContrastColor();

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = randomInRange(1, 4) * SCALE/800;

    ctx.strokeStyle = fg;

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);

    let r = randomInRange(3,7) * SCALE/800 ; // dot radius
    let dotFill = randItem([fg, fg, bg]);

    for (let i = 0; i < vcount; i++) {
        for (let j = 0; j < count; j++) {
            // convenience vars
            x = w * j + w/2;
            y = h * i + h/2;
            xnorm = x/cw;
            ynorm = y/ch;

            drawCircle(ctx, x, y, r, {fill: dotFill});

            ctx.beginPath();
            if (i > 0 && Math.random() > 0.75) {
                ctx.moveTo(x, y);
                ctx.lineTo(x, y - h);
            }
            if (j > 0 && Math.random() > 0.75) {
                ctx.moveTo(x, y);
                ctx.lineTo(x - w, y);
            }
            if (i > 0 && j > 0 && Math.random() > 0.75) {
                ctx.moveTo(x, y);
                ctx.lineTo(x - w, y - h);
            }
            if (i > 0 && j < (count - 1) && Math.random() > 0.75) {
                ctx.moveTo(x, y);
                ctx.lineTo(x + w, y - h);
            }
            ctx.stroke();
            ctx.closePath();
        }
    }


    // END DRAW --------------------------------------

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
