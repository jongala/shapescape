import noiseUtils from './noiseutils';
import { randItem, randomInRange, setAttrs } from './utils';
import { defineFill, expandFill } from './colors';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';


/**
 * Define a fill, either in solid or gradients
 * @param  {context} ctx  the canvas rendering context
 * @param {array} palette an array of color values
 * @param  {num} x    center x of shape
 * @param  {num} y    center y of shape
 * @param  {num} size       half the size of the shape (r for circle)
 * @param  {num} skew       scalar to offset endpoints left/right for angled gradient
 * @return {fillStyle}      a solid color or canvas gradient
 */
function getRandomFill(palette, x, y, size, skew = 0) {
    let type = 'solid';
    if (Math.random() < 0.999999) {
        type = 'linear';
    }
    return defineFill(type, palette, x, y, size, skew);
}


function drawWave(ctx, y1, c1, c2, y2, w, h, opts) {
    ctx.save();
    if (opts.fill) {
        ctx.fillStyle = opts.fill;
    }
    ctx.beginPath();
    ctx.moveTo(0, y1);
    ctx.bezierCurveTo(w / 3, c1, 2 * w / 3, c2, w, y2);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();

    ctx.fill();
    ctx.restore();
}

function drawSunbeams(ctx, x, y, w, h, fill) {
    var triCount;
    var x2;
    var y2;
    var tw;
    var tx;
    var grad;
    ctx.globalCompositeOperation = 'soft-light';

    if (Math.random() > 0.15) {
        // Most of the time, render many beams at low opacity
        triCount = Math.round(randomInRange(40, 60));
        ctx.globalAlpha = randomInRange(0.1, 0.3);
    } else {
        // … sometimes, render a few beams at more varying opacities
        triCount = Math.round(randomInRange(5, 10));
        ctx.globalAlpha = randomInRange(0.2, 0.8);
    }

    while (triCount--) {
        // Set triangle width, and target x centerpoint.
        // Target x can be on or off page, with width spread bringing part
        // of the beam into the image
        tw = randomInRange(w / 30, w / 3); // width range
        tx = randomInRange(-w / 3, 4 * w / 3); // target (bottom) x
        ctx.fillStyle = fill || '#fff';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(tx + tw / 2, h);
        ctx.lineTo(tx - tw / 2, h);
        ctx.closePath();
        ctx.fill();
    }
}

function addShadow(ctx, w, h) {
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 3 * Math.min(w, h) / 400;
    ctx.shadowBlur = 10 * Math.min(w, h) / 400;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
}

function removeShadow(ctx) {
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
}

// Draw a waterline shape, clip to it, execute renderFunc,
// then restore canvas to remove clipping
function clipInWaterline(ctx, y1, c1, c2, y2, w, h, renderFunc) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, y1 * h);
    ctx.bezierCurveTo(w / 3, c1 * h, 2 * w / 3, c2 * h, w, y2 * h);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.clip();

    renderFunc(ctx, w, h, y1, y2);

    ctx.closePath();
    ctx.restore();
}

// Map shape names to drawing functions
let renderMap = {
    circle: drawCircle,
    ring: drawRing,
    triangle: drawTriangle,
    square: drawSquare,
    box: drawBox,
    rect: drawRect,
    pentagon: drawPentagon,
    hexagon: drawHexagon
};

let DEFAULT_OPTIONS = {
    container: 'body',
    palette: ['#222222', '#fae1f6', '#b966d3', '#8ED2EE', '#362599', '#fff9de', '#FFC874'],
    drawShadows: true,
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true
};


// For dev use:
// A descriptor of what we think a complete schema should look like.
// Compare structure with the def object produced by defineWaterline().
let SCHEMA = {
        shapeName: '',
        shapeY: 0,
        shapeSize: 0,
        shapeMagnified: 0,
        shapeAngle: 0,
        shapeFill: {},
        underwaterShapeAlpha: 1,
        backgroundFill: {},

        surfaceLine: {
            fill: {},
            backAlpha: 1,
            backOffset: 0,
            backLine: [0, 0, 0, 0],
            frontLine: [0, 0, 0, 0]
        },
        sunBeams: {
            alpha: 1,
            beams: [0, 0]
        },

        waveSet: [
            {
                gradient: {start: [0,0], end: [0,0]},
                position: [0, 0, 0, 0],
                alpha: 1
            }
        ],

        edgeThickness: 0,
        edgeAlpha: 1,
        edgeBlendStops: [0.25, 0.75], // left half, right half

        spots: [{
            x: 0,
            y: 0,
            r: 1,
            alpha: 1
        }]

};

