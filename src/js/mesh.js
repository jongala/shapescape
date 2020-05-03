import noiseUtils from './noiseutils';
import palettes from './palettes';
import { randItem, randomInRange, resetTransform, rotateCanvas, getGradientFunction, getSolidColorFunction, shuffle } from './utils';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';

const DEFAULTS = {
    container: 'body',
    palette: palettes.de_stijl,
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
        el.width = cw;
        el.height = ch;
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

    // shared colors
    let fg; // hold on…
    let bg = getSolidFill(); // pick a bg

    // get palette of non-bg colors
    let contrastPalette = shuffle([].concat(opts.palette));
    contrastPalette.splice(contrastPalette.indexOf(bg), 1);
    let getContrastColor = getSolidColorFunction(contrastPalette);

    fg = getContrastColor(); // fg is another color


    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = randomInRange(1, 4) * SCALE/800;

    ctx.strokeStyle = fg;

    let R = randomInRange(2,5) * SCALE/800 ; // dot radius
    let r = R; // radius per node
    let dotFill = randItem([fg, fg, 'transparent']);
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
            return 1 + R/2 * pr;
        },
    ]);

    let pr; // radius from center

    // choose a connection mode, which determines frequency
    // of the connection types
    let connectionMode = randItem([
        () => {}, // normal/uniform
        () => {}, // normal/uniform
        () => {}, // normal/uniform
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
    ]);

    // Pick the item from @palette by converting the normalized @factor
    // to its nearest index
    let mapToPalette = (palette, factor) => {
        factor = factor % 1; // loop
        return palette[Math.round(factor * (palette.length -1))];
    }
    let loopPalette = (palette, index) => {
        return palette[index % palette.length];
    }

    // reference point is center by default
    let refPoint = [0.5, 0.5];
    if (Math.random() < 0.5) {
        // unless we randomize the refernce point!
        refPoint = [Math.random(), Math.random()];
    }

    // choose stroke color scheme
    let multiColorStrokes = (Math.random() < 0.25);

    // work through the points
    for (let i = 0; i < vcount; i++) {
        for (let j = 0; j < count; j++) {
            // convenience vars
            x = w * j + w/2;
            y = h * i + h/2;
            xnorm = x/cw;
            ynorm = y/ch;

            isConnected = 0;

            // get distance to reference point
            pr = Math.sqrt(Math.pow(xnorm - refPoint[0], 2) + Math.pow(ynorm - refPoint[1], 2));

            // set dot radius, and draw it
            r = rTransform();
            drawCircle(ctx, x, y, r, {fill: dotFill});

            // adjust connection weights, chosen above
            connectionMode();

            // start drawing connections
            ctx.globalCompositeOperation = 'destination-over';
            ctx.beginPath();
            if (i > 0 && Math.random() < drawUp) {
                if (multiColorStrokes) {
                    ctx.strokeStyle = loopPalette(contrastPalette, 0);
                }
                ctx.moveTo(x, y);
                ctx.lineTo(x, y - h);
                isConnected++;
            }
            if (j > 0 && Math.random() < drawLeft) {
                if (multiColorStrokes) {
                    ctx.strokeStyle = loopPalette(contrastPalette, 1);
                }
                ctx.moveTo(x, y);
                ctx.lineTo(x - w, y);
                isConnected++;
            }
            if (i > 0 && j < (count - 1) && Math.random() < drawDL) {
                if (multiColorStrokes) {
                    ctx.strokeStyle = loopPalette(contrastPalette, 2);
                }
                ctx.moveTo(x, y);
                ctx.lineTo(x + w, y - h);
                isConnected++;
            }
            if (i > 0 && j > 0 && Math.random() < drawDR) {
                if (multiColorStrokes) {
                    ctx.strokeStyle = loopPalette(contrastPalette, 3);
                }
                ctx.moveTo(x, y);
                ctx.lineTo(x - w, y - h);
                isConnected++;
            }
            ctx.stroke();
            ctx.closePath();
            ctx.globalCompositeOperation = 'normal';

            // occasionally add rings
            if (isConnected && Math.random() < drawRing) {
                ctx.lineWidth = ctx.lineWidth / 2;
                drawCircle(ctx, x, y, w/3, {fill: null, stroke: fg});
                ctx.lineWidth = ctx.lineWidth * 2;
                ctx.strokeStyle = fg;
            }
        }
    }

    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);
    ctx.globalCompositeOperation = 'normal';


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
