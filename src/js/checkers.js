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
    console.log('max thickness', MAXWEIGHT);


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

    centers = [{x: cw/2, y: 0 - SHORT * .9}];


    // Limit centers, since hexscatter has a lot of overscan and does
    // poorly when cell size is large compared to container.
    // Allow more centers for stretched layouts.
    centers = shuffle(centers);
    //let maxCenters = Math.ceil(ASPECT);
    //centers = centers.slice(0, maxCenters);

    ctx.lineCap = 'butt';//

    // Step through the centers and create ring clusters for each
    centers.forEach((center, i)=> {
        // intial r
        let r = SCALE * randomInRange(0.4, 0.7);
        r = SHORT * randomInRange(1, 2);
        let R = r; // keep original value, as we step inward

        let STRETCH = randItem([1, 1, 1, 1.618, 1.618, 2]);


        // start with a baseline thickness
        let thickness = randomInRange(MAXWEIGHT/4, MAXWEIGHT);

        // Assume dash length will equal thickness
        // Find a value near thickness that will give a whole number
        // of dashes
        let C = r * 2 * PI;
        let n = C / (thickness);
        let N = Math.round(n);
        let dash = C / N; // the dash length for whole number
        let gap = dash * STRETCH; // set gap relative to dash
        thickness = dash; // reset thickness to the gap


        // make several rings
        while (r > R * .7) {
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

            // draw the solid ring, then draw dashed on top

            ctx.setLineDash([]); // solid ring
            ctx.beginPath();
            ctx.arc(center.x, center.y, r, 0, 2 * PI);
            ctx.strokeStyle = getSolidFill();
            ctx.stroke();

            // dashed ring
            ctx.setLineDash([dash, gap]);

            // draw the fg ring with a rando color
            ctx.lineDashOffset = 0;
            ctx.beginPath();
            ctx.arc(center.x, center.y, r, 0, 2 * PI);
            ctx.strokeStyle = getSolidFill();
            ctx.stroke();

            // increment r by ring thickness
            r = r - thickness;
        }
    });

    console.log(rings.length + ' rings around ' + centers.length + ' centers' );


    let drawStripes = function(cx, cy, N=6, angle, thickness=MAXWEIGHT * .66) {
        ctx.lineWidth = thickness;

        let norm = angle + PI;
        let x1 = cx;

        for (var i=0; i<N; i++) {
            ctx.strokeStyle = getSolidFill();
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(0, cy + i * thickness);
            ctx.lineTo(cw, cy + i * thickness);
            ctx.stroke();

            ctx.strokeStyle = getSolidFill();
            ctx.setLineDash([thickness, thickness]);
            ctx.beginPath();
            ctx.moveTo(0, cy + i * thickness);
            ctx.lineTo(cw, cy + i * thickness);
            ctx.stroke();
        }
    }

    drawStripes(cw/2, ch - SCALE/4, randomInt(4,8), 0, MAXWEIGHT * randomInRange(0.5, 0.8));


    /**
     * util for drawing rays
     * from @p1 to @p2, at thickness @weight.
     * Start solid and draws the last @dottedFraction dotted or dashed,
     * depending on weight.
     * Relies on a global context ctx;
     * */
    function dottedLine(p1, p2, weight, dottedFraction = 0.33) {
        ctx.lineWidth = weight;

        let [x1, y1] = p1;
        let [x2, y2] = p2;
        let dx = x2 - x1;
        let dy = y2 - y1;

        let d = Math.sqrt(dx * dx + dy * dy);

        let t = Math.atan(dy / dx);
        if (x2 < x1) t += PI;

        let mx = x1 + Math.cos(t) * d * (1 - dottedFraction);
        let my = y1 + Math.sin(t) * d * (1 - dottedFraction);

        // start solid
        ctx.lineCap = 'butt';
        ctx.setLineDash([]);
        ctx.lineDashOffset = 0;
        // draw solid segment
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(mx, my);
        ctx.stroke();

        // dotted portion:
        ctx.beginPath();
        ctx.lineCap = 'round';
        if (weight <= 4) {
            // thin strokes
            ctx.setLineDash([weight, weight * 4]);
            ctx.lineDashOffset = 0;
        } else {
            // thick strokes
            ctx.setLineDash([0, weight * 2]);
            ctx.lineDashOffset = weight * 1;
        }
        ctx.moveTo(mx, my);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // reset dashes for any following drawing
        ctx.setLineDash([]);
        ctx.lineDashOffset = 0;
    }


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


