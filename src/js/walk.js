import noiseUtils from './noiseutils';
import { randItem, randomInRange, resetTransform, rotateCanvas, getGradientFunction, getSolidColorFunction, shuffle } from './utils';
import { drawCircle, drawSquare } from './shapes';

const DEFAULTS = {
    container: 'body',
    palette: ['#f9f9f9', '#D9AC32', '#ED5045', '#1F3E9C', '#000142'], // de_stijl
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true
}

/*
 * Draw survival curves. Pick a bunch of walkers, step along
 * a grid. At each point, choose to go right or down.
 * Save the points according to type (down/right).
 * Decorate the line segments and the grid points.
 * Pick the rightmost and downmost points in each row/column, and
 * decorate those by extending lines to the edges.
 */
export function walk(options) {
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
    let count = Math.round(randomInRange(10, 30));
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

    let R = randomInRange(1,4) * SCALE/800 ; // dot radius
    let r = R; // radius per node
    let dotFill =fg;// randItem([fg, fg, 'transparent']);
    // probability thresholds to draw connections

    let modes = ['descend', 'survival'];
    let MODENAME = randItem(modes);

    let walkers = [];

    let walkerCount = Math.round(randomInRange(2,20));
    while (walkerCount--) {
        walkers.push({
            x: (MODENAME === 'survival') ? 0 : Math.round(randomInRange(0, count)),
            y: 0,
            dir: 1 // right or left
        })
    }

    // threshold to go right vs down
    let goH = 0.5;

    let pr; // radius from center

    // Pick the item from @palette by converting the normalized @factor
    // to its nearest index
    let mapToPalette = (palette, factor) => {
        factor = factor % 1; // loop
        return palette[Math.round(factor * (palette.length -1))];
    }

    // reference point is center by default
    let refPoint = [0.5, 0.5];
    if (Math.random() < 0.5) {
        // unless we randomize the refernce point!
        refPoint = [Math.random(), Math.random()];
    }

    // choose stroke color scheme
    let multiColorStrokes = (Math.random() < 0.25);

    // arrays to save the places where we chose right or down
    let rightDots = [];
    let downDots = [];
    let leftDots = [];

    // Walking function
    let survival = (walker, i) => {
        // For each walker, step till you hit the edges.
        // At each point, choose to go right or down.
        // Save the point into the appropriate dot array after choosing.
        // Draw the line segment.
        ctx.beginPath();
        ctx.moveTo(walker.x * w, walker.y * h);
        while (walker.x < count && walker.y < vcount) {
            if (Math.random() < goH) {
                walker.x += 1;
                rightDots.push([walker.x, walker.y]);
            } else {
                walker.y += 1;
                downDots.push([walker.x, walker.y])
            }
            ctx.lineTo(walker.x * w, walker.y * h);
        }
        ctx.stroke();
        ctx.closePath();
    }

    // Walking function
    let descend = (walker, i) => {
        // For each walker, step till you hit the edges.
        // At each point, choose to go right or down.
        // Save the point into the appropriate dot array after choosing.
        // Draw the line segment.
        ctx.beginPath();
        ctx.moveTo(walker.x * w, walker.y * h);
        while (walker.x < count && walker.y < vcount) {
            if (Math.random() < goH) {
                walker.x += 1 * walker.dir;
                if (walker.dir > 0) {
                    rightDots.push([walker.x, walker.y]);
                } else {
                    leftDots.push([walker.x, walker.y]);
                }
            } else {
                walker.y += 1;
                downDots.push([walker.x, walker.y])
                walker.dir *= -1;
            }
            ctx.lineTo(walker.x * w, walker.y * h);
        }
        ctx.stroke();
        ctx.closePath();
    }

    let rightColor = getContrastColor();
    let leftColor = getContrastColor();
    let downColor = getContrastColor();

    // pick a decoration scheme, each with a right and down decorator function
    let decoration = randItem([
            // dots
            {
                rightDeco: (d, i) => {
                    let [x, y] = [...d];
                    drawCircle(ctx, x * w - w/2, y * h - h/2, r, {fill: rightColor});
                },
                leftDeco: (d, i) => {
                    let [x, y] = [...d];
                    drawCircle(ctx, x * w + w/2, y * h - h/2, r, {fill: leftColor});
                },
                downDeco: (d, i) => {
                    let [x, y] = [...d];
                    drawCircle(ctx, x * w - w/2, y * h - h/2, r, {fill: downColor});
                }
            },
            // squares right, dots down. sized to fit inside each other
            {
                rightDeco: (d, i) => {
                    let [x, y] = [...d];
                    drawSquare(ctx, x * w - w/2, y * h - h/2, w/4, {fill: rightColor});
                },
                leftDeco: (d, i) => {
                    let [x, y] = [...d];
                    drawSquare(ctx, x * w + w/2, y * h - h/2, w/4, {fill: leftColor});
                },
                downDeco: (d, i) => {
                    let [x, y] = [...d];
                    drawCircle(ctx, x * w - w/2, y * h - h/2, w/6, {fill: downColor});
                }
            },
            // half-square triangles pointing right or down
            {
                rightDeco: (d, i) => {
                    let [x, y] = [...d];
                    ctx.beginPath();
                    ctx.moveTo(x * w - w * .25, y * h - h/2);
                    ctx.lineTo(x * w - w * .5, y * h - h * .25 - h/2);
                    ctx.lineTo(x * w - w * .5, y * h + h * .25 - h/2);
                    ctx.closePath();
                    ctx.fillStyle = rightColor;
                    ctx.fill();

                },
                leftDeco: (d, i) => {
                    let [x, y] = [...d];
                    ctx.beginPath();
                    ctx.moveTo(x * w + w * .25, y * h - h/2);
                    ctx.lineTo(x * w + w * .5, y * h - h * .25 - h/2);
                    ctx.lineTo(x * w + w * .5, y * h + h * .25 - h/2);
                    ctx.closePath();
                    ctx.fillStyle = leftColor;
                    ctx.fill();

                },
                downDeco: (d, i) => {
                    let [x, y] = [...d];
                    ctx.beginPath();
                    ctx.moveTo(x * w - w/2, y * h - h * .25);
                    ctx.lineTo(x * w - w * .25 - w/2, y * h - h * .5);
                    ctx.lineTo(x * w + w * .25 - w/2, y * h - h * .5);
                    ctx.closePath();
                    ctx.fillStyle = downColor;
                    ctx.fill();
                }
            }
        ]);

    // run the walkers to draw the main lines
    let walkFunc = (MODENAME === 'survival')? survival : descend;
    walkers.forEach(walkFunc);

    // execute the decoration functions on each junction dot
    rightDots.forEach(decoration.rightDeco);
    leftDots.forEach(decoration.leftDeco);
    downDots.forEach(decoration.downDeco);

    // will contain the rightmost and downmost dots in each row and column
    let rightMax = [];
    let downMax = [];

    // run through the points and assign the rightmost and downmost points
    [].concat(rightDots).concat(downDots).forEach((d) => {
        let [x, y] = [...d];
        if (!rightMax[y] || x > rightMax[y]) {
            rightMax[y] = x;
        }
        if (!downMax[x] || y > downMax[x]) {
            downMax[x] = y;
        }
    });

    // use a narrow line for the grid extensions
    ctx.lineWidth = Math.max(ctx.lineWidth/2, 1);

    // draw lines from rightmost and downmost dots to boundaries
    rightMax.forEach((d, i) => {
        ctx.beginPath();
        ctx.moveTo(d * w + w/2, i * h + h/2);
        ctx.lineTo(cw, i * h + h/2);
        ctx.strokeStyle = rightColor;
        ctx.stroke();
    });

    downMax.forEach((d, i) => {
        ctx.beginPath();
        ctx.moveTo(i * w + w/2, d * h + h/2);
        ctx.lineTo(i * w + w/2, ch);
        ctx.strokeStyle = downColor;
        ctx.stroke();
    });

    // composite in the background
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