// Dev util: check a waterline def against the schema, and list any keys
// not yet represented.  This doesn't check for correctness!!!
let checkDef = (def, schema) => {
    let defKeys = Object.keys(def);
    let schemaKeys = Object.keys(schema);
    let missingKeys = [];
    schemaKeys.map((k)=>{
        if (!defKeys.includes(k)) missingKeys.push(k);
    })
    return missingKeys;
}

// Create a waterline definition from a set of input @options.
// Eventually, this should be a JSON object that fully describes
// a graphic's appearance, with some secondary randomness.
export function defineWaterline(options) {
    let opts = Object.assign({}, DEFAULT_OPTIONS, options);
    let shapes = Object.keys(renderMap);
    // shuffle shape list and pick a shape
    shapes.sort(function(a, b) {
        return randomInRange(-1, 1);
    });

    // Set up container values that determine sizes and coordinates
    var container = opts.container;
    var w = container.offsetWidth;
    var h = container.offsetHeight;
    var SCALE = Math.min(w, h); // generalized size of the layout

    // temp vars which are used in multiple attributes
    let _shapeSize = randomInRange(0.25, 0.4);
    let _shapeX = 1/2;
    let _shapeY = randomInRange(0.4, 0.6);

    // waves
    let _backLine = [
        randomInRange(0.49, 0.51),
        randomInRange(0.48, 0.52),
        randomInRange(0.48, 0.52),
        randomInRange(0.49, 0.51)
    ];
    let _backTop = Math.min(_backLine[0], _backLine[3]);
    let _frontLine = [
        randomInRange(0.47, 0.52),
        randomInRange(0.45, 0.55),
        randomInRange(0.45, 0.55),
        randomInRange(0.47, 0.52)
    ];
    let _frontTop = Math.min(_frontLine[0], _frontLine[3]);

    // skeleton of a waterline def
    let def = {
        shapeName: shapes[0],
        shapeX: _shapeX,
        shapeY: _shapeY,
        shapeSize: _shapeSize,
        shapeMagnified: _shapeSize * (1 + 1 / randomInRange(50, 80)),
        // Rotate shape. Not all renderers will use this.
        shapeAngle: randomInRange(-Math.PI/12, Math.PI/12),
        shapeFill: getRandomFill(opts.palette, _shapeX, _shapeY, _shapeSize, opts.skew),
        underwaterShapeAlpha: randomInRange(0.2, 1),

        // sky fill
        backgroundFill: getRandomFill(opts.palette, 0.5, 0.5, 0.5, opts.skew),

        // waves
        surfaceLine: {
            fill: getRandomFill(opts.palette, 0, _backTop, 1 - _backTop, 0),
            backAlpha: randomInRange(0.2, 0.6),
            backOffset: 1 / randomInRange(40, 100), // offset between the two waterline waves
            backLine: _backLine,
            frontLine: _frontLine
        },

        // edge
        edgeThickness: 0.005 * Math.random(),
        edgeAlpha: randomInRange(0.1, 0.75),
        edgeBlendStops: [randomInRange(0, 0.5), randomInRange(0.5, 1)],
    }

    console.log('def', def);
    console.log('missing:', checkDef(def, SCHEMA));

    window.LASTDEF = def; // debug allow re-run

    return def;
}




