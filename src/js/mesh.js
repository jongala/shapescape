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
    let count = Math.round(randomInRange(3, 30));
    let w = cw/count;
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

    let R = randomInRange(2,5) * SCALE/800 ; // dot radius
    let r = R; // radius per node
    let dotFill = randItem([fg, fg, bg]);
    // probability thresholds to draw connections
    let drawUp = 0.25;
    let drawLeft = 0.25;
    let drawDL = 0.25;
    let drawDR = 0.25;
    let drawRing = 0.05;
    let isConnected = 0;

    let rTransform = randItem([
        () => R, // no scaling
        () => { // scale sin curve heavy center
            return 0.5 +
                (R * Math.sin(xnorm * Math.PI) +
                R * Math.sin(ynorm * Math.PI)) / 2;
        },
        () => { // scale away from center linearly
            return 1 + R/2 * Math.sqrt(Math.pow(xnorm - 0.5, 2) + Math.pow(ynorm - 0.5, 2));
        },
    ]);

    let pr; // radius from center

    let connectionModes = [
        () => {}, // normal
        () => {}, // normal
        () => {
            // sweep up: bias diagonals on the left/right edge.
            // bias verticals toward the middle
            drawUp = 0.5 * Math.sin(xnorm * Math.PI);
            drawLeft = 0.05;
            drawDL = 0.75 * xnorm;
            drawDR = 0.75 * (1 - xnorm);
        },
        () => {
            // sidways and diagonals
            drawUp = drawDR = 0;
            drawLeft = 0.3;
            drawDL = 0.2;
            drawRing = 0.1
        },
        () => {
            // vert and other diagonal
            drawLeft = drawDL = 0;
            drawUp = 0.3;
            drawDR = 0.2;
            drawRing = 0.2;
        }
    ];


    for (let i = 0; i < vcount; i++) {
        for (let j = 0; j < count; j++) {
            // convenience vars
            x = w * j + w/2;
            y = h * i + h/2;
            xnorm = x/cw;
            ynorm = y/ch;

            isConnected = 0;

            r = rTransform();
            drawCircle(ctx, x, y, r, {fill: dotFill});

            pr = Math.sqrt(Math.pow(xnorm - 0.5, 2) + Math.pow(ynorm - 0.5, 2));

            randItem(connectionModes)();
            //connectionModes[2]();


            ctx.beginPath();
            if (i > 0 && Math.random() < drawUp) {
                ctx.moveTo(x, y);
                ctx.lineTo(x, y - h);
                isConnected++;
            }
            if (j > 0 && Math.random() < drawLeft) {
                ctx.moveTo(x, y);
                ctx.lineTo(x - w, y);
                isConnected++;
            }
            if (i > 0 && j < (count - 1) && Math.random() < drawDL) {
                ctx.moveTo(x, y);
                ctx.lineTo(x + w, y - h);
                isConnected++;
            }
            if (i > 0 && j > 0 && Math.random() < drawDR) {
                ctx.moveTo(x, y);
                ctx.lineTo(x - w, y - h);
                isConnected++;
            }
            ctx.stroke();
            ctx.closePath();

            if (isConnected && Math.random() < drawRing) {
                ctx.lineWidth = ctx.lineWidth / 2;
                drawCircle(ctx, x, y, w/3, {fill: null, stroke: fg});
                ctx.lineWidth = ctx.lineWidth * 2;
                ctx.strokeStyle = fg;
            }
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
