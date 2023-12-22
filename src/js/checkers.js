import noiseUtils from './noiseutils';
import palettes from './palettes';
import hexScatter from './hexScatter';
import { randItem, randomInRange, randomInt, resetTransform, rotateCanvas, getGradientFunction, getSolidColorFunction, shuffle } from './utils';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';

const DEFAULTS = {
    container: 'body',
    palette: palettes.plum_sauce,
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

    /*
    Approach:
    - choose some center points
    - draw nested sets of rings around each point
    - each ring has a solid stroke for a base color, and a dashed stroke
    - these create a radial checkerboard pattern
    */


    // max line weight depends on canvas size
    //const MAXWEIGHT = SCALE / (50 + LONG/100);
    const MAXWEIGHT = SCALE / 20;
    ctx.lineWidth = MAXWEIGHT;
    console.log('max thickness', MAXWEIGHT);


    let centers = []; // array of center points
    let rings = []; // array of all rings

    // pick a few center points
    // more for large layouts
    let centerCount = randomInt(2, 2 + SCALE/400);
    // more rings per group in large and stretched layouts
    let ringsPerGroup = [5 + Math.round(SCALE/150), 10 + Math.round(ASPECT * 20)];
    let spacing = 0; // between rings

    // Radius to step outward, intial value. Keep in outer scope because
    // rays will rely on this for drawing too.
    let r = 0;

    // center vars
    // Scatter points coarsely
    // These numbers aren't great
    const MARGIN = SHORT/12;
    let pts = hexScatter(SHORT * 0.5, cw - MARGIN * 2, ch - MARGIN * 2);

    pts.forEach((p, i) => {
        p[0] += MARGIN;
        p[1] += MARGIN;
        // The scatter algo will place points out of bounds or near edges.
        // Discard those points.
        let bounds = true;
        if (p[0] > (cw - MARGIN)) bounds = false;
        if (p[0] < MARGIN) bounds = false;
        if (p[1] > (ch - MARGIN)) bounds = false;
        if (p[1] < MARGIN) bounds = false;

        if (bounds) {
            centers.push({x:p[0], y:p[1]});
            //drawCircle(ctx,p[0], p[1], 30, {fill:'red'});
        }
    });

    // Limit centers, since hexscatter has a lot of overscan and does
    // poorly when cell size is large compared to container.
    // Allow more centers for stretched layouts.
    centers = shuffle(centers);
    let maxCenters = Math.ceil(ASPECT);
    centers = centers.slice(0, maxCenters);

    ctx.lineCap = 'butt';//

    // Step through the centers and create ring clusters for each
    centers.forEach((center, i)=> {
        // intial r
        r = SCALE * randomInRange(0.4, 0.7);

        let thickness = randomInRange(MAXWEIGHT/4, MAXWEIGHT);
        let ringCount = randomInt(...ringsPerGroup);

        let dash = thickness;
        let C = r * 2 * PI;
        let n = C / (2 * dash);
        let N = Math.ceil(n);
        let gap = dash * (2 * n - N)/N;


        // make several rings
        while (r > 10) {
            // create a ring
            let arcLength = PI * 2;
            let arcOffset = 0;

            // recalculate dashes for new r
            C = r * 2 * PI;
            dash = C / N;
            gap = dash;
            thickness = dash;

            // draw the solid ring, then draw dashed on top

            ctx.lineWidth = thickness + 10;

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

            // increment r by ring thickness + spacing
            r = r - (thickness + spacing);
        }
    });

    console.log(rings.length + ' rings around ' + centers.length + ' centers' );


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


