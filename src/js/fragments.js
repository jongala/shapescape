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




export function fragments(options) {
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

    let randomFill = () => "#" + Math.random().toString(16).slice(2,8);

    function addShadow(ctx, w, h) {
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 3 * Math.min(w, h) / 400;
        ctx.shadowBlur = 10 * Math.min(w, h) / 400;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    }

    function removeShadow(ctx) {
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
    }


    let cols = Math.round(randomInRange(5, 9));
    let w = cw/cols;
    let h = w;
    let rows = Math.ceil(ch/h);
    let count = rows * cols;

    let pts = [];
    for (var i = 0; i < count ; i++) {
        pts.push([w * (i % rows), h * Math.floor(i / cols)]);
    }
    //console.log(pts);


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

    ctx.translate(w/2, h/2);

    ctx.beginPath();
    ctx.rect(0, 0, cw - w, ch - h);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.closePath();
    ctx.clip();

    // define triangles
    let frags = [];
    let fragcount = Math.round(randomInRange(10, 50));
    let p1, p2, p3;
    while (fragcount--) {
        p1 = Math.round(randomInRange(0, count-1));
        p2 = Math.round(randomInRange(p1, count-1));
        p3 = Math.round(randomInRange(p2, count-1));

        frags.push([p1, p2, p3]);
    }

    // draw each fragment
    function drawFragments(ctx, frags, opts) {
        frags.forEach((f) => {
            let [p1,p2,p3] = f;
            if (Math.random() > 0.5) {
                addShadow(ctx, cw, ch);
            } else {
                removeShadow(ctx);
            }

            ctx.fillStyle = randItem(opts.palette);
            ctx.beginPath();
            ctx.moveTo(...pts[p1]);
            ctx.lineTo(...pts[p2]);
            ctx.lineTo(...pts[p3]);
            ctx.closePath();
            ctx.fill();
        });
        removeShadow(ctx);
    }

    drawFragments(ctx, frags, opts);




    // draw grid
    for (let i = 0; i < rows; i++) {
        //renderer = getRandomRenderer();
        renderer = drawCircle;
        for (let j = 0; j < cols; j++) {
            // convenience vars
            x = w * j;
            y = h * i;
            xnorm = x/cw;
            ynorm = y/ch;

            renderer(ctx, x, y, ch/400, {fill: 'white'})
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


