import noiseUtils from './noiseutils';
import palettes from './palettes';
import { randItem, randomInRange, randomInt, resetTransform, rotateCanvas, getGradientFunction, getSolidColorFunction } from './utils';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';

const DEFAULTS = {
    container: 'body',
    palette: palettes.blush,
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true,

    splitting: 'med',
    budding: 'med',
    stopping: 'med',
    flowering: 'auto',
    divergence: 'auto', // degrees
    growthDecay: 'med',
    straightening: 'med',
    thinning: 'med',
    leaning: 'med',
    roughness: 'auto',
    knobbiness: 'med',
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

    // Props

    // map named values of props, e.g. low, med, high…
    // to values, as defined in the obj @props
    // If values are arrays, use @accessor function to pick.
    // Respect 'auto' as special case for @name
    function mapKeywordToVal (props, accessor=randomInRange) {
        let names = Object.keys(props);

        return function(name, label='param') {
            if (name === 'auto' || name === 'AUTO') {
                name = randItem(names);
                console.log(`${label}: auto picked ${name}`);
            }
            if (props[name] === undefined) {
                name = names[0];
                console.log(`${label}: fell back to ${name}`);
            }
            let val = props[name];
            if (Array.isArray(val)) {
                return accessor(...val);
            } else {
                return val;
            }
        }
    }

    // hello world
    console.log('--------------------------------------\nPlants')


    const SPLITTING =  mapKeywordToVal({
        'low': 0.2,
        'med': 0.3,
        'high': 0.4
    })(opts.splitting, 'splitting');
    const BUDDING =  mapKeywordToVal({
        'low': 0.2,
        'med': 0.3,
        'high': 0.5
    })(opts.budding, 'budding');
    const STOPPING = mapKeywordToVal({
        'low': 0.1,
        'med': 0.2,
        'high': 0.3
    })(opts.stopping, 'stopping');
    const FLOWERING = mapKeywordToVal({
        'none': 0,
        'low': 0.25,
        'med': 0.6,
        'high': 0.8,
        'all': 1
    })(opts.flowering, 'flowering');
    const DIVERGENCE = mapKeywordToVal({
        'low':  [15, 30],
        'med': [30, 60],
        'high': [60, 90]
    })(opts.divergence, 'divergence') * PI/180; //opts.divergence * PI / 180; // input is in degrees
    const GROWTHDECAY = mapKeywordToVal({
        'low': 0.9,
        'med': 0.8,
        'high': 0.7
    })(opts.growthDecay, 'decay');
    const STRAIGHTENING = mapKeywordToVal({
        'low': 1,
        'med': 0.85,
        'high': [0.7, 0.8]
    })(opts.straightening, 'straightening');
    const THINNING = mapKeywordToVal({
        'low': [0.97, 1],
        'med': [0.92, 0.95],
        'high': [0.85, 0.9]
    })(opts.thinning, 'thinning');
    const LEANING = mapKeywordToVal({
        'low': [0, 0.15],
        'med': [0.15, 0.25],
        'high': [0.25, 0.35]
    })(opts.leaning, 'leaning');
    const ROUGHNESS = mapKeywordToVal({
        'off': 0,
        'low': 0.15,
        'med': 0.2,
        'high': 0.3
    })(opts.roughness, 'roughness');
    const KNOBBINESS = mapKeywordToVal({
        'off': 0,
        'low': [0.1, 0.15],
        'med': [0.2, 0.3],
        'high': [0.25, 0.35]
    })(opts.knobbiness, 'knobbiness');


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


    // directly draw from a to b
    function drawAbsoluteLineSegment(a, b) {
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
    function drawLineSegment (x, y, angle, length) {
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

        //console.log(`drawSegment from ${x},${y} to ${x2},${y2}, angle ${angle * 180/PI} len ${length}`);

        return [x2, y2];
    }

    // draw from a to b, by transforming the canvas and moving
    // "horizontally" across.
    // Draw with a trace of dots.
    // Use ROUGHNESS for jitter, and KNOBBINESS to scatter extra dots
    // around endpoints.
    function drawSegment (x, y, angle, length, size=3, curvature=0.2, color=fg) {
        // translate to a, point toward b
        ctx.translate(x, y);
        ctx.rotate(-angle);

        // draw "horizontally" from a to b
        ctx.beginPath();
        ctx.moveTo(0, 0);

        // min size of tracing dot in case thinning takes us too far down
        size = Math.max(size, 0.75);

        length *= randomInRange(0.75, 1.25); // randomize length

        let steps = Math.round(length);
        let inc = length / steps;
        let _x, _y;
        for (var i = 0 ; i < steps ; i++ ) {
            _x = inc * i;
            _y = curvature * length * Math.sin(i/steps * PI);
            _y += randomInRange(-1, 1) * ROUGHNESS * size; // jitter
            drawCircle(ctx, _x, _y, size/2, {fill: color});
        }

        let x2, y2;
        x2 = x + length * Math.cos(-angle);
        y2 = y + length * Math.sin(-angle);


        if (KNOBBINESS > 0) {
            // draw cluster near the ends
            let bx, by;
            let knobLength = size * 2;

            const knobCount = 20;

            // near end
            for (var i = 0 ; i < knobCount ; i++ ) {
                bx = randomInRange(0, knobLength);
                by = KNOBBINESS * randItem([-1, 1]) * (knobLength - bx);
                drawCircle(
                    ctx,
                    bx,
                    by,
                    size/2,
                    {fill: color}
                );
            }
            // far end
            for (var i = 0 ; i < knobCount ; i++ ) {
                bx = randomInRange(0, knobLength);
                by = KNOBBINESS * randItem([-1, 1]) * (knobLength - bx);
                drawCircle(
                    ctx,
                    length - bx,
                    by,
                    size/2,
                    {fill: color}
                );
            }
        }

        // reset transforms
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        //console.log(`traceSegment from ${x},${y} to ${x2},${y2}, angle ${angle * 180/PI} len ${length}`);

        return [x2, y2];
    }


    // draw a bud or flower
    function drawTip(x, y, angle, size, color) {
        if (Math.random() < FLOWERING) {
            drawFlower(...arguments);
        } else {
            drawBud(...arguments);
        }
    }


    // closed, solid fg colored bud
    function drawBud(x, y, angle, size, color) {
        ctx.translate(x, y);
        ctx.rotate(-angle);

        color = color || 'red';

        ctx.beginPath();

        ctx.lineWidth = size;
        ctx.lineCap = 'round';

        let _x = size * 2;
        let len = size * randomInRange(3, 5);
        let height = size * 2;

        // draw leaf shape with two simple curves
        ctx.moveTo(_x, 0);
        ctx.quadraticCurveTo(_x + len/2, height, _x + len, 0);
        ctx.quadraticCurveTo(_x + len/2, -height, _x, 0);

        ctx.strokeStyle = fg;
        ctx.fillStyle = fg;

        ctx.fill();
        ctx.stroke();

        // reset transforms
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.setLineDash([]);
    }

    // flower with contrasting fill
    function drawFlower(x, y, angle, size, color) {
        ctx.translate(x, y);
        ctx.rotate(-angle);

        color = color || 'red';

        ctx.beginPath();

        ctx.lineWidth = size;
        ctx.lineCap = 'round';

        let _x = size * 2;
        let len = size * randomInRange(7,10);
        let height = size * 4;

        // draw leaf shape with two simple curves
        ctx.moveTo(_x, 0);
        ctx.quadraticCurveTo(_x + len/2, height, _x + len, 0);
        ctx.quadraticCurveTo(_x + len/2, -height, _x, 0);

        ctx.strokeStyle = fg;
        ctx.fillStyle = color;

        ctx.fill();
        ctx.stroke();


        // center stroke
        ctx.lineWidth *= randomInRange(0.6, 0.8);

        let dash = len * randomInRange(0.3, 0.7);
        ctx.setLineDash([dash, randomInRange(len * 0.3, dash)]);
        ctx.beginPath();
        ctx.moveTo(_x, 0);
        ctx.lineTo(_x + len, 0);
        ctx.stroke();

        //drawCircle(ctx, size * 1.5, 0, size * 3, {fill: color, stroke: fg});


        // reset transforms
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.setLineDash([]);
    }


    // --------------------------------------
    // Test objects
    // --------------------------------------

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

    var v = getVector(p1, p2);

    // test segment renderers
    // ctx.strokeStyle = '#39c';
    // drawSegment(p1[0], p1[1], v.angle, v.length);

    // ctx.strokeStyle = '#39c';
    // traceSegment(p1[0], p1[1], v.angle, v.length, 3, -0.2);

    // console.log(`Test with angle ${v.angle} (${v.angle * 180/PI})`)



    // --------------------------------------
    // Real stuff
    // --------------------------------------

    // background lines:

    let vines = [];
    let vineCount = cw / randomInRange(15, 30);
    let vineColor = getContrastColor();
    let vineWidth = cw / randomInRange(600, 1200);
    vineWidth = Math.max(vineWidth, 1);


    ctx.strokeStyle = vineColor;
    ctx.lineWidth = vineWidth;
    ctx.globalAlpha = randomInRange(0.2, 0.4);

    for (var i = 0; i < vineCount; i++) {
        let vx = cw/vineCount * (i + 1/2);
        let vh = randomInRange(ch * 0.05, ch * 0.5);
        drawLineSegment(
            vx,
            0,
            -PI/2,
            vh
        );
        drawCircle(ctx,
            vx + randomInRange(-cw/vineCount, cw/vineCount),
            randomInRange(vh/2, vh),
            cw/vineCount * randomInRange(0.5, 0.75),
            {fill: vineColor}
        );

        drawCircle(ctx,
            vx,
            vh,
            cw/vineCount * randomInRange(0.5, 0.75),
            {fill: vineColor}
        );
    }
    ctx.globalAlpha = 1;

    // Set up initial branches
    let branches = [];
    let branchCount = Math.round(cw/100);

    // Define initial branch properties
    for (var i = 0 ; i < branchCount ; i++) {
        branches.push({
            x: cw / branchCount * (i + 1/2),
            y: ch + randomInRange(0, 70),
            angle: PI/2 + randomInRange(-PI/8, PI/8),
            width: SCALE/100 * randomInRange(0.5, 0.75),
            budSize: SCALE/100 * randomInRange(0.33, 0.5),
            curvature: 0.1,
            lean: randomInRange(-1, 1),
            color: 'color',
            stepCount: randomInt(5, 7),
            length: ch / 2 / 6 / GROWTHDECAY,//SCALE / 10 / GROWTHDECAY
        });
    }



    while (branches.length) {
        branches.forEach((branch, i) => {
            // main branch propagation logic

            let curveSign = branch.stepCount % 2 ? 1 : -1;


            // remove dead branches
            if (branch.stepCount <= 0) {
                // remove dead branches
                branches.splice(i, 1);
                drawTip(branch.x, branch.y, branch.angle, branch.budSize, accentColor);
                return;
            }

            // remaining branches continue and draw,
            // then decide to split or bud



            // draw main branch

            // first in background as mask
            /*traceSegment(
                branch.x,
                branch.y,
                branch.angle,
                branch.length,
                branch.width * 3,
                branch.curvature * curveSign,
                bg
            );*/

            // then in fg
            [branch.x, branch.y] = drawSegment(
                branch.x,
                branch.y,
                branch.angle,
                branch.length,
                branch.width,
                branch.curvature * curveSign,
                fg
            );


            let splitSign;
            splitSign = curveSign * -1;

            // gap between new branch and base branch
            let splitGap = branch.width * 2;


            if (Math.random() < SPLITTING  && branch.stepCount > 1) {
                // split a new branch sometimes

                // debug: highlight branch point
                //drawCircle(ctx, branch.x, branch.y, branch.width * 5, {fill:null,stroke:'#ace'});

                // only kink new branch
                let splitAngle = branch.angle - DIVERGENCE * splitSign;

                // ok fine kink both branches a little
                let kinkFactor = (branch.lean > 0) ? 1 : -1;
                kinkFactor *= 0.3;

                branch.angle += kinkFactor * DIVERGENCE;
                splitAngle += kinkFactor * DIVERGENCE;

                // push a clean copy of the branch as a new branch.
                // add a little gap along the vector before starting the new branch
                // reverse the curvature so its ready for the next step
                branches.push(Object.assign(
                    {},
                    branch,
                    {
                        x: branch.x + splitGap * Math.cos(splitAngle),
                        y: branch.y - splitGap * Math.sin(splitAngle),
                        angle: splitAngle,
                        width: branch.width * THINNING,
                        curvature: -branch.curvature
                    }
                ));
            } else if (Math.random() < BUDDING && branch.stepCount > 1) {
                // add a bud
                //branch.angle -= diverge * splitSign;
                drawTip(branch.x, branch.y, branch.angle + DIVERGENCE, branch.budSize, accentColor);

            } else if (Math.random() < STOPPING) {
                // stop and bud
                branch.stepCount = 0; // will draw next pass
            }


            // update the branch
            branch.stepCount--;
            branch.length *= GROWTHDECAY; // reduce length each time
            branch.curvature *= STRAIGHTENING; // straighten out each time
            branch.width *= THINNING; // thin out each time
            branch.angle += branch.lean * LEANING;
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


