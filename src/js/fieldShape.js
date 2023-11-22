import noiseUtils from './noiseutils';
import palettes from './palettes';
import hexScatter from './hexScatter';
import { randItem, randomInRange, resetTransform, rotateCanvas, getGradientFunction, getSolidColorFunction, getVector } from './utils';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';

const DEFAULTS = {
    container: 'body',
    palette: palettes.metroid_fusion,
    addNoise: 0.04,
    noiseInput: null,
    clear: true,
    colorMode: 'auto', // from COLORMODES or 'auto'
    fieldMode: 'auto', // [auto, harmonic, flow]
    lightMode: 'normal', // [auto, bloom, normal]
}

const PI = Math.PI;
const FIELDMODES = ['harmonic', 'flow'];
const LIGHTMODES = ['bloom', 'normal'];
const COLORMODES = ['single', 'angle', 'random'];

// Main function
export function fieldShape(options) {
    let opts = Object.assign({}, DEFAULTS, options);

    let container = opts.container;
    let cw = container.offsetWidth;
    let ch = container.offsetHeight;
    let SCALE = Math.min(cw, ch);
    let LONG = Math.max(cw, ch);
    let SHORT = Math.min(cw, ch);
    const AREA = cw * ch;

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

    // modes and styles
    const LIGHTMODE = opts.lightMode === 'auto' ? randItem(LIGHTMODES) : opts.lightMode;
    const FIELDMODE = opts.fieldMode === 'auto' ? randItem(FIELDMODES) : opts.fieldMode;
    const COLORMODE = opts.colorMode === 'auto' ? randItem(COLORMODES) : opts.colorMode;

    // color funcs
    let getSolidFill = getSolidColorFunction(opts.palette);

    // how many cells are in the grid?
    let countMin, countMax;

    // setup vars for each cell
    let x = 0;
    let y = 0;
    let xnorm = 0;
    let ynorm = 0;
    let renderer;

    // shared colors
    let bg = getSolidFill();

    // get palette of non-bg colors
    let contrastPalette = [].concat(opts.palette);
    contrastPalette.splice(opts.palette.indexOf(bg), 1);
    let getContrastColor = getSolidColorFunction(contrastPalette);

    // shared foregrounds
    let fg = getContrastColor();
    let fg2 = getContrastColor();

    // in bloom mode, we draw high-contrast grayscale, and layer
    // palette colors on top
    if (LIGHTMODE === 'bloom') {
        bg = '#222222';
        fg = fg2 = '#cccccc';
    }

    // draw background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);

    // set default tail color
    ctx.strokeStyle = fg;
    // set default dot color
    let dotFill = fg2;


    let rateMax = 3;

    let tailLength = SCALE / randomInRange(10, 50);


    // tail vars
    let _x,_y,len;

    // dotScale will be multiplied by 2. Keep below .25 to avoid bleed.
    // Up to 0.5 will lead to full coverage.
    let dotScale = tailLength * randomInRange(0.1, 0.25);
    // line width
    let weight = randomInRange(0.5, 3) * SCALE/800;

    ctx.lineWidth = weight;
    ctx.lineCap = 'round';

    // const used in normalizing transforms
    let maxLen = 2 * Math.sqrt(2);

    // It looks nice to extend lines beyond their cells. how much?
    // Scaled against tailLength
    let lineScale = randomInRange(0.7, 2);



    // set of functions to transform opacity across grid
    const opacityTransforms = [
        () => 1,
        (_x, _y) => Math.abs(_y/_x)/maxLen,
        (_x, _y) => (1 - Math.abs(_y/_x)/maxLen),
        (_x, _y) => Math.abs(_x/_y), // hides verticals
        (_x, _y) => Math.abs(_y/_x), // hides horizontals
        (_x, _y) => (_x / _y),
        (_x, _y) => (_y / _x),
        (_x, _y) => (_y - _x),
        (_x, _y) => (_x - _y)
    ]
    // now pick one
    let opacityFunc = randItem(opacityTransforms);

    // Create a function which is a periodic transform of x, y
    function createTransform (rateMin = 0, rateMax = 1) {
        let rate1 = randomInRange(0, rateMax/2);
        let rate2 = randomInRange(0, rateMax/2);
        let rate3 = randomInRange(rateMax/2, rateMax);
        let rate4 = randomInRange(rateMax/2, rateMax);

        let phase1 = randomInRange(-PI, PI);
        let phase2 = randomInRange(-PI, PI);
        let phase3 = randomInRange(-PI, PI);
        let phase4 = randomInRange(-PI, PI);

        let c1 = randomInRange(0, 1);
        let c2 = randomInRange(0, 1);
        let c3 = randomInRange(0, 1);
        let c4 = randomInRange(0, 1);
        return (xnorm, ynorm) => {
            let t1 = Math.sin(xnorm * rate1 * 2 * PI + phase1);
            let t2 = Math.sin(ynorm * rate2 * 2 * PI + phase2);
            let t3 = Math.sin(xnorm * rate3 * 2 * PI + phase3);
            let t4 = Math.sin(ynorm * rate4 * 2 * PI + phase4);
            return (c1 * t1 + c2 * t2 + c3 * t3 + c4 * t4)/(c1 + c2 + c3 + c4);
        }
    }

    function createSourceSinkTransform (count = 4) {
        let sources = [];

        while(count--) {
            let src = {
                strength: randomInRange(1, 20),
                sign: 1,
                x: randomInRange(-0.25, 1.25), // add some overscan
                y: randomInRange(-0.25, 1.25)
            }
            if (Math.random() > 0.9) { // occasionally make sinks instead of sources
                src.sign *= -1;
            }
            sources.push(src);
        }

        return {
            sources: sources,
            t: (xnorm, ynorm) => {
                let v = [0, 0]; // force vector to return

                sources.forEach((source) => {
                    let rmin = source.strength / 1000; // magic number


                    let dx = xnorm - source.x;
                    let dy = ynorm - source.y;
                    let _r = (dx * dx + dy * dy); // really r squared but that's what we want

                    if(_r < rmin) {
                        _r = rmin;
                    }; // min r

                    let scalar = source.sign * source.strength/(_r);

                    let _x = scalar * (dx);
                    let _y = scalar * (dy);
                    v[0] += _x;
                    v[1] += _y;
                });

                return v;
            }
        }
    }

    // a set of independent transforms to use while rendering
    let trans = {
        xbase: createTransform(rateMax), // (x,y)=>0,//
        ybase: createTransform(rateMax), // (x,y)=>0,//
        xtail: createTransform(rateMax), // (x,y)=>0,//
        ytail: createTransform(rateMax), // (x,y)=>0,//
        radius: createTransform(rateMax)
    }





    let pts = [];

    //pts = hexScatter(tailLength, cw, ch);

    // place points along shapes

    function circlePoints(x, y, size) {
        let theta = 0;
        let N = 200;
        let r = size;
        for (var i = 0; i < N; i++) {
            theta += (PI * 2)/N;
            pts.push([ x + r * Math.cos(theta), y + r * Math.sin(theta)]);
        }
    }


    function polyPoints(vertices, spacing=10, pts) {
        // place points at vertices

        pts.push(...vertices);


        // for each edge:

        // get vector for edges by subtracing vertex coordinates

        function drawEdge(edge, pts) {
            // for each edge, get nearest number of whole number of steps based
            // on spacing

            let steps = Math.floor(edge.length / spacing);
            let inc = edge.length / steps;

            console.log(`${steps} steps at ${inc.toPrecision(3)}px each`);

            // start at vertex and move along edge vector in increments,
            // placing points
            // do this by dividing the edge vector by edge spacing scalar?
            // step along in increments until end vertex is reached

            for (var i = 0; i < steps ; i++ ) {
                pts.push([
                    edge.x + i * inc * Math.cos(edge.angle),
                    edge.y + i * inc * Math.sin(edge.angle)
                ]);
            }
        }

        vertices.forEach((v, i) => {
            drawEdge(
                getVector(v, vertices[(i + 1) % vertices.length])
            , pts);
        });

    }


    // rotate @p around the origin by @angle radians
    let rot = function(p, angle) {
        let [x, y] = p;
        let x2, y2;
        x2 = x * Math.cos(angle) - y * Math.sin(angle);
        y2 = x * Math.sin(angle) + y * Math.cos(angle);
        return [x2, y2];
    }

    function squarePoints(x, y, size, angle=0) {
        // get vertices
        let vertices = [
            rot([-size/2, -size/2], angle),
            rot([size/2, -size/2], angle),
            rot([size/2, size/2], angle),
            rot([-size/2, size/2], angle)
        ].map((v, i) => {
            return [v[0] + x, v[1] + y]
        });

        polyPoints(vertices, 20, pts);
    }


    function trianglePoints(x, y, size, angle=0) {
        let d = size * 0.64;
        // get vertices
        let vertices = [
            rot([0, -d], angle),
            rot([-d * Math.cos(PI/6), d * Math.sin(PI/6)], angle),
            rot([d * Math.cos(PI/6), d * Math.sin(PI/6)], angle)
        ].map((v, i) => {
            return [v[0] + x, v[1] + y]
        });

        polyPoints(vertices, 20, pts);
    }



    // test shapes
    squarePoints(cw * .33, ch *.33, SCALE/4, PI * randomInRange(0, 1));
    trianglePoints(cw * .66, ch * .66, SCALE/4, PI * randomInRange(0, 1));
    circlePoints(cw/2, ch/2, SCALE/4);



    // create field transform
    let sourceTransform = createSourceSinkTransform(Math.round(randomInRange(5, 15)));

    // Flags for coloring by angle
    // Don't do special coloring in bloom mode, because it relies on grayscale
    // initial rendering
    let colorTailByAngle = false;
    let colorDotByAngle = false;
    let randomColorThreshold;
    if (LIGHTMODE !== 'bloom') {
        if (COLORMODE === 'angle') {
            if (Math.random() < 0.6) {
                colorTailByAngle = true;
            }
            if (Math.random() < 0.6) {
                colorDotByAngle = true;
            }
        }
        if (COLORMODE === 'random') {
            randomColorThreshold = 0.66;
        }
    }

    // console.log(`Colors: tails ${colorTailByAngle}, dots: ${colorDotByAngle}`);

    // source/sink stuff
    if (FIELDMODE === 'flow') {
        let totalStrength = 0;
        sourceTransform.sources.forEach((source) => {
            totalStrength += source.strength;
        });
        lineScale = 1/totalStrength;
    }

    // step thru points
    pts.forEach((p, i) => {
        x = p[0];
        y = p[1];
        xnorm = x/cw;
        ynorm = y/ch;

        // get end of tail coords
        if (FIELDMODE === 'flow') {
            // flow fields (source-sink)
            let flow = sourceTransform.t(xnorm, ynorm);
            _x = flow[0];
            _y = flow[1];
        } else {
            // harmonic fields
            _x = trans.xtail(xnorm, ynorm);
            _y = trans.ytail(xnorm, ynorm);
        }

        let theta = Math.atan2(_y, _x);
        let fillIndex = Math.round(contrastPalette.length * theta/PI / 2);
        let angleColor = contrastPalette[fillIndex];

        if (colorDotByAngle) {
            dotFill = angleColor;
        }
        if (COLORMODE === 'random' && Math.random() < randomColorThreshold) {
            dotFill = getContrastColor();
        }

        // draw dot
        ctx.globalAlpha = 1;
        drawCircle(ctx,
            x,
            y,
            (trans.radius(xnorm, ynorm) + 1) * dotScale,
            {fill: dotFill}
        );

        ctx.globalAlpha = opacityFunc(_x, _y);

        if (colorTailByAngle) {
            ctx.strokeStyle = angleColor;
        }
        if (COLORMODE === 'random' && Math.random() < randomColorThreshold) {
            ctx.strokeStyle = getContrastColor();
        }

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(
            x + tailLength * _x * lineScale,
            y + tailLength * _y * lineScale
        );
        ctx.stroke();
    });

    ctx.globalAlpha = 1;

    // in bloom mode, we draw a big colorful gradient over the grayscale
    // background, using palette colors and nice blend modes
    if (LIGHTMODE === 'bloom') {
        ctx.globalCompositeOperation = 'color-dodge';

        // bloom with linear gradient
        ctx.fillStyle = getGradientFunction(opts.palette)(ctx, cw, ch);//getContrastColor();
        ctx.fillRect(0, 0, cw, ch);

        if (Math.random() < 0.5) {
            // bloom with spot lights
            let dodgeDot = (max = 1.5) => {
                let gx, gy, gr1, gr2;
                gx = randomInRange(0, cw);
                gy = randomInRange(0, ch);
                gr1 = randomInRange(0, 0.25);
                gr2 = randomInRange(gr1, max);

                let radial = ctx.createRadialGradient(
                    gx,
                    gy,
                    gr1 * SCALE,
                    gx,
                    gy,
                    gr2 * SCALE
                );
                radial.addColorStop(0, randItem(opts.palette));
                radial.addColorStop(1, '#000000');

                ctx.fillStyle = radial;
                ctx.fillRect(0, 0, cw, ch);
            }
            // try layering dots with varying coverage
            ctx.globalAlpha = randomInRange(0.4, 0.7);
            dodgeDot(1.5);
            ctx.globalAlpha = randomInRange(0.4, 0.7);
            dodgeDot(1.0);
            ctx.globalAlpha = randomInRange(0.7, 0.9);
            dodgeDot(0.5);
            ctx.globalAlpha = 1;
        }

        ctx.globalCompositeOperation = 'normal';
    }

    // add noise
    if (opts.addNoise) {
        if (opts.noiseInput) {
            // apply noise from supplied canvas
            noiseUtils.applyNoiseCanvas(el, opts.noiseInput);
        } else {
            // create noise pattern and apply
            noiseUtils.addNoiseFromPattern(el, opts.addNoise, cw / 3);
        }
    }

    // if new canvas child was created, append it
    if (newEl) {
        container.appendChild(el);
    }
}

