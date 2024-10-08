import noiseUtils from './noiseutils';
import palettes from './palettes';
import { randItem, randomInRange, randomInt, resetTransform, rotateCanvas, getGradientFunction, getSolidColorFunction, getAngle, getVector, mapKeywordToVal, shuffle } from './utils';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';

const DEFAULTS = {
    container: 'body',
    palette: palettes.de_stijl,
    style: 'auto',
    addNoise: 0.04,
    noiseInput: null,
    clear: true,
}

const PI = Math.PI;
const TWOPI = PI * 2;

const STYLES = ['simple', 'complex']; // or auto

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

    // opts
    // --------------------------------------
    const STYLE = (STYLES.indexOf(opts.style) >= 0) ? opts.style : 'auto';


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
    let LINE2 = LINE1 / 2;
    let LINE3 = LINE1 / 3;

    ctx.lineWidth = LINE1;


    // Utils
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

    // function to draw @n radial lines out from a point
    function radiateFromPoint(p, n=36) {
        let step = TWOPI/n;
        let R = LONG * 3;
        let offset = randomInRange(0, PI);

        for (var i = 0; i < n; i++) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + R * Math.cos(i * step + offset), p.y + R * Math.sin(i * step + offset) );
            ctx.stroke();
        }
    }

    // function to draw many circles around a point
    function outwardRings(p, n=36, color) {
        let outerR = LONG * 2;
        let step = outerR / n;
        let expansion = 1.02;

        for (var i = 0; i < n; i++) {
            drawCircle(ctx, p.x, p.y, i * step, {stroke: color});
            step *= expansion;
        }
    }

    let decorators = [radiateFromPoint, outwardRings];


    // Draw Stuff
    // --------------------------------------

    // Draw some points. We will step through, looking at three at a time,
    // and define circles. Adjacent circles will have two points in common.
    let points = [];



    // point placement function
    let quadrants = function() {
        points.push([randomInt(0, cw/2), randomInt(0, ch/2)]);
        points.push([randomInt(cw/2, cw), randomInt(0, ch/2)]);
        points.push([randomInt(0, cw/2), randomInt(ch/2, ch)]);
        points.push([randomInt(cw/2, cw), randomInt(ch/2, ch)]);

        // points.push([cw/2, randomInt(0, ch/2)]);
        // points.push([cw/2, randomInt(ch/2, ch)]);
        // points.push([randomInt(0, cw/2) , ch/2]);
        // points.push([randomInt(cw/2, cw), ch/2]);

        points = shuffle(points);
    }

    // point placement function
    let ring = function() {
        let steps = randomInt(8, 24);
        let inc = TWOPI / steps;
        let startAngle = randomInRange(TWOPI);

        // baseline radius of the ellipse that plots the points
        let radiusFraction = randomInRange(20, 30) / 100;

        let offset;
        let _x, _y;

        // go around the ellipse defined by canvas, dropping points
        for (var i = 0; i < steps; i++) {
            // alternate moving in and out by the offset fraction
            offset = (i % 2) ? 1 : -1;
            offset *= randomInRange(0, 20) / 100;

            _x = cw/2 + cw * (radiusFraction + offset) * Math.cos(i * inc + startAngle);
            _y = ch/2 + ch * (radiusFraction + offset) * Math.sin(i * inc + startAngle);

            points.push([_x, _y]);
        }

        // For every 10 points we have, drop 1
        let skipCount = Math.floor(steps/10);
        while (skipCount--) {
            points.splice(randomInt(points.length - 1), 1);
        }
    }


    // point placement function
    // TODO fix params
    let alternate = function(a, b, steps) {
        let _x, _y;
        // debug
        if (Math.random() < 0.5) {
            // left right
            a = [0, randomInRange(ch)];
            b = [cw, randomInRange(ch)];
        } else {
            // top bottom
            a = [randomInRange(cw), 0];
            b = [randomInRange(cw), ch];
        }


        let v = getVector(a, b);
        steps = Math.round(8 * v.length/SHORT);
        let inc = v.length / steps;

        _x = v.x
        _y = v.y;

        let offset = SCALE / 10;
        let orthogonal;

        for (var i=0; i < steps ; i++) {
            _x += v.length/steps * Math.cos(v.angle);
            _y += v.length/steps * Math.sin(v.angle);

            //drawCircle(ctx, _x, _y, 5, {fill:'green'});

            orthogonal = (i % 2)? PI/2 : -PI/2;
            orthogonal += v.angle;

            offset = SCALE * randomInRange(0.1, 0.4);
            // sometimes make big steps pop out for variety
            if (Math.random() < 0.125) {
                offset *= 1.5;
            }

            points.push([_x + offset * Math.cos(orthogonal), _y + offset * Math.sin(orthogonal)]);
        }

        ctx.beginPath();
        ctx.moveTo(...a);
        ctx.lineTo(...b);
        ctx.stroke();

        // let split = randomInt(points.length);
        // points = points.slice(0, split).concat(points.slice(split, -1));
    }


    // run setup functions according to style prop
    let setupFuncs = [];
    if (STYLE === 'simple') {
        quadrants();
    } else if (STYLE === 'complex') {
        randItem([alternate, ring])();
    } else {
        // auto case
        randItem([quadrants, alternate, ring])();
    }

    // set up circles
    let circles = [];

    // space between circles and background drawings
    let margin = SCALE / randomInt(20, 60);

    // draw fewer rays when there will be many circles
    let rayCount = 150 / Math.log(points.length);
    let decorationThreshold = 0.66 / Math.log(points.length);

    // step through points:
    // define circles
    for (var i = 0; i < points.length - 2; i++) {
        let c = circumcenter(...points.slice(i, i + 3));

        let color = getContrastColor();
        c.color = color;

        // add circle to collection
        circles.push(c);
    }

    // now step through circles and draw background decorations
    ctx.lineWidth = LINE3;
    circles.forEach((c) => {
        ctx.strokeStyle = c.color;
        let decorationCount = Math.round(rayCount + rayCount * c.r/SCALE);

        // for few circles, decorate all. For more, only some
        if (circles.length <= 3) {
            randItem(decorators)(c, decorationCount, c.color);
        } else if (Math.random() < decorationThreshold) {
            randItem(decorators)(c, decorationCount, c.color);
        }
    });


    // now step through circles and draw bg mask over decorations
    circles.forEach((c) => {
        margin = SCALE / randomInt(20, 60);
        drawCircle(ctx, c.x, c.y, c.r + margin, {stroke: null, fill: bg});
    });

    // step through points to draw triangles
    for (var i = 0; i < points.length - 2; i++) {
        let c = circles[i];
        let color = c.color;

        ctx.lineWidth = LINE2;
        ctx.setLineDash([LINE2 * 9, LINE2 * 6]);
        drawTriPoints(ctx, ...points.slice(i, i + 3), color);
        ctx.lineWidth = LINE1;
        ctx.setLineDash([]);

        // // center to circle spoke
        // ctx.strokeStyle = color;
        // ctx.beginPath();
        // ctx.moveTo(c.x, c.y);
        // ctx.lineTo(...points[i]);
        // ctx.stroke();
    }

    // now step through circles and draw the rings
    ctx.lineWidth = LINE1;
    circles.forEach((c) => {
        drawCircle(ctx, c.x, c.y, c.r, {stroke: c.color, fill: null});
        // draw center
        // drawCircle(ctx, c.x, c.y, SCALE/200, {fill: c.color});
    });



    // ---

    // step through points
    // draw connecting bar between shared points
    // alternates based on triangle pairs
    ctx.lineWidth = LINE1;
    // for (var i = 0; i < points.length - 2; i++) {
    //     let idx = (i % 2) ? i : i + 1;

    //     ctx.strokeStyle = fg;
    //     ctx.beginPath();
    //     ctx.moveTo(...points[idx]);
    //     ctx.lineTo(...points[idx + 1]);
    //     ctx.stroke();
    // }


    // ---
    // draw all points on top of everything
    points.forEach((p) => {
        drawCircle(ctx, p[0], p[1], SCALE/100, {fill:fg})
    });


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


