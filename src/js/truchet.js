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

    mode: null,
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

    let secondLayer = (Math.random() < 0.5);

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

    // draw an arc around anchor corner
    function _arc(anchor, color) {
        let corners = [[0, 0], [w, 0], [w, h], [0, h]];
        if (anchor === undefined) anchor = Math.round(randomInRange(0,3));

        drawCircle(ctx,
            corners[anchor][0],
            corners[anchor][1],
            w/2,
            {
                stroke: color
            });
    }

    let numberDefs = {
        0: '891176',
        1: '410101',
        2: '898611',
        3: '717176',
        4: '551101',
        5: '117976',
        6: '891976',
        7: '118210',
        8: '898976',
        9: '897146'
    }

    function drawNumber(N, i, j, fill) {
        let def = numberDefs[N];

        // map serialized hex code to cell styles
        // defined inside drawNumber for ease of passing fills
        let toCell = {
            0: ()=>{},
            1: ()=>{_square(null, fill)},
            2: ()=>{_triangle(2, fill)},
            3: ()=>{_triangle(3, fill)},
            4: ()=>{_triangle(0, fill)},
            5: ()=>{_triangle(1, fill)},
            6: ()=>{_circle(0, fill)},
            7: ()=>{_circle(1, fill)},
            8: ()=>{_circle(2, fill)},
            9: ()=>{_circle(3, fill)},
            "a": ()=>{_square(null, fill)},
            "b": ()=>{_square(null, fill)},
            "c": ()=>{_square(null, fill)},
            "d": ()=>{_square(null, fill)},
            "e": ()=>{_square(null, fill)},
            "f": ()=>{_square(null, fill)}
        }


        ctx.translate(i * w, j * h);
        clipSquare(ctx, w, h, 'transparent');
        toCell[def[0]]();
        ctx.restore();

        ctx.translate(w,0);
        clipSquare(ctx, w, h, 'transparent');
        toCell[def[1]]();
        ctx.restore();

        ctx.translate(-w,h);
        clipSquare(ctx, w, h, 'transparent');
        toCell[def[2]]();
        ctx.restore();

        ctx.translate(w,0);
        clipSquare(ctx, w, h, 'transparent');
        toCell[def[3]]();
        ctx.restore();

        ctx.translate(-w,h);
        clipSquare(ctx, w, h, 'transparent');
        toCell[def[4]]();
        ctx.restore();

        ctx.translate(w,0);
        clipSquare(ctx, w, h, 'transparent');
        toCell[def[5]]();
        ctx.restore();

        resetTransform(ctx);
    }

    // draw arc terminals for anchor corner
    function _terminal(size, anchor, color) {
        let corners = [[w/2, 0], [w, h/2], [w/2, h], [0, h/2]];
        if (anchor === undefined) anchor = Math.round(randomInRange(0,3));
        let a = (anchor) % corners.length;
        let b = (anchor + 3) % corners.length;

        drawCircle(ctx,
            corners[a][0],
            corners[a][1],
            size,
            {
                fill: color
            });
        drawCircle(ctx,
            corners[b][0],
            corners[b][1],
            size,
            {
                fill: color
            });
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


    //mode
    function arcs(background, weight) {
        background = background || bg;
        ctx.lineWidth = weight;
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

                if (Math.random() < 0.5) {
                    _arc(0, fg);
                    _arc(2, fg);
                } else {
                    _arc(1, fg);
                    _arc(3, fg);
                }

                // unshift, unclip
                ctx.restore();
                resetTransform(ctx);
            }
        }
    }

    // mode
    function arcs2(background, weight) {
        background = background || bg;
        ctx.lineWidth = weight;

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

                switch (Math.round(randomInRange(1, 9))){
                    case 1:
                    case 2:
                        _arc(0,fg);
                        _arc(2,fg);
                        break;
                    case 3:
                    case 4:
                        _arc(1, fg);
                        _arc(3, fg);
                        break;
                    case 5:
                        _arc(0, fg);
                        _terminal(weight/2, 2, fg);
                        break;
                    case 6:
                        _arc(1, fg);
                        _terminal(weight/2, 3, fg);
                        break;
                    case 7:
                        _arc(2, fg);
                        _terminal(weight/2, 0, fg);
                        break;
                    case 8:
                        _arc(3, fg);
                        _terminal(weight/2, 1, fg);
                        break;
                    case 9:
                        _terminal(weight/2, 0, fg);
                        _terminal(weight/2, 2, fg);
                        break;
                }


                // unshift, unclip
                ctx.restore();
                resetTransform(ctx);
            }
        }
    }

    // gather our modes
    let modes = [circles, triangles, mixed, arcs, arcs2];

    // do the loop with one of our modes
    renderer = randItem(modes);
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

    drawNumber(0, 1, 1, 'white');
    drawNumber(1, 3, 1, 'white');
    drawNumber(2, 5, 1, 'white');
    drawNumber(3, 7, 1, 'white');

    drawNumber(4, 1, 4, 'white');
    drawNumber(5, 3, 4, 'white');
    drawNumber(6, 5, 4, 'white');
    drawNumber(7, 7, 4, 'white');

    drawNumber(8, 5, 7, 'white');
    drawNumber(9, 7, 7, 'white');


    // if new canvas child was created, append it
    if (newEl) {
        container.appendChild(el);
    }
}


