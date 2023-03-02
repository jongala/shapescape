import noiseUtils from './noiseutils';
import palettes from './palettes';
import { randItem, randomInRange, randomInt, resetTransform, rotateCanvas, getGradientFunction, getSolidColorFunction } from './utils';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';

const DEFAULTS = {
    container: 'body',
    palette: palettes.high_contrast,
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true,

    mode: null,
    count: 0, // 0 for auto, or an integer
    weight: 0, // 0 for auto, or 1-10 for normalized weights
    contrast: true
}

const PI = Math.PI;

// Main function
export function plants(options) {
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

    // color funcs
    let randomFill = () => "#" + Math.random().toString(16).slice(2,8);
    let getSolidFill = getSolidColorFunction(opts.palette);

    // play with these random seeds
    let a,b,c;
    a = Math.random();
    b = Math.random();
    c = Math.random();

    // shared colors
    let fg; // hold on…
    let bg = getSolidFill(); // pick bg

    // get palette of non-bg colors
    let contrastPalette = [].concat(opts.palette);
    contrastPalette.splice(opts.palette.indexOf(bg), 1);
    let getContrastColor = getSolidColorFunction(contrastPalette);
    fg = getContrastColor(); // …now set fg in contrast to bg
    let accentColor = getContrastColor();

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);


    // random points
    let p1, p2;
    p1 = [
        randomInRange(0, cw),
        randomInRange(0, ch),
    ];
    p2 = [
        randomInRange(0, cw),
        randomInRange(0, ch),
    ];

    // draw the test points
    // drawCircle(ctx, ...p1, 10, {fill:null, stroke:'red'});
    // drawCircle(ctx, ...p2, 10, {fill:null, stroke:'blue'});


    // directly draw from a to b
    function drawLineSegment(a, b) {
        ctx.beginPath();
        ctx.moveTo(...a);
        ctx.lineTo(...b);
        ctx.stroke();

        console.log(`drawLineSegment from ${a} to ${b}`);
    }

    // util
    function getAngle(a, b) {
        let dx = b[0] - a[0];
        let dy = b[1] - a[1];
        let theta = Math.atan(-dy/dx);
        if (dx < 0) {
            theta -= PI;
        }
        return theta;
    }

    // util
    function getVector(a, b) {
        let dx = b[0] - a[0];
        let dy = b[1] - a[1];
        let theta = Math.atan(-dy/dx);
        if (dx < 0) {
            theta -= PI;
        }
        let length = Math.sqrt(dx * dx + dy * dy);
        return {
            x: a[0],
            y: a[1],
            angle: theta,
            length: length
        }
    }

    // draw from x, y, by transforming the canvas and moving
    // "horizontally" for length.
    function drawSegment (x, y, angle, length) {
        ctx.translate(x, y);
        ctx.rotate(-angle);

        // draw "horizontally" from a to b
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(length, 0);
        ctx.stroke();

        let x2, y2;
        x2 = length * Math.cos(angle);
        y2 = length * Math.sin(angle);

        // reset transforms
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        console.log(`drawSegment from ${x},${y} to ${x2},${y2}, angle ${angle * 180/PI} len ${length}`);

        return [x2, y2];
    }

    // draw from a to b, by transforming the canvas and moving
    // "horizontally" across.
    // Draw with a trace of dots.
    function traceSegment (x, y, angle, length, size=3, curvature=0.2) {
        // translate to a, point toward b
        ctx.translate(x, y);
        ctx.rotate(-angle);

        // draw "horizontally" from a to b
        ctx.beginPath();
        ctx.moveTo(0, 0);


        let steps = Math.round(length);
        let inc = length / steps;
        let _x, _y;
        for (var i = 0 ; i < steps ; i++ ) {
            _x = inc * i;
            _y = curvature * length * Math.sin(i/steps * PI);
            //ctx.moveTo(inc * i, 0);
            drawCircle(ctx, _x, _y, size/2, {fill:fg});
        }

        let x2, y2;
        x2 = x + length * Math.cos(-angle);
        y2 = y + length * Math.sin(-angle);

        if (x2.toString() === 'NaN' || y2.toString() === 'NaN') {
            debugger;
        }


        // reset transforms
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        console.log(`traceSegment from ${x},${y} to ${x2},${y2}, angle ${angle * 180/PI} len ${length}`);

        return [x2, y2];
    }


    function drawTip(x, y, angle, size, color) {
        ctx.translate(x, y);
        ctx.rotate(-angle);

        color = color || 'red';

        ctx.beginPath();
        ctx.moveTo(0, 0);

        ctx.lineWidth = size;
        drawCircle(ctx, size * 1.5, 0, size * 3, {fill: color, stroke: fg});


        // reset transforms
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    var v = getVector(p1, p2);

    // test segment renderers
    // ctx.strokeStyle = '#39c';
    // drawSegment(p1[0], p1[1], v.angle, v.length);

    // ctx.strokeStyle = '#39c';
    // traceSegment(p1[0], p1[1], v.angle, v.length, 3, -0.2);




    let branches = [];


    console.log('Plants\n--------------------------------------')

    let branchCount = 10;

    for (var i = 0 ; i < branchCount ; i++) {
        branches.push({
            x: cw/branchCount * i,//randomInRange(0, cw),
            y: ch + randomInRange(0, 70),
            angle: PI/2 + randomInRange(-PI/8, PI/8),
            size: randomInRange(4, 6),
            curvature: 0.3,
            lean: randomInRange(-1, 1),
            color: 'color',
            stepCount: randomInt(6, 10),
            length: 70
        });
    }


    let diverge = PI/4;

    let splitGrowRate = 0.3; // chance to split a new branch
    let splitBudRate = 0.1; // chance to split and bud
    let stopBudRate = 0.1; // chances a stop and bud

    let growthDecay = 0.9;
    let straightening = 0.85; // sweet spot is 0.8 to 1
    let leanFactor = 0.1;
    let thinning = 0.95;

    while (branches.length) {
        branches.forEach((branch, i) => {
            // main branch propagation logic

            let curveSign = branch.stepCount % 2 ? 1 : -1;
            [branch.x, branch.y] = traceSegment(
                branch.x,
                branch.y,
                branch.angle,
                branch.length,
                branch.size,
                branch.curvature * curveSign
            );


            // update the branch
            branch.stepCount--;
            branch.length *= growthDecay; // reduce length each time
            branch.curvature *= straightening; // straighten out each time
            branch.size *= thinning; // thin out each time
            branch.angle += branch.lean * leanFactor;

            if (branch.stepCount <= 0) {
                // remove dead branches
                branches.splice(i, 1);
                drawTip(branch.x, branch.y, branch.angle, branch.size, accentColor);
            } else {
                // continue
                if (Math.random() < splitGrowRate) {
                    // split sometimes

                    // debug: highlight branch point
                    //drawCircle(ctx, branch.x, branch.y, branch.size * 5, {fill:null,stroke:'#ace'});

                    branch.angle += diverge/2 ;//* curveSign;

                    branches.push({
                        x: branch.x,
                        y: branch.y,
                        angle: branch.angle - diverge,// * curveSign,
                        size: branch.size,
                        curvature: -branch.curvature,
                        lean: branch.lean,
                        color: 'color',
                        stepCount: branch.stepCount,
                        length: branch.length
                    });
                } else if (Math.random() < splitBudRate) {
                    // stop and bud sometimes
                    branch.angle += diverge/2 ;//* curveSign;
                    drawTip(branch.x, branch.y, branch.angle + diverge, branch.size, accentColor);

                } else if (Math.random() < stopBudRate) {
                    // stop and bud sometimes
                    branch.stepCount = 0; // will draw next pass
                }
            }


        });
    }





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


