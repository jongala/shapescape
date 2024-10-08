import noiseUtils from './noiseutils';
import palettes from './palettes';
import hexScatter from './hexScatter';
import { randItem, randomInRange, resetTransform, rotateCanvas, getGradientFunction, getSolidColorFunction, mapKeywordToVal} from './utils';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';
import { createTransform, createSourceSinkTransform, opacityTransforms } from './util/fieldUtils';

const DEFAULTS = {
    container: 'body',
    palette: palettes.de_stijl,
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true,
    colorMode: 'auto', // from COLORMODES or 'auto'
    fieldMode: 'auto', // [auto, harmonic, flow]
    lightMode: 'normal', // [auto, bloom, normal]
    gridMode: 'auto', // [auto, normal, scatter, random]
    density: 'auto', // [auto, coarse, fine]
    fieldNoise: 'auto' // mapped to values below
}

const PI = Math.PI;
const FIELDMODES = ['harmonic', 'flow'];
const LIGHTMODES = ['bloom', 'normal'];
const GRIDMODES = ['normal', 'scatter', 'random'];
const DENSITIES = ['coarse', 'fine'];
const COLORMODES = ['single', 'angle', 'random'];

// Main function
export function field(options) {
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

    // modes and styles
    const LIGHTMODE = opts.lightMode === 'auto' ? randItem(LIGHTMODES) : opts.lightMode;
    const GRIDMODE = opts.gridMode === 'auto' ? randItem(GRIDMODES) : opts.gridMode;
    const DENSITY = opts.density === 'auto' ? randItem(DENSITIES) : opts.density;
    const FIELDMODE = opts.fieldMode === 'auto' ? randItem(FIELDMODES) : opts.fieldMode;
    const COLORMODE = opts.colorMode === 'auto' ? randItem(COLORMODES) : opts.colorMode;
    const FIELDNOISE = mapKeywordToVal({
        // hacky way to weight options by redundantly specifying
        'none': 0,
        'none2': 0,
        'low': 0.125,
        'low2': 0.125,
        'med': 0.25,
        'high': 0.5
    })(opts.fieldNoise, 'fieldNoise');

    // color funcs
    let getSolidFill = getSolidColorFunction(opts.palette);

    // how many cells are in the grid?
    let countMin, countMax;
    if (DENSITY === 'coarse') {
        countMin = 10;
        countMax = 30;
    } else {
        countMin = 60;
        countMax = 100;
    }

    let cellSize = Math.round(SHORT / randomInRange( countMin, countMax ));
    console.log(`Field: ${DENSITY}(${cellSize}px) ${GRIDMODE} ${FIELDMODE} ${COLORMODE}`);

    // setup vars for each cell
    let x = 0;
    let y = 0;
    let xnorm = 0;
    let ynorm = 0;
    let renderer;

    // shared colors
    let bg = getSolidFill();

    // get palette of non-bg colors
    let contrastPalette = [].concat(opts.palette);
    contrastPalette.splice(opts.palette.indexOf(bg), 1);
    let getContrastColor = getSolidColorFunction(contrastPalette);

    // shared foregrounds
    let fg = getContrastColor();
    let fg2 = getContrastColor();

    // in bloom mode, we draw high-contrast grayscale, and layer
    // palette colors on top
    if (LIGHTMODE === 'bloom') {
        bg = '#222222';
        fg = fg2 = '#cccccc';
    }

    // draw background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);

    // set default tail color
    ctx.strokeStyle = fg;
    // set default dot color
    let dotFill = fg2;


    let rateMax = 3;
    if (DENSITY === 'fine' && Math.random() < 0.5) {
        rateMax = 6;
    }


    // tail vars
    let _x,_y,len;

    // dotScale will be multiplied by 2. Keep below .25 to avoid bleed.
    // Up to 0.5 will lead to full coverage.
    let dotScale = cellSize * randomInRange(0.1, 0.25);
    // line width
    let weight = randomInRange(0.5, 3) * SCALE/800;

    ctx.lineWidth = weight;
    ctx.lineCap = 'round';

    // const used in normalizing transforms
    let maxLen = 2 * Math.sqrt(2);

    // It looks nice to extend lines beyond their cells. how much?
    // Scaled against cellSize
    let lineScale = randomInRange(0.7, 2);

    // Displace the center point of each cell by this factor
    // Only do this sometimes, and not when scattering
    let warp = 0;
    if (GRIDMODE !== 'scatter' && (Math.random() < 0.5)) {
        warp = randomInRange(0.75, Math.sqrt(2));
    }

    // Pick an opacity transform to use
    let opacityFunc = randItem(opacityTransforms(maxLen));


    // a set of independent transforms to use while rendering
    let trans = {
        xbase: createTransform(rateMax), // (x,y)=>0,//
        ybase: createTransform(rateMax), // (x,y)=>0,//
        xtail: createTransform(rateMax), // (x,y)=>0,//
        ytail: createTransform(rateMax), // (x,y)=>0,//
        radius: createTransform(rateMax)
    }

    function randomScatter(size, w, h) {
        let pts = [];
        let xcount = Math.ceil(w / size);
        let ycount = Math.ceil(h / size);
        let count = xcount * ycount;
        while (count--) {
            pts.push([randomInRange(0, w), randomInRange(0, h)]);
        }
        return pts;
    }

    function placeNormal(size, w, h) {
        let pts = [];
        let xcount = Math.ceil(w / size) + 2;
        let ycount = Math.ceil(h / size) + 2;
        let count = xcount * ycount;
        let x, y;
        for (var i = 0 ; i < count ; i++) {
            x = size * ((i % xcount) - 1) + size / 2;
            y = size * (Math.floor(i/xcount) - 1) + size / 2;
            pts.push([x, y]);
        }
        return pts;
    }

    let pts = [];

    // If we are warping the grid, we should plot points outside of the canvas
    // bounds to avoid gaps at the edges. Shift them over below.
    let overscan = 1;
    if (warp) {
        overscan = 1.2;
    }

    switch (GRIDMODE) {
        case 'scatter':
            pts = hexScatter(cellSize, cw * overscan, ch * overscan);
            break;
        case 'random':
            pts = randomScatter(cellSize, cw  * overscan, ch * overscan);
            break;
        default:
            pts = placeNormal(cellSize, cw * overscan, ch * overscan);
    }

    // compensate for overscan by shifting pts back
    if (warp) {
        pts.map((p,i) => {
            return [p[0] - cw * .1, p[1] - ch * .1];
        });
    }

    let sourceTransform = createSourceSinkTransform(Math.round(randomInRange(5, 15)));


    // Flags for coloring by angle
    // Don't do special coloring in bloom mode, because it relies on grayscale
    // initial rendering
    let colorTailByAngle = false;
    let colorDotByAngle = false;
    let randomColorThreshold;
    if (LIGHTMODE !== 'bloom') {
        if (COLORMODE === 'angle') {
            if (Math.random() < 0.6) {
                colorTailByAngle = true;
            }
            if (Math.random() < 0.6) {
                colorDotByAngle = true;
            }
        }
        if (COLORMODE === 'random') {
            randomColorThreshold = 0.66;
        }
    }

    // console.log(`Colors: tails ${colorTailByAngle}, dots: ${colorDotByAngle}`);

    // source/sink stuff
    if (FIELDMODE === 'flow') {
        let totalStrength = 0;
        sourceTransform.sources.forEach((source) => {
            totalStrength += source.strength;
        });
        lineScale = 1/totalStrength;
    }

    // step thru points
    pts.forEach((p, i) => {
        x = p[0];
        y = p[1];
        xnorm = x/cw;
        ynorm = y/ch;

        // shift base points to their warped coordinates
        x = x + cellSize * trans.xbase(xnorm, ynorm) * warp;
        y = y + cellSize * trans.ybase(xnorm, ynorm) * warp;

        let xNoise = 0;
        let yNoise = 0;
        if (FIELDNOISE > 0) {
            xNoise = randomInRange(-1,1) * FIELDNOISE;
            yNoise = randomInRange(-1,1) * FIELDNOISE;
        }

        // get end of tail coords
        if (FIELDMODE === 'flow') {
            // flow fields (source-sink)
            let flow = sourceTransform.t(xnorm, ynorm);
            _x = flow[0];
            _y = flow[1];
        } else {
            // harmonic fields
            _x = trans.xtail(xnorm, ynorm);
            _y = trans.ytail(xnorm, ynorm);
        }

        _x += xNoise;
        _y += yNoise;

        let theta = Math.atan2(_y, _x);
        let fillIndex = Math.round(contrastPalette.length * theta/PI / 2);
        let angleColor = contrastPalette[fillIndex];

        if (colorDotByAngle) {
            dotFill = angleColor;
        }
        if (COLORMODE === 'random' && Math.random() < randomColorThreshold) {
            dotFill = getContrastColor();
        }

        // draw dot
        ctx.globalAlpha = 1;
        drawCircle(ctx,
            x,
            y,
            (trans.radius(xnorm, ynorm) + 1) * dotScale,
            {fill: dotFill}
        );

        ctx.globalAlpha = opacityFunc(_x, _y);

        if (colorTailByAngle) {
            ctx.strokeStyle = angleColor;
        }
        if (COLORMODE === 'random' && Math.random() < randomColorThreshold) {
            ctx.strokeStyle = getContrastColor();
        }

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(
            x + cellSize * _x * lineScale,
            y + cellSize * _y * lineScale
        );
        ctx.stroke();
    });

    ctx.globalAlpha = 1;

    // in bloom mode, we draw a big colorful gradient over the grayscale
    // background, using palette colors and nice blend modes
    if (LIGHTMODE === 'bloom') {
        ctx.globalCompositeOperation = 'color-dodge';

        // bloom with linear gradient
        ctx.fillStyle = getGradientFunction(opts.palette)(ctx, cw, ch);//getContrastColor();
        ctx.fillRect(0, 0, cw, ch);

        if (Math.random() < 0.5) {
            // bloom with spot lights
            let dodgeDot = (max = 1.5) => {
                let gx, gy, gr1, gr2;
                gx = randomInRange(0, cw);
                gy = randomInRange(0, ch);
                gr1 = randomInRange(0, 0.25);
                gr2 = randomInRange(gr1, max);

                let radial = ctx.createRadialGradient(
                    gx,
                    gy,
                    gr1 * SCALE,
                    gx,
                    gy,
                    gr2 * SCALE
                );
                radial.addColorStop(0, randItem(opts.palette));
                radial.addColorStop(1, '#000000');

                ctx.fillStyle = radial;
                ctx.fillRect(0, 0, cw, ch);
            }
            // try layering dots with varying coverage
            ctx.globalAlpha = randomInRange(0.4, 0.7);
            dodgeDot(1.5);
            ctx.globalAlpha = randomInRange(0.4, 0.7);
            dodgeDot(1.0);
            ctx.globalAlpha = randomInRange(0.7, 0.9);
            dodgeDot(0.5);
            ctx.globalAlpha = 1;
        }

        ctx.globalCompositeOperation = 'normal';
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

