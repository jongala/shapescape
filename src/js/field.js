import noiseUtils from './noiseutils';
import { randItem, randomInRange, resetTransform, rotateCanvas, getGradientFunction, getSolidColorFunction } from './utils';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';

const DEFAULTS = {
    container: 'body',
    palette: ['#f9f9f9', '#D9AC32', '#ED5045', '#1F3E9C', '#000142'],
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true
}

const PI = Math.PI;

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


    // color funcs
    let getSolidFill = getSolidColorFunction(opts.palette);

    // define grid
    let count = Math.round(randomInRange(25 , 50));
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

    let fg = getContrastColor();
    let fg2 = getContrastColor();


    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);

    ctx.strokeStyle = fg;

    let xrate = randomInRange(0,4);
    let yrate = randomInRange(0,4);

    let xphase = randomInRange(0,PI);
    let yphase = randomInRange(0,PI);

    let _x,_y,len;
    let dotScale = randomInRange(5,15);
    let weight = randomInRange(1,3);

    let maxLen = Math.sqrt(2 * Math.sin(PI/4));

    let lineScale = randomInRange(1,2);


    ctx.lineWidth = weight;

    const opacityTransforms = [
        (_x, _y) => Math.abs(_y/_x)/maxLen,
        (_x, _y) => (1 - Math.abs(_y/_x)/maxLen),
        (_x, _y) => Math.abs(_x/_y), // hides verticals
        (_x, _y) => Math.abs(_y/_x), // hides horizontals
        (_x, _y) => (_x / _y),
        (_x, _y) => (_y / _x),
        (_x, _y) => (_y - _x),
        (_x, _y) => (_x - _y)
    ]

    let opacityFunc = randItem(opacityTransforms);


    for (var i = 0 ; i < count ; i++) {
        for (var j = 0 ; j < vcount ; j++) {
            x = w * (i + 1/2);
            y = h * (j + 1/2);
            xnorm = x/cw;
            ynorm = y/ch;

            _x = (Math.sin(xnorm * PI * xrate + xphase) + Math.cos(xnorm * PI * xrate + xphase));
            _y = (Math.sin(ynorm * PI * yrate + yphase) + Math.cos(ynorm * PI * yrate + yphase));
            len = Math.sqrt(_x * _x + _y * _y);

            ctx.globalAlpha = 1;
            drawCircle(ctx, x, y, (2-len) * w/dotScale, {fill: fg2});

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


