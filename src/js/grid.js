import noiseUtils from './noiseutils';
import { randItem, randomInRange, resetTransform, rotateCanvas, getGradientFunction, getSolidColorFunction } from './utils';
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
    function circles () {
        let px, py;
        for (let i = 0; i < vcount; i++) {
            for (let j = 0; j < count; j++) {
                // convenience vars
                x = w * j;
                y = h * i;
                xnorm = x/cw;
                ynorm = y/ch;

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
                xnorm = x/cw;
                ynorm = y/ch;

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
    function snakes () {
        ctx.lineCap = 'round';
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, cw, ch);

        let px, py;

        let weight = randomInRange(1, w/10);
        let lightweight = Math.max(1, weight/3);
        let fg1 = getContrastColor();
        let fg2 = getContrastColor();

        console.log(`${count} by ${vcount} cells`);

        fg = getContrastColor();
        let c1 = getContrastColor();
        let c2 = getContrastColor();
        let dotColor = c1;

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

                    if (Math.random() < 0.25) {
                        drawCircle(ctx, px, py, weight * randItem([0.5, 1, 2, 4]) , {fill: dotColor});
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
        let lightweight = Math.max(1, weight/3);
        let fg1 = getContrastColor();
        let fg2 = getContrastColor();

        console.log(`${count} by ${vcount} cells`);

        fg = getContrastColor();
        let c1 = getContrastColor();
        let c2 = getContrastColor();
        let dotColor = c1;

        let ringdefs = [];
        let centers = [];
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

                let start = Math.round(randomInRange(0,4));
                let segments = Math.round(randomInRange(2,4));
                r = w/2 * Math.round(randomInRange(1,3));

                ctx.strokeStyle = fg;
                ctx.lineWidth = lightweight;

                if(Math.random() < 0.25){
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
                }
                drawCircle(ctx, px, py, lightweight, {fill: dotColor});



                // unshift, unclip
                //ctx.restore();
                resetTransform(ctx);
            }
        }

        // draw connecting lines between dots
        ctx.strokeStyle = c1;
        ctx.lineWidth = lightweight;
        while(centers.length >= 2) {
            ctx.beginPath();
            ctx.moveTo(...centers.pop());
            ctx.lineTo(...centers.shift());
            ctx.stroke();
        }

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
                xnorm = x/cw;
                ynorm = y/ch;

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
    let modes = [maskAndRotate, circles, triangles, mixed, snakes];
    modes = [rings];

    // do the loop with one of our modes
    randItem(modes)();

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


