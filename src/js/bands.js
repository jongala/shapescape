import noiseUtils from './noiseutils';
import { randItem, randomInRange, resetTransform, rotateCanvas, getGradientFunction, getSolidColorFunction } from './utils';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';
import { defineFill, expandFill } from './colors';

const DEFAULTS = {
    container: 'body',
    palette: ['#f4dda8','#eda87c','#c8907e','#9cacc3','#485e80','#3b465b'],
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true
}

const PI = Math.PI;

// Main function
export function bands(options) {
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

    // util to draw a square and clip following rendering inside
    function clipSquare(ctx, w, h, color) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(0,0, w, h);
        ctx.fillStyle = color;
        ctx.closePath();
        ctx.fill();
        ctx.clip();
    }

    // color funcs
    let randomFill = () => "#" + Math.random().toString(16).slice(2,8);
    let getSolidFill = getSolidColorFunction(opts.palette);


    // shared colors
    let bg = getSolidFill();

    // get palette of non-bg colors
    let contrastPalette = [].concat(opts.palette);
    contrastPalette.splice(opts.palette.indexOf(bg), 1);
    let getContrastColor = getSolidColorFunction(contrastPalette);
    let fg = getContrastColor();

    // draw

    let count = 70;
    let baseStep = cw/count;
    let step = 0;

    let _x = 0;
    let jitter = 0.4;


    ctx.strokeStyle = 'black';

    let _h;
    let _y;
    let _w;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, cw, ch);




    // bands
    for (var i = 0 ; i <= count ; i++ ) {
        step = baseStep * randomInRange(1 - jitter, 1 + jitter);
        _x += step;

        if (Math.random() < 0.1) {
            ctx.fillStyle = '#e7e7e7';
            ctx.fillRect(_x, 0, step * randItem([1,2,3,4]), ch);
        }


        _w = step * randomInRange(0.8, 1);
        _h = ch * randomInRange(0.2, 0.7);
        _y = randomInRange(0, ch);

        ctx.beginPath();
        ctx.fillStyle = getSolidFill();
        ctx.fillRect(_x - _w, _y - _h/2, _w, _h);

        ctx.lineWidth = randomInRange(0.25, 2);
        ctx.beginPath();
        ctx.moveTo(_x, 0);
        ctx.lineTo(_x, ch);
        ctx.stroke();
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


