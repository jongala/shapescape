(function(){
    // simple object extender
    function extend(dest, src) {
        for (k in src) {
            if (src.hasOwnProperty(k)) {
                dest[k] = src[k];
            }
        }
        return dest;
    }



    // Turn constants into functions which return the constant,
    // used to allow passing colors as strings or functions
    function constToFunc(x) {
        if (typeof x !== "function") {
            return function(){return x;}
        } else {
            return x;
        }
    }

    function addNoiseToCanvas(canvas, opacity) {
        var ctx = canvas.getContext('2d'),
        x,
        y,
        noise,
        opacity = opacity || .2;

        var w = canvas.width;
        var h = canvas.height;

        for ( x = 0; x < w; x++ ) {
          for ( y = 0; y < h; y++ ) {
             noise = Math.floor( Math.random() * 255 );

             ctx.fillStyle = "rgba(" + noise + "," + noise + "," + noise + "," + opacity + ")";
             ctx.fillRect(x, y, 1, 1);
          }
        }
    }

    function addNoiseFromPattern(canvas, opacity, tileSize, useOverlay) {
        // create an offscreen canvas where we will generate
        // noise to use as a pattern
        var noiseCanvas = createNoiseCanvas(opacity, tileSize);
        applyNoiseCanvas(canvas, noiseCanvas, useOverlay);

        return {
            noiseCanvas: noiseCanvas,
            canvas: canvas
        }
    }

    function createNoiseCanvas(opacity, tileSize) {
        // create an offscreen canvas where we will generate
        // noise to use as a pattern
        tileSize = tileSize || 100;
        var noise = document.createElement('canvas');
        noise.width = tileSize;
        noise.height = tileSize;
        var noiseCtx = noise.getContext('2d');

        // add noise to the offscreen canvas
        addNoiseToCanvas(noise, opacity);

        return noise;
    }

    function applyNoiseCanvas(targetCanvas, noiseCanvas, useOverlay) {
        var ctx = targetCanvas.getContext('2d');
        // create a noise pattern from the offscreen canvas
        var noisePattern = ctx.createPattern(noiseCanvas, 'repeat');
        ctx.fillStyle = noisePattern;
        if (useOverlay) {
            ctx.globalCompositeOperation = 'overlay';
        }
        ctx.fillRect(0, 0, targetCanvas.width, targetCanvas.height);
        if (useOverlay) {
            ctx.globalCompositeOperation = 'normal';
        }
        return targetCanvas;
    }

    // random Array member
    function randItem(arr) {
        return arr[Math.floor(arr.length * Math.random())];
    }

    function randomInRange(min, max) {
        return (min + (max - min) * Math.random());
    }


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
            var xoff = randomInRange(-skew/2, skew/2) * size;
            // build gradient, add stops
            var grad = ctx.createLinearGradient(
                x - xoff,
                y - size,
                x + xoff,
                y + size);
            grad.addColorStop(0, randItem(palette));
            grad.addColorStop(1, randItem(palette));
            return grad;
        }
    }


    function setAttrs(el, attrs) {
        if (el && el.setAttribute) {
            for (a in attrs) {
                if (attrs.hasOwnProperty(a)) {
                    el.setAttribute(a, attrs[a]);
                }
            }
        }
    }


    function drawCircle(ctx, x, y, r, opts) {
        ctx.fillStyle = opts.fill;
        ctx.strokeStyle = opts.stroke;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arc(x, y, r, 0, 2 * Math.PI, false);
        ctx.fill();
        opts.stroke && ctx.stroke();
        ctx.closePath();
    }

    function drawTriangle(ctx, x, y, size, opts) {
        var h = 2 * size * Math.cos(Math.PI/6);
        ctx.fillStyle = opts.fill || getFill(ctx, opts.palette, x, y + height/2, height, opts.skew);
        ctx.beginPath();
        ctx.moveTo(x, y - h/2);
        ctx.lineTo(x + size, y + h/2);
        ctx.lineTo(x - size, y + h/2);
        ctx.closePath();
        ctx.fill();
        return ctx;
    }

    function drawSquare(ctx, x, y, d, opts) {
        ctx.fillStyle = opts.fill || getFill(ctx, opts.palette, x, y + d/2, d);
        ctx.fillRect(x - d, y - d, d * 2, d * 2);
    }

    function drawWaterline(ctx, y1, c1, c2, y2, w, h, opts) {
        ctx.save();
        //ctx.fillStyle = opts.fill || getFill(ctx, opts.palette, 0, 0, h - Math.min(y1, y2), opts.skew);
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

    function drawSunbeams(ctx, x, y, w, h) {
        var triCount = Math.round(randomInRange(3,7));
        var x2;
        var y2;
        var tw;
        var tx;
        var grad;
        ctx.globalCompositeOperation = 'soft-light';
        ctx.globalAlpha = randomInRange(0.1, 0.5);
        while (triCount--) {
            tw = randomInRange(w/30, w/3);
            tx = randomInRange(-w/3, 4 * w/3);
            grad = ctx.createLinearGradient(x, y,
                tx, randomInRange(h/2, h));

            grad.addColorStop(0, 'rgba(255, 255, 211, 1)');
            grad.addColorStop(1, 'rgba(255, 255, 211, 0)');
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(tx + tw/2, h);
            ctx.lineTo(tx - tw/2, h);
            ctx.closePath();
            ctx.fill();
        }
    }

    function addShadow(ctx, w, h) {
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 3 * Math.min(w,h)/400;
        ctx.shadowBlur = 10 * Math.min(w,h)/400;
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


    // Tile the container
    function shapescape(options) {
        var defaults = {
            container: 'body',
            palette: ['#222222', '#fae1f6', '#b966d3', '#8ED2EE', '#362599', '#fff9de', '#FFC874'],
            drawShadows: true,
            addNoise: 0.04,
            noiseInput: null,
            skew: 1, // normalized skew
            clear: true
        };
        var opts = {};
        opts = extend(extend(opts, defaults), options);

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
                'width': container.offsetWidth,
                'height': container.offsetHeight
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
            'circle': drawCircle,
            'triangle': drawTriangle,
            'square': drawSquare
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
        shapes.sort(function(a, b) { return randomInRange(-1, 1)});
        renderer = renderMap[shapes[0]];

        // pick centerpoint for shape
        var shapeX = w/2;
        var shapeY = h * randomInRange(0.4, 0.6);
        var shapeSize = Math.min(w,h) * randomInRange(0.2, 0.4);
        var shapeMagnified = shapeSize + Math.min(w,h) / randomInRange(50, 80);

        // Create a fill we will reuse for both renderings of the shape
        var shapeFill = getFill(ctx, opts.palette, shapeX, shapeY, shapeSize, 0);

        // Prepare main waterlines
        var wl; // left waterline
        var wc1; // control point
        var wc2;  // control point
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
        drawWaterline(ctx,
            wr - bgOffset,
            wc2 - bgOffset,
            wc1 - bgOffset,
            wl - bgOffset,
            w, h, extend({
            fill: wfill
        }, opts));
        ctx.globalAlpha = 1;

        // Draw the shape above waterline
        renderer(ctx, shapeX, shapeY, shapeSize, {
            fill: shapeFill
        });

        // Draw main foreground waterline. We will reuse these params
        // for clipping the underwater elements
        wl = randomInRange(0.47, 0.52) * h;
        wc1 = randomInRange(0.45, 0.55) * h;
        wc2 = randomInRange(0.45, 0.55) * h;
        wr = randomInRange(0.47, 0.52) * h;
        wtop = Math.min(wl, wr);
        drawWaterline(ctx, wl, wc1, wc2, wr, w, h, extend({
            fill: wfill
        }, opts));

        // rendering to be done within the waterline clipping
        function underwater(ctx, w, h, y1, y2) {
            var hz = Math.min(y1, y2);
            removeShadow(ctx);

            // Get a color sample from the underwater background block.
            // This will be used in the wavy overlays. We get it from
            // just below the horizon line in the middle, before we render
            // the underwater half of the main shape.
            var colorSample = ctx.getImageData(w/2, Math.floor((h -hz)/2), 1, 1);
            var colorData = colorSample.data;
            var waterLevel = hz;
            var waterColor = `${colorData[0]}, ${colorData[1]}, ${colorData[2]}`;
            var waterFill;

            // Draw light beams with some yellowish triangles
            drawSunbeams(ctx,
                randomInRange(0, w),
                randomInRange(-2 * h, -h/2 ),
                w,
                h);

            // Draw the underwater half of the main shape, a little bigger
            ctx.globalCompositeOperation = 'normal';
            ctx.globalAlpha = randomInRange(0.2, 1);
            addShadow(ctx, w, h);
            renderer(ctx, shapeX, shapeY, shapeMagnified, {
                fill: shapeFill
            });

            // Function to batch create sets of wavy lines under the water
            function drawWaterlines(composite, ymin, ymax, amin, amax) {
                ctx.globalCompositeOperation = composite || 'normal';
                ymin = ymin || 0;
                ymax = ymax || h;
                amin = amin || 0.2;
                amax = amax || 0.8;

                var waterCount = Math.round(randomInRange(3,7));
                var increment = (ymax - ymin)/waterCount;

                while (waterCount--) {
                    ctx.globalAlpha = randomInRange(amin, amax);
                    waterLevel = ymin + waterCount * increment;

                    waterFill = ctx.createLinearGradient(
                        randomInRange(w/3, 2*w/3),
                        randomInRange(hz, waterLevel),
                        w/2,
                        randomInRange(waterLevel, h));
                    waterFill.addColorStop(0, `rgba(${waterColor}, 1)`);
                    waterFill.addColorStop(1, `rgba(${waterColor}, 0)`);

                    drawWaterline(ctx,
                        waterLevel * randomInRange(0.9, 1.1),
                        waterLevel * randomInRange(0.9, 1.1),
                        waterLevel * randomInRange(0.9, 1.1),
                        waterLevel * randomInRange(0.9, 1.1),
                        w, h, {
                        fill: waterFill
                    });
                }
            }

            removeShadow(ctx);

            // Draw light blended waves near the surface
            drawWaterlines('soft-light',
                hz,
                hz + (h - hz)/3,
                0.2,
                0.8);

            // Draw dark blended waves near the bottom
            drawWaterlines('multiply',
                hz + (h - hz)/2,
                h,
                0.1,
                0.3);


            // At the top edge, use main waterline points and repeat the
            // curve back to left edge, slightly lower.  Fill with a light
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
        }

        clipInWaterline(ctx, wl, wc1, wc2, wr, w, h, underwater);


        // Add effect elements
        // ...


        // add noise
        if (opts.addNoise) {
            addNoiseFromPattern(el, opts.addNoise, w/3);
        }

        // END RENDERING

        // if new canvas child was created, append it
        if (newEl) {
            container.appendChild(el);
        }

    }

    // export
    window.shapescape = shapescape;
}());
