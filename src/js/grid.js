import noiseUtils from './noiseutils';
import { randItem, randomInRange, setAttrs, resetTransform, rotateCanvas, getGradientFunction, getSolidColorFunction } from './utils';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';

const DEFAULTS = {
    container: 'body',
    palette: ['#d7d7d7', '#979797', '#cabd9d', '#e4ca49', '#89bed3', '#11758e'],
    addNoise: false,//0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true
}




export function grid(options) {
    let opts = Object.assign({}, DEFAULTS, options);

    var container = opts.container;
    var cw = container.offsetWidth;
    var ch = container.offsetHeight;

    // Find or create canvas child
    var el = container.querySelector('canvas');
    var newEl = false;
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

    var ctx; // canvas ctx or svg tag

    ctx = el.getContext('2d');



    var renderMap = {
        circle: drawCircle,
        ring: drawRing,
        triangle: drawTriangle,
        square: drawSquare,
        box: drawBox,
        rect: drawRect,
        pentagon: drawPentagon,
        hexagon: drawHexagon
    };
    var shapes = Object.keys(renderMap);
    let getRandomRenderer = () => {
        return renderMap[randItem(shapes)];
    }



    ctx.strokeStyle = "white";


    function clipSquare(ctx, w, h, color) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(0,0, w, h);
        ctx.fillStyle = color;
        ctx.closePath();
        ctx.fill();
        ctx.clip();
    }


    let count = Math.round(randomInRange(5, 9));
    let w = cw/count;
    let h = w;
    let vcount = Math.ceil(ch/h);

    let randomFill = () => "#" + Math.random().toString(16).slice(2,8);

    let x = 0;
    let y = 0;
    let xnorm = 0;
    let ynorm = 0;
    let renderer;

    // play with these
    let a,b,c;
    a = Math.random();
    b = Math.random();
    c = Math.random();

    let getSolidFill = getSolidColorFunction(opts.palette);

    let fg = getSolidFill();
    let bg = getSolidFill();

    for (let i = 0; i < vcount; i++) {
        renderer = getRandomRenderer();
        //renderer = drawSquare;
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
                w * a,
                h * b,//h * ynorm,
                w/1.441,//w/2 + w/6 * xnorm + h/6 * ynorm,
                {
                    fill: fg,//randItem(opts.palette),
                    angle: xnorm + ynorm
                }
            );

            // unshift, unclip
            ctx.restore();
            resetTransform(ctx);
        }
    }



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


