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

    /*
    Approach:
    - choose some center points
    - define a set of widening rings around each center point
    - each ring is solid or dashed, and of varying length and offset
    - all ring defs are in a common array, which we shuffle so they will
      be drawn interleaved if ring clusters overlap
    - around the last center point, draw radial rays, either starting at
      ring edge going outward, or at outer perimeter coming inward.
    - on top of this, draw rings twice: once with extra thickness in the
      background color, then again with a random foreground color.
      This leaves a cutout/outline where they overlap.
    */


    // max line weight depends on canvas size
    const MAXWEIGHT = SCALE / (50 + LONG/100);
    ctx.lineWidth = MAXWEIGHT;
    console.log('max thickness', MAXWEIGHT);


    let centers = []; // array of center points
    let rings = []; // array of all rings

    // pick a few center points
    // more for large layouts
    let centerCount = randomInt(2, 2 + SCALE/400);
    // more rings per group in large and stretched layouts
    let ringsPerGroup = [5 + Math.round(SCALE/150), 10 + Math.round(ASPECT * 20)];
    let spacing = 3; // between rings

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

    // Step through the centers and create ring clusters for each
    centers.forEach((center, i)=> {
        // intial r
        r = SCALE / 20;

        let ringCount = randomInt(...ringsPerGroup);
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
                // complete circle
                arcLength = PI * 2;
                arcOffset = 0;
            }

            // define the ring
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

    // draw rays
    // start from the last incremented value of r
    let minRayRadius = r + MAXWEIGHT;
    let maxrayEnd = rayStart * randomInRange(1.1, 2);
    let rayStart, rayEnd;


    let rayStyle = randItem(['INNER', 'OUTER']);

    // bigger circle = room for more rays
    let rayCount;
    if (rayStyle === 'OUTER') {
        rayCount = randomInt(60, 120);
    } else {
        rayCount = randomInt(40, 80);
    }

    console.log(`${rayCount} rays`);
    let rays = [];
    // use the last center, because that corresponds to the r value we are using
    let rayCenter = centers[centers.length - 1];

    // linecap for rays is always butt, for precise origin
    ctx.lineCap = 'butt';
    let dottedFraction; // will pass to dottedLine with various values

    // step through the rays
    for (var i = 0; i < rayCount; i++) {
        ctx.strokeStyle = getContrastColor();

        let theta = i * TWOPI/rayCount;
        let rayEnd = minRayRadius * randomInRange(1.1, 2);
        let _cos, _sin;
        _cos = Math.cos(theta);
        _sin = Math.sin(theta);

        let _start, _end;
        if (rayStyle === 'INNER') {
            _start = minRayRadius;
            _end = rayEnd;
        } else if (rayStyle === 'OUTER') {
            _start = LONG * 1.44;
            _end = rayEnd;
        } else {
            return;
        }

        let rayWidth;

        // rays have alternating thickness and dottedness
        if (i % 2) {
            dottedFraction = 0;
            rayWidth = randomInRange(1, MAXWEIGHT);
        } else {
            dottedFraction = randomInRange(0.15, 0.33);
            rayWidth = randomInRange(1, MAXWEIGHT/2);
        }

        // draw with dotted line util
        dottedLine([
            rayCenter.x + _cos * _start,
            rayCenter.y + _sin * _start
            ], [
            rayCenter.x + _cos * _end,
            rayCenter.y + _sin * _end
            ],
            rayWidth,
            dottedFraction
        );
    }

    // prepare linecap for rings
    // prefer square, use round sometimes
    ctx.lineCap = randItem(['round','square','square','square','square']);


    // then shuffle rings to interleave
    rings = shuffle(rings);


    // for each ring, draw it
    rings.forEach((ring, i) => {
        // draw this ring

        let dash = ring.thickness * randomInRange(0.5, 5);

        // sometimes set dashes, others do continuous lines
        if (Math.random() < 0.5) {
            ctx.setLineDash([dash, dash * randomInRange(0, 3) + ring.thickness]);
            ctx.lineDashOffset = -spacing; // to get shadow around dashes
        } else {
            ctx.setLineDash([]);
        }


        // draw a shadow with bg color and extra thickness
        ctx.beginPath();
        let cap = spacing/ring.r; // extend the shadow a bit around the end
        ctx.arc(ring.x, ring.y, ring.r, ring.start - cap, ring.end + cap, ring.reverse);
        ctx.lineWidth = ring.thickness + 2 * spacing;
        ctx.strokeStyle = bg;
        ctx.stroke();


        // draw the fg ring with a rando color
        ctx.lineDashOffset = 0;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.r, ring.start, ring.end, ring.reverse);
        ctx.lineWidth = ring.thickness;
        ctx.strokeStyle = ring.color;
        ctx.stroke();
    });

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


