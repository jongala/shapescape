import noiseUtils from './noiseutils';
import palettes from './palettes';
import { randItem, randomInRange, resetTransform, rotateCanvas, getGradientFunction, getSolidColorFunction } from './utils';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';

const DEFAULTS = {
    container: 'body',
    palette: palettes.south_beach,
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true,

    style: 'auto', // one of modes
    layer: 'auto', // true | false | auto
    count: 0, // 0 for auto, or an integer
    weight: 0, // 0 for auto, or 1-10 for normalized weights
    contrast: true
}

const PI = Math.PI;

// Main function
export function truchet(options) {
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

    // define grid
    let count = Math.round(opts.count) || Math.round(randomInRange(4, 9));
    let w = Math.ceil(cw/count);
    let h = w;
    let vcount = Math.ceil(ch/h);

    // setup vars for each cell
    let x = 0;
    let y = 0;
    let xnorm = 0;
    let ynorm = 0;
    let renderer;

    let secondLayer;
    if (opts.layer === true || opts.layer === 'true') {
        secondLayer = true;
    }
    if (opts.layer === false || opts.layer === 'false') {
        secondLayer = false;
    }
    if (opts.layer === null || opts.layer === undefined || opts.layer == 'auto') {
        secondLayer = (Math.random() < 0.5);
    }

    // play with these random seeds
    let a,b,c;
    a = Math.random();
    b = Math.random();
    c = Math.random();

    // shared colors
    let fg; // hold on…
    let bg = getSolidFill(); // pick bg

    // get palette of non-bg colors
    let contrastPalette = [].concat(opts.palette);
    contrastPalette.splice(opts.palette.indexOf(bg), 1);
    let getContrastColor = getSolidColorFunction(contrastPalette);
    fg = getContrastColor(); // …now set fg in contrast to bg

    // mode settings
    // line weight
    let weight;
    if (opts.weight) {
        weight = w/30 * opts.weight;
    } else {
        weight = w/30 * randomInRange(1,10);
    }


    // component utils

    // draw a triangle at anchor corner
    function _triangle(anchor, fill) {
        let corners = [[0, 0], [w, 0], [w, h], [0, h]];
        let drawCorners = [];
        fill = fill || getSolidFill();
        if (anchor === undefined) anchor = Math.round(randomInRange(0,3));
        drawCorners = [].concat(corners);
        drawCorners.splice(anchor, 1);

        // draw a triangle with the remaining 3 points
        ctx.beginPath();
        ctx.moveTo(...drawCorners[0]);
        ctx.lineTo(...drawCorners[1]);
        ctx.lineTo(...drawCorners[2]);
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
    }

    // draw a circle at anchor corner
    function _circle(anchor, fill) {
        let corners = [[0, 0], [w, 0], [w, h], [0, h]];
        let drawCorners = [];
        fill = fill || getSolidFill();
        if (anchor === undefined) anchor = Math.round(randomInRange(0,3));

        drawCircle(ctx,
            corners[anchor][0],
            corners[anchor][1],
            w,
            {
                fill: fill
            }
        );
    }

    // fill cell
    // first arg is for parity with _triangle and _circle
    function _square(_, fill) {
        fill = fill || getSolidFill();
        ctx.rect(0,0, w, h);
        ctx.fillStyle = fill;
        ctx.closePath();
        ctx.fill();
    }


    // mode
    function circles (background) {
        background = background || bg;
        let px, py;
        for (let i = 0; i < vcount; i++) {
            for (let j = 0; j < count; j++) {
                // convenience vars
                x = w * j;
                y = h * i;
                xnorm = x/cw;
                ynorm = y/ch;

                // shift and clip
                ctx.translate(x, y);
                clipSquare(ctx, w, h, background);

                _circle();

                // unshift, unclip
                ctx.restore();
                resetTransform(ctx);
            }
        }
    }



    // mode
    function triangles (background) {
        background = background || bg;
        for (let i = 0; i < vcount; i++) {
            for (let j = 0; j < count; j++) {
                // convenience vars
                x = w * j;
                y = h * i;
                xnorm = x/cw;
                ynorm = y/ch;

                // shift and clip
                ctx.translate(x, y);
                clipSquare(ctx, w, h, background);

                _triangle();

                // unshift, unclip
                ctx.restore();
                resetTransform(ctx);
            }
        }
    }


    // mode
    function mixed (background) {
        background = background || bg;
        let px, py, seed;
        let styles = [
            ()=>{
                renderer = drawCircle;
                px = 0;
                py = 0;
            }
        ];

        for (let i = 0; i < vcount; i++) {
            for (let j = 0; j < count; j++) {
                // convenience vars
                x = w * j;
                y = h * i;
                xnorm = x/cw;
                ynorm = y/ch;

                // shift and clip
                ctx.translate(x, y);
                clipSquare(ctx, w, h, background);

                switch (Math.round(randomInRange(1, 12))){
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                        _circle();
                        break;
                    case 5:
                    case 6:
                    case 7:
                    case 8:
                        _square();
                        break;
                    case 9:
                    case 10:
                    case 11:
                    case 12:
                        _triangle();
                        break;
                }

                // unshift, unclip
                ctx.restore();
                resetTransform(ctx);
            }
        }
    }

    // gather our modes
    let modes = {
        circles,
        triangles,
        mixed
    };

    // do the loop with one of our modes
    if (opts.style && modes[opts.style]) {
        renderer = modes[opts.style]
    } else {
        renderer = modes[randItem(Object.keys(modes))];
    }
    renderer(bg, weight);

    if (secondLayer) {
        fg = getContrastColor();
        ctx.globalAlpha = 0.8;
        renderer('transparent', (opts.contrast)? weight/2:weight);
        ctx.globalAlpha = 1;
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


