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
        // bitmasks for drawing modes
        let cellModes = [
            0x000001, // horiz
            0x000010, // vert
            0x000100, // tl
            0x001000, // tr
            0x010000, // br
            0x100000, // bl
            0x101000,
            0x010100,
            /*0x011000,
            0x100100,
            0x011100,
            0x101100,
            0x110100,
            0x111000,
            0x111100*/
        ];

        ctx.lineCap = 'round';
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, cw, ch);

        let tl = () => {
            ctx.beginPath();
            ctx.moveTo(w/2, 0);
            ctx.arc(0, 0, w/2, 0, PI/2, false);
            ctx.stroke();
        }

        let tr = () => {
            ctx.beginPath();
            ctx.moveTo(w, h/2);
            ctx.arc(w, 0, w/2, PI/2, PI, false);
            ctx.stroke();
        }

        let br = () => {
            ctx.beginPath();
            ctx.moveTo(w/2, h);
            ctx.arc(w, h, w/2, PI, 3*PI/2, false);
            ctx.stroke();
        }

        let bl = () => {
            ctx.beginPath();
            ctx.moveTo(0, h/2);
            ctx.arc(0, h, w/2, -PI/2, 0, false);
            ctx.stroke();
        }

        let horiz = () => {
            ctx.beginPath();
            ctx.moveTo(0, h/2);
            ctx.lineTo(w, h/2);
            ctx.stroke();
        }

        let vert = () => {
            ctx.beginPath();
            ctx.moveTo(w/2, 0);
            ctx.lineTo(w/2, h);
            ctx.stroke();
        }

        let px, py;

        let weight = randomInRange(1, w/6);
        let fg1 = getContrastColor();
        let fg2 = getContrastColor();

        let drawModes = (modes) => {
            (modes & 0x000001) && horiz(); // horiz
            (modes & 0x000010) && vert(); // vert
            (modes & 0x000100) && tl(); // tl
            (modes & 0x001000) && tr(); // tr
            (modes & 0x010000) && br(); // br
            (modes & 0x100000) && bl(); // bl
        }

        // hit each cell
        for (let i = 0; i < vcount; i++) {
            for (let j = 0; j < count; j++) {
                // convenience vars
                x = w * j;
                y = h * i;
                xnorm = x/cw;
                ynorm = y/ch;

                // shift and clip
                ctx.translate(x, y);
                //clipSquare(ctx, w, h, bg);

                if(Math.random() < .25) {
                    drawCircle(
                        ctx,
                        w,
                        h,
                        w/randomInRange(5, 20),
                        {
                            fill: randItem([fg1, fg2])
                        }
                    );
                }

                // randomize stacking of two colors
                let c1, c2;
                if (Math.random() < 0.5) {
                    c1 = fg1;
                    c2 = fg2;
                } else {
                    c1 = fg2;
                    c2 = fg1;
                }

                // get a mode for each cell, mask for function
                let m = randItem(cellModes);
                ctx.lineWidth = weight;
                ctx.strokeStyle = c1;
                drawModes(m);

                // second set of modes
                m = randItem(cellModes);
                ctx.lineWidth = weight;
                ctx.strokeStyle = c2;
                drawModes(m)

                // unshift, unclip
                //ctx.restore();
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
    let modes = [maskAndRotate, circles, triangles, mixed];

    // do the loop with one of our modes
    //randItem(modes)();
    snakes();

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


