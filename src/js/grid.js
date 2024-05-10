import noiseUtils from './noiseutils';
import palettes from './palettes';
import { randItem, randomInRange, resetTransform, rotateCanvas, getGradientFunction, getSolidColorFunction } from './utils';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';

const DEFAULTS = {
    container: 'body',
    palette: palettes.south_beach,
    style: 'auto', // ['masked', 'layers']
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true
}

const PI = Math.PI;

// Main function
export function grid(options) {
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

    // available renderers
    let renderMap = {
        //circle: drawCircle,
        //ring: drawRing,
        triangle: drawTriangle,
        square: drawSquare,
        box: drawBox,
        rect: drawRect,
        pentagon: drawPentagon,
        hexagon: drawHexagon
    };
    let shapes = Object.keys(renderMap);
    let getRandomRenderer = () => {
        return renderMap[randItem(shapes)];
    }

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
    let count = Math.round(randomInRange(4, 9));
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
    let fg = getSolidFill();
    let bg = getSolidFill();

    // get palette of non-bg colors
    let contrastPalette = [].concat(opts.palette);
    contrastPalette.splice(opts.palette.indexOf(bg), 1);
    let getContrastColor = getSolidColorFunction(contrastPalette);

    // mode
    function maskAndRotate () {
        renderer = getRandomRenderer();
        let colorFunc;
        // pick a color mode: random, or just fg
        if (Math.random() < 0.33) {
            colorFunc = getContrastColor;
        } else {
            colorFunc = () => fg;
        }
        for (let i = 0; i < vcount; i++) {
            // pick renderers by row here
            // renderer = getRandomRenderer();
            for (let j = 0; j < count; j++) {
                // convenience vars
                x = w * j;
                y = h * i;
                xnorm = x/cw;
                ynorm = y/ch;

                // shift and clip
                ctx.translate(x, y);
                clipSquare(ctx, w, h, bg);

                // draw
                renderer(ctx,
                    w * a + xnorm * (1 - a), // start at a, march across
                    h * b + ynorm * (1 - b), // start at b, march down
                    w/(c + 1.5), // scale at c
                    {
                        fill: colorFunc(),
                        angle: ((xnorm - a) - (ynorm - b)) // rotate with position
                    }
                );

                // unshift, unclip
                ctx.restore();
                resetTransform(ctx);
            }
        }
    }

    // mode
    function layers(layerCount=7) {

        function drawLayer() {
            let px, py;
            let s;

            for (let i = 0; i < vcount; i++) {
                for (let j = 0; j < count; j++) {
                    // convenience vars
                    x = w * j;
                    y = h * i;
                    xnorm = x/cw;
                    ynorm = y/ch;

                    // shift and clip
                    ctx.translate(x, y);
                    clipSquare(ctx, w, h, 'white');

                    // size jitter
                    s = randomInRange(0.15, 0.45) * w;
                    // offset a bit, based on available size
                    px = randomInRange(-1, 1) * 0.2 * (1 - s);
                    py = randomInRange(-1, 1) * 0.2 * (1 - s);

                    // shift to center for rotation
                    ctx.translate(w/2, h/2);

                    // draw
                    drawSquare(ctx,
                        px,
                        py,
                        s,
                        {
                            fill: getSolidFill(),
                            angle: randomInRange(-1, 1) * 0.1
                        }
                    );

                    // unshift, unclip
                    ctx.restore();
                    resetTransform(ctx);
                }
            }
        }

        ctx.globalAlpha = Math.pow(0.9, layerCount);
        ctx.globalCompositeOperation = 'multiply';

        while (layerCount--){
            drawLayer();
        }

        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'normal';

    }

    // gather our modes
    let modes = [maskAndRotate, layers];

    // do the loop with one of our modes
    let STYLE = opts.style;
    if (!STYLE || STYLE == 'auto') {
        randItem(modes)();
    } else {
        if (STYLE === 'masked') {
            maskAndRotate();
        }
        if (STYLE === 'layers') {
            layers();
        }
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


