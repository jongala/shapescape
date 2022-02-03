import noiseUtils from './noiseutils';
import palettes from './palettes';
import { randItem, randomInRange, resetTransform, rotateCanvas, getGradientFunction, getSolidColorFunction } from './utils';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';

const DEFAULTS = {
    container: 'body',
    palette: palettes.de_stijl,
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true,
    lightMode: 'normal', // [auto, bloom, normal]
    gridMode: 'normal', // [auto, normal, scatter, random]
    density: 'coarse', // [auto, coarse, fine]
}

const PI = Math.PI;
const LIGHTMODES = ['bloom', 'normal'];
const GRIDMODES = ['normal', 'scatter', 'random'];
const DENSITIES = ['coarse', 'fine'];

// Main function
export function surface(options) {
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
    //console.log(`cellSize: ${cellSize}, ${GRIDMODE}, ${DENSITY}`);

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
    let fg3 = getContrastColor();

    // in bloom mode, we draw high-contrast grayscale, and layer
    // palette colors on top
    if (LIGHTMODE === 'bloom') {
        bg = '#222222';
        fg = fg2 = '#cccccc';
    }

    // draw background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);

    ctx.strokeStyle = fg;


    let cellCount = cw/cellSize;
    let rateMax = 3;
    if (DENSITY === 'fine' && Math.random() < 0.5) {
        rateMax = 6;
    }

    // tail vars
    let _x,_y,len;

    // line width
    let weight = cellSize * randomInRange(0.25, .866);

    ctx.lineWidth = weight;
    ctx.lineCap = 'round';

    // The max height of each column. Thinner cols can be taller.
    let max = cellSize * randomInRange(0.5, 1 / (weight/cellSize));

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
        x: createTransform(rateMax), // (x,y)=>0,//
        y: createTransform(rateMax), // (x,y)=>0,//
        h: createTransform(rateMax), // (x,y)=>0,//
    }

    function hexPack(size, w, h) {
        let pts = [];
        let xcount = Math.ceil(w / size) + 2;
        let ycount = Math.ceil(h / (size * .8660)) + 10; // extra rows
        let count = xcount * ycount;
        let x,y;
        let shift;
        for (var j=0; j<= ycount ; j++) {
            shift = j % 2 ? size * .5 : 0;
            for (var i=0;i<=xcount;i++){
                x = size * i - shift;
                y = size * j * .8660;
                pts.push([x, y]);
            }
        }
        return pts;
    }

    let pts = [];

    // If we are warping the grid, we should plot points outside of the canvas
    // bounds to avoid gaps at the edges. Shift them over below.
    let overscan = 1;

    pts = hexPack(cellSize, cw, ch);

    let shadowAngle = randomInRange(0.2, 0.66) * randItem([-1,1]);
    let shadowStrength = randomInRange(0.1, 0.3);

    // step thru points
    pts.forEach((p, i) => {
        x = p[0];
        y = p[1];
        xnorm = x/cw;
        ynorm = y/ch;

        _x = trans.x(xnorm, ynorm);
        _y = (trans.y(xnorm, ynorm) + 1 )/2 * max;

        if(_y < 0) console.log('oh no', _y);

        // add jitter
        //_y += 0.15 * cellSize * randomInRange(-1, 1);
        _y *= randomInRange(1, 1.15);

        ctx.translate(x, y);

        // draw shadow first
        
        ctx.strokeStyle = 'black';
        ctx.globalAlpha = shadowStrength;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(
            _y * shadowAngle,
            _y
        );
        ctx.stroke();
        ctx.globalAlpha = 1;

        // draw main post
        let grad = ctx.createLinearGradient(0, -_y, 0, 2 * max - _y);
        grad.addColorStop(0, fg);
        grad.addColorStop(1, fg2);
        ctx.strokeStyle = grad;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(
            0,
            -_y
        );
        ctx.stroke();

        drawCircle(ctx, 0, -_y, (weight/2)-(weight/8), {fill: fg3});

        ctx.translate(-x, -y);
    });

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

