import noiseUtils from './noiseutils';
import palettes from './palettes';
import { randItem, randomInRange, randomInt, resetTransform, rotateCanvas, getGradientFunction, getSolidColorFunction, getAngle, getVector, mapKeywordToVal, shuffle } from './utils';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';

const DEFAULTS = {
    container: 'body',
    palette: palettes.de_stijl,
    addNoise: 0.04,
    noiseInput: null,
    clear: true,
}

const PI = Math.PI;

// Main function
export function tricycles(options) {
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

    let getContrastSequence = function(i) {
        return contrastPalette[i % contrastPalette.length];
    }

    // shared foregrounds
    let fg = getContrastColor();
    let fg2 = getContrastColor();
    let fg3 = getContrastColor();

    // fill background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);

    // set default stroke
    ctx.strokeStyle = fg;


    let LINE1 = Math.max(SCALE/400, 1);
    let LINE2 = LINE1/2;

    ctx.lineWidth = LINE1;


    // Draw Stuff
    // --------------------------------------

    function avgPoints(points) {
        var avg=[0, 0];
        avg[0] = points.reduce(function (m, v) { return m + v[0]; }, 0) / points.length;
        avg[1] = points.reduce(function (m, v) { return m + v[1]; }, 0) / points.length;
        return avg;
    }

    function circumcenter(a, b, c) {
        var ax = a[0];
        var ay = a[1];
        var bx = b[0];
        var by = b[1];
        var cx = c[0];
        var cy = c[1];

        // midpoints
        var midAB = avgPoints([a, b]);
        var midAC = avgPoints([a, c]);

        // slopes
        var mAB = (by - ay) / (bx - ax);
        var mAC = (cy - ay) / (cx - ax);
        // invert for perpendicular
        mAB = -1/mAB;
        mAC = -1/mAC;

        // offsets
        var bAB = midAB[1] - mAB * midAB[0];
        var bAC = midAC[1] - mAC * midAC[0];

        var CCx;
        var CCy;

        // algebra!
        CCx = (bAC - bAB) / (mAB - mAC);
        CCy = mAB * CCx + bAB;

        var dx = CCx - ax;
        var dy = CCy - ay;
        var r = Math.sqrt(dx * dx + dy * dy);

        return {x: CCx, y: CCy, r: r};
    }


    function drawTriPoints(ctx, p1, p2, p3, color) {
        ctx.beginPath();
        ctx.moveTo(...p1);
        ctx.lineTo(...p2);
        ctx.lineTo(...p3);
        ctx.closePath();
        ctx.strokeStyle = color;
        ctx.stroke();
    }

    // draw four points
    // two will be in common between both circles
    // the other two will each define a third point for two circles

    let points = [];

    points.push([randomInt(0, cw/2), randomInt(0, ch/2)]);
    points.push([randomInt(cw/2, cw), randomInt(0, ch/2)]);
    points.push([randomInt(0, cw/2), randomInt(ch/2, ch)]);
    points.push([randomInt(cw/2, cw), randomInt(ch/2, ch)]);

    points = shuffle(points);


    let circles = [];

    for (var i = 0; i < points.length - 2; i++) {
        let c = circumcenter(...points.slice(i, i + 3));

        let color = getContrastSequence(i);

        ctx.lineWidth = LINE2;
        ctx.setLineDash([LINE2 * 9, LINE2 * 6]);
        drawTriPoints(ctx, ...points.slice(i, i + 3), color);
        ctx.lineWidth = LINE1;
        ctx.setLineDash([]);

        //drawCircle(ctx, c.x, c.y, SCALE/100, {fill: color});
        drawCircle(ctx, c.x, c.y, c.r, {stroke: color});

        // center to circle
        // ctx.strokeStyle = color;
        // ctx.beginPath();
        // ctx.moveTo(c.x, c.y);
        // ctx.lineTo(...points[i]);
        // ctx.stroke();

        circles.push(c);
    }


    // ---

    // draw connecting bar between shared points
    // ctx.strokeStyle = fg;
    // ctx.beginPath();
    // ctx.moveTo(...points[1]);
    // ctx.lineTo(...points[2]);
    // ctx.stroke();




    // ---
    // draw all points

    points.forEach((p) => {
        drawCircle(ctx, p[0], p[1], SCALE/100, {fill:fg})
    });

    // drawCircle(ctx, ...points[0], SCALE/100, {fill: fg});
    // drawCircle(ctx, ...points[1], SCALE/100, {fill: fg});
    // drawCircle(ctx, ...points[2], SCALE/100, {fill: fg});
    // drawCircle(ctx, ...points[3], SCALE/100, {fill: fg});




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


