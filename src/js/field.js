import noiseUtils from './noiseutils';
import palettes from './palettes';
import { randItem, randomInRange, resetTransform, rotateCanvas, getGradientFunction, getSolidColorFunction } from './utils';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';

const DEFAULTS = {
    container: 'body',
    palette: palettes.de_stijl,
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true,
    lightMode: 'auto', // [auto, bloom, normal]
    gridMode: 'auto', // [auto, coarse, fine]
}

const PI = Math.PI;
const LIGHTMODES = ['bloom', 'normal'];
const GRIDMODES = ['coarse', 'fine'];

// Main function
export function field(options) {
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
        el.width = cw;
        el.height = ch;
    }

    let ctx = el.getContext('2d');

    // modes and styles
    const LIGHTMODE = opts.lightMode === 'auto' ? randItem(LIGHTMODES) : opts.lightMode;
    const GRIDMODE = opts.gridMode === 'auto' ? randItem(GRIDMODES) : opts.gridMode;

    // color funcs
    let getSolidFill = getSolidColorFunction(opts.palette);

    // how many cells are in the grid?
    let countMin, countMax;
    if (GRIDMODE === 'coarse') {
        countMin = 8;
        countMax = 20;
    } else {
        countMin = 30;
        countMax = 100;
    }

    // define grid
    let count = Math.round(randomInRange(countMin , countMax));
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

    // shared colors
    let bg = getSolidFill();

    // get palette of non-bg colors
    let contrastPalette = [].concat(opts.palette);
    contrastPalette.splice(opts.palette.indexOf(bg), 1);
    let getContrastColor = getSolidColorFunction(contrastPalette);

    // shared foregrounds
    let fg = getContrastColor();
    let fg2 = getContrastColor();

    // in bloom mode, we draw high-contrast grayscale, and layer
    // palette colors on top
    if (LIGHTMODE === 'bloom') {
        bg = '#222222';
        fg = fg2 = '#cccccc';
    }

    // draw background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);

    ctx.strokeStyle = fg;

    let rateMax = 0.5;
    if (GRIDMODE === 'fine' && Math.random() < 0.5) {
        rateMax = 5;
    }

    // rate is the number of sin waves across the grid
    let xrate = randomInRange(0, rateMax);
    let yrate = randomInRange(0, rateMax);
    // set phase offset
    let xphase = randomInRange(-PI, PI);
    let yphase = randomInRange(-PI, PI);

    let _x,_y,len;
    let dotScale = randomInRange(5, 15);
    let weight = randomInRange(1, 3);

    ctx.lineWidth = weight;
    ctx.lineCap = 'round';

    // const used in normalizing transforms
    let maxLen = 2 * Math.sqrt(2);

    // it looks nice to extend lines beyond their cells. how much?
    let lineScale = randomInRange(0.75, count / 10)/maxLen; // long lines from count

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

    // main loop
    for (var i = 0 ; i < count ; i++) {
        for (var j = 0 ; j < vcount ; j++) {
            x = w * (i + 1/2);
            y = h * (j + 1/2);
            xnorm = x/cw;
            ynorm = y/ch;

            _x = (Math.sin(xnorm * PI * xrate + xphase) + Math.sin(ynorm * PI * xrate + xphase) );
            _y = (Math.sin(ynorm * PI * yrate + yphase) + Math.sin(xnorm * PI * yrate + yphase) );
            len = Math.sqrt(_x * _x + _y * _y);

            ctx.globalAlpha = 1;
            drawCircle(ctx, x, y, (maxLen-len) * w/dotScale, {fill: fg2});

            ctx.globalAlpha = opacityFunc(_x, _y);

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(
                x + w * _x * lineScale,
                y + h * _y * lineScale
            );
            ctx.stroke();
        }
    }

    ctx.globalAlpha = 1;

    // in bloom mode, we draw a big colorful gradient over the grayscale
    // background, using palette colors and nice blend modes
    if (LIGHTMODE === 'bloom') {
        ctx.globalCompositeOperation = 'color-dodge';

        // bloom with linear gradient
        ctx.fillStyle = getGradientFunction(opts.palette)(ctx, cw, ch);//getContrastColor();
        ctx.fillRect(0, 0, cw, ch);

        if (Math.random() < 0.5) {
            // bloom with spot lights
            let dodgeDot = (max = 1.5) => {
                let gx, gy, gr1, gr2;
                gx = randomInRange(0, cw);
                gy = randomInRange(0, ch);
                gr1 = randomInRange(0, 0.25);
                gr2 = randomInRange(gr1, max);

                let radial = ctx.createRadialGradient(
                    gx,
                    gy,
                    gr1 * SCALE,
                    gx,
                    gy,
                    gr2 * SCALE
                );
                radial.addColorStop(0, randItem(opts.palette));
                radial.addColorStop(1, '#000000');

                ctx.fillStyle = radial;
                ctx.fillRect(0, 0, cw, ch);
            }
            // try layering dots with varying coverage
            ctx.globalAlpha = randomInRange(0.4, 0.7);
            dodgeDot(1.5);
            ctx.globalAlpha = randomInRange(0.4, 0.7);
            dodgeDot(1.0);
            ctx.globalAlpha = randomInRange(0.7, 0.9);
            dodgeDot(0.5);
            ctx.globalAlpha = 1;
        }

        ctx.globalCompositeOperation = 'normal';
    }

    // add noise
    if (opts.addNoise) {
        if (opts.noiseInput) {
            // apply noise from supplied canvas
            noiseUtils.applyNoiseCanvas(el, opts.noiseInput);
        } else {
            // create noise pattern and apply
            noiseUtils.addNoiseFromPattern(el, opts.addNoise, w / 3);
        }
    }

    // if new canvas child was created, append it
    if (newEl) {
        container.appendChild(el);
    }
}


