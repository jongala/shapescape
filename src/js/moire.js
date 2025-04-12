import noiseUtils from './noiseutils';
import palettes from './palettes';
import { randItem, randomInRange, randomInt, resetTransform, rotateCanvas, getGradientFunction, getSolidColorFunction, getAngle, getVector, mapKeywordToVal, Note } from './utils';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon, drawLine, drawCross } from './shapes';

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

    function curveToSteps(a, c1, c2, b, steps) {
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
    function drawSegment(a, c1, c2, b, steps, pathCount, trackWidth, drift) {
        let vectors = curveToSteps(a, b, c1, c2, steps);
        drawPaths(stepsToPaths(vectors, pathCount, trackWidth, drift));
    }


    // --------------------------------------
    //
    // point placement for main curves
    //
    // --------------------------------------


    let jitterPoint = function(p, r) {
        let _r = randomInRange(0, r);
        let _theta = randomInRange(Math.PI * 2);
        return [
            p[0] + _r * Math.cos(_theta),
            p[1] + _r * Math.sin(_theta)
        ];
    }

    let pointOnCanvasEllipse = function(theta, margin) {
        return [
            cw/2 + (1 - margin) * cw/2 * Math.cos(theta),
            ch/2 + (1 - margin) * ch/2 * Math.sin(theta)
        ];
    }

    /*

    input margin, theta, theta skew?

    */

    function createTrack(margin = 0.15, theta, skew) {
        let start, ctlstart, ctlm1, mid, ctlm2, ctlend, end;
        if (theta === undefined) {
            theta = randomInRange(TWOPI);
        }
        if (skew === undefined) {
            skew = PI * (1 + randomInRange(-.25, .25));
        }
        let theta2 = theta + skew;
        start = pointOnCanvasEllipse(theta, margin);
        end = pointOnCanvasEllipse(theta2, margin);
        let v = getVector(start, end);


        // mid point and controls

        mid = [
            ( start[0] + end[0] ) / 2,
            ( start[1] + end[1] ) / 2
        ];
        mid = jitterPoint(mid, v.length / 5);

        let midAngle = v.angle + PI * randomInRange(-0.2, 0.2);

        let mc1; // mid control point 1
        let mc2; // mid control point 2

        let midSpan = trackVector.length * randomInRange(0.1, 0.2);

        ctlm1 = [
            mid[0] + midSpan * Math.cos(midAngle + PI),
            mid[1] + midSpan * Math.sin(midAngle + PI)
        ];

        ctlm2 = [
            mid[0] + midSpan * Math.cos(midAngle),
            mid[1] + midSpan * Math.sin(midAngle)
        ];



        // end control points are along track by default

        ctlstart = [
            start[0] + v.length * 0.2 * Math.cos(v.angle),
            start[1] + v.length * 0.2 * Math.sin(v.angle)
        ];
        ctlend = [
            end[0] + v.length * 0.2 * Math.cos(v.angle - PI),
            end[1] + v.length * 0.2 * Math.sin(v.angle - PI)
        ];


        return [start, ctlstart, ctlm1, mid, ctlm2, ctlend, end];
    }





    let ringpts = [];
    let ringMargin = randomInRange(0.1, 0.2);


    for (var i = 0; i < 90 ; i++) {
        ringpts.push(pointOnCanvasEllipse(i * TWOPI/90, ringMargin));
    }
    ringpts.forEach((p)=> {
        drawCircle(ctx, ...p, 2, {fill:'red'});
    });

    let trackAngle1 = randomInRange(0, TWOPI);
    let trackAngle2 = trackAngle1 + PI * (1 + randomInRange(-.25, .25));

    let trackStart = pointOnCanvasEllipse(trackAngle1, ringMargin);
    let trackEnd = pointOnCanvasEllipse(trackAngle2, ringMargin);

    let trackVector = getVector(trackStart, trackEnd);

    let trackSpan = trackVector.length;

    drawCircle(ctx, ...trackStart, 6, {fill:'green'});
    drawCircle(ctx, ...trackStart, 106, {stroke:'green'});
    drawCircle(ctx, ...trackEnd, 6, {fill:'red'});
    drawCircle(ctx, ...trackEnd, 106, {stroke:'red'});


    let midTrack = [
        ( trackStart[0] + trackEnd[0] ) / 2,
        ( trackStart[1] + trackEnd[1] ) / 2
    ];
    midTrack = jitterPoint(midTrack, trackVector.length / 5);

    drawCircle(ctx, ...midTrack, 6, {fill:'magenta'});
    drawCircle(ctx, ...midTrack, 56, {stroke:'magenta'});




    let midAngle = trackVector.angle + PI * randomInRange(-0.2, 0.2);

    let mc1; // mid control point 1
    let mc2; // mid control point 2

    let midSpan = trackVector.length * randomInRange(0.1, 0.2);

    mc1 = [
        midTrack[0] + midSpan * Math.cos(midAngle + PI),
        midTrack[1] + midSpan * Math.sin(midAngle + PI)
    ]

    mc2 = [
        midTrack[0] + midSpan * Math.cos(midAngle),
        midTrack[1] + midSpan * Math.sin(midAngle)
    ]

    drawCircle(ctx, ...mc1, 6, {fill:'magenta'});
    drawCircle(ctx, ...mc2, 6, {fill:'magenta'});

    ctx.strokeStyle = 'magenta';
    drawLine(ctx, mc1, mc2);
    ctx.stroke();

    // control points for the ends
    let trackStartCtl;
    let trackEndCtl;

    trackStartCtl = [
        trackStart[0] + trackVector.length * 0.2 * Math.cos(trackVector.angle),
        trackStart[1] + trackVector.length * 0.2 * Math.sin(trackVector.angle),
    ];
    trackEndCtl = [
        trackEnd[0] + trackVector.length * 0.2 * Math.cos(trackVector.angle - PI),
        trackEnd[1] + trackVector.length * 0.2 * Math.sin(trackVector.angle - PI),
    ];
    drawCircle(ctx, ...trackStartCtl, 6, {fill:'green'});
    drawCircle(ctx, ...trackEndCtl, 6, {fill:'red'});

    ctx.strokeStyle = 'green';
    drawLine(ctx, trackStart, trackStartCtl);
    ctx.stroke();
    ctx.strokeStyle = 'red';
    drawLine(ctx, trackEnd, trackEndCtl);
    ctx.stroke();


    // Set steps, thickness and separation of lines, skew

    let steps = trackVector.length / 5;
    let trackWidth = LONG * randomInRange(0.15, 0.3);
    let pathCount = randomInt(15, 30);
    let weight = trackWidth / pathCount * randomInRange(0.13, 0.33);
    ctx.lineWidth = weight;


    // for drift, 100 is 45deg, and 0 is parallel with path
    let drift1 = randomInRange(10, 120);
    let drift2 = randomInRange(10, 120);
    // usually sync drift so the angles match
    if (Math.random() < .80) drift2 = drift1;


    // sometimes, use the same color for both
    if (Math.random() < 0.3) {
        fg2 = fg;
    }


    ctx.strokeStyle = fg;


    let createMultiSegmentTrack = function(start, ctlstart, ctlm1, mid, ctlm2, ctlend, end, steps) {
        let vecs1 = curveToSteps(start, ctlstart, ctlm1, mid, 1000);
        let vecs2 = curveToSteps(mid,  ctlm2, ctlend, end, 1000);


        // Balance the number of steps between segments.
        // Measure each segment with fine step count, get fraction of total length,
        // then recalculate each segemt with its portion of the final step count.

        let len1 = getCurveLength(vecs1);
        let len2 = getCurveLength(vecs2);

        DEBUG && note.add(`Segment lengths ${len1.toPrecision(4)}px and ${len2.toPrecision(4)}px, total ${(len1 + len2).toPrecision(4)}px`);;

        let steps1 = Math.round(steps * len1/(len1 + len2));
        let steps2 = Math.round(steps * len2/(len1 + len2));

        vecs1 = curveToSteps(start, ctlstart, ctlm1, mid, steps1);
        vecs2 = curveToSteps(mid,  ctlm2, ctlend, end, steps2);

        let allVectors = [].concat( vecs1 ).concat( vecs2 );

        DEBUG && note.add(`Corrected steps: ${steps1} and ${steps2}, from ${steps}`);

        return allVectors;
    }


    let trackParams = createTrack(0.15);
    let allVectors = createMultiSegmentTrack(...trackParams, steps);

    // DEBUG && note.add(`Corrected steps: ${steps1} and ${steps2}, from ${steps}`);

    // Draw it
    drawPaths(stepsToPaths(allVectors, pathCount, trackWidth, drift1));






    //--------------------------------------




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

    // // test: concat both segments into a single vector set, then draw it
    // let vecs1 = curveToSteps(start, mid, startControlPt, cc1, 1000);
    // let vecs2 = curveToSteps(mid,   end, cc2, endControlPt, 1000);


    // // Balance the number of steps between segments.
    // // Measure each segment with fine step count, get fraction of total length,
    // // then recalculate each segemt with its portion of the final step count.

    // let len1 = getCurveLength(vecs1);
    // let len2 = getCurveLength(vecs2);

    // DEBUG && note.add(`Segment lengths ${len1.toPrecision(4)}px and ${len2.toPrecision(4)}px, total ${(len1 + len2).toPrecision(4)}px`);;

    // let steps1 = Math.round(steps * len1/(len1 + len2));
    // let steps2 = Math.round(steps * len2/(len1 + len2));

    // vecs1 = curveToSteps(start, mid, startControlPt, cc1, steps1);
    // vecs2 = curveToSteps(mid,   end, cc2, endControlPt, steps2);

    // let allVectors = [].concat( vecs1 ).concat( vecs2 );

    // DEBUG && note.add(`Corrected steps: ${steps1} and ${steps2}, from ${steps}`);

    // // Draw it
    // drawPaths(stepsToPaths(allVectors, pathCount, trackWidth, drift1));

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


