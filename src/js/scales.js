import noiseUtils from './noiseutils';
import palettes from './palettes';
import { randItem, randomInRange, randomInt, resetTransform, rotateCanvas, getGradientFunction, getSolidColorFunction, getAngle, getVector, mapKeywordToVal } from './utils';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';

const DEFAULTS = {
    container: 'body',
    palette: palettes.north_beach,
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true
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

    ctx.lineCap = 'round';

    let scaleSimple = function(x, y, r, c1, c2, c3) {
        drawCircle(ctx,
            x,
            y,
            r,
            {fill: c1, stroke: c2}
        );
    }


    let scaleRings = function(x, y, r, c1, c2, c3) {
        drawCircle(ctx, x, y, r * 1.0, {fill: c1});
        drawCircle(ctx, x, y, r * 0.8, {fill: c2});
        drawCircle(ctx, x, y, r * 0.6, {fill: c1});
        drawCircle(ctx, x, y, r * 0.4, {fill: c2});
        drawCircle(ctx, x, y, r * 0.2, {fill: c1});
    }

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
        }
    ];

    let scaleRenderer = randItem(scaleFunctions);
    //scaleRenderer = scaleFunctions[scaleFunctions.length-1];


    // grid stuff

    let v_spacing = 0.3; // .5 or less
    let h_spacing = 0.9; //

    // .1 -> .75
    // .2 -> .8
    // .25 -> .83
    // .3 -> .9
    // .3333 -> .93
    // .4 -> .96
    // .5 -> 1


    let ref = randomInt(10, 15); // horizontal reference count
    ref = Math.round(cw / randomInRange(60, 90));
    let size = Math.round(cw/ref * h_spacing);
    let xcount = Math.ceil(cw / size) + 2;
    let ycount = Math.ceil(ch / size) * 1/v_spacing + 2;
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


    let xnorm, ynorm;

    let renderSet = [].concat(scaleFunctions);
    renderSet.sort(()=>Math.random()-0.5);


    let PATCHES = true;
    let clusterNodes = [];
    if (PATCHES) {
        // scatter N points for N renderers
        renderSet.forEach((p, i)=>{
            // push an x,y between 0 and 1, we will compare to normalize coords
            clusterNodes.push([ randomInRange(0, 1), randomInRange(0, 1) ]);
        });
        // at render time, use the renderer closest to the point you are at
        console.log(clusterNodes.toString());
    }

    pts.forEach((p, i) => {
        x = p[0];
        y = p[1];
        xnorm = x/cw;
        ynorm = y/ch;

        //console.log(Math.floor(ynorm * (scaleFunctions.length - 1)));

        if (PATCHES) {
            // pick renderer closest to this point
            let minR = 2; // max squared dimension for normalized vals
            let renderIndex = null;
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
        } else {
            // draw in bands based on ynorm
            scaleRenderer = renderSet[Math.round(ynorm * (renderSet.length - 1))];
        }

        scaleRenderer(x, y, size/2, fg, fg2, fg3);
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


    // reset line dashes for other renderers
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;


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


