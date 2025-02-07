import noiseUtils from './noiseutils';
import palettes from './palettes';
import { randItem, randomInRange, randomInt, resetTransform, rotateCanvas, getGradientFunction, getSolidColorFunction, getAngle, getVector, mapKeywordToVal } from './utils';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';

const DEFAULTS = {
    container: 'body',
    palette: palettes.plum_sauce,
    addNoise: 0.04,
    noiseInput: null,
    clear: true,
}

const PI = Math.PI;

// Main function
export function moire(options) {
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


    // Draw Stuff
    // --------------------------------------


    let lines = [];
    let lineCount = 100;
    for (var i = 0; i <= lineCount; i++) {
        let line = [];
        line.push([cw/4, ch * (1 - i/lineCount)]);
        line.push([3 * cw/4, ch * (1 - i/lineCount)]);
        lines.push(line);
    }

    // lines.forEach(line => {
    //     ctx.beginPath();
    //     ctx.moveTo(...line[0]);
    //     ctx.lineTo(...line[1]);
    //     ctx.stroke();
    // });


    function lineSteps(a, b, steps, l, curve) {
        let v = getVector(a, b);
        let inc = v.length / steps;

        let x = a[0];
        let y = a[1];
        let p1 = [0, 0]; // start point of transverse line
        let p2 = [0, 0]; // end point

        ctx.beginPath();

        for (var i = 0; i <= steps; i++) {
            x += inc * Math.cos(v.angle);
            y += inc * Math.sin(v.angle);

            //drawCircle(ctx, x, y, 20, {stroke:'black'});

            p1 = [
                x + l * Math.cos(v.angle - PI/2),
                y + l * Math.sin(v.angle - PI/2),
            ];
            p2 = [
                x + l * Math.cos(v.angle + PI/2),
                y + l * Math.sin(v.angle + PI/2),
            ];

            //drawCircle(ctx, ...p1, 10, {stroke:'red'});
            //drawCircle(ctx, ...p2, 10, {fill:'blue'});

            //ctx.beginPath();
            ctx.moveTo(...p1);
            ctx.lineTo(...p2);
            //ctx.stroke();


            //ctx.lineTo(x, y);
            //ctx.stroke();
        }

        ctx.stroke();
    }

    lineSteps([cw/4, ch],[3 * cw/4, 0], 100, 100);


    ctx.strokeStyle = 'black';
    function stepCurve(a, b, c1, c2, steps) {
        ctx.beginPath();
        ctx.moveTo(...a);
        ctx.bezierCurveTo(...c1, ...c2, ...b);
        ctx.stroke();

        let t = 0;
        let inc = 1/steps;

        let x = a[0];
        let y = a[1];
        let _x = x; // last x
        let _y = y; // last y

        let v;

        // step thru the bezier
        for (var i = 1; i < steps; i++) {
            console.log(t);
            x = (1 - t) ** 3 * a[0] +       3 * (1 - t) ** 2 * t * c1[0] +      3 * (1 - t) * t ** 2 * c2[0] +      t ** 3 * b[0];
            y = (1 - t) ** 3 * a[1] +       3 * (1 - t) ** 2 * t * c1[1] +      3 * (1 - t) * t ** 2 * c2[1] +      t ** 3 * b[1];
            t += inc;

            drawCircle(ctx, x, y, 100, {stroke:'green'});
            console.log(x, y);


        }
    }

    stepCurve(
        [3*cw/4, ch],
        [cw/4, 0],
        [.4 * cw, .6 * ch],
        [ .6 * cw, .4 * ch],
        100
    );



    //console.log(lines);


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


