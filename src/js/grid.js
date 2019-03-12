import noiseUtils from './noiseutils';
import { randItem, randomInRange, setAttrs, resetTransform, rotateCanvas, getGradientFunction, getSolidColorFunction } from './utils';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';

const DEFAULTS = {
    container: 'body',
    palette: ['#d7d7d7', '#979797', '#cabd9d', '#e4ca49', '#89bed3', '#11758e'],
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true
}

// actually draw a grid between points p1 and p2 with the passed options
function drawGrid(ctx, p1, p2, count = 2, recurse, mode, opts) {
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

    // area stuff
    let gw = p2[0] - p1[0]; // grid width
    let gh = p2[1] - p1[1]; // grid height

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


    // color funcs
    let randomFill = () => "#" + Math.random().toString(16).slice(2,8);
    let getSolidFill = getSolidColorFunction(opts.palette);


    // define grid
    let w = Math.ceil(gw/count);
    let h = w;
    let vcount = Math.ceil(gh/h);

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
                xnorm = x/gw;
                ynorm = y/gh;

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
    function circles () {
        let px, py;
        for (let i = 0; i < vcount; i++) {
            for (let j = 0; j < count; j++) {
                // convenience vars
                x = w * j;
                y = h * i;
                xnorm = x/gw;
                ynorm = y/gh;

                // shift and clip
                ctx.translate(x, y);
                clipSquare(ctx, w, h, bg);

                switch (Math.round(randomInRange(1, 5))){
                    case 1:
                        renderer = drawSquare;
                        px = 0;
                        py = 0;
                        break;
                    case 2:
                        renderer = drawCircle;
                        px = 0;
                        py = 0;
                        break;
                    case 3:
                        renderer = drawCircle;
                        px = w;
                        py = 0;
                        break;
                    case 4:
                        renderer = drawCircle;
                        px = w;
                        py = h;
                        break;
                    case 5:
                        renderer = drawCircle;
                        px = 0;
                        py = h;
                        break;
                }

                // draw
                renderer(ctx,
                    px,
                    py,
                    w,
                    {
                        fill: getSolidFill()
                    }
                );

                // unshift, unclip
                ctx.restore();
                resetTransform(ctx);
            }
        }
    }

    // draw a triangle in a random corner
    function _triangle() {
        let corners = [[0, 0], [w, 0], [w, h], [0, h]];
        let drawCorners = [];
        let skip;
        skip = Math.round(randomInRange(0,3));
        drawCorners = [].concat(corners);
        drawCorners.splice(skip, 1);

        // draw a triangle with the remaining 3 points
        ctx.beginPath();
        ctx.moveTo(...drawCorners[0]);
        ctx.lineTo(...drawCorners[1]);
        ctx.lineTo(...drawCorners[2]);
        ctx.closePath();
        ctx.fillStyle = getSolidFill();
        ctx.fill();
    }

    // mode
    function triangles () {
        for (let i = 0; i < vcount; i++) {
            for (let j = 0; j < count; j++) {
                // convenience vars
                x = w * j;
                y = h * i;
                xnorm = x/gw;
                ynorm = y/gh;

                // shift and clip
                ctx.translate(x, y);
                clipSquare(ctx, w, h, bg);

                _triangle();

                // unshift, unclip
                ctx.restore();
                resetTransform(ctx);
            }
        }
    }

    // mode
    function mixed () {
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
                xnorm = x/gw;
                ynorm = y/gh;

                // shift and clip
                ctx.translate(x, y);
                clipSquare(ctx, w, h, bg);

                switch (Math.round(randomInRange(1, 12))){
                    case 1:
                        renderer = drawCircle;
                        px = 0;
                        py = 0;
                        break;
                    case 2:
                        renderer = drawCircle;
                        px = w;
                        py = 0;
                        break;
                    case 3:
                        renderer = drawCircle;
                        px = w;
                        py = h;
                        break;
                    case 4:
                        renderer = drawCircle;
                        px = 0;
                        py = h;
                        break;
                    case 5:
                    case 6:
                    case 7:
                    case 8:
                        renderer = drawSquare;
                        px = 0;
                        py = 0;
                        break;
                    case 9:
                    case 10:
                    case 11:
                    case 12:
                        _triangle();
                        renderer = ()=>{}
                        break;
                }

                // draw
                renderer(ctx,
                    px,
                    py,
                    w,
                    {
                        fill: getSolidFill()
                    }
                );

                // unshift, unclip
                ctx.restore();
                resetTransform(ctx);
            }
        }
    }

    // gather our modes
    let modes = [maskAndRotate, circles, triangles, mixed];

    // do the loop with one of our modes
    randItem(modes)();
}

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
        setAttrs(el, {
            width: cw,
            height: ch
        });
    }

    let ctx = el.getContext('2d');


    drawGrid(ctx, [0, 0], [cw, ch], Math.round(randomInRange(4, 9)), false, null, opts);

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


