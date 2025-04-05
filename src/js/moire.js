import noiseUtils from './noiseutils';
import palettes from './palettes';
import { randItem, randomInRange, randomInt, resetTransform, rotateCanvas, getGradientFunction, getSolidColorFunction, getAngle, getVector, mapKeywordToVal, Note } from './utils';
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

const DEBUG = true;

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

    let note = new Note();


    // Color funcs
    // --------------------------------------

    let getSolidFill = getSolidColorFunction(opts.palette);

    // shared colors
    let bg = getSolidFill();
    //bg = randItem(['#fcf9f0','#f3f2f1','#f4f9fb','#f6f4f2']);

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


    function estimateCurveLength(a, b, c1, c2) {
        let direct = getVector(a, b).length;
        let hull = 0;
        hull += getVector(a, c1).length;
        hull += getVector(c1, c2).length;
        hull += getVector(c2, b).length;
        return .6 * direct + .4 * hull;
    }

    function getCurveLength(stepVectors) {
        return stepVectors.reduce((len, v, i, vecs) => {
            return len + v.length;
        }, 0);
    }


    // Draw Stuff
    // --------------------------------------

    function curveToSteps(a, b, c1, c2, steps) {
        /*
        step thru the bezier curve from @a to @b, with control points
        @c1 and @c2 in @steps steps.
        Return an array of vectors from each point to the next, in the form of
        @getVector objects
        */
        let vectors = [];

        let curveLength = estimateCurveLength(a, b, c1, c2);
        let normalizedStep = curveLength/steps;
        DEBUG && note.add(`curve length from ${steps} steps about ${curveLength.toPrecision(4)}px each step about ${normalizedStep.toPrecision(4)}px`);

        let t = 0;
        let inc = 1/steps;

        let x = a[0];
        let y = a[1];
        let _x = x; // last x
        let _y = y; // last y

        let v; // the vector between steps

        // step thru the bezier
        for (var i = 1; i <= steps; i++) {
            t = i * inc;

            x = (1 - t) ** 3 * a[0] + 3 * (1 - t) ** 2 * t * c1[0] + 3 * (1 - t) * t ** 2 * c2[0] + t ** 3 * b[0];
            y = (1 - t) ** 3 * a[1] + 3 * (1 - t) ** 2 * t * c1[1] + 3 * (1 - t) * t ** 2 * c2[1] + t ** 3 * b[1];

            // get vector from last point to this point
            v = getVector([_x, _y], [x, y]);

            vectors.push(v);

            // update point
            _x = x;
            _y = y;
        }

        return vectors;
    }

    function stepsToPaths(stepVectors, pathCount, trackWidth, drift) {
        /*
        Take a set of vectors representing a piecewise bezier track.
        Make an array of @pathCount path objects, and push points in them
        adding @drift as you go.
        Check against @trackWidth to expire paths as they exceed bounds.
        Draw all the paths at the end.
        */

        let spacing = trackWidth/pathCount;
        let offsetBoundary = trackWidth/2;

        let paths = []; // array of arrays
        for (var i = 0; i <= pathCount; i++) {
            paths.push({
                pts:[],
                offset: -offsetBoundary + i * spacing,
                active: true
            }); // push an array for each path
        }

        note.add(`Track width ${trackWidth.toPrecision(4)}px`);

        // default drift and then process as percentage of a 45deg angle
        drift = drift || 0;
        let driftAngle = (drift / 100) * PI/4; // 100 is 45deg
        note.add(`Input drift is ${drift.toPrecision(3)}, about ${(driftAngle).toPrecision(3)} rad`);

        /*
            Either 1 or -1. Will work with the vector angle to set
            direction of drift. Keeping drift positive and switching
            direction with this allows simpler bounds checking and
            insertion of new paths.
        */
        let direction = 1;

        // tracking cumulative drift until we insert the next path
        let offsetRatchet = 0;

        stepVectors.forEach((v, i) => {
            // path x and y
            let px = 0;
            let py = 0;

            let stepDrift = v.length * Math.sin(driftAngle);

            // step through paths
            paths.forEach((path, j) => {
                /*
                    Paths can be:
                    1. out of bounds on the negative side, drifting in
                    2. in bounds, drifting out
                    3. out of bounds on positive side, never to return
                */
                if (path.active) {
                    px = v.x + path.offset * Math.cos(v.angle + direction * PI/2);
                    py = v.y + path.offset * Math.sin(v.angle + direction * PI/2);

                    if (path.offset > -offsetBoundary && path.offset < offsetBoundary) {
                        path.pts.push([px, py]);
                    }
                }
                // only check positive bound to deactivate; if it is below
                // negative bound it is drifting in and should stay active
                if (path.active && path.offset > offsetBoundary) {
                    path.active = false;
                }

                path.offset += stepDrift;
            });

            offsetRatchet += stepDrift;

            if (offsetRatchet >= spacing ) {
                let offsetRemainder = offsetRatchet - spacing;
                paths.unshift({
                    active: true,
                    //offset: minOff - spacing,//-l/2,
                    offset: -offsetBoundary + offsetRemainder,
                    pts: []
                });
                offsetRatchet = offsetRemainder;
            }
        });

        return paths;
    }


    // actually draw paths to canvas
    function drawPaths(paths) {
        // now go back and draw all then paths
        paths.forEach((path) => {
            if (!path.pts.length) return;
            ctx.beginPath();
            ctx.moveTo(...path.pts.shift());
            path.pts.forEach((p) => {
                ctx.lineTo(p[0], p[1]);
            });
            ctx.stroke();
        });
    }


    // Convenience function composing curveToSteps and stepsToPaths
    function drawSegment(a, b, c1, c2, steps, pathCount, trackWidth, drift) {
        let vectors = curveToSteps(a, b, c1, c2, steps);
        drawPaths(stepsToPaths(vectors, pathCount, trackWidth, drift));
    }


    // --------------------------------------
    //
    // point placement for main curves
    //
    // --------------------------------------

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

    // create start and end points
    start = [
        origin[0] + REACH * Math.cos(theta),
        origin[1] + REACH * Math.sin(theta)
    ];
    end = [
        origin[0] + REACH * Math.cos(theta - PI),
        origin[1] + REACH * Math.sin(theta - PI)
    ];

    let startControlLength = REACH * randomInRange(0.6, 0.7);
    let startControlPt = [
        origin[0] + startControlLength * Math.cos(theta),
        origin[1] + startControlLength * Math.sin(theta)
    ];

    let endControlLength = REACH * randomInRange(0.6, 0.7);
    let endControlPt = [
        origin[0] + endControlLength * Math.cos(theta - PI),
        origin[1] + endControlLength * Math.sin(theta - PI)
    ];

    DEBUG && drawCircle(ctx, ...startControlPt, 20, {stroke:'green'});
    DEBUG && drawCircle(ctx, ...endControlPt, 20, {stroke:'red'});

    let midTheta = randomInRange(0, TWOPI);
    let midReach = REACH * randomInRange(0.1, 0.6);
    let mid = [
        origin[0] + midReach * Math.cos(midTheta),
        origin[1] + midReach * Math.sin(midTheta)
    ];

    let centerSkewAngle = theta + 0.25 * randomInRange(-PI, PI);
    let centerSkewAmount = REACH * randomInRange(0.4, 0.4);
    let cc1 = [
        mid[0] + centerSkewAmount * Math.cos(centerSkewAngle),
        mid[1] + centerSkewAmount * Math.sin(centerSkewAngle)
    ];
    let cc2 = [
        mid[0] + centerSkewAmount * Math.cos(centerSkewAngle - PI),
        mid[1] + centerSkewAmount * Math.sin(centerSkewAngle - PI)
    ];

    if (DEBUG) {
        ctx.strokeStyle = '#ff0099';
        ctx.beginPath();
        ctx.moveTo(...cc1);
        ctx.lineTo(...cc2);
        ctx.stroke();
    }

    DEBUG && drawCircle(ctx, ...cc1, 20, {stroke:'#f09'});
    DEBUG && drawCircle(ctx, ...cc2, 20, {stroke:'#f09'});


    // different endpoints
    let theta2 = theta - PI + PI * randomInRange(-0.3, 0.3);
    let end2 = [
        origin[0] + REACH * Math.cos(theta2),
        origin[1] + REACH * Math.sin(theta2)
    ];


    // DEBUG
    DEBUG && drawCircle(ctx, ...start, REACH/3, {stroke:'green'});
    DEBUG && drawCircle(ctx, ...end, REACH/3, {stroke:'red'});
    DEBUG && drawCircle(ctx, ...mid, 20, {stroke:'#ff0099'});
    DEBUG && drawCircle(ctx, ...mid, centerSkewAmount, {stroke:'#ff0099'});

    // Set control points relative to the track axis
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
    steps *= 4;
    let trackWidth = LONG * randomInRange(0.15, 0.3);
    let skew = PI * 0.3 * randomInRange(-1, 1);
    let pathCount = randomInt(15, 30);
    let weight = trackWidth / pathCount * randomInRange(0.13, 0.33);
    ctx.lineWidth = weight;
    DEBUG && note.add(`${Math.round(steps)} steps over ${Math.round(REACH)}px; ${(REACH/steps).toPrecision(3)}px per interval; ${weight.toPrecision(3)}px lines at ${(trackWidth/pathCount).toPrecision(3)}px spacing`);


    // sometimes, use the same color for both
    if (Math.random() < 0.3) {
        fg2 = fg;
    }

    // DEBUG
    // fg = 'red';
    // fg2 = 'blue';

    // for drift, 100 is 45deg, and 0 is parallel with path
    let drift1 = randomInRange(10, 120);
    let drift2 = randomInRange(10, 120);
    // usually sync drift so the angles match
    if (Math.random() < .80) drift2 = drift1;


    let renderModes = [

        () => {
            note.add('same endpoints, different controls');
            ctx.strokeStyle = fg;
            drawSegment(start, end, c1, c2, steps, pathCount,  trackWidth, drift1);
            ctx.strokeStyle = fg2;
            drawSegment(start, end, c3, c4, steps, pathCount, trackWidth, drift2);
        },

        () => {
            note.add('same start, different end, different controls');
            ctx.strokeStyle = fg;
            drawSegment(start, end, c1, c2, steps, pathCount,  trackWidth, drift1);
            ctx.strokeStyle = fg2;
            drawSegment(start, end2, c3, c4, steps, pathCount,  trackWidth, drift2);
        },

        () => {
            note.add('same start, different end, shared control');
            ctx.strokeStyle = fg;
            drawSegment(start, end, c1, c2, steps, pathCount,  trackWidth, drift1);
            ctx.strokeStyle = fg2;
            drawSegment(start, end2, c1, c4, steps, pathCount,  trackWidth, drift2);
        },

        // stepCurve(start, end, origin, origin, 150, 200);
        // stepCurve(start, end2, origin, origin, 150, 200);

    ];

    // Finally: draw
    // randItem(renderModes)();

    //steps = steps/2;


    ctx.strokeStyle = fg;
    //boundaryCurve(start, mid, startControlPt, cc1, pathCount, steps, trackWidth, drift1);
    //boundaryCurve(mid, end, cc2, endControlPt, pathCount, steps, trackWidth, drift1);

    //drift1 = drift2 = 0;

    // test: concat both segments into a single vector set, then draw it
    let vecs1 = curveToSteps(start, mid, startControlPt, cc1, 1000);
    let vecs2 = curveToSteps(mid,   end, cc2, endControlPt, 1000);


    // Balance the number of steps between segments.
    // Measure each segment with fine step count, get fraction of total length,
    // then recalculate each segemt with its portion of the final step count.

    let len1 = getCurveLength(vecs1);
    let len2 = getCurveLength(vecs2);

    DEBUG && note.add(`Segment lengths ${len1.toPrecision(4)}px and ${len2.toPrecision(4)}px, total ${(len1 + len2).toPrecision(4)}px`);;

    let steps1 = Math.round(steps * len1/(len1 + len2));
    let steps2 = Math.round(steps * len2/(len1 + len2));

    vecs1 = curveToSteps(start, mid, startControlPt, cc1, steps1);
    vecs2 = curveToSteps(mid,   end, cc2, endControlPt, steps2);

    let allVectors = [].concat( vecs1 ).concat( vecs2 );

    DEBUG && note.add(`Corrected steps: ${steps1} and ${steps2}, from ${steps}`);

    // Draw it
    drawPaths(stepsToPaths(allVectors, pathCount, trackWidth, drift1));

    // output any notes
    note.log();

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


