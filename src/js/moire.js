import noiseUtils from './noiseutils';
import palettes from './palettes';
import { randItem, randomInRange, randomInt, resetTransform, rotateCanvas, getGradientFunction, getSolidColorFunction, getAngle, getVector, mapKeywordToVal } from './utils';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon, drawCross } from './shapes';

const DEFAULTS = {
    container: 'body',
    palette: palettes.plum_sauce,
    addNoise: 0.04,
    noiseInput: null,
    clear: true,
}

const PI = Math.PI;
const TWOPI = 2 * PI;

const DEBUG = false;

// Main function
export function moire(options) {
    let opts = Object.assign({}, DEFAULTS, options);

    let container = opts.container;
    let cw = container.offsetWidth;
    let ch = container.offsetHeight;
    let SCALE = Math.min(cw, ch);
    let LONG = Math.max(cw, ch);
    let SHORT = Math.min(cw, ch);
    let SPAN = Math.sqrt(LONG ** 2 + SHORT ** 2);
    const AREA = cw * ch;
    const ASPECT = LONG/SHORT;

    let center = [cw/2, ch/2];

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


    // Color funcs
    // --------------------------------------

    let getSolidFill = getSolidColorFunction(opts.palette);

    // shared colors
    let bg = getSolidFill();
    bg = randItem(['#fcf9f0','#f3f2f1','#f3f9fc']);

    // get palette of non-bg colors
    let contrastPalette = [].concat(opts.palette);
    contrastPalette.splice(opts.palette.indexOf(bg), 1);
    let getContrastColor = getSolidColorFunction(contrastPalette);

    // shared foregrounds
    let fg = getContrastColor();
    let fg2 = getContrastColor();

    // fill background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);

    // set default stroke
    ctx.strokeStyle = fg;


    // Draw Stuff
    // --------------------------------------


    let lines = [];
    let lineCount = 100;
    for (var i = 0; i <= lineCount; i++) {
        let line = [];
        line.push([cw/4, ch * (1 - i/lineCount)]);
        line.push([3 * cw/4, ch * (1 - i/lineCount)]);
        lines.push(line);
    }

    // lines.forEach(line => {
    //     ctx.beginPath();
    //     ctx.moveTo(...line[0]);
    //     ctx.lineTo(...line[1]);
    //     ctx.stroke();
    // });


    function lineSteps(a, b, steps, l, curve) {
        let v = getVector(a, b);
        let inc = v.length / steps;

        let x = a[0];
        let y = a[1];
        let p1 = [0, 0]; // start point of transverse line
        let p2 = [0, 0]; // end point

        ctx.beginPath();

        for (var i = 0; i <= steps; i++) {
            x += inc * Math.cos(v.angle);
            y += inc * Math.sin(v.angle);

            //drawCircle(ctx, x, y, 20, {stroke:'black'});

            p1 = [
                x + l * Math.cos(v.angle - PI/2),
                y + l * Math.sin(v.angle - PI/2),
            ];
            p2 = [
                x + l * Math.cos(v.angle + PI/2),
                y + l * Math.sin(v.angle + PI/2),
            ];

            //drawCircle(ctx, ...p1, 10, {stroke:'red'});
            //drawCircle(ctx, ...p2, 10, {fill:'blue'});

            //ctx.beginPath();
            ctx.moveTo(...p1);
            ctx.lineTo(...p2);
            //ctx.stroke();


            //ctx.lineTo(x, y);
            //ctx.stroke();
        }

        ctx.stroke();
    }

    //lineSteps([cw/4, ch],[3 * cw/4, 0], 100, 100);


    ctx.strokeStyle = 'black';

    ctx.lineWidth = 2;

    function stepCurve(a, b, c1, c2, steps, l, skew) {
        // ctx.beginPath();
        // ctx.moveTo(...a);
        // ctx.bezierCurveTo(...c1, ...c2, ...b);
        // ctx.stroke();

        skew = skew || 0;

        // DEBUG
        DEBUG && drawCross(ctx, ...c1, 10, {stroke:fg});
        DEBUG && drawCross(ctx, ...c2, 10, {stroke:fg});

        let t = 0;
        let inc = 1/steps;

        let x = a[0];
        let y = a[1];
        let _x = x; // last x
        let _y = y; // last y

        // each point on curve
        //drawCircle(ctx, x, y, 10, {stroke:'red'});

        let v;
        let p1 = [0, 0]; // start point of transverse line
        let p2 = [0, 0]; // end point


        // step thru the bezier
        for (var i = 1; i <= steps; i++) {
            t = i * inc;

            x = (1 - t) ** 3 * a[0] +       3 * (1 - t) ** 2 * t * c1[0] +      3 * (1 - t) * t ** 2 * c2[0] +      t ** 3 * b[0];
            y = (1 - t) ** 3 * a[1] +       3 * (1 - t) ** 2 * t * c1[1] +      3 * (1 - t) * t ** 2 * c2[1] +      t ** 3 * b[1];

            // get vector from last point to this point
            v = getVector([_x, _y], [x, y]);

            // draw trasnverse line
            p1 = [
                _x + l * Math.cos(v.angle + skew - PI/2),
                _y + l * Math.sin(v.angle + skew - PI/2),
            ];
            p2 = [
                _x + l * Math.cos(v.angle + skew + PI/2),
                _y + l * Math.sin(v.angle + skew + PI/2),
            ];


            //ctx.strokeStyle = fg;

            ctx.beginPath();
            ctx.moveTo(...p1);
            ctx.lineTo(...p2);
            ctx.stroke();

            // update point
            _x = x;
            _y = y;
        }
    }



    // Create another canvas

    let ref = document.querySelector('#ref');
    if (!ref) {
        ref = document.createElement('canvas');
        ref.setAttribute('id','ref');
        ref.setAttribute('width', cw);
        ref.setAttribute('height', ch);
        ref.className = 'artContainer';
        //document.querySelector('body').appendChild(ref);
    }
    let rctx = ref.getContext('2d', { willReadFrequently: true });

    rctx.fillStyle = 'black';
    rctx.fillRect(0, 0, cw, ch);

    rctx.strokeStyle = 'white';
    //rctx.lineWidth = weight * 2; // exclusion based on stroke


    // Function checks reference canvas at x, y and returns true
    // if it is in bounds, and false if it is out of bounds.
    // Eval is based on white in-bounds, black out-of-bounds
    function checkBounds(x, y) {
        let sample = rctx.getImageData(x, y, 1, 1).data;
        // just a bit higher than 1 for anti-aliasing
        return (sample[0] > 5);
    }

    function bezierX(a, b, c1, c2, t) {
        return (1 - t) ** 3 * a[0] + 3 * (1 - t) ** 2 * t * c1[0] + 3 * (1 - t) * t ** 2 * c2[0] + t ** 3 * b[0];
    }

    function bezierY(a, b, c1, c2, t) {
        return (1 - t) ** 3 * a[1] + 3 * (1 - t) ** 2 * t * c1[1] + 3 * (1 - t) * t ** 2 * c2[1] + t ** 3 * b[1];
    }

    function boundaryCurve(a, b, c1, c2, pathCount, steps, l, skew) {
        /*
        - Do bounds checking via an offscreen canvas:
            - draw the curve with a very thick stroke

        - start by doing a single step to establish vector, which
            will allow computing the transverse angle
        - have an array for each path in the track
        - step finely along the path, moving forward, and
            drifting transversely with each iteration, 
            plotting a point each time
        - the relative rate of forward and transverse movement sets
            the angle/skew of the paths
        - for each step check the bounds canvas. If the point
            is out of bounds, end the path
        - or check transverse val against max transversal???
        - when a path expires for excessive drift, start a new path at the
            minimum transversal 
        - at each step on the source side of the track, check bounds
            and add a new path if there is room
        - the end result is a set of arrays of points;
            plot them all via canvas or stitch into svg paths

        */


        let _color = ctx.strokeStyle;

        ctx.globalAlpha = 0.2;
        ctx.lineWidth = l;
        //ctx.strokeStyle = 'black';

        ctx.beginPath();
        ctx.moveTo(...a);
        ctx.bezierCurveTo(...c1, ...c2, ...b);
        ctx.stroke();
        ctx.globalAlpha = 1;

        let paths = []; // array of arrays


        paths.push({
            active: true,
            offset: 0,
            pts: []
        });

        ctx.lineWidth = 1;
        //ctx.strokeStyle = fg;

        skew = 0;

        let t = 0;
        let inc = 1/steps;

        let offset = 1/pathCount;
        console.log('offset', offset);

        let x = a[0];
        let y = a[1];
        let _x = x; // last x
        let _y = y; // last y

        // each point on curve
        //drawCircle(ctx, x, y, 10, {stroke:'red'});

        let v;
        let p1 = [0, 0]; // start point of transverse line
        let p2 = [0, 0]; // end point


        // step thru the bezier
        for (var i = 1; i <= steps; i++) {
            t = i * inc;

            x = (1 - t) ** 3 * a[0] + 3 * (1 - t) ** 2 * t * c1[0] + 3 * (1 - t) * t ** 2 * c2[0] + t ** 3 * b[0];
            y = (1 - t) ** 3 * a[1] + 3 * (1 - t) ** 2 * t * c1[1] + 3 * (1 - t) * t ** 2 * c2[1] + t ** 3 * b[1];

            // get vector from last point to this point
            v = getVector([_x, _y], [x, y]);

            let dx;
            let dy;

            // draw trasnverse line
            p1 = [
                _x + l * Math.cos(v.angle + skew - PI/2),
                _y + l * Math.sin(v.angle + skew - PI/2),
            ];
            p2 = [
                _x + l * Math.cos(v.angle + skew + PI/2),
                _y + l * Math.sin(v.angle + skew + PI/2),
            ];


            // step through paths
            paths.forEach((path) => {
                // get the lateral offset of the path using
                // the transverse line functions
                let last = path.pts[path.pts.length - 1];
                

                // add the vector of v + drift to the last point
                let next = [
                    //last[0] + 
                ]


                // check new placement for bounds

                // add point to path.pts

            });


            //ctx.strokeStyle = fg;

            // draw transverse lines
            // ctx.beginPath();
            // ctx.moveTo(...p1);
            // ctx.lineTo(...p2);
            // ctx.stroke();

            // path x and y
            let px = 0;
            let py = 0;
            let poff = 0;
            for (var j=0 ; j <= pathCount; j++) {
                let poff = j * offset;
                console.log(poff);
                px = x + (-l/2 + j * offset * l) * Math.cos(v.angle - PI/2);
                py = y + (-l/2 + j * offset * l) * Math.sin(v.angle - PI/2);
                //console.log(px, py);
                drawCircle(ctx, px, py, 1, {fill: _color});
            }

            // update point
            _x = x;
            _y = y;
        }

        // now go back and draw all then paths
        paths.forEach((path) => {
            if (!path.pts.length) return;
            ctx.beginPath();
            ctx.moveTo(...path.pts.shift());
            path.pts.forEach((p) => {
                ctx.lineTo(p[0], p[1]);
            });
            ctx.stroke();
            //ctx.moveTo(path.pts[0][0], path.pts[0][1]);
        });


    }


    // point placement for curve

    let theta = randomInRange(0, TWOPI); // the angle of the track axis
    let alpha = randomInRange(0, TWOPI); // angle of origin offset from center
    let originOffset = SPAN * randomInRange(0, 0.1); // radius of origin offset
    let origin = [
        cw/2 + originOffset * Math.cos(alpha),
        ch/2 + originOffset * Math.sin(alpha)
    ];

    DEBUG && drawCross(ctx, ...origin, 20, {fill:'black'});

    let start = [0, 0];
    let end = [0, 0];

    let REACH = SPAN * 0.3;

    //
    start = [
        origin[0] + REACH * Math.cos(theta),
        origin[1] + REACH * Math.sin(theta)
    ];
    end = [
        origin[0] + REACH * Math.cos(theta - PI),
        origin[1] + REACH * Math.sin(theta - PI)
    ];
    // different endpoints
    let theta2 = theta - PI + PI * randomInRange(-0.3, 0.3);
    let end2 = [
        origin[0] + REACH * Math.cos(theta2),
        origin[1] + REACH * Math.sin(theta2)
    ];


    // DEBUG
    DEBUG && drawCircle(ctx, ...start, REACH/2, {stroke:'red'});
    DEBUG && drawCircle(ctx, ...end, REACH/2, {stroke:'green'});
    DEBUG && drawCircle(ctx, ...end2, REACH/2, {stroke:'blue'});


    let a1 = theta;
    let r1 = REACH * 0.5;
    let c1 = [
        origin[0] + r1 * Math.cos(a1),
        origin[1] + r1 * Math.sin(a1)
    ];
    let a2 = theta - PI;
    let r2 = REACH * 0.5;
    let c2 = [
        origin[0] + r2 * Math.cos(a2),
        origin[1] + r2 * Math.sin(a2)
    ];
    let a3 = theta + PI * randomInRange(-0.3, 0.3);
    let r3 = REACH * 0.5;
    let c3 = [
        origin[0] + r3 * Math.cos(a3),
        origin[1] + r3 * Math.sin(a3)
    ];
    let a4 = theta - PI + PI * randomInRange(-0.3, 0.3);
    let r4 = REACH * 0.5;
    let c4 = [
        origin[0] + r4 * Math.cos(a4),
        origin[1] + r4 * Math.sin(a4)
    ];


    // Set steps, thickness and separation of lines, skew

    let steps = Math.round(REACH * randomInRange(0.15, 0.35));
    let weight = REACH / steps * randomInRange(0.33, 0.66);
    ctx.lineWidth = weight;
    // console.log(`${Math.round(steps)} steps over ${Math.round(REACH)}px; ${(REACH/steps).toPrecision(3)}px per interval; ${weight.toPrecision(3)}px lines`);
    let trackWidth = LONG * randomInRange(0.1, 0.3);
    let skew = PI * 0.3 * randomInRange(-1, 1);


    if (Math.random() < 0.3) {
        fg2 = fg;
    }

    let renderModes = [

        () => {
            console.log('same endpoints, different controls');
            ctx.strokeStyle = fg;
            stepCurve(start, end, c1, c2, steps, trackWidth, skew);
            ctx.strokeStyle = fg2;
            stepCurve(start, end, c3, c4, steps, trackWidth, skew);
        },

        () => {
            console.log('same start, different end, different controls');
            ctx.strokeStyle = fg;
            stepCurve(start, end, c1, c2, steps, trackWidth, skew);
            ctx.strokeStyle = fg2;
            stepCurve(start, end2, c3, c4, steps, trackWidth, skew);
        },

        () => {
            console.log('same start, different end, shared control');
            ctx.strokeStyle = fg;
            stepCurve(start, end, c1, c2, steps, trackWidth, skew);
            ctx.strokeStyle = fg2;
            stepCurve(start, end2, c1, c4, steps, trackWidth, skew);
        },

        // stepCurve(start, end, origin, origin, 150, 200);
        // stepCurve(start, end2, origin, origin, 150, 200);

    ];

    //randItem(renderModes)();


    let pathCount = 80;

    ctx.strokeStyle = 'red';
    boundaryCurve(start, end, c1, c2, pathCount, steps, trackWidth, skew);

    ctx.strokeStyle = 'blue';
    boundaryCurve(start, end2, c1, c4, pathCount, steps, trackWidth, skew);

    ctx.strokeStyle = fg;
    //stepCurve(start, end, c1, c2, steps, trackWidth, skew);
    
    ctx.strokeStyle = fg2;
    //stepCurve(start, end2, c1, c4, steps, trackWidth, skew);





    // Finish up
    // --------------------------------------

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


