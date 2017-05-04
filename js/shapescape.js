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

    function drawTriangle(ctx, x, y, height, opts) {
        var side = height / Math.cos(Math.PI/6);
        ctx.fillStyle = opts.fill || getFill(ctx, opts.palette, x, y + height/2, height, opts.skew);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + side/2, y + height);
        ctx.lineTo(x - side/2, y + height);
        ctx.closePath();
        ctx.fill();
        return ctx;
    }

    function drawSquare(ctx, x, y, d, opts) {
        ctx.fillStyle = opts.fill || getFill(ctx, opts.palette, x, y + d/2, d);
        ctx.fillRect(x - d/2, y - d/2, d, d);
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
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 3 * Math.min(w,h)/400;
            ctx.shadowBlur = 10 * Math.min(w,h)/400;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        }

        // draw background/sky
        ctx.fillStyle = getFill(ctx, opts.palette, 0, 0, h, opts.skew);
        ctx.fillRect(0, 0, w, h);

        // shuffle shape list and pick a shape
        shapes.sort(function(a, b) { return randomInRange(-1, 1)});
        var shape = renderMap[shapes[0]];

        // pick centerpoint for shape
        var shapeX = w/2;
        var shapeY = h * randomInRange(0.4, 0.6);
        var shapeSize = Math.min(w,h) * randomInRange(0.2, 0.4);
        var magnification = randomInRange(1.07, 1.1);

        // adjust params for triangle
        if (shapes[0] === 'triangle') {
            shapeY -= shapeSize/2;
            magnification = randomInRange(1.2, 1.4);
        }

        // create a fill we will reuse for both renderings of the shape
        var shapeFill = getFill(ctx, opts.palette, shapeX, shapeY, shapeSize, 0);

        // draw the shape above waterline
        shape(ctx, shapeX, shapeY, shapeSize, {
            fill: shapeFill
        });

        // draw waterline
        var wl; // left waterline
        var wr; // right waterline
        var wc1; // control point
        var wc2;  // control point

        wl = randomInRange(0.47, 0.52) * h;
        wr = randomInRange(0.45, 0.55) * h;
        wc1 = randomInRange(0.45, 0.55) * h;
        wc2 = randomInRange(0.47, 0.52) * h;

        var wtop = Math.min(wl, wr);

        drawWaterline(ctx, wl, wc1, wc2, wr, w, h, extend({
            fill: getFill(ctx, opts.palette, 0, wtop, h - wtop, 0)
        }, opts));

        // rendering to be done within the waterline clipping
        function underwater(ctx, w, h, y1, y2) {

            // draw light beams
            var hz = Math.min(y1, y2);

            var triCount = Math.round(randomInRange(3,7));
            console.log(triCount);
            ctx.globalCompositeOperation = 'soft-light';
            ctx.globalAlpha = randomInRange(0.4, 0.8);
            while (triCount--) {
                var th = randomInRange(h - hz, h);
                console.log(hz, th);
                var grad = ctx.createLinearGradient(0, hz,
                    w, h);
                grad.addColorStop(0, 'rgba(255, 255, 211, 1)');
                grad.addColorStop(1, 'rgba(255, 255, 211, 0)');
                drawTriangle(ctx, randomInRange(-w, w), h - th, th, {
                    palette: ['#fff', '#ff9', '#fd6'],
                    fill: grad,
                    skew: 0
                })
            }

            // draw shape, a little bigger
            ctx.globalCompositeOperation = 'normal';
            shape(ctx, shapeX, shapeY, shapeSize * magnification, {
                fill: shapeFill
            });

            
            var colorSample = ctx.getImageData(w/2, Math.floor((h -hz)/2), 1, 1);
            var colorData = colorSample.data;
            var waterLevel = hz;
            var waterFill = ctx.createLinearGradient(0, hz, 0, hz * randomInRange(1.1, 1.2));
            waterFill.addColorStop(0, `rgba(${colorData[0]}, ${colorData[1]}, ${colorData[2]}, 1)`);
            waterFill.addColorStop(1, `rgba(${colorData[0]}, ${colorData[1]}, ${colorData[2]}, 1)`);

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

            
            drawWaterlines('soft-light',
                hz,
                hz + (h - hz)/3,
                0.2,
                0.8);

            drawWaterlines('multiply',
                hz + (h - hz)/2,
                h,
                0.1,
                0.3);




            // top edge
            /*var edgeFill = ctx.createLinearGradient(0, hz, 0, hz + h/10);
            edgeFill.addColorStop(0, '#fff');
            edgeFill.addColorStop(1, '#000');
            ctx.globalCompositeOperation = 'screen';
            drawWaterline(ctx, wl, wc1, wc2, wr, w, h, {
                fill: edgeFill
            });*/
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
