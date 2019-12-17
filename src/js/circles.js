import noiseUtils from './noiseutils';
import { randItem, randomInRange, resetTransform, rotateCanvas, getGradientFunction, getSolidColorFunction } from './utils';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon, drawPath } from './shapes';
import { defineFill, expandFill } from './colors';

const DEFAULTS = {
    container: 'body',
    palette: ['#f9f9f9', '#D9AC32', '#ED5045', '#1F3E9C', '#000142'],
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true
}

const PI = Math.PI;

function centerpoint(a, b) {
    return [(a[0] + b[0])/2, (a[1] + b[1])/2];
}

function drawcc(ctx, a, b, c, p, color1, color2) {
    let [ax, ay] = a;
    let [bx, by] = b;
    let [cx, cy] = c;
    let [px, py] = p;

    color2 = color2 || color1;

    // slopes
    var mAB = (by - ay) / (bx - ax);
    var mAC = (cy - ay) / (cx - ax);
    // invert for perpendicular
    mAB = -1/mAB;
    mAC = -1/mAC;


    var midAB = centerpoint(a, b);
    var midAC = centerpoint(a, c);

    var bAB = midAB[1] - mAB * midAB[0];
    var bAC = midAC[1] - mAC * midAC[0];

    var CCx;
    var CCy;

    CCx = (bAC - bAB) / (mAB - mAC);
    CCy = mAB * CCx + bAB;

    let r1 = ctx.lineWidth * 3;
    let r2 = r1 * 2;

    // draw the points as dots with rings around
    drawCircle(ctx, ax, ay, r1, {fill:color1});
    drawCircle(ctx, ax, ay, r2, {stroke:color1});

    drawCircle(ctx, bx, by, r1, {fill:color1});
    drawCircle(ctx, bx, by, r2, {stroke:color1});

    drawCircle(ctx, cx, cy, r1, {fill:color1});
    drawCircle(ctx, cx, cy, r2, {stroke:color1});


    // draw the triangle connecting them
    drawPath(ctx, [a, b, c], {stroke: color1});


    // draw midpoints
    drawCircle(ctx, midAB[0], midAB[1], r1, {fill:color2});
    drawCircle(ctx, midAC[0], midAC[1], r1, {fill:color2});


    // with slopes and offsets, draw perp bisectors
    ctx.lineCap = 'round';
    ctx.setLineDash([r1, r1 * 4]);

    ctx.strokeStyle = color2;
    ctx.beginPath();
    ctx.moveTo(0, bAB);
    ctx.lineTo(p[1], mAB * p[1] + bAB);
    ctx.closePath();
    ctx.stroke();

    ctx.strokeStyle = color2;
    ctx.beginPath();
    ctx.moveTo(0, bAC);
    ctx.lineTo(p[1], mAC * p[1] + bAC);
    ctx.closePath();
    ctx.stroke();

    ctx.setLineDash([]);

    // draw circumcenter point
    drawCircle(ctx, CCx, CCy, r2, {stroke:color1});

    // draw the enclosing circle
    var dx = CCx - ax;
    var dy = CCy - ay;
    var r = Math.sqrt(dx * dx + dy * dy);
    drawCircle(ctx, CCx, CCy, r, {stroke:color1});

    // return the center point
    return [CCx, CCy];
}


