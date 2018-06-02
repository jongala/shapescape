import noiseUtils from './noiseutils';
import { randItem, randomInRange, setAttrs } from './utils';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';

/**
 * Get a fill, either in solid or gradients
 * @param  {context} ctx  the canvas rendering context
 * @param {array} palette an array of color values
 * @param  {num} x    center x of shape
 * @param  {num} y    center y of shape
 * @param  {num} size half the size of the shape (r for circle)
 * @return {fillStyle}      a solid color or canvas gradient
 */
function getFill(ctx, palette, x, y, size, skew) {
    if (skew === undefined) {
        skew = 0;
    }
    if (Math.random() > 0.9) {
        // solid
        return randItem(palette);
    } else {
        // gradient
        // pick xoffset as fraction of size to get a shallow angle
        var xoff = randomInRange(-skew / 2, skew / 2) * size;
        // build gradient, add stops
        var grad = ctx.createLinearGradient(x - xoff, y - size, x + xoff, y + size);
        grad.addColorStop(0, randItem(palette));
        grad.addColorStop(1, randItem(palette));
        return grad;
    }
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
    ctx.moveTo(0, y1);
    ctx.bezierCurveTo(w / 3, c1, 2 * w / 3, c2, w, y2);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.clip();

    renderFunc(ctx, w, h, y1, y2);

    ctx.closePath();
    ctx.restore();
}

// draw it!
function waterline(options) {
    var defaults = {
        container: 'body',
        palette: ['#222222', '#fae1f6', '#b966d3', '#8ED2EE', '#362599', '#fff9de', '#FFC874'],
        drawShadows: true,
        addNoise: 0.04,
        noiseInput: null,
        dust: false,
        skew: 1, // normalized skew
        clear: true
    };
    var opts = {};
    opts = Object.assign(Object.assign(opts, defaults), options);

    var container = options.container;

    var w = container.offsetWidth;
    var h = container.offsetHeight;

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

    var renderer;
    var renderMap = {
        circle: drawCircle,
        ring: drawRing,
        triangle: drawTriangle,
        square: drawSquare,
        box: drawBox,
        rect: drawRect,
        pentagon: drawPentagon,
        hexagon: drawHexagon
    };
    var shapes = Object.keys(renderMap);

    // BEGIN RENDERING

    if (opts.drawShadows) {
        addShadow(ctx, w, h);
    }

    // draw background/sky
    ctx.fillStyle = getFill(ctx, opts.palette, 0, 0, h, opts.skew);
    ctx.fillRect(0, 0, w, h);

    // shuffle shape list and pick a shape
    shapes.sort(function(a, b) {
        return randomInRange(-1, 1);
    });
    renderer = renderMap[shapes[0]];

    // pick centerpoint for shape
    var shapeX = w / 2;
    var shapeY = h * randomInRange(0.4, 0.6);
    var shapeSize = Math.min(w, h) * randomInRange(0.25, 0.4);
    if (shapes[0] === 'rect') {
        // bump up size of rectangles
        shapeSize *= 1.2;
    }
    var shapeMagnified = shapeSize + Math.min(w, h) / randomInRange(50, 80);
    // Rotate shape. Not all renderers will use this.
    var shapeAngle = randomInRange(-Math.PI / 12, Math.PI / 12);

    // Create a fill we will reuse for both renderings of the shape
    var shapeFill = getFill(ctx, opts.palette, shapeX, shapeY, shapeSize, 0);

    // Prepare main waterlines
    var wl; // left waterline
    var wc1; // control point
    var wc2; // control point
    var wr; // right waterline
    var wtop; // the min of the waterline heights
    var wfill; // main waterline fill
    var bgOffset; // offset of background waterline

    // Set waterline params for background renderin, and common fill
    wl = randomInRange(0.49, 0.51) * h;
    wc1 = randomInRange(0.48, 0.52) * h;
    wc2 = randomInRange(0.48, 0.52) * h;
    wr = randomInRange(0.49, 0.51) * h;
    wtop = Math.min(wl, wr);
    wfill = getFill(ctx, opts.palette, 0, wtop, h - wtop, 0);

    // Draw background waterline at low opacity, slightly offset upward
    ctx.globalAlpha = randomInRange(0.2, 0.6);
    bgOffset = h / randomInRange(40, 100);
    drawWave(
        ctx,
        wr - bgOffset,
        wc2 - bgOffset,
        wc1 - bgOffset,
        wl - bgOffset,
        w,
        h,
        Object.assign({ fill: wfill }, opts)
    );
    ctx.globalAlpha = 1;

    // Draw the shape above waterline
    renderer(ctx, shapeX, shapeY, shapeSize, {
        fill: shapeFill,
        angle: shapeAngle
    });

    // Draw main foreground waterline. We will reuse these params
    // for clipping the underwater elements
    wl = randomInRange(0.47, 0.52) * h;
    wc1 = randomInRange(0.45, 0.55) * h;
    wc2 = randomInRange(0.45, 0.55) * h;
    wr = randomInRange(0.47, 0.52) * h;
    wtop = Math.min(wl, wr);
    drawWave(
        ctx,
        wl,
        wc1,
        wc2,
        wr,
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
        ctx.globalAlpha = randomInRange(0.2, 1);
        addShadow(ctx, w, h);
        renderer(ctx, shapeX, shapeY, shapeMagnified, {
            fill: shapeFill,
            angle: shapeAngle
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
        var edgeThickness = h * 0.005 * Math.random() + 1.5;
        var edgeFill = ctx.createLinearGradient(0, 0, w, 0);
        edgeFill.addColorStop(0, '#808080');
        edgeFill.addColorStop(randomInRange(0, 0.5), '#fff');
        edgeFill.addColorStop(randomInRange(0.5, 1), '#fff');
        edgeFill.addColorStop(1, '#808080');

        ctx.fillStyle = edgeFill;
        ctx.globalCompositeOperation = 'overlay';
        ctx.globalAlpha = randomInRange(0.1, 0.75);

        ctx.beginPath();
        ctx.moveTo(0, wl);
        ctx.bezierCurveTo(w / 3, wc1 - 1, 2 * w / 3, wc2 - 1, w, wr);
        ctx.lineTo(w, wr + 3);
        ctx.bezierCurveTo(2 * w / 3, wc2 + edgeThickness, w / 3, wc1 + edgeThickness, 0, wl + 2);
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
    clipInWaterline(ctx, wl, wc1, wc2, wr, w, h, underwater);

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

// export
export default waterline;