// Draw a waterline, given a @def and rendering @options.
// Eventually, @options should contain only the target element, height, and
// width, while @def determines what is drawn in that space
export function drawWaterline(def, options) {
    let opts = Object.assign({}, DEFAULT_OPTIONS, options);

    var container = options.container;

    var w = container.offsetWidth;
    var h = container.offsetHeight;
    var SCALE = Math.min(w, h);

    // Find or create canvas child
    var el = container.querySelector('canvas');
    var newEl = false;
    if (!el) {
        container.innerHTML = '';
        el = document.createElement('canvas');
        newEl = true;
    }
    if (newEl || opts.clear) {
        setAttrs(el, {
            width: container.offsetWidth,
            height: container.offsetHeight
        });
    }

    var ctx; // canvas ctx or svg tag

    ctx = el.getContext('2d');

    // optional clear
    if (opts.clear) {
        el.width = container.offsetWidth;
        el.height = container.offsetHeight;
        ctx.clearRect(0, 0, w, h);
    }

    // BEGIN RENDERING

    if (opts.drawShadows) {
        addShadow(ctx, w, h);
    }

    // draw background/sky
    ctx.fillStyle = expandFill(ctx, def.backgroundFill, w, h, SCALE);
    ctx.fillRect(0, 0, w, h);


    let renderer = renderMap[def.shapeName];

    // pick centerpoint for shape

    // since these may get modified, make local copies
    let shapeSize = def.shapeSize;
    let shapeMagnified = def.shapeMagnified;
    if (def.shapeName === 'rect') {
        // bump up size of rectangles
        shapeSize *= 1.2;
        shapeMagnified *= 1.2;
    }

    // Create a fill we will reuse for both renderings of the shape
    var shapeFill = expandFill(ctx, def.shapeFill, w, h, SCALE);

    // Prepare main waterlines

    // Set waterline params for background renderin, and common fill
    let wfill = expandFill(ctx, def.surfaceLine.fill, w, h, SCALE); // main waterline fill

    // Draw background waterline at low opacity, slightly offset upward
    ctx.globalAlpha = def.surfaceLine.backAlpha;

    let backgroundOffset = def.surfaceLine.backOffset * h;
    drawWave(
        ctx,
        h * def.surfaceLine.backLine[0] - backgroundOffset,
        h * def.surfaceLine.backLine[1] - backgroundOffset,
        h * def.surfaceLine.backLine[2] - backgroundOffset,
        h * def.surfaceLine.backLine[3] - backgroundOffset,
        w,
        h,
        Object.assign({ fill: wfill }, opts)
    );
    ctx.globalAlpha = 1;

    // Draw the shape above waterline
    renderer(ctx, def.shapeX * w, def.shapeY * h, shapeSize * SCALE, {
        fill: shapeFill,
        angle: def.shapeAngle
    });

    // Draw main foreground waterline. We will reuse these params
    // for clipping the underwater elements
    drawWave(
        ctx,
        h* def.surfaceLine.frontLine[0],
        h* def.surfaceLine.frontLine[1],
        h* def.surfaceLine.frontLine[2],
        h* def.surfaceLine.frontLine[3],
        w,
        h,
        Object.assign(
            {
                fill: wfill
            },
            opts
        )
    );

    // rendering to be done within the waterline clipping
    function underwater(ctx, w, h, y1, y2) {
        var hz = Math.min(y1, y2);
        removeShadow(ctx);

        // Get a color sample from the underwater background block.
        // This will be used in the wavy overlays. We get it from
        // just below the horizon line in the middle, before we render
        // the underwater half of the main shape.
        var colorSample = ctx.getImageData(w / 2, Math.floor((h - hz) / 2), 1, 1);
        var colorData = colorSample.data;
        var waterLevel = hz;
        var waterColor = `${colorData[0]}, ${colorData[1]}, ${colorData[2]}`;
        var waterFill;

        // Draw light beams with the same fill as the water
        // (will render in a different blending mode)
        // The beams start anywhere across width, and somewhere above
        // the top of the image (hence negative y vals)
        drawSunbeams(ctx, randomInRange(0, w), randomInRange(-2 * h, hz / 2), w, h, wfill);

        // Draw the underwater half of the main shape, a little bigger
        // for the liquid magnification effect. Fade it out to get different
        // apparent depth and clarity in liquid.
        ctx.globalCompositeOperation = 'normal';
        ctx.globalAlpha = def.underwaterShapeAlpha;
        addShadow(ctx, w, h);
        renderer(ctx, def.shapeX * w, def.shapeY * h, shapeMagnified * SCALE, {
            fill: shapeFill,
            angle: def.shapeAngle
        });

        // Function to batch create sets of wavy lines under the water
        function drawWaveSet(composite, ymin, ymax, amin, amax) {
            ctx.globalCompositeOperation = composite || 'normal';
            ymin = ymin || 0;
            ymax = ymax || h;
            amin = amin || 0.2;
            amax = amax || 0.8;

            var waterCount = Math.round(randomInRange(3, 7));
            var increment = (ymax - ymin) / waterCount;

            while (waterCount--) {
                ctx.globalAlpha = randomInRange(amin, amax);
                waterLevel = ymin + waterCount * increment;

                waterFill = ctx.createLinearGradient(
                    randomInRange(w / 3, 2 * w / 3),
                    randomInRange(hz, waterLevel),
                    w / 2,
                    randomInRange(waterLevel, h)
                );
                waterFill.addColorStop(0, `rgba(${waterColor}, 1)`);
                waterFill.addColorStop(1, `rgba(${waterColor}, 0)`);

                drawWave(
                    ctx,
                    waterLevel * randomInRange(0.9, 1.1),
                    waterLevel * randomInRange(0.9, 1.1),
                    waterLevel * randomInRange(0.9, 1.1),
                    waterLevel * randomInRange(0.9, 1.1),
                    w,
                    h,
                    {
                        fill: waterFill
                    }
                );
            }
        }

        // The waves look bad when they cast shadows
        removeShadow(ctx);

        // Draw light blended waves near the surface
        drawWaveSet('soft-light', hz, hz + (h - hz) / 3, 0.2, 0.8);

        // Draw dark blended waves near the bottom
        drawWaveSet('multiply', hz + (h - hz) / 2, h, 0.1, 0.3);

        // At the top edge, use the main waterline points, then repeat the
        // curve going back to the left, slightly lower.  Fill with a light
        // gradient and blend over.
        var edgeThickness = def.edgeThickness * h + 1.5;
        var edgeFill = ctx.createLinearGradient(0, 0, w, 0);
        edgeFill.addColorStop(0, '#808080');
        edgeFill.addColorStop(def.edgeBlendStops[0], '#fff');
        edgeFill.addColorStop(def.edgeBlendStops[1], '#fff');
        edgeFill.addColorStop(1, '#808080');

        ctx.fillStyle = edgeFill;
        ctx.globalCompositeOperation = 'overlay';
        ctx.globalAlpha = def.edgeAlpha;

        let [wl, wc1, wc2, wr] = def.surfaceLine.frontLine;

        ctx.beginPath();
        ctx.moveTo(0, wl * h);
        ctx.bezierCurveTo(w / 3, h * wc1 - 1, 2 * w / 3, h * wc2 - 1, w, h * wr);
        ctx.bezierCurveTo(2 * w / 3, h * wc2 + edgeThickness, w / 3, h * wc1 + edgeThickness, 0, h * wl + 2);
        ctx.closePath();
        ctx.fill();

        if (opts.dust) {
            var spotCount = Math.floor(randomInRange(200, 1000));
            ctx.globalCompositeOperation = 'soft-light';
            while (--spotCount) {
                ctx.globalAlpha = randomInRange(0, 0.5);
                drawCircle(
                    ctx,
                    randomInRange(0, w),
                    randomInRange(hz, h),
                    randomInRange(0.5, 1.5) * w / 800,
                    { fill: '#fff' }
                );
            }
        }
    }

    // Now render the above function inside the waterline clipping area
    clipInWaterline(ctx, ...def.surfaceLine.frontLine, w, h, underwater);

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'normal';

    // Add effect elements
    // ...

    // add noise
    if (opts.addNoise) {
        if (opts.noiseInput) {
            noiseUtils.applyNoiseCanvas(el, opts.noiseInput);
        } else {
            noiseUtils.addNoiseFromPattern(el, opts.addNoise, w / 3);
        }
    }

    // END RENDERING

    // if new canvas child was created, append it
    if (newEl) {
        container.appendChild(el);
    }
}

// This wrapper function replaces the old single-function rendering pipeline,
// where you input rendering @options and get a surprise graphic.
export function waterline(options) {
    drawWaterline(defineWaterline(options), options)
}