// Main function
export function circles(options) {
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
    let bg = getSolidFill();

    // get palette of non-bg colors
    let contrastPalette = [].concat(opts.palette);
    contrastPalette.splice(opts.palette.indexOf(bg), 1);
    let getContrastColor = getSolidColorFunction(contrastPalette);
    let fg = getContrastColor();

    // mode
    function snakes () {
        ctx.lineCap = 'round';
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, cw, ch);

        let px, py;

        let weight = randomInRange(1, w/10);
        let lightweight = Math.max(1, weight/3);

        let c1 = getContrastColor();
        let c2 = getContrastColor();
        let dotColor = c1;

        let dotGradient = getGradientFunction([c1, c2, bg])(ctx, cw/2, ch/2);

        let set1 = [];
        let set2 = [];

        function loop(color) {
            let ringdefs = [];
            let start;
            let segments;
            let r;
            // hit each cell
            for (let i = 0; i < vcount; i++) {
                for (let j = 0; j < count; j++) {
                    // convenience vars
                    x = w * j;
                    y = h * i;
                    px = x + w/2;
                    py = y + h/2;
                    xnorm = px/cw;
                    ynorm = py/ch;

                    start = Math.round(randomInRange(0,4));
                    segments = Math.round(randomInRange(1,2));
                    r = w/2 * Math.round(randomInRange(1,1));

                    ctx.strokeStyle = color;
                    ctx.lineWidth = weight;

                    dotColor = color;
                    if(Math.random() < 0.75){
                        // draw circles for many
                        ringdefs.push([
                            px,
                            py,
                            r,
                            PI/2 * start,
                            PI/2 * (start + segments),
                            false
                        ]);
                    } else if (Math.random() < 0.25) {
                        // draw line
                        ctx.beginPath();
                        if (Math.random() < 0.5) {
                            ctx.moveTo(px, y);
                            ctx.lineTo(px + w, y);
                        } else {
                            ctx.moveTo(x, py);
                            ctx.lineTo(x, py + h);
                        }
                        ctx.stroke();
                    } else {
                        dotColor = fg;
                    }

                    if (Math.random() < 0.125) {
                        drawCircle(ctx, px, py, w/2 * randItem([0.25, 0.5, 1]) - weight/2 + 0.5 , {fill: dotGradient});
                    }


                    // unshift, unclip
                    //ctx.restore();
                    resetTransform(ctx);
                }
            }
            return ringdefs;
        }

        set1 = loop(c1);
        set2 = loop(c2);

        // draw rings
        ctx.strokeStyle = c1;
        ctx.lineWidth = weight;
        set1.forEach((def) => {
            ctx.beginPath();
            ctx.arc(...def);
            ctx.stroke();
        });

        ctx.strokeStyle = c2;
        ctx.lineWidth = weight;
        set2.forEach((def) => {
            ctx.beginPath();
            ctx.arc(...def);
            ctx.stroke();
        });
    }

    function triPoints(ctx, p1, p2, p3, color) {
        ctx.beginPath;
        ctx.moveTo(...p1);
        ctx.lineTo(...p2);
        ctx.lineTo(...p3);
        ctx.closePath();
        ctx.strokeStyle = color;
        ctx.stroke();
    }

    function rings () {
        ctx.lineCap = 'round';
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, cw, ch);

        let px, py;

        let weight = randomInRange(1, w/10);
        let lightweight = Math.max(0.5, weight/3);

        console.log(`${count} by ${vcount} cells`);

        let c1 = getContrastColor();
        let c2 = getContrastColor();
        let dotColor = c1;

        let ringdefs = [];
        let centers = [];
        let r;

        let threshold = (0.5 - .25 * (count/10));
        console.log('count:', count, 'threshold:', threshold);


        // hit each cell
        for (let i = 0; i < vcount; i++) {
            for (let j = 0; j < count; j++) {
                // convenience vars
                x = w * j;
                y = h * i;
                px = x + w/2;
                py = y + h/2;
                xnorm = px/cw;
                ynorm = py/ch;

                let start = Math.round(randomInRange(0,4));
                let segments = Math.round(randomInRange(1,3));
                r = w/2 * Math.round(randomInRange(1,3));

                ctx.strokeStyle = fg;
                ctx.lineWidth = lightweight;

                if(Math.random() < threshold ){
                    centers.push([px, py]);
                    ringdefs.push([
                        px,
                        py,
                        r,
                        PI/2 * start,
                        PI/2 * (start + segments),
                        false
                    ])
                    dotColor = fg;

                    let a = randomInRange(PI/2 * start, PI/2 * (start + segments));
                    ctx.beginPath();
                    ctx.moveTo(px, py);
                    ctx.lineTo(px + r * Math.cos(a), py + r * Math.sin(a));
                    ctx.stroke();
                } else {
                    dotColor = c1;
                    drawCircle(ctx, px, py, lightweight, {fill: dotColor});
                }


                // unshift, unclip
                //ctx.restore();
                resetTransform(ctx);
            }
        }



        // draw connecting lines between dots
        let centers_copy = [].concat(centers);
        ctx.strokeStyle = c1;
        ctx.lineWidth = Math.max(lightweight / 2, 0.5);
        while(centers_copy.length >= 2) {
            ctx.beginPath();
            ctx.moveTo(...centers_copy.pop());
            ctx.lineTo(...centers_copy.shift());
            ctx.stroke();
        }

        // draw dots
        centers.forEach((c) => {
            drawCircle(ctx, c[0], c[1], lightweight, {fill: fg});
        });

        // draw rings
        ctx.strokeStyle = fg;
        ctx.lineWidth = weight;
        ringdefs.forEach((def) => {
            ctx.beginPath();
            ctx.arc(...def);
            ctx.stroke();
        });
    }

    // mode
    function pattern () {
        let c1 = randomInRange(0.125, 0.5);
        let c2 = randomInRange(.5, 1);

        let dotScale = randomInRange(0.1, 0.5);
        let dotMin = randomInRange(0, 0.5 - dotScale);
        let dotFill = getContrastColor();
        let dotSign = Math.random() < 0.5;

        let xref = Math.random();
        let yref = Math.random();
        if (Math.random() < 0.5) {
            xref = yref = 0.5;
        }

        let crossDots = true;//Math.random() < 0.5;
        let crossFill =  Math.random() < 0.5 ? fg : bg;
        let crossScale = randomInRange(0.25, .3);

        let cr;

        let crossPattern = (r) => {
            drawCircle(ctx, w * r, h / 2, w * r, {fill: null, stroke: fg});
            drawCircle(ctx, -w * (r - 1), h / 2, w * r, {fill: null, stroke: fg});

            drawCircle(ctx, w/2, h  * r, w * r, {fill: null, stroke: fg});
            drawCircle(ctx, w/2, -h * (r - 1), h * r, {fill: null, stroke: fg});
        }

        ctx.lineWidth = randomInRange(1, w/30);

        for (let i = 0; i < vcount; i++) {
            for (let j = 0; j < count; j++) {
                // convenience vars
                x = w * j;
                y = h * i;
                xnorm = (x + w/2)/cw;
                ynorm = (y + h/2)/ch;

                // shift and clip
                ctx.translate(x, y);
                clipSquare(ctx, w, h, bg);

                drawCircle(ctx, 0, 0, w/2, {fill: null, stroke: fg});
                drawCircle(ctx, w, 0, w/2, {fill: null, stroke: fg});
                drawCircle(ctx, w, h, w/2, {fill: null, stroke: fg});
                drawCircle(ctx, 0, h, w/2, {fill: null, stroke: fg});

                crossPattern(c1);
                crossPattern(c2);

                if (crossDots && (i % 2) === (j % 2)) {
                    //drawCircle(ctx, w/2, h/2, crossScale, {fill: crossFill, stroke: fg});
                }

                cr = Math.sqrt(Math.pow(xnorm - xref, 2) + Math.pow(ynorm - yref, 2))/.7071;
                if (dotSign) {
                    cr = 1 - cr;
                }
                cr = Math.abs(cr);

                drawCircle(ctx,
                    w/2,
                    h/2,
                    dotMin + dotScale * w * cr,
                    {fill: dotFill, stroke: fg});

                drawCircle(ctx,
                    w/2,
                    h/2,
                    dotMin + dotScale * w * cr + ctx.lineWidth * 2,
                    {fill: null, stroke: fg});


                // unshift, unclip
                ctx.restore();
                resetTransform(ctx);
            }
        }
    }

    // mode
    function ccs() {


        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, cw, ch);

        let randomPoint = () => [randomInRange(0, cw), randomInRange(0, ch)];

        let cc1, cc2, cc3;

        cc1 = drawcc(
            ctx,
            randomPoint(),
            randomPoint(),
            randomPoint(),
            [cw, ch],
            getContrastColor()
        );

        cc2 = drawcc(
            ctx,
            randomPoint(),
            randomPoint(),
            randomPoint(),
            [cw, ch],
            getContrastColor()
        );

        cc3 = drawcc(
            ctx,
            randomPoint(),
            randomPoint(),
            randomPoint(),
            [cw, ch],
            getContrastColor()
        );

        // draw circumcenter of circumcenters
        ctx.lineWidth = 2;
        drawcc(
            ctx,
            cc1,
            cc2,
            cc3,
            [cw, ch],
            getContrastColor()
        )
    }

    // gather our modes
    let modes = [snakes, rings, pattern];

    // do the loop with one of our modes
    //randItem(modes)();
    ccs();

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


