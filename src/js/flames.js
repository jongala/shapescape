import noiseUtils from './noiseutils';
import palettes from './palettes';
import { randItem, randomInRange, randomInt, resetTransform, rotateCanvas, getGradientFunction, getSolidColorFunction, getAngle, getVector, mapKeywordToVal } from './utils';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon, drawLine, drawCross } from './shapes';

const DEFAULTS = {
    container: 'body',
    palette: palettes.torch,
    addNoise: 0.04,
    noiseInput: null,
    clear: true,
}

const PI = Math.PI;

// Main function
export function flames(options) {
    let opts = Object.assign({}, DEFAULTS, options);

    let container = opts.container;
    let cw = container.offsetWidth;
    let ch = container.offsetHeight;
    let SCALE = Math.min(cw, ch);
    let LONG = Math.max(cw, ch);
    let SHORT = Math.min(cw, ch);
    const AREA = cw * ch;
    const ASPECT = LONG/SHORT;

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

    // fill background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);

    // set default stroke
    ctx.strokeStyle = fg;


    let DEBUG = false ;

    // Draw Stuff
    // --------------------------------------


    // pick a point anywhere

    let p1 = [
        randomInRange(cw),
        randomInRange(ch)
    ];


    let p2 = [
        randomInRange(cw),
        randomInRange(ch)
    ];

    let v = getVector(p1, p2);

    DEBUG && drawCircle(ctx, ...p1, 9, {fill: fg});
    DEBUG && drawCircle(ctx, ...p1, 39, {stroke: fg});
    DEBUG && drawCircle(ctx, ...p2, 9, {fill: fg});

    // draw center line
    // ctx.strokeStyle = fg;
    // drawLine(ctx, p1, p2);
    // ctx.stroke();

    let ctlRad = 0.4;


    let dir1 = 1;

    let angle1 = v.angle + dir1 * PI * randomInRange(0.2, 0.4);

    let c1 = [
        p1[0] + ctlRad * v.length * Math.cos(angle1),
        p1[1] + ctlRad * v.length * Math.sin(angle1)
    ];

    let angle2 = v.angle +  dir1 * PI * randomInRange(0.1, 0.2);

    let c2 = [
        p2[0] - ctlRad * v.length * Math.cos(angle2),
        p2[1] - ctlRad * v.length * Math.sin(angle2)
    ];

    DEBUG && drawCircle(ctx, ...c1, 4, {fill: fg});
    DEBUG && drawCircle(ctx, ...c2, 4, {fill: fg});

    ctx.beginPath();
    ctx.moveTo(...p1);
    ctx.bezierCurveTo(...c1, ...c2, ...p2);
    ctx.stroke();


    let angle3 = angle2 + PI * 0.2;

    let c3 = [
        p2[0] - ctlRad * v.length * Math.cos(angle3),
        p2[1] - ctlRad * v.length * Math.sin(angle3)
    ];

    DEBUG && drawCross(ctx, ...c3, 9, {stroke: fg});

    let angle4 = angle1 - PI * 0.2;

    let c4 = [
        p1[0] + ctlRad * v.length * Math.cos(angle4),
        p1[1] + ctlRad * v.length * Math.sin(angle4)
    ];

   DEBUG &&  drawCross(ctx, ...c4, 9, {stroke: fg});


    ctx.beginPath();
    ctx.moveTo(...p2);
    ctx.bezierCurveTo(...c3, ...c4, ...p1);
    ctx.stroke();



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


