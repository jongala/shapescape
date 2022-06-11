import noiseUtils from './noiseutils';
import palettes from './palettes';
import { drawCircle, drawRing, drawExactTriangle, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';
import { randItem, randomInRange, getGradientFunction, getSolidColorFunction } from './utils';

const SILVERS = ['#ffffff','#f2f2f2','#eeeeee','#e7e7e7','#e0e0e0','#d7d7d7'];

const PI = Math.PI;
const TWOPI = PI * 2;

// Tile the container
export function grads(options) {
    var defaults = {
        container: 'body',
        palette: palettes.terra_cotta_cactus,
        middleOut: 'auto', // 'auto' 'true' 'false'
        drawShadows: false,
        addNoise: 0.04,
        noiseInput: null,
        clear: true
    };
    var opts = {};
    opts = Object.assign(Object.assign(opts, defaults), options);

    let container = opts.container;
    let cw = container.offsetWidth;
    let ch = container.offsetHeight;
    let SCALE = Math.min(cw, ch);
    let LONG = Math.max(cw, ch);
    let SHORT = Math.min(cw, ch);
    const AREA = cw * ch;

    // Find or create canvas child
    var el = container.querySelector('canvas');
    var newEl = false;
    if (!el) {
        container.innerHTML = '';
        el = document.createElement('canvas');
        newEl = true;
    }
    if (newEl || opts.clear) {
        el.width = cw;
        el.height = ch;
    }

    var ctx; // canvas ctx or svg tag

    ctx = el.getContext('2d');

    // optional clear
    if (opts.clear) {
        el.width = container.offsetWidth;
        el.height = container.offsetHeight;
        ctx.clearRect(0, 0, cw, ch);
    }


    let getSolidFill = getSolidColorFunction(opts.palette);


    // drawing order
    let MIDDLEOUT;
    if (opts.middleOut === 'auto') {
        MIDDLEOUT = (Math.random() > 0.5);
    } else if (opts.middleOut === 'false') {
        MIDDLEOUT = false;
    } else {
        MIDDLEOUT = true;
    }

    // shadows
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 25 * Math.min(cw, ch) / 800;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';

    // split into shapes
    // add some slices, add more for high aspect ratios
    let sliceCount = Math.round(randomInRange(6,10) * cw/ch);
    if (sliceCount % 2 == 0) sliceCount++;

    let sw = cw/sliceCount;

    let g;

    let colors = opts.palette.length

    let slices = [];

    if (Math.random() > 0.5) {
        opts.palette = opts.palette.reverse();
    }

    // Array of functions which will define slices. Slices are just arrays of gradients.
    let sliceGenerators = [
        // random
        function(count) {
            let slices = [];
            for (var i =0; i <= count; i++) {
                g = ctx.createLinearGradient(
                    0,
                    0 + 0.25 * randomInRange(-ch,ch),
                    0,
                    ch + 0.25 * randomInRange(-ch,ch)
                );

                for (var c = 0; c<= colors - 1 ; c++) {
                    g.addColorStop(1/colors * c, opts.palette[c]);
                }

                slices.push(g);
            }
            return slices;
        },
        // sine
        function(count) {
            let slices = [];
            let rate = randomInRange(0.5, 2);
            let phase = randomInRange(-PI, PI);
            let a1 = randomInRange(0.2, 1.5);
            let a2 = randomInRange(0.2, 1.5);

            for (var i =0; i <= count; i++) {
                g = ctx.createLinearGradient(
                    0,
                    0 + 0.25 * a1 * ch * Math.sin(rate * (i/count * TWOPI + phase)),
                    0,
                    ch + 0.25 * a2 * ch * Math.sin(rate * (i/count * TWOPI + phase))
                );

                for (var c = 0; c<= colors - 1 ; c++) {
                    g.addColorStop(1/colors * c, opts.palette[c]);
                }

                slices.push(g);
            }
            return slices;
        }
    ];

    slices = sliceGenerators[1](sliceCount);

    // Step through the slices, and draw a rectangle with the gradient defined in each slice

    // A utility function to draw a single slice
    function drawSliceAtIndex(i) {
        ctx.beginPath();
        ctx.fillStyle = getSolidFill();

        ctx.fillStyle = slices[i];

        ctx.rect(i * sw, 0, sw, ch);
        ctx.closePath();
        ctx.fill();
    }

    // If middle out, alternate outward from the center slice, to get nice shadow stacking
    // Otherwise just draw them in order
    if (MIDDLEOUT) {
        // start in the middle and alternate outward
        let middle = Math.floor(sliceCount / 2);
        let steps = 0;
        let increment = 1;

        drawSliceAtIndex(middle);
        steps = 1;
        while (steps < sliceCount) {
            drawSliceAtIndex(middle + increment);
            drawSliceAtIndex(middle - increment);
            increment++;
            steps += 2;
        }
    } else {
        // draw each slice in order
        for (var i =0; i < slices.length; i++) {
            drawSliceAtIndex(i);
        }
    }

    // Add effect elements
    // ...

    // add noise
    if (opts.addNoise) {
        if (opts.noiseInput) {
            noiseUtils.applyNoiseCanvas(el, opts.noiseInput);
        } else {
            noiseUtils.addNoiseFromPattern(el, opts.addNoise, cw / 3);
        }
    }

    // END RENDERING

    // if new canvas child was created, append it
    if (newEl) {
        container.appendChild(el);
    }
}
