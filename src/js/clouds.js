import noiseUtils from './noiseutils';
import palettes from './palettes';
import { randItem, randomInRange, resetTransform, rotateCanvas, getGradientFunction, getSolidColorFunction } from './utils';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';

const DEFAULTS = {
    container: 'body',
    palette: palettes.fingerspitzen,
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true,
    lightMode: 'auto', // [auto, bloom, normal]
    gridMode: 'auto', // [auto, normal, scatter, random]
    density: 'auto', // [auto, coarse, fine]
}

const PI = Math.PI;


// Main function
export function clouds(options) {
    let opts = Object.assign({}, DEFAULTS, options);

    let container = opts.container;
    let cw = container.offsetWidth;
    let ch = container.offsetHeight;
    let SCALE = Math.min(cw, ch);
    let LONG = Math.max(cw, ch);
    let SHORT = Math.min(cw, ch);
    const AREA = cw * ch;

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

    // special fill functions
    let getBgGradient = getGradientFunction(['#ffffff', bg]);
    let getCloudFill = function(y1, y2, color = bg) {
        let grad = ctx.createLinearGradient(0, y1, 0, y2);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(1, color);
        return grad;
    }


    // draw

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);

    let rateMax = 3;

    function createTransform () {
        let rate1 = randomInRange(0, rateMax);
        let rate2 = randomInRange(0, rateMax);
        let phase1 = randomInRange(-PI, PI);
        let phase2 = randomInRange(-PI, PI);
        let c1 = randomInRange(1, 2);
        let c2 = randomInRange(0, 1);
        return (x, y) => {
            let t1 = Math.sin(x * PI * rate1 + phase1);
            let t2 = Math.sin(y * PI * rate2 + phase2);
            return (c1 * t1 + c2 * t2)/(c1 + c2);
        }
    }

    let wave = createTransform();

    let pointCount = cw/4;
    let x, y, r;

    let r_seed;

    let waveScale = SHORT/8;
    let harmScale = waveScale/2;
    let bubbleSize;
    let bubbleMax = ch/4;

    let xnorm, ynorm;
    let countNorm;

    ctx.lineCap = 'round';

    for (let i = 0; i<=pointCount; i++) {
        countNorm = i/pointCount;
        x = i * cw/(pointCount);
        y = wave(countNorm, 0) * waveScale; // input a normalized value
        y += ch/2; // center, roughly

        r = 5;

        r_seed = Math.random();
        bubbleSize = randomInRange(10, bubbleMax);
        r = Math.pow(r_seed, 6) * bubbleSize + 20;

        y -= randomInRange(0, bubbleSize);

        /*drawCircle(ctx, x, y , harmScale, {
            fill: null,
            stroke: fg
        });*/

        drawCircle(ctx, x, y, r, {
            fill: 'white',//getCloudFill(y - r, ch, bg),
            stroke: null
        });

    }




    // add noise
    if (opts.addNoise) {
        if (opts.noiseInput) {
            // apply noise from supplied canvas
            noiseUtils.applyNoiseCanvas(el, opts.noiseInput);
        } else {
            // create noise pattern and apply
            noiseUtils.addNoiseFromPattern(el, opts.addNoise, cw / 3);
        }
    }

    // if new canvas child was created, append it
    if (newEl) {
        container.appendChild(el);
    }
}
