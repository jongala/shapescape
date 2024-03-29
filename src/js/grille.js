import noiseUtils from './noiseutils';
import palettes from './palettes';
import { randItem, randomInRange, resetTransform, rotateCanvas, getGradientFunction, getSolidColorFunction } from './utils';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';

const DEFAULTS = {
    container: 'body',
    palette: palettes.blush,
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true,

    inset: 'auto', // or truthy/falsy
    mode: null,
    count: 0, // 0 for auto, or an integer
    weight: 0, // 0 for auto, or 1-10 for normalized weights
    contrast: true
}

const PI = Math.PI;

// Main function
export function grille(options) {
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
    let randomFill = () => "#" + Math.random().toString(16).slice(2,8);
    let getSolidFill = getSolidColorFunction(opts.palette);

    // define grid
    let count = Math.round(opts.count) || Math.round(randomInRange(4, 9));
    let w = Math.floor(cw/count);
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

    // mode settings
    // line weight
    let WEIGHT;
    if (opts.weight) {
        WEIGHT = 1 + w/250 * opts.weight;
    } else {
        WEIGHT = 1 + w/250 * randomInRange(1,10);
    }
    ctx.lineWidth = WEIGHT;

    // Spacing and zoom
    let INSET;
    if (opts.inset === 'auto') {
        INSET = (Math.random() <= 0.5);
    } else {
        INSET = !!opts.inset;
    }
    let ZOOM = INSET ? (1 - 3 * WEIGHT/w) : 1;

    // util to draw a square and clip following rendering inside
    function moveAndClip(ctx, x, y, size, color) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(ZOOM, ZOOM);
        ctx.beginPath();
        ctx.rect(-size/2 - 0.5, -size/2 - 0.5, size + 1, size + 1);
        ctx.fillStyle = color;
        ctx.closePath();
        ctx.fill();
        ctx.clip();
    }

    // convenience var for center-based boxes
    let d = h / 2;

    // box styles

    let modes = {};

    modes.diag = function() {
        ctx.beginPath();

        ctx.moveTo(-d, -d);
        ctx.lineTo(d, d);

        ctx.moveTo(-d * .5, -d);
        ctx.lineTo(-d, -d * .5);

        ctx.moveTo(0, -d);
        ctx.lineTo(-d, 0);

        ctx.moveTo(d * .5, -d);
        ctx.lineTo(-d, d * .5);

        ctx.moveTo(d, -d);
        ctx.lineTo(-d, d);

        ctx.moveTo(d, -d * .5);
        ctx.lineTo(-d * .5, d);

        ctx.moveTo(d, 0);
        ctx.lineTo(0, d);

        ctx.moveTo(d, d * .5);
        ctx.lineTo(d * .5, d);

        ctx.stroke();
    }

    modes.fan = function () {
        // straight or curved crosspiece?
        let straight = (Math.random() > 0.5);

        ctx.beginPath();

        ctx.moveTo(-d, -d);
        ctx.lineTo(-d, d);

        ctx.moveTo(-d, -d);
        ctx.lineTo(-d/2, d);

        ctx.moveTo(-d, -d);
        ctx.lineTo(0, d);

        ctx.moveTo(-d, -d);
        ctx.lineTo(d/2, d);

        ctx.moveTo(-d, -d);
        ctx.lineTo(d, d);

        //

        ctx.moveTo(-d, -d);
        ctx.lineTo(d, -d);

        ctx.moveTo(-d, -d);
        ctx.lineTo(d, -d/2);

        ctx.moveTo(-d, -d);
        ctx.lineTo(d, 0);

        ctx.moveTo(-d, -d);
        ctx.lineTo(d, d/2);


        if (straight) {
            ctx.moveTo(d, -d);
            ctx.lineTo(-d, d);
        }

        ctx.stroke();

        if (!straight) {
            drawCircle(ctx, -d, -d, d * 3/2, {fill: 'transparent', stroke: fg});
        }

        drawCircle(ctx, -d, -d, d/2, {fill: bg, stroke: fg});
    }

    modes.cross = function () {
        ctx.beginPath();

        ctx.moveTo(-d, -d);
        ctx.lineTo(d, d);

        ctx.moveTo(-d/2, -d);
        ctx.lineTo(d/2, d);

        ctx.moveTo(0, -d);
        ctx.lineTo(0, d);

        ctx.moveTo(d/2, -d);
        ctx.lineTo(-d/2, d);

        ctx.moveTo(d, -d);
        ctx.lineTo(-d, d);

        ctx.stroke();

        drawCircle(ctx, 0, 0, d/4, {fill: bg, stroke: fg});
    }

    modes.sun = function() {
        ctx.beginPath();

        ctx.moveTo(-d, -d);
        ctx.lineTo(d, d);

        ctx.moveTo(-d/2, -d);
        ctx.lineTo(d/2, d);

        ctx.moveTo(0, -d);
        ctx.lineTo(0, d);

        ctx.moveTo(d/2, -d);
        ctx.lineTo(-d/2, d);

        ctx.moveTo(d, -d);
        ctx.lineTo(-d, d);

        //

        ctx.moveTo(-d, -d/2);
        ctx.lineTo(d, d/2);

        ctx.moveTo(-d, 0);
        ctx.lineTo(d, 0);

        ctx.moveTo(-d, d/2);
        ctx.lineTo(d, -d/2);

        ctx.stroke();

        drawCircle(ctx, 0, 0, d/5, {fill: bg, stroke: fg});
    }

    modes.offset = function() {
        ctx.beginPath();

        let pts = [
            [-d, -d],
            [-d/2, -d],
            [0, -d],
            [d/2, -d],
            //[d, -d],
            [d, -d/2],
            [d, 0],
            [d, d/2],
            //[d, d],
            [d/2, d],
            [0, d],
            [-d/2, d],
            //[-d, d],
            [-d, d/2],
            [-d, 0],
            [-d, -d/2]
        ]

        let center = [-d/3, -d/3];

        pts.forEach((p)=>{
            ctx.moveTo(...center);
            ctx.lineTo(...p);
        });

        ctx.stroke();

        drawCircle(ctx, -d*1.9, -d*1.9, h * 1.5, {fill: null, stroke: fg});
        drawCircle(ctx, ...center, d/4, {fill: bg, stroke: fg});
    }

    modes.bars = function () {
        ctx.beginPath();

        ctx.moveTo(-d, -d);
        ctx.lineTo(-d, d);

        ctx.moveTo(-d/2, -d);
        ctx.lineTo(-d/2, d);

        ctx.moveTo(-0, -d);
        ctx.lineTo(-0, d);

        ctx.moveTo(d/2, -d);
        ctx.lineTo(d/2, d);

        ctx.moveTo(d, -d);
        ctx.lineTo(d, d);

        ctx.moveTo(-d, 0);
        ctx.lineTo(d, 0);

        ctx.stroke();

        drawCircle(ctx, -d * .75, 0, d/4, {fill: 'transparent', stroke: fg});
        drawCircle(ctx, 0, 0, d/2, {fill: 'transparent', stroke: fg});
        drawCircle(ctx, d * .75, 0, d/4, {fill: 'transparent', stroke: fg});
    }

    modes.notes = function () {
        ctx.beginPath();

        ctx.moveTo(-d, -d);
        ctx.lineTo(-d, d);

        ctx.moveTo(-d/2, -d);
        ctx.lineTo(-d/2, d);

        ctx.moveTo(-0, -d);
        ctx.lineTo(-0, d);

        ctx.moveTo(d/2, -d);
        ctx.lineTo(d/2, d);

        ctx.moveTo(d, -d);
        ctx.lineTo(d, d);

        ctx.stroke();

        drawCircle(ctx, -d * .75, -d * .75, d/4, {fill: 'transparent', stroke: fg});
        drawCircle(ctx, -d * .25, -d * .25, d/4, {fill: 'transparent', stroke: fg});
        drawCircle(ctx, d * .25, d * .25, d/4, {fill: 'transparent', stroke: fg});
        drawCircle(ctx, d * .75, d * .75, d/4, {fill: 'transparent', stroke: fg});
    }

    modes.circleSet = function () {
        ctx.beginPath();

        ctx.moveTo(-d * .5, -d);
        ctx.lineTo(-d * .5, d);

        ctx.moveTo(0, -d);
        ctx.lineTo(0, d);

        ctx.moveTo(d * .5, -d);
        ctx.lineTo(d * .5, d);


        ctx.moveTo(-d, -d * .5);
        ctx.lineTo(d, -d * .5);

        ctx.moveTo(-d, 0);
        ctx.lineTo(d, 0);

        ctx.moveTo(-d, d * .5);
        ctx.lineTo(d, d * .5);

        ctx.stroke();

        let r = d/5;

        drawCircle(ctx, d * -.5, -d * .5, r, {fill:bg, stroke:fg});
        drawCircle(ctx, d * 0, -d * .5,   r, {fill:bg, stroke:fg});
        drawCircle(ctx, d * .5, -d * .5,  r, {fill:bg, stroke:fg});

        drawCircle(ctx, d * -.5, 0, r, {fill:bg, stroke:fg});
        drawCircle(ctx, d * 0, 0,   r, {fill:bg, stroke:fg});
        drawCircle(ctx, d * .5, 0,  r, {fill:bg, stroke:fg});

        drawCircle(ctx, d * -.5, d * .5, r, {fill:bg, stroke:fg});
        drawCircle(ctx, d * 0, d * .5,   r, {fill:bg, stroke:fg});
        drawCircle(ctx, d * .5, d * .5,  r, {fill:bg, stroke:fg});
    }

    modes.standUps = function () {
        ctx.beginPath();

        let ringEdge = -d * .3;

        ctx.moveTo(-d * .5, -d);
        ctx.lineTo(-d * .5, -d * .5);

        ctx.moveTo(0, -d);
        ctx.lineTo(0, -d * .5);

        ctx.moveTo(d * .5, -d);
        ctx.lineTo(d * .5, -d * .5);

        ctx.moveTo(-d, -d * .5);
        ctx.lineTo(d, -d * .5);

        if (Math.random() < 0.5) {
            // criss cross

            ctx.moveTo(-d, d);
            ctx.lineTo(-d * .5, ringEdge);
            ctx.lineTo(0, d);
            ctx.lineTo(d * .5, ringEdge);
            ctx.lineTo(d, d);

            ctx.moveTo(-d, ringEdge);
            ctx.lineTo(-d * .5, d);
            ctx.lineTo(0, ringEdge);
            ctx.lineTo(d * .5, d);
            ctx.lineTo(d, ringEdge);
        } else {
            // zig zag

            ctx.moveTo(-d, ringEdge);
            ctx.lineTo(-d * .75, d);
            ctx.lineTo(-d * .5, ringEdge);
            ctx.lineTo(-d * .25, d);
            ctx.lineTo(0, ringEdge);
            ctx.lineTo(d * .25, d);
            ctx.lineTo(d * .5, ringEdge);
            ctx.lineTo(d * .75, d);
            ctx.lineTo(d, ringEdge);
        }

        ctx.stroke();

        // rings
        drawCircle(ctx, -d, -d * .5, d/5, {fill: bg, stroke: fg});
        drawCircle(ctx, -d * .5, -d * .5, d/5, {fill: bg, stroke: fg});
        drawCircle(ctx, 0, -d * .5, d/5, {fill: bg, stroke: fg});
        drawCircle(ctx, d * .5, -d * .5, d/5, {fill: bg, stroke: fg});
        drawCircle(ctx, d, -d * .5, d/5, {fill: bg, stroke: fg});
    }

    modes.squares = function () {

        drawSquare(ctx, 0, 0, d, {fill: 'transparent', stroke: fg});
        drawSquare(ctx, 0, 0, d / (4/3), {fill: 'transparent', stroke: fg});
        drawSquare(ctx, 0, 0, d / 2, {fill: 'transparent', stroke: fg});
        drawSquare(ctx, 0, 0, d / 4, {fill: 'transparent', stroke: fg});

        ctx.rotate(PI/4);

        let diag = d * 0.7071;

        drawSquare(ctx, 0, 0, diag * 1.5, {fill: 'transparent', stroke: fg});
        drawSquare(ctx, 0, 0, diag / 1, {fill: 'transparent', stroke: fg});
        drawSquare(ctx, 0, 0, diag / 2, {fill: 'transparent', stroke: fg});
    }

    modes.arcs = function () {

        drawCircle(ctx, -d, -d, h / 1, {fill: 'transparent', stroke: fg});
        drawCircle(ctx, -d, -d, h / 2, {fill: 'transparent', stroke: fg});
        drawCircle(ctx, -d, -d, h / (4/3), {fill: 'transparent', stroke: fg});
        drawCircle(ctx, -d, -d, h / 4, {fill: 'transparent', stroke: fg});

        ctx.beginPath();
        ctx.moveTo(-d, -d);
        ctx.lineTo(d, d);
        ctx.stroke();
    }

    modes.arcSide = function () {

        drawCircle(ctx, 0, -d, d/2, {fill: null, stroke:fg});
        drawCircle(ctx, 0, -d, d/1, {fill: null, stroke:fg});

        drawCircle(ctx, 0, d, d/2, {fill: null, stroke:fg});
        drawCircle(ctx, 0, d, d/1, {fill: null, stroke:fg});

        drawCircle(ctx, 0, 0, d/2, {fill: null, stroke:fg});
        drawCircle(ctx, 0, 0, d/1, {fill: null, stroke:fg});

        ctx.beginPath();
        ctx.moveTo(0, -d);
        ctx.lineTo(0, d);
        ctx.stroke();
    }

    modes.arcCorners = function () {
        drawCircle(ctx, -d, -d, h / 1, {fill: 'transparent', stroke: fg});
        drawCircle(ctx, -d, -d, h / 2, {fill: 'transparent', stroke: fg});
        drawCircle(ctx, -d, -d, h / (4/3), {fill: 'transparent', stroke: fg});
        drawCircle(ctx, -d, -d, h / 4, {fill: 'transparent', stroke: fg});

        drawCircle(ctx, d, d, h / 1, {fill: 'transparent', stroke: fg});
        drawCircle(ctx, d, d, h / 2, {fill: 'transparent', stroke: fg});
        drawCircle(ctx, d, d, h / (4/3), {fill: 'transparent', stroke: fg});
        drawCircle(ctx, d, d, h / 4, {fill: 'transparent', stroke: fg});
    }

    modes.flower = function() {
        drawCircle(ctx, 0, -d, d/1, {fill: null, stroke:fg});
        drawCircle(ctx, 0, d, d/1, {fill: null, stroke:fg});
        drawCircle(ctx, -d, 0, d/1, {fill: null, stroke:fg});
        drawCircle(ctx, d, 0, d/1, {fill: null, stroke:fg});

        drawCircle(ctx, 0, 0, d/4, {fill: bg, stroke:fg});
    }

    modes.herringbone = function() {
        function up(y) {
            ctx.moveTo(-d, -d + y);
            ctx.lineTo(0, -d + y - d);
        }

        function down(y) {
            ctx.moveTo(d, -d + y);
            ctx.lineTo(0, -d + y - d);
        }

        ctx.beginPath();

        for (var i = 0; i <= 6; i++) {
            up(i * d/2);
            down(i * d/2);
        }

        ctx.moveTo(0, -d);
        ctx.lineTo(0, d);

        ctx.stroke();
    }


    // TESTING
    //opts.mode = 'diag';


    // mode
    function main (background, double) {
        background = background || bg;
        ctx.strokeStyle = fg;
        let px, py;
        ctx.fillStyle = background;
        ctx.rect(0, 0, cw, ch);
        ctx.fill();
        for (let i = 0; i < vcount; i++) {
            for (let j = 0; j < count; j++) {
                // convenience vars
                x = w * j;
                y = h * i;
                xnorm = x/cw;
                ynorm = y/ch;
                // center point
                px = x + w / 2;
                py = y + h / 2;

                // shift and clip at center point
                moveAndClip(ctx, px, py, h, background);
                // randomly rotate by 90 degree increment
                ctx.rotate(randItem([0, PI/2, PI, PI * 3/2]));

                // do art in this box
                if (opts.mode && modes[opts.mode]) {
                    modes[opts.mode]();
                } else {
                    modes[randItem(Object.keys(modes))]();
                }

                // unshift, unclip
                ctx.restore();
                resetTransform(ctx);

                // draw border box after unclipping, to avoid aliasing
                drawSquare(ctx, px, py, h/2 * ZOOM, {fill: null, stroke: fg});
            }
        }
    }

    main(bg);

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


