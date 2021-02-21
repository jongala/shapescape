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
    
    time: null
}

const PI = Math.PI;

// Main function
export function numerals(options) {
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

    // shared colors
    let fg; // hold on…
    let bg = getSolidFill(); // pick bg

    // get palette of non-bg colors
    let contrastPalette = [].concat(opts.palette);
    contrastPalette.splice(opts.palette.indexOf(bg), 1);
    let getContrastColor = getSolidColorFunction(contrastPalette);
    fg = getContrastColor(); // …now set fg in contrast to bg


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

    var now = new Date();

    var hours = now.getHours();
    if (hours > 12) hours = hours - 12;
    var minutes = now.getMinutes();
    var seconds = now.getSeconds();
    
    function padNum(n) {
        return (n < 10) ? "0" + n.toString() : n.toString();
    }

    hours = padNum(hours);
    minutes = padNum(minutes);
    seconds = padNum(seconds);

    console.log('hours:', hours);

    drawNumber(hours[0], 1, 1, 'white');
    drawNumber(hours[1], 3, 1, 'white');

    drawNumber(minutes[0], 5, 1, 'white');
    drawNumber(minutes[1], 7, 1, 'white');

    drawNumber(seconds[0], 9, 1, 'white');
    drawNumber(seconds[1], 11, 1, 'white');




    /*drawNumber(0, 1, 1, 'white');
    drawNumber(1, 3, 1, 'white');
    drawNumber(2, 5, 1, 'white');
    drawNumber(3, 7, 1, 'white');

    drawNumber(4, 1, 4, 'white');
    drawNumber(5, 3, 4, 'white');
    drawNumber(6, 5, 4, 'white');
    drawNumber(7, 7, 4, 'white');

    drawNumber(8, 5, 7, 'white');
    drawNumber(9, 7, 7, 'white');*/


    // if new canvas child was created, append it
    if (newEl) {
        container.appendChild(el);
    }
}


