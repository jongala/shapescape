import noiseUtils from './noiseutils';
import palettes from './palettes';
import { randItem, randomInRange, randomInt, resetTransform, rotateCanvas, getGradientFunction, getSolidColorFunction, getAngle, getVector, mapKeywordToVal, shuffle } from './utils';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';

const DEFAULTS = {
    container: 'body',
    palette: palettes.admiral,
    addNoise: 0.04,
    noiseInput: null,
    clear: true,
}

const PI = Math.PI;

// Main function
export function weave(options) {
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



    // define grid
    let count = Math.round(randomInRange(10, 20));
    let w = Math.ceil(cw/count);
    let h = w;
    let vcount = Math.ceil(ch/h);
    console.log(`Grid: ${count} by ${vcount} at ${w}px`);

    // setup vars for each cell
    let x = 0;
    let y = 0;
    let xnorm = 0;
    let ynorm = 0;
    let renderer;


    // Draw Stuff
    // --------------------------------------

    // weave params
    let perCell = randomInt(5, 10);
    let spacing = w/perCell;
    let openness = randomInRange(0.33, 0.66);
    let weight = spacing * openness;

    // lil reminder of what stroke objects should look like
    let strokeSchema = {
        start: [0, 0],
        end: [w, h],
        color: 'red'
    };

    // Draws stroke twice: once with bg color, once with fg color
    // this creates effect of going above other strokes
    let drawStroke = function(stroke) {
        ctx.strokeStyle = bg;

        ctx.lineWidth = spacing;
        ctx.beginPath();
        ctx.moveTo(...stroke.start);
        ctx.lineTo(...stroke.end);
        ctx.stroke();

        ctx.strokeStyle = stroke.color;

        ctx.lineWidth = weight;
        ctx.beginPath();
        ctx.moveTo(...stroke.start);
        ctx.lineTo(...stroke.end);
        ctx.stroke();
    }

    // reminder :)
    // warp is vertical
    // weft is horizontal

    let warpColor;
    let weftColor;

    let warpPalette = [].concat(contrastPalette);
    let weftPalette = [].concat(contrastPalette);

    // build a single warpPalette for the whole layout, so we can
    // consistently hit colors by index as we iterate through grid spots
    while (warpPalette.length < count) {
        warpPalette = warpPalette.concat(contrastPalette);
    }
    warpPalette = shuffle(warpPalette);

    // build a consistent weftPalette, too
    while (weftPalette.length < count) {
        weftPalette = weftPalette.concat(contrastPalette);
    }
    weftPalette = shuffle(weftPalette);


    let COMMONCOLORS = false;

    for (let i = 0; i < vcount; i++) {
        // shuffle weft colors each step, so rows don't look the same.
        // do this even with COMMONCOLORS.
        weftPalette = shuffle(weftPalette);

        for (let j = 0; j < count; j++) {
            // convenience vars
            x = w * j;
            y = h * i;
            xnorm = x/cw;
            ynorm = y/ch;

            ctx.translate(x, y);

            // build an array of strokes
            let strokes = [];

            if (!COMMONCOLORS) {
                warpColor = getContrastColor();
                weftColor = getContrastColor();
            }

            // fill the array with all of them
            // horizontal
            let strokeCount = perCell;
            while (strokeCount--) {
                if (COMMONCOLORS) {
                    weftColor = weftPalette[(strokeCount + perCell * i) % weftPalette.length];
                }
                let s = {
                    start: [0, spacing * strokeCount + spacing/2],
                    end: [w, spacing * strokeCount + spacing/2],
                    color: weftColor
                };
                strokes.push(s);
            }
            // vertical
            strokeCount = perCell;
            while (--strokeCount) {
                if (COMMONCOLORS) {
                    warpColor = warpPalette[(strokeCount + perCell * j) % warpPalette.length];
                }
                let s = {
                    start: [spacing * strokeCount + spacing/2, 0],
                    end: [spacing * strokeCount + spacing/2, h],
                    color: warpColor
                };
                strokes.push(s);
            }

            // delete some random strokes
            // coming soon …

            // shuffle the array
            strokes = shuffle(strokes);

            // draw the strokes
            strokes.forEach(drawStroke);

            resetTransform(ctx);
        }
    }


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


