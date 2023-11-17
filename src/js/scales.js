import noiseUtils from './noiseutils';
import palettes from './palettes';
import { randItem, randomInRange, randomInt, resetTransform, rotateCanvas, getGradientFunction, getSolidColorFunction, getAngle, getVector, mapKeywordToVal } from './utils';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';


// Accepts array @options, with elements [opt, weight].
// Returns an array with each @opt inserted @weight times.
// This is a very stupid way to pick randItem from enumerable options with
// different weights for each item.
function weightedPickList(options) {
    let list = [];
    options.forEach((weighted, i) => {
        let [opt, weight] = weighted;
        for (var n = 0; n < weight; n++) {
            list.push(opt);
        }
    });
    return list;
}

// how to pick scale styles
const STYLES = weightedPickList([
    ['patches', 2],
    ['fields', 5],
    ['stripes', 1]
]);
// how much of the palette to use
const COLORDEPTHS = ['small', 'medium', 'medium', 'large'];

const DEFAULTS = {
    container: 'body',
    palette: palettes.north_beach,
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true,

    style: 'auto', // how to arrange scales
    colorDepth: 'auto', // how much of the palette to use
    edges: 'auto', // consistent edge coloring
}

const PI = Math.PI;

// Main function
export function scales(options) {
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

    // Modes and styles
    // --------------------------------------

    const STYLE = opts.style === 'auto' ? randItem(STYLES) : opts.style;
    const COLORDEPTH = opts.colorDepth === 'auto' ? randItem(COLORDEPTHS) : opts.colorDepth;
    const EDGES = opts.edges === 'auto' ? Math.random() < 0.5 : opts.edges;

    console.log(`Scales: ${STYLE}, ${COLORDEPTH} colors, edges: ${EDGES}`);


    // Color funcs
    // --------------------------------------

    let getSolidFill = getSolidColorFunction(opts.palette);

    // shared colors
    let bg = getSolidFill();

    // get palette of non-bg colors
    let contrastPalette = [].concat(opts.palette);
    contrastPalette.splice(opts.palette.indexOf(bg), 1);
    let getContrastColor = getSolidColorFunction(contrastPalette);

    // shared foregrounds
    let fg = getContrastColor();
    let fg2 = getContrastColor();
    let fg3 = getContrastColor();
    //fg3 = fg;

    // fill background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);

    // set default stroke
    ctx.strokeStyle = fg;


    // Draw Stuff
    // --------------------------------------

    // scale styles
    // --------------------------------------

    ctx.lineCap = 'round';

    let scaleFunctions = [
        function(x, y, r, c1, c2, c3) {
            // 2C simple circle
            drawCircle(ctx, x, y, r * 1.0, {fill: c1});
            drawCircle(ctx, x, y, r * 0.9, {fill: c2});
            drawCircle(ctx, x, y, r * 0.85, {fill: c1});
            drawCircle(ctx, x, y, r * 0.75, {fill: c2});
        },
        function(x, y, r, c1, c2, c3) {
            // 2C thin lines
            drawCircle(ctx, x, y, r * 1.0, {fill: c1});
            drawCircle(ctx, x, y, r * 0.9, {fill: c2});
            drawCircle(ctx, x, y, r * 0.75, {fill: c1});
            drawCircle(ctx, x, y, r * 0.65, {fill: c2});
            drawCircle(ctx, x, y, r * 0.5, {fill: c1});
            drawCircle(ctx, x, y, r * 0.4, {fill: c2});
            drawCircle(ctx, x, y, r * 0.25, {fill: c1});
            drawCircle(ctx, x, y, r * 0.15, {fill: c2});
        },
        function(x, y, r, c1, c2, c3) {
            // 2C evenly spaced rings
            drawCircle(ctx, x, y, r * 1.0, {fill: c1});
            drawCircle(ctx, x, y, r * 0.8, {fill: c2});
            drawCircle(ctx, x, y, r * 0.6, {fill: c1});
            drawCircle(ctx, x, y, r * 0.4, {fill: c2});
            drawCircle(ctx, x, y, r * 0.2, {fill: c1});
        },
        function(x, y, r, c1, c2, c3) {
            // 3C thin middle ring
            drawCircle(ctx, x, y, r * 1.0, {fill: c1});
            drawCircle(ctx, x, y, r * 0.9, {fill: c2});
            drawCircle(ctx, x, y, r * 0.6, {fill: c3});
            drawCircle(ctx, x, y, r * 0.5, {fill: c2});
            drawCircle(ctx, x, y, r * 0.2, {fill: c3});
        },
        function(x, y, r, c1, c2, c3) {
            // 3C twin middle ring
            drawCircle(ctx, x, y, r * 1.0, {fill: c1});
            drawCircle(ctx, x, y, r * 0.9, {fill: c2});
            drawCircle(ctx, x, y, r * 0.7, {fill: c3});
            drawCircle(ctx, x, y, r * 0.6, {fill: c2});
            drawCircle(ctx, x, y, r * 0.5, {fill: c3});
            drawCircle(ctx, x, y, r * 0.4, {fill: c2});
            drawCircle(ctx, x, y, r * 0.2, {fill: c3});
        },
        function(x, y, r, c1, c2, c3) {
            // 3C dots
            let lineWidth = r * 0.25;
            ctx.lineWidth = lineWidth;
            ctx.setLineDash([0, lineWidth * 1.33]);
            drawCircle(ctx, x, y, r * 1.0, {fill: c1});
            drawCircle(ctx, x, y, r * 0.9, {fill: c2});
            drawCircle(ctx, x, y, r * 0.55, {fill: null, stroke: c3});
            drawCircle(ctx, x, y, r * 0.2, {fill: c1});
            // reset line dashes for other renderers
            ctx.setLineDash([]);
        },
        function(x, y, r, c1, c2, c3) {
            // 3C double dots
            let lineWidth = r * 0.175;
            ctx.lineWidth = lineWidth;
            ctx.setLineDash([0, lineWidth * 1.5]);
            drawCircle(ctx, x, y, r * 1.0, {fill: c1});
            drawCircle(ctx, x, y, r * 0.9, {fill: c2});
            drawCircle(ctx, x, y, r * 0.675, {fill: null, stroke: c3});
            drawCircle(ctx, x, y, r * 0.425, {fill: null, stroke: c3});
            drawCircle(ctx, x, y, r * 0.2, {fill: c3});
            ctx.setLineDash([]);
        }
    ];

    let scaleRenderer = randItem(scaleFunctions);
    //scaleRenderer = scaleFunctions[scaleFunctions.length-1];


    // grid stuff
    // --------------------------------------

    let v_spacing = 0.3; // .5 or less
    let h_spacing = 0.915; //

    // map spacing from v to h
    // .1 -> .75
    // .2 -> .8
    // .23 -> .845
    // .25 -> .85
    // .28 -> .90
    // .3 -> .915
    // .3333 -> .93 // .3333 and above shows full center dots
    // .4 -> .96
    // .5 -> 1


    let ref = randomInt(10, 15); // horizontal reference count
    ref = Math.round(cw / randomInRange(60, 90));
    let size = Math.round(cw / ref);
    let xcount = Math.ceil(cw / size * 1 / h_spacing) + 2;
    let ycount = Math.ceil(ch / size) * 1 / v_spacing + 2;
    let count = xcount * ycount;


    let pts = [];
    let x, y;
    for (var j = 0 ; j < ycount ; j++) {
        for (var i = 0; i <= xcount ; i++) {
            x = size * i * h_spacing;// + size / 2;
            if (j % 2) x += size/2 * h_spacing;
            y = j * size * v_spacing;// + size / 2;
            pts.push([x, y]);
        }
    }

    // end grid
    // --------------------------------------


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

    // a set of independent transforms to use while rendering
    let trans = {
        style: createTransform(0, 3),
        color: createTransform(0, 3),
    }

    let xnorm, ynorm;

    let renderSet = [].concat(scaleFunctions);
    renderSet.sort(()=>Math.random()-0.5);



    let clusterNodes = [];
    if (STYLE === 'patches') {
        // Scatter a point for each rendering style we have
        // At render time, we will check to see which clusterNode a given scale
        // is closest to, then use the renderer with the same index as its
        // closest node.
        renderSet.forEach((p, i)=>{
            // Use x,y between 0 and 1 because we will compare to normalize coords
            clusterNodes.push([ randomInRange(0, 1), randomInRange(0, 1) ]);
        });
    }

    // set up vars for color cycling across styles
    let styleCount = renderSet.length;
    let [c1, c2, c3] = [fg, fg2, fg3];

    // How many times through the style set?
    // Run through more times for large COLORDEPTH
    let CYCLES = 1;
    if (COLORDEPTH === 'large') {
        CYCLES = 2;
    }


    // Finally: step through the points in the scale placements, and draw
    // a scale at each point
    pts.forEach((p, i) => {
        x = p[0];
        y = p[1];
        xnorm = x/cw;
        ynorm = y/ch;

        let renderIndex = 0;

        //console.log(Math.floor(ynorm * (scaleFunctions.length - 1)));

        if (STYLE === 'patches') {
            // pick renderer closest to this point
            let minR = 2; // max squared dimension for normalized vals
            let R;
            clusterNodes.forEach((n, i)=>{
                let dx = xnorm - n[0];
                let dy = ynorm - n[1];
                R = dx * dx + dy * dy;
                if (R < minR) {
                    minR = R;
                    renderIndex = i;
                }
                //console.log(`renderer ${i}: ${R}`);
            });
            //console.log(`picked renderer ${renderIndex} with distance ${R}`);
            scaleRenderer = renderSet[renderIndex];

            // Define colors from the contrast palette,
            // aligned to the render styles.
            // Stepping through by index this way ensures that adjacent
            // styles share some colors
            if (COLORDEPTH !== 'small') {
                c1 = contrastPalette[(renderIndex + 0) % contrastPalette.length];
                c2 = contrastPalette[(renderIndex + 1) % contrastPalette.length];
                c3 = contrastPalette[(renderIndex + 2) % contrastPalette.length];
            }
            if (EDGES) {
                c1 = bg;
            }
        } else if (STYLE === 'fields') {

            // field term is periodic function, pushed into postive vals
            let f = (trans.style(xnorm, ynorm) + 1)/2;
            let renderIndex = Math.round( f * (renderSet.length - 1) * CYCLES);

            scaleRenderer = renderSet[renderIndex % renderSet.length];

            // Define colors from the contrast palette,
            // aligned to the render styles.
            // Stepping through by index this way ensures that adjacent
            // styles share some colors
            if (COLORDEPTH !== 'small') {
                c1 = contrastPalette[(renderIndex + 0) % contrastPalette.length];
                c2 = contrastPalette[(renderIndex + 1) % contrastPalette.length];
                c3 = contrastPalette[(renderIndex + 2) % contrastPalette.length];
            }
            if (EDGES) {
                c1 = bg;
            }
        } else {
            // STYLE === 'stripes'
            // draw in bands based on ynorm
            renderIndex = Math.round(ynorm * (renderSet.length - 1));
            scaleRenderer = renderSet[renderIndex];

            // Define colors from the contrast palette,
            // aligned to the render styles.
            // Stepping through by index this way ensures that adjacent
            // styles share some colors
            if (COLORDEPTH !== 'small') {
                c1 = contrastPalette[(renderIndex + 0) % contrastPalette.length];
                c2 = contrastPalette[(renderIndex + 1) % contrastPalette.length];
                c3 = contrastPalette[(renderIndex + 2) % contrastPalette.length];
            }
            if (EDGES) {
                c1 = bg;
            }
        }

        scaleRenderer(x, y, size/2, c1, c2, c3);
    });

    // debug: draw the reference nodes
    // ctx.font = '14px sans-serif';
    // ctx.textAlign = 'center';
    // ctx.textBaseline = 'middle'
    // clusterNodes.forEach((n, i)=>{
    //     drawCircle(ctx, cw * n[0], ch * n[1], 10, {fill: 'black'});
    //     ctx.fillStyle = 'white';
    //     ctx.fillText(i, cw * n[0], ch * n[1]);
    // });


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


