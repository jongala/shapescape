import noiseUtils from './noiseutils';
import { randItem, randomInRange, setAttrs, resetTransform, rotateCanvas, getGradientFunction, getSolidColorFunction, shuffle } from './utils';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';

const DEFAULTS = {
    container: 'body',
    palette: ['#3C2E42', '#B4254B', '#FF804A', '#E8D1A1', '#A5C9C4'],
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true
}

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
        setAttrs(el, {
            width: cw,
            height: ch
        });
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

    let walkers = [];

    let walkerCount = Math.round(randomInRange(2,20));
    while (walkerCount--) {
        walkers.push({
            x: 0,
            y: 0
        })
    }

    let goLeft = 0.5;
    let goRight = 0.5;
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

    let doWalk = (walker, i) => {
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

    // draw dots for all the grid
    /*for (let i = 0; i < vcount; i++) {
        for (let j = 0; j < count; j++) {
            // convenience vars
            x = w * j + w/2;
            y = h * i + h/2;
            xnorm = x/cw;
            ynorm = y/ch;
            // get distance to reference point
            pr = Math.sqrt(Math.pow(xnorm - refPoint[0], 2) + Math.pow(ynorm - refPoint[1], 2));

            // set dot radius, and draw it
            drawCircle(ctx, x, y, r, {fill: dotFill});
        }
    }*/

    let rightColor = getContrastColor();
    let downColor = getContrastColor();

    // pick a decoration scheme, each with a right and down decorator function
    let decoration = randItem([
            {
                rightDeco: (d, i) => {
                    let [x, y] = [...d];
                    drawCircle(ctx, x * w - w/2, y * h - h/2, r, {fill: rightColor});
                },
                downDeco: (d, i) => {
                    let [x, y] = [...d];
                    drawCircle(ctx, x * w - w/2, y * h - h/2, r, {fill: downColor});
                }
            },
            {
                rightDeco: (d, i) => {
                    let [x, y] = [...d];
                    drawSquare(ctx, x * w - w/2, y * h - h/2, w/4, {fill: rightColor});
                },
                downDeco: (d, i) => {
                    let [x, y] = [...d];
                    drawCircle(ctx, x * w - w/2, y * h - h/2, w/6, {fill: downColor});
                }
            },
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
    walkers.forEach(doWalk);

    // execute the decoration functions on each junction dot
    rightDots.forEach(decoration.rightDeco);
    downDots.forEach(decoration.downDeco);

    let rightMax = [];
    rightDots.forEach((d) => {
        let [x, y] = [...d];
        if (!rightMax[y] || x > rightMax[y]) {
            rightMax[y] = x;
        }
    });
    let downMax = [];
    downDots.forEach((d) => {
        let [x, y] = [...d];
        if (!downMax[x] || y > downMax[x]) {
            downMax[x] = y;
        }
    });

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
