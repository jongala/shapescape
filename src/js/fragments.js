import noiseUtils from './noiseutils';
import { randItem, randomInRange, setAttrs, resetTransform, rotateCanvas, getGradientFunction, getSolidColorFunction } from './utils';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';

const DEFAULTS = {
    container: 'body',
    palette: ['#F8ADAA', '#F8E3AC', '#111111', '#ffffff', '#94552C'],
    addNoise: false,//0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true
}

function getFragmentsFromGrid(count=10, pts) {
    let frags = [];
    let p1, p2, p3;
    while (count--) {
        p1 = Math.round(randomInRange(0, pts.length-1));
        p2 = Math.round(randomInRange(p1, pts.length-1));
        p3 = Math.round(randomInRange(p2, pts.length-1));

        frags.push([pts[p1], pts[p2], pts[p3]]);
    }
    return frags;
}

function getFragmentsFromCanvas(count=10, cw, ch) {
    let frags = [];
    let getPoint = (r) => {
        let a = randomInRange(0, 2 * Math.PI);
        return [r * Math.sin(a) + cw/2, r * Math.cos(a) + ch/2]
    }
    let r = 0;
    let scale = Math.min(cw, ch);
    while (count--) {
        r = randomInRange(scale * 0.5, scale * 1.5);
        frags.push([
            getPoint(r),
            getPoint(r),
            getPoint(r)
        ]);
    }
    return frags;
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
    rows++;
    cols++;
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
    let getGradientFill = getGradientFunction(opts.palette);

    let fg = getSolidFill();
    let bg = getGradientFill(ctx, cw, ch);

    // paint the background
    ctx.beginPath();
    ctx.rect(0, 0, cw, ch);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.closePath();

    // define triangles
    //let frags = getFragmentsFromGrid(Math.round(randomInRange(5, 15)), pts);
    let frags = getFragmentsFromCanvas(Math.round(randomInRange(5, 10)), cw, ch);

    // util: draw each fragment
    function drawFragments(ctx, frags, opts) {
        frags.forEach((f) => {
            // skip some fragments
            if (Math.random() > 0.75) {
                return;
            }

            // add shadows, sometimes
            if (Math.random() > 0.5) {
                addShadow(ctx, cw, ch);
            } else {
                removeShadow(ctx);
            }

            let [p1,p2,p3] = f;

            ctx.fillStyle = getGradientFill(ctx, cw, ch);
            ctx.beginPath();
            ctx.moveTo(...p1);
            ctx.lineTo(...p2);
            ctx.lineTo(...p3);
            ctx.closePath();
            ctx.fill();
        });
        removeShadow(ctx);
    }
    
    // define masks
    let masks = [];
    let maskcount = Math.round(randomInRange(3, 5));
    masks.push([
        [0, 0],
        [cw, 0],
        [cw, ch],
        [0, ch]
    ]);
    while (maskcount--) {
        masks.push([
            [0, 0],
            [cw, 0],
            [cw, randomInRange(0, ch)],
            [0, randomInRange(0, ch)]
            //[cw, randomInRange(ch * .1 / maskcount, ch * .9 / maskcount)],
            //[0, randomInRange(ch * .1 / maskcount, ch * .9 / maskcount)]
        ]);
    }

    // For each mask, draw the path, clip into it, and draw fragments inside
    addShadow(ctx, cw, ch);
    masks.forEach((m) => {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(...m[0]);
        ctx.lineTo(...m[1]);
        ctx.lineTo(...m[2]);
        ctx.lineTo(...m[3]);
        ctx.closePath();
        ctx.fillStyle = 'black';
        //ctx.fill();
        ctx.clip();
        drawFragments(ctx, frags, opts);
        ctx.restore();
    });
    removeShadow(ctx);

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


