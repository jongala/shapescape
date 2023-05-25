import noiseUtils from './noiseutils';
import palettes from './palettes';
import { randItem, randomInRange, randomInt, resetTransform, rotateCanvas, getGradientFunction, getSolidColorFunction, getAngle, getVector, mapKeywordToVal } from './utils';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';

const DEFAULTS = {
    container: 'body',
    palette: palettes.ultra,
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true,

}

const PI = Math.PI;

// Main function
export function folds(options) {
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

    // Props

    // hello world
    console.log('--------------------------------------\nFolds')


    // color funcs
    let randomFill = () => "#" + Math.random().toString(16).slice(2,8);
    let getSolidFill = getSolidColorFunction(opts.palette);

    // play with these random seeds
    let a,b,c;
    a = Math.random();
    b = Math.random();
    c = Math.random();

    // shared colors
    let fg; // hold on…
    let bg = getSolidFill(); // pick bg

    // get palette of non-bg colors
    let contrastPalette = [].concat(opts.palette);
    contrastPalette.splice(opts.palette.indexOf(bg), 1);
    let getContrastColor = getSolidColorFunction(contrastPalette);
    fg = getContrastColor(); // …now set fg in contrast to bg
    let fg2 = getContrastColor();
    let accentColor = getContrastColor();

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);

    /* define a fold
    @a starting pt
    @b ending pt
    some curving params. Fourier?

    */


let curves = {
    wave:  [100,100,,-8,,1,,,,,6,0,1,,,,,,,,,2,,1],
    wiggle: [,,,-8,,1,,,,,6,0,1,,,,,,,,,2,,3],
    wiggle2:   [,,40,0,50,1,2,,1,1,,,28,,,,,,5],
    wiggle3: [,,,55,3,1,,,,,12,0,1,,,,,,,9,],
}


    /**
     * A f(x) = y, based on coefficients and offsets.
     * Takes an input @n, and applies a series of sin funcs scaled by
     * the values in @coefs, and returns a single scalar.
     * @param  {number} n      input dimension, from 0 to 1
     * @param  {array(number)} coefs  pseudo-fourier coefficients
     * @return {number}        output value
     */
    const synthFunc = (n, coefs) => {
        if (!coefs || !coefs.length) coefs = [1];

        let v = 0;

        coefs.forEach((c, i) => {
            c = c || 0; // allow sparse spec like [,,1]
            // coefficients for sin waves. Start with 0.25 wave,
            // 0.5, then steps through half-wave increments
            // [1,0] rise, [0,1] hump, [0,0,1] sin, [0,0,0,1] double…
            i = i || 0.5;
            v += c * Math.sin( n * i * Math.PI * 2 );
        });

        return v;
    }

    /*let pointCount = Math.round(cw);
    for (var i = 0; i < pointCount; i++) {
        let t = i/pointCount;
        drawCircle(ctx, t * cw, ch/2 + synthFunc(t, curves.wave), 3, {fill: fg})
    }*/


    // generate random vector of coefficients
    let makeCoefs = function(terms=10) {
        let threshold = 0.3;
        let max = 100;

        let coefs = [];
        for (var i = 0; i < terms; i++) {
            if (Math.random() < threshold) {
                coefs[i] = randomInt(max);
            }
        }
        return coefs;
    }

    // match terms to that used to generate coefs
    let makeScalingVec = function(terms=10) {
        let scales = [];
        while (terms--) {
            scales.push(randomInRange(0.9, 1.1));
        }
        return scales;
    }


    let defineFold = function(a, b, coefs) {
        return {
            a,
            b,
            coefs
        }
    }

    // multiply two sparse arrays of scalar values
    let vecMult = function(a1, a2) {
        let len = Math.min(a1.length, a2.length);
        let result = Array(len);
        for (var i = 0; i <= len; i++) {
            if (a1[i] !== undefined && a2[i] !== undefined) {
                result[i] = a1[i] * a2[i];
            }
        }
        return result;
    }



    function lerp(v0, v1, t) {
        return v0 * (1 - t) + v1 * t;
    }

    ctx.lineWidth = 1;

    let drawFold = function(fold, pointCount, tail=[0, 100]) {
        let _x, _y;
        _x = fold.a[0];
        _y = fold.a[1];

        for (var i = 0; i < pointCount; i++) {
            let t = i/pointCount;
            _x = lerp(fold.a[0], fold.b[0], t);
            _y = lerp(fold.a[1], fold.b[1], t);
            _y += synthFunc(t, fold.coefs);

            let g = ctx.createLinearGradient(_x, _y, _x + tail[0], _y + tail[1]);
            g.addColorStop(0, fg);
            g.addColorStop(1, bg);
            ctx.strokeStyle = g;
            ctx.beginPath();
            ctx.moveTo(_x, _y);
            ctx.lineTo(_x + tail[0], _y + tail[1]);
            ctx.stroke();

            //drawCircle(ctx, _x, _y , 3, {fill: fg})
        }
    }


    let termCount = 4; // number of tems in wave coefficients

    let baseCoefs = makeCoefs(termCount);
    let coefs = baseCoefs.concat([]); // clone array, for some reason
    let scalingVec = makeScalingVec(termCount);
    let testFold = defineFold([0, 100], [cw, 300], coefs);
    //drawFold(testFold, 100);

    let foldCount = 30;
    let folds = [];


    let baseY1 = randomInRange(0, ch);
    let baseY2 = randomInRange(0, ch);
    let increment = ch / (foldCount - 1);

    let offsetY = Math.max(baseY1, baseY2);
    baseY1 -= offsetY;
    baseY2 -= offsetY;

    console.log('colors', fg, fg2);


    // define a stack of folds, incrementing Y,
    // and multiplying the coefs by the scalingVec each time
    // to create a smoothly varying set of coefficients
    for (var i = 0; i < foldCount; i++) {
        coefs = vecMult(coefs, scalingVec);
        folds.push(defineFold([0, baseY1 + i * increment], [cw, baseY2 + i * increment], coefs));
    }

    // how many points on each fold?
    let pointCount = Math.round(cw);
    pointCount = Math.round(cw / randItem([1, 2, 3, 4, 5]) );

    // how thick is each stroke that builds the folds?
    ctx.lineWidth = 1;


    let tail = [randomInRange(-1, 1) * increment/4, increment * randomInRange(1, 4)];

    folds.forEach((f, i) => {
        drawFold(f, pointCount, tail);
    });


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


