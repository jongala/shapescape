import noiseUtils from './noiseutils';
import palettes from './palettes';
import hexScatter from './hexScatter';
import { randItem, randomInRange, randomInt, resetTransform, rotateCanvas, getGradientFunction, getSolidColorFunction, getVector, shuffle } from './utils';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';
import { createTransform, createSourceSinkTransform, opacityTransforms } from './util/fieldUtils';

const DEFAULTS = {
    container: 'body',
    palette: palettes.metroid_fusion,
    addNoise: 0.04,
    noiseInput: null,
    clear: true,
    debug: false,
    colorMode: 'auto', // from COLORMODES or 'auto'
    fieldMode: 'auto', // [auto, harmonic, flow]
    lightMode: 'normal', // [auto, bloom, normal]
    drawEdges: 'auto', // [auto, true, false]
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
    // canvas center x and y
    let cx = cw/2;
    let cy = ch/2;

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
    const DEBUG = opts.debug;
    const LIGHTMODE = opts.lightMode === 'auto' ? randItem(LIGHTMODES) : opts.lightMode;
    const FIELDMODE = opts.fieldMode === 'auto' ? randItem(FIELDMODES) : opts.fieldMode;
    const COLORMODE = opts.colorMode === 'auto' ? randItem(COLORMODES) : opts.colorMode;
    const POLYEDGES = opts.drawEdges === 'auto' ? randItem([true, false]) : opts.drawEdges;

    console.log(`FieldShape: ${FIELDMODE} ${COLORMODE} ${LIGHTMODE} ${POLYEDGES}`);

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

    let tailLength = SCALE / randomInRange(30, 50);

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


    // Pick an opacity transform to use
    let opacityFunc = randItem(opacityTransforms(maxLen));

    // a set of independent transforms to use while rendering
    let trans = {
        xbase: createTransform(rateMax), // (x,y)=>0,//
        ybase: createTransform(rateMax), // (x,y)=>0,//
        xtail: createTransform(rateMax), // (x,y)=>0,//
        ytail: createTransform(rateMax), // (x,y)=>0,//
        radius: createTransform(rateMax)
    }

    // Make a reference canvas, fill it black
    let ref = document.querySelector('#ref');
    if (!ref) {
        ref = document.createElement('canvas');
        ref.setAttribute('id','ref');
        ref.setAttribute('width', cw);
        ref.setAttribute('height', ch);
        ref.className = 'artContainer';
        //document.querySelector('body').appendChild(ref);
    }
    let refctx = ref.getContext('2d');
    // fill ref with black
    refctx.fillStyle = 'black';
    refctx.fillRect(0, 0, cw, ch);
    // set to white to draw shapes
    refctx.fillStyle = 'white';


    // with a set of imageData, get the color at x,y
    function colorFromReference(x, y, imageData) {
        let c = [];
        return c;
    }

    // edge spacing
    const SPACING = SCALE/randomInRange(35, 50);

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

    // Return an array of vertices defining a regular polygon
    // centered at @x, @y, with @sides, @size, and @angle
    function makeRegularVertices(sides=4, x, y, size=100, angle=0) {
        let vertices = [];
        var a = Math.PI * 2 / sides;
        function _x(theta) {
            return size * Math.cos(theta + angle - Math.PI / 2);
        }
        function _y(theta) {
            return size * Math.sin(theta + angle - Math.PI / 2);
        }

        for (var i = 1; i <= sides; i++) {
            vertices.push([_x(a * i), _y(a * i)]);
        }

        vertices = vertices.map((v, i) => {
            return [v[0] + x, v[1] + y]
        });

        return vertices;
    }

    // Create points at @spacing along polygon defined by @vertices
    // Append to @pts and return modified @pts
    function getEdgePointsFromVertices(vertices, spacing=10) {
        // place points at vertices
        let pts = [];
        pts.push(...vertices);

        // for each edge:
        // get vector for edges by subtracing vertex coordinates
        function drawEdge(edge, pts) {
            // for each edge, get nearest number of whole number of steps based
            // on spacing

            let steps = Math.floor(edge.length / spacing);
            let inc = edge.length / steps;

            DEBUG && console.log(`${steps} steps at ${inc.toPrecision(3)}px each`);

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

        return pts;
    }


    // Create points at @spacing along polygon defined by @vertices
    // Append to @pts and return modified @pts
    function drawShapeFromVertices(ctx, vertices) {
        //ctx.globalAlpha = 0.5;
        ctx.fillStyle = 'white';

        ctx.beginPath();
        ctx.moveTo(...vertices.pop());
        while(vertices.length){
            ctx.lineTo(...vertices.pop());
        }
        ctx.closePath();
        ctx.fill();

        ctx.globalAlpha = 1;

        return vertices;
    }


    // Convenience function: compose the vertex and point placement functions
    // to draw a complete polygon
    function placePolygonPoints(sides=4, x, y, size=100, angle=0, spacing=20) {
        return getEdgePointsFromVertices(makeRegularVertices(sides, x, y, size, angle), spacing);
    }

    // util used for scaling shapes
    function distanceFromEdge(x, y) {
        let dx = Math.min(x, cw - x);
        let dy = Math.min(y, ch - y);
        // normalize gap to the larger dimension of the canvas
        return Math.min(dx, dy) / LONG;
    }

    // Define N shapes placed along a ring at some random interval, which
    // may loop. Move the ring a bit offset from the true center.
    // Returns a list of vertices.
    let placeShapesOnRing = function() {
        let ringPoints = [];

        let shapeR = SCALE * randomInRange(0.25, 0.4);
        let N = randomInt(2, 6);
        let shapeAngle = PI/randomInt(1, N);

        let _cx, _cy; // adjusted center point
        let _r = SCALE * randomInRange(0, 0.2);
        _cx = cx + _r * Math.cos(shapeAngle);
        _cy = cy + _r * Math.sin(shapeAngle);


        for (var i=0; i<N; i++) {
            let _x, _y;
            _x = _cx + shapeR * Math.cos(i * shapeAngle);
            _y = _cy + shapeR * Math.sin(i * shapeAngle);
            ringPoints = ringPoints.concat([
                makeRegularVertices(
                    randomInt(3, 6),
                    _x,
                    _y,
                    SCALE * randomInRange(0.1, 0.3),
                    PI * randomInRange(0, 1),
                    SCALE / randomInRange(25, 55)
                )
            ]);
        }

        if (DEBUG) {
            ctx.globalAlpha = 0.33;
            ctx.lineWidth = 1;
            drawCircle(ctx, _cx, _cy, shapeR, {stroke:fg2});
            ctx.lineWidth = weight;
            ctx.globalAlpha =1;
        }

        return ringPoints;
    }

    function placeShapesRandomly(N) {
        N = N || randomInt(3, 6);
        let shapePoints = [];

        // place them randomly
        // find distance to closest edge
        // make shapes near edges large, away from edges small
        // allow centers to be outside of area.

        for (var i=0; i<N; i++) {
            let _x, _y;
            _x = randomInRange(0, cw);
            _y = randomInRange(0, ch);

            let scalar = 1 - distanceFromEdge(_x, _y);
            scalar = scalar * scalar * scalar;

            shapePoints = shapePoints.concat([
                makeRegularVertices(
                    randomInt(3, 6),
                    _x,
                    _y,
                    SCALE * randomInRange(0.3, 0.5) * scalar,
                    PI * randomInRange(0, 1),
                    SCALE / randomInRange(25, 55)
                )
            ]);
        }

        return shapePoints;
    }

    function placeShapesOnLine() {
        let N = randomInt(3, 6);
        let shapePoints = [];

        // points along each side of the canvas
        let sides = shuffle([
            [cw * randomInRange(0.2, 0.8), 0],
            [cw, ch * randomInRange(0.2, 0.8)],
            [cw * randomInRange(0.2, 0.8), ch],
            [0, ch * randomInRange(0.2, 0.8)]
        ]);

        // choose random combo
        let p1 = sides.pop();
        let p2 = sides.pop();

        if (DEBUG) {
            ctx.globalAlpha = 0.5;
            // trace line
            ctx.strokeStyle = fg;
            ctx.lineWidth = 1
            ctx.moveTo(...p1);
            ctx.lineTo(...p2);
            ctx.stroke();
            ctx.lineWidth = weight;
        }

        // draw shapes along the line
        for (var i=0; i<N; i++) {
            let _x, _y, d;
            // interpolate at random spot along p1 -> p2
            d = randomInRange(0, 1);
            _x = d * p1[0] + (1 - d) * p2[0];
            _y = d * p1[1] + (1 - d) * p2[1];

            let scalar = 1 - distanceFromEdge(_x, _y);
            scalar = scalar * scalar * scalar;

            shapePoints = shapePoints.concat([
                makeRegularVertices(
                    randomInt(3, 6),
                    _x,
                    _y,
                    SCALE * randomInRange(0.3, 0.5) * scalar,
                    PI * randomInRange(0, 1),
                    SCALE / randomInRange(25, 55)
                )
            ]);
        }

        return shapePoints;
    }

    // make a collection of placement functions that we can pick from
    let placementFunctions = [
        placeShapesOnRing,
        placeShapesOnLine,
        placeShapesRandomly
    ];

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

    // draw a single point in the field
    function drawPoints(points, drawTails=true, drawDots=true) {
        points.forEach((p, i) => {
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

            if (drawDots) {
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
                    {stroke: dotFill}
                );
            }

            if (drawTails) {
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
            }
        });
    }


    // --------------------------------------
    // draw stuff:


    // -> Get a set of polygon vertices
    let polyVertices = [];
    polyVertices = randItem(placementFunctions)();

    // -> scatter a background field

    // Draw the background field from scattered points, with only tails
    // Use a shorter tail length and thickness to make this less dominant
    let baseScale = lineScale;
    lineScale = baseScale / 3;

    let bgField = hexScatter(tailLength, cw, ch);
    drawPoints(bgField, true, false);


    // -> draw the polygon edges, if desired

    // Restore full tail length and thickness to draw points derived from
    // the polygons
    lineScale = baseScale;
    ctx.lineWidth = weight * 2;

    // Pick a random placement function and draw the edges
    if (POLYEDGES) {
        polyVertices.forEach((polygon, i) => {
            drawPoints(getEdgePointsFromVertices(polygon, SPACING), true, true);
        });
    }

    // -> select the background points that overlap polygons

    // draw the polys to the reference canvas
    polyVertices.forEach((polygon, i) => {
        drawShapeFromVertices(refctx, polygon);
    });

    // step thru the field points, check their position against reference
    // and create a new list
    let pointsInsidePolys = [];
    bgField.forEach((p, i) => {
        if (refctx.getImageData(...p, 1, 1).data[0] > 128) {
            pointsInsidePolys.push(p);
        }
    });

    // -> draw the polygon field points

    ctx.lineWidth = weight;
    lineScale = baseScale/2;
    drawPoints(pointsInsidePolys, true, true);


    // reset alpha for any following draw operations
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

