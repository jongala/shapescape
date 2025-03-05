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
    bg = randItem(['#fcf9f0','#f3f2f1','#f4f9fb','#f6f4f2']);

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


    // Draw Stuff
    // --------------------------------------


    function boundaryCurve(a, b, c1, c2, pathCount, steps, l, drift) {
        /*

        - make an array of path objects, which have points and track
            their transverse offset and active/inactive status
        - start at point a, then proceed from step 1 (vs 0)
        - step finely along the path, moving forward, adding points to
            each path as you go. At each step, drift transversely.
        - the relative rate of forward and transverse movement sets
            the angle/skew of the paths
        - for each step check transverse offset against the track width
            and deactivate when it exceeds bounds
        - track drift and when we have drifted by the spacing between paths
            add another path
        - the end is a set of path objects with their points; when complete
            plot them all via canvas or stitch into svg paths

        */

        let curveLength = estimateCurveLength(a, b, c1, c2);
        let normalizedStep = curveLength/steps;
        console.log(`curve length about ${curveLength.toPrecision(4)}px each step about ${normalizedStep.toPrecision(4)}px`);


        let spacing = l/pathCount;

        //DEBUG: directly draw the ghost of the path
        if (DEBUG) {
            let _weight = ctx.lineWidth;
            ctx.globalAlpha = 0.15;
            ctx.lineWidth = l;
            ctx.beginPath();
            ctx.moveTo(...a);
            ctx.bezierCurveTo(...c1, ...c2, ...b);
            ctx.stroke();
            ctx.globalAlpha = 1;
            ctx.lineWidth = _weight;
        }

        let paths = []; // array of arrays
        for (var i = 0; i <= pathCount; i++) {
            paths.push({
                pts:[],
                offset: l * -1/2 + i * spacing,
                active: true
            }); // push an array for each path
        }

        let t = 0;
        let inc = 1/steps;

         // normalize drift
        drift = drift || 0;
        drift = drift/100; // percentage
        // drift * N = spacing.
        // TODO: make drift normalized both to spacing and the step increment.
        // current behavior is sensitive to step count.

        // a direct percentage of the average step
        drift = normalizedStep * drift;

        // re-express as a fraction of the spacing, so we get there
        // in even numbers of steps
        // drift * N = spacing
        // drift = spacing / N
        // N = spacing / normalizedDrift
        let N = spacing / (normalizedStep * drift);
        console.log(`DRIFT: ${N.toPrecision(3)} steps for drift from ${spacing.toPrecision(3)} spacing, ${drift.toPrecision(3)} drift`);
        //drift = spacing / N;
        //drift = spacing *  3 / 5;


        console.log(`${drift.toPrecision(3)}px drift from ${spacing.toPrecision(3)}px spacing`);

        let x = a[0];
        let y = a[1];
        let _x = x; // last x
        let _y = y; // last y

        // each point on curve
        //drawCircle(ctx, x, y, 10, {stroke:'red'});

        let v; // the vector between steps

        let insert = 0; // tracks when to insert a new path

        // step thru the bezier
        for (var i = 1; i <= steps; i++) {
            t = i * inc;

            x = (1 - t) ** 3 * a[0] + 3 * (1 - t) ** 2 * t * c1[0] + 3 * (1 - t) * t ** 2 * c2[0] + t ** 3 * b[0];
            y = (1 - t) ** 3 * a[1] + 3 * (1 - t) ** 2 * t * c1[1] + 3 * (1 - t) * t ** 2 * c2[1] + t ** 3 * b[1];

            // get vector from last point to this point
            v = getVector([_x, _y], [x, y]);

            // path x and y
            let px = 0;
            let py = 0;
            let poff = l;
            let inBounds = true;
            // step through paths
            paths.forEach((path, j) => {
                path.offset += drift;
                inBounds = (path.offset > -l/2 && path.offset < l/2);
                if (inBounds) {
                    if (path.active) {
                        px = x + path.offset * Math.cos(v.angle + PI/2);
                        py = y + path.offset * Math.sin(v.angle + PI/2);
                        path.pts.push([px, py]);
                    }
                } else {
                    path.active = false;
                }
            });

            let totalDrift = i * drift;
            let offsetTracker = totalDrift % spacing;

            let creep = Math.floor(i * drift/spacing);
            let remainder = (i * drift) % spacing;
                            /* total drift % spacing */
            if (creep > insert) {
                insert = creep;
                // push to end
                // unshift to start
                if (drift > 0) {
                    paths.unshift({
                        active: true,
                        //offset: minOff - spacing,//-l/2,
                        offset: -l/2 + remainder,
                        pts: []
                    });
                }
                if (drift < 0) {
                    paths.push({
                        active: true,
                        offset: l/2 - remainder,
                        pts: []
                    });
                }
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
        });
    }


    // point placement for main curves

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
    steps *= 2;
    let trackWidth = LONG * randomInRange(0.15, 0.3);
    let skew = PI * 0.3 * randomInRange(-1, 1);
    let pathCount = 30;
    let weight = trackWidth / pathCount * randomInRange(0.13, 0.33);
    ctx.lineWidth = weight;
    console.log(`${Math.round(steps)} steps over ${Math.round(REACH)}px; ${(REACH/steps).toPrecision(3)}px per interval; ${weight.toPrecision(3)}px lines at ${(trackWidth/pathCount).toPrecision(3)}px spacing`);


    // sometimes, use the same color for both
    if (Math.random() < 0.3) {
        fg2 = fg;
    }

    // DEBUG
    fg = 'red';
    fg2 = 'blue';


    let renderModes = [

        () => {
            console.log('same endpoints, different controls');
            ctx.strokeStyle = fg;
            boundaryCurve(start, end, c1, c2, pathCount, steps, trackWidth, 50);
            ctx.strokeStyle = fg2;
            boundaryCurve(start, end, c3, c4, pathCount, steps, trackWidth, 100);
        },

        () => {
            console.log('same start, different end, different controls');
            ctx.strokeStyle = fg;
            boundaryCurve(start, end, c1, c2, pathCount, steps, trackWidth, 50);
            ctx.strokeStyle = fg2;
            boundaryCurve(start, end2, c3, c4, pathCount, steps, trackWidth, 100);
        },

        () => {
            console.log('same start, different end, shared control');
            ctx.strokeStyle = fg;
            boundaryCurve(start, end, c1, c2, pathCount, steps, trackWidth, 50);
            ctx.strokeStyle = fg2;
            boundaryCurve(start, end2, c1, c4, pathCount, steps, trackWidth, 100);
        },

        // stepCurve(start, end, origin, origin, 150, 200);
        // stepCurve(start, end2, origin, origin, 150, 200);

    ];

    // Finally: draw
    randItem(renderModes)();


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


