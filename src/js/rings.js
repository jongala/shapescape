import noiseUtils from './noiseutils';
import palettes from './palettes';
import hexScatter from './hexScatter';
import { randItem, randomInRange, randomInt, resetTransform, rotateCanvas, getGradientFunction, getSolidColorFunction, shuffle } from './utils';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';

const PI = Math.PI;
const TWOPI = PI * 2;
const STYLES = ['normal']; // TODO

const DEFAULTS = {
    container: 'body',
    palette: palettes.plum_sauce,
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true,
    style: 'auto', // from STYLES
    mixWeight: false,
    isolate: true
}

// Main function
export function rings(options) {
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
    const STYLE = opts.style === 'auto' ? randItem(STYLES) : opts.style;

    console.log('==================================\nRings:', STYLE);

    // color funcs
    let getSolidFill = getSolidColorFunction(opts.palette);

    // setup

    let xnorm = 0;
    let ynorm = 0;
    let renderer;

    // shared colors
    let bg = getSolidFill();

    // get palette of non-bg colors
    let contrastPalette = [].concat(opts.palette);
    contrastPalette.splice(opts.palette.indexOf(bg), 1);
    //contrastPalette.sort(()=>(randomInRange(-1, 1)));
    let getContrastColor = getSolidColorFunction(contrastPalette);
    let colorCount = contrastPalette.length;


    // draw background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);

    // rings

    const MAXWEIGHT = SCALE / 50;
    ctx.lineWidth = MAXWEIGHT;

    console.log('max thickness', MAXWEIGHT);

    let centers = []; // array of center points
    let rings = []; // array of all rings

    //  pick a few center points
    let centerCount = randomInt(2, 2 + SCALE/400);
    let ringsPerGroup = randomInt(15, 30);
    let spacing = 3;

    let r = 0; // radius to step outward, intial value
    while (centerCount--) {
        // create a center point, push to centers
        centers.push({
            x: randomInRange(0, cw),
            y: randomInRange(0, ch)
        });
    }


    centers.forEach((center, i)=> {
        // intial r
        r = SCALE / 20;

        let ringCount = ringsPerGroup;
        // make several rings
        while (ringCount--) {
            // create a ring
            let thickness = randomInRange(MAXWEIGHT/4, MAXWEIGHT);
            r += thickness/2 + spacing;

            let arcLength;
            let arcOffset;

            // choose between incomplete or complete rings
            if (Math.random() < 0.75) {
                // incomplete vary from 1/4 to 3/4 turn
                arcLength = randomInRange(TWOPI * 1/3, TWOPI * 5/7);
                arcOffset = randomInRange(0, PI * 2);     
            } else {
                arcLength = PI * 2;
                arcOffset = 0;
            }

            

            let ring = {
                x: center.x,
                y: center.y,
                r: r,
                start: arcOffset,
                end: arcOffset + arcLength,
                reverse: 0,//(Math.random() > 0.5),
                thickness: thickness,
                color: getContrastColor(),
                dashes: ''
            }

            // push it to rings[]
            rings.push(ring);

            // increment r by ring thickness + spacing
            r += ring.thickness/2 + spacing;
        }
    });

    console.log(rings.length + ' rings around ' + centers.length + ' centers' );

    // then shuffle rings to interleave
    rings = shuffle(rings);


    ctx.lineCap = 'butt';

    // for each ring, draw it
    rings.forEach((ring, i) => {
        // draw this ring

        let dash = ring.thickness * randomInRange(0.5, 5);

        // sometimes set dashes, others do continuous lines
        if (Math.random() < 0.5) {
            ctx.setLineDash([dash, dash * randomInRange(0, 3)]);    
        } else {
            ctx.setLineDash([]);
        }
        

        // draw a shadow with bg color and extra thickness
        /*ctx.beginPath();
        let cap = spacing/ring.r; // extend the shadow a bit around the end
        ctx.arc(ring.x, ring.y, ring.r, ring.start - cap, ring.end + cap, ring.reverse);
        ctx.lineWidth = ring.thickness + 2 * spacing;
        ctx.strokeStyle = bg;
        ctx.stroke();*/
        

        // draw the fg ring with a rando color
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.r, ring.start, ring.end, ring.reverse);
        ctx.lineWidth = ring.thickness;
        ctx.strokeStyle = ring.color;
        ctx.stroke();
    });

    // clear dash setting
    ctx.setLineDash([]);


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


