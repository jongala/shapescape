import noiseUtils from './noiseutils';
import palettes from './palettes';
import hexScatter from './hexScatter';
import { randItem, randomInRange, randomInt, resetTransform, rotateCanvas, getGradientFunction, getSolidColorFunction, shuffle } from './utils';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';

const DEFAULTS = {
    container: 'body',
    palette: palettes.admiral,
    addNoise: 0.04,
    noiseInput: null,
    clear: true,
    style: 'auto', // from STYLES
    mixWeight: false,
    isolate: true
}

const PI = Math.PI;
const TWOPI = PI * 2;
const STYLES = ['normal']; // TODO

const DEBUG = false;

// Main function
export function checkers(options) {
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

    // modes and styles
    const STYLE = opts.style === 'auto' ? randItem(STYLES) : opts.style;

    console.log('==================================\nCheckers:', STYLE);

    // color funcs
    let getSolidFill = getSolidColorFunction(opts.palette);

    // setup

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

    /*
    Approach:
    - choose some center points
    - draw nested sets of rings around each point
    - each ring has a solid stroke for a base color, and a dashed stroke
    - these create a radial checkerboard pattern
    */


    // max line weight depends on canvas size
    //const MAXWEIGHT = SCALE / (50 + LONG/100);
    //const MAXWEIGHT = SCALE / 20;
    const MAXWEIGHT = SCALE / 10;
    ctx.lineWidth = MAXWEIGHT;
    const MINWEIGHT = MAXWEIGHT / 2.5;
    console.log('max thickness', MAXWEIGHT, ' min thickness', MINWEIGHT.toPrecision(2));


    let centers = []; // array of center points
    let rings = []; // array of all rings

    // pick a few center points
    // more for large layouts
    let centerCount = randomInt(2, 2 + SCALE/400);

    // center vars
    // Scatter points coarsely
    // These numbers aren't great
    const MARGIN = SHORT/12;
    let pts = hexScatter(SHORT * 0.5, cw - MARGIN * 2, ch - MARGIN * 2);

    pts.forEach((p, i) => {
        centers.push({x:p[0], y:p[1]});
        DEBUG && drawCircle(ctx,p[0], p[1], 30, {fill:'red'});
    });

    // put a single center somewhere way out, radially from the center
    let alpha = randomInRange(0, TWOPI);
    let dist = LONG * randomInRange(1, 4);
    centers = [{x: cw/2 + dist * Math.cos(alpha), y: ch/2 + dist * Math.sin(alpha)}];


    // Limit centers, since hexscatter has a lot of overscan and does
    // poorly when cell size is large compared to container.
    // Allow more centers for stretched layouts.
    centers = shuffle(centers);
    //let maxCenters = Math.ceil(ASPECT);
    //centers = centers.slice(0, maxCenters);

    ctx.lineCap = 'butt';//

    let STRETCHSET = [1, 1, 1, 1.618, 1.618, 2];

    // Step through the centers and create ring clusters for each
    centers.forEach((center, i)=> {
        // intial r
        let r = dist * randomInRange(1.2, 1.6);
        let R = r; // keep original value, as we step inward

        let STRETCH = randItem(STRETCHSET);


        // start with a baseline thickness
        let thickness = randomInRange(MINWEIGHT, MAXWEIGHT);

        // Assume dash length will equal thickness
        // Find a value near thickness that will give a whole number
        // of dashes
        let C = r * 2 * PI;
        let n = C / (thickness);
        let N = Math.round(n);
        let dash = C / N; // the dash length for whole number
        let gap = dash * STRETCH; // set gap relative to dash
        thickness = dash; // reset thickness to the gap

        let skipStroke = 0;

        // make several rings
        while (r > SCALE/20) {
            // create a ring
            let arcLength = PI * 2;
            let arcOffset = 0;

            // recalculate dashes for new r
            C = r * 2 * PI;
            dash = C / N;
            gap = dash * STRETCH;
            thickness = dash;

            // don't know why this fudge is needed. Rounding?
            ctx.lineWidth = thickness + 2;

            // Stroke skipping:
            // Sometimes, set skipStroke to skip several lines. Then
            // decrement the skip count as you go. Pick skip count and
            // skip likelihood to have a nice mix of contiguous drawn
            // and skipped lines.
            // When starting a skip sequence, reset the STRETCH style,
            // so the following band has its own style.
            if(skipStroke) {
                skipStroke--;
            } else {
                // sometimes set skipping and stretch.
                // most of the time, do nothing, and just draw
                if (Math.random() < 0.2) {
                    skipStroke = randomInt(2, 4);
                    STRETCH = randItem(STRETCHSET);
                }
            }

            // draw the solid ring, then draw dashed on top

            ctx.setLineDash([]); // solid ring
            ctx.beginPath();
            ctx.arc(center.x, center.y, r, 0, 2 * PI);
            ctx.strokeStyle = getSolidFill();
            if (!skipStroke) ctx.stroke();

            // dashed ring
            ctx.setLineDash([dash, gap]);

            // draw the fg ring with a rando color
            ctx.lineDashOffset = 0;
            ctx.beginPath();
            ctx.arc(center.x, center.y, r, 0, 2 * PI);
            ctx.strokeStyle = getSolidFill();
            if (!skipStroke) ctx.stroke();

            // increment r by ring thickness
            r = r - thickness;
        }
    });

    console.log(rings.length + ' rings around ' + centers.length + ' centers' );


    // draw radial traces
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.03;
    let rayCount = 360 * randomInt(3, 5);
    let angleInc = TWOPI / rayCount;

    ctx.lineWidth = 8 * SHORT / rayCount;


    // clear dash settings
    ctx.setLineDash([0, 0]);
    //ctx.setLineDash([ctx.lineWidth * 2, ctx.lineWidth * 2]);

    centers.forEach((center, i) => {
        let angle;
        while (rayCount--) {
            ctx.lineDashOffset = (rayCount % 2) ? 0 : ctx.lineWidth * 2;
            angle = rayCount * angleInc;
            ctx.beginPath();
            ctx.moveTo(center.x, center.y);
            ctx.lineTo(center.x + dist * 2 * Math.cos(angle), center.y + dist * 2 * Math.sin(angle));
            ctx.strokeStyle = (rayCount % 2) ? 'white' : 'black';
            ctx.stroke();
        }
    });
    ctx.globalCompositeOperation = 'normal';

    // func to draw a set of parallel square-patterned stripes
    let drawStripes = function(cx, cy, N=6, angle, thickness=MAXWEIGHT * .66) {
        ctx.lineWidth = thickness;

        let norm = angle + PI;
        let x1 = cx;

        for (var i=0; i<N; i++) {
            // solid line for bg
            ctx.strokeStyle = getSolidFill();
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(0, cy + i * thickness);
            ctx.lineTo(cw, cy + i * thickness);
            ctx.stroke();

            // dashed line for checkers
            ctx.strokeStyle = getSolidFill();
            ctx.setLineDash([thickness, thickness]);
            ctx.beginPath();
            ctx.moveTo(0, cy + i * thickness);
            ctx.lineTo(cw, cy + i * thickness);
            ctx.stroke();
        }
    }

    // draw horizontal stripes somewhere
    //drawStripes(cw/2, ch - SCALE/4, randomInt(4,8), 0, MAXWEIGHT * randomInRange(0.5, 0.8));

    // clear dash settings
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;


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


