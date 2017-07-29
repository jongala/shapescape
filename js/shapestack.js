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
        if (Math.random() > 0) {
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
        ctx.save();
        ctx.translate(x, y);
        ctx.beginPath();
        ctx.moveTo(r, 0);
        ctx.arc(0, 0, r, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.restore();

        ctx.fillStyle = opts.fill;
        ctx.strokeStyle = opts.stroke;
        ctx.fill();
        opts.stroke && ctx.stroke();

        return ctx;
    }

    function drawRing(ctx, x, y, r, opts) {
        var inner = r * 0.5;

        ctx.save();
        ctx.translate(x, y);
        ctx.beginPath();
        ctx.moveTo(r, 0);
        ctx.arc(0, 0, r, 0, 2 * Math.PI, false);
        // cutout
        ctx.moveTo(inner, 0);
        ctx.arc(0, 0, inner, 0, 2 * Math.PI, true);
        ctx.closePath();
        ctx.restore();

        ctx.fillStyle = opts.fill;
        ctx.strokeStyle = opts.stroke;
        ctx.fill();
        opts.stroke && ctx.stroke();
        return ctx;
    }

    function drawTriangle(ctx, x, y, size, opts) {
        var h = 2 * size * Math.cos(Math.PI/6);

        ctx.save();
        ctx.translate(x, y);
        ctx.beginPath();
        ctx.moveTo(0, -h/2);
        ctx.lineTo(size, h/2);
        ctx.lineTo(-size, h/2);
        ctx.closePath();
        ctx.restore();

        ctx.fillStyle = opts.fill || getFill(ctx, opts.palette, 0, 0 + size/2, size, opts.skew);
        ctx.fill();

        return ctx;
    }

    function drawSquare(ctx, x, y, d, opts) {
        ctx.save();
        ctx.translate(x, y);
        ctx.beginPath();
        ctx.rect(-d, -d, d * 2, d * 2);
        ctx.closePath();
        ctx.restore();

        ctx.fillStyle = opts.fill || getFill(ctx, opts.palette, 0, 0 + d/2, d);
        ctx.fill();

        return ctx;
    }

    function drawRect(ctx, x, y, d, opts) {
        var gl = 0.6180339;
        ctx.save();
        ctx.translate(x, y);
        if (opts.angle) {
            ctx.rotate(opts.angle)
        }

        ctx.beginPath();
        ctx.rect(-d, -d * gl, d * 2, d * 2 * gl);
        ctx.closePath();
        ctx.restore();

        ctx.fillStyle = opts.fill || getFill(ctx, opts.palette, 0, 0 + d/2, d);
        ctx.fill();
        return ctx;
    }

    function drawBox(ctx, x, y, d, opts) {
        var r = d * 0.4;

        ctx.save();
        ctx.translate(x, y);
        if (opts.angle) {
            ctx.rotate(opts.angle)
        }
        ctx.beginPath();
        ctx.moveTo(-d, -d);
        ctx.lineTo(+d, -d);
        ctx.lineTo(+d, +d);
        ctx.lineTo(-d, +d);
        // cutout
        ctx.moveTo(-r, -r);
        ctx.lineTo(-r, +r);
        ctx.lineTo(+r, +r);
        ctx.lineTo(+r, -r);

        ctx.closePath();
        ctx.restore();

        ctx.fillStyle = opts.fill || getFill(ctx, opts.palette, 0, 0 + d/2, d);
        ctx.fill();

        return ctx;
    }

    function _drawPolygon(SIDES, SCALE) {
        SCALE = SCALE || 1;

        return function(ctx, x, y, d, opts) {
            ctx.save();
            ctx.translate(x, y);
            if (opts.angle) {
                ctx.rotate(opts.angle)
            }

            var r = d * SCALE;
            var a = Math.PI * 2/SIDES;
            function _x(theta) {return r * Math.cos(theta - Math.PI/2)};
            function _y(theta) {return r * Math.sin(theta - Math.PI/2)};

            ctx.beginPath();
            ctx.moveTo(_x(a * 0), _y(a * 0));
            for (var i = 1; i <= SIDES; i++) {
                ctx.lineTo(_x(a * i), _y(a * i));
            }
            ctx.closePath();
            ctx.restore();

            ctx.fillStyle = opts.fill || getFill(ctx, opts.palette, 0, 0 + d/2, d);
            ctx.fill();

            return ctx;
        }
    }

    var drawPentagon = _drawPolygon(5, 1.1);
    var drawHexagon = _drawPolygon(6, 1.05);

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
             triCount = Math.round(randomInRange(40,60));
             ctx.globalAlpha = randomInRange(0.1, 0.3);
        } else {
            // … sometimes, render a few beams at more varying opacities
            triCount = Math.round(randomInRange(5,10));
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


    // draw it!
    function shapestack(options) {
        var defaults = {
            container: 'body',
            palette: ['#222222', '#fae1f6', '#b966d3', '#8ED2EE', '#362599', '#fff9de', '#FFC874'],
            drawShadows: false,
            addNoise: 0.04,
            noiseInput: null,
            dust: false,
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
            'ring': drawRing,
            'triangle': drawTriangle,
            'square': drawSquare,
            'box': drawBox,
            'rect': drawRect,
            'pentagon': drawPentagon,
            'hexagon': drawHexagon
        };
        var shapes = Object.keys(renderMap);

        var grays = ["#111111", "#666666",  "#999999", "#cccccc", "#f9f9f9"];

        // BEGIN RENDERING

        if (opts.drawShadows) {
            addShadow(ctx, w, h);
        }

        // draw background/sky
        ctx.fillStyle = '#cccccc';
        ctx.fillRect(0, 0, w, h);

        // shuffle shape list and pick a shape
        shapes.sort(function(a, b) { return randomInRange(-1, 1)});
        renderer = renderMap[shapes[0]];

        // DEBUG
        renderer = drawCircle;

        // pick centerpoint for shape
        var maskX = w/2;
        var maskY = h * randomInRange(0.45, 0.55);
        var maskSize = Math.min(w,h) * randomInRange(0.33, 0.45);

        // pick depth of stack
        var stackSize = randomInRange(1, 4);
        var heightA = h * randomInRange(0.4, 0.6);
        var heightB = heightA * randomInRange(0.95, 1.05);

        var stackA = [];
        var stackB = [];

        var levelA = h - heightA;
        var levelB = h - heightB;

        var block;

        var i = 1;
        var blockH;
        while (i++ <= stackSize) {
            console.log(i);
            blockH = heightA / stackSize;
            block = [levelA, levelA + randomInRange(0.25 * blockH, blockH)];
            levelA = block[1];
            stackA.push(block);

            blockH = heightB / stackSize;
            block = [levelB, levelB + randomInRange(0.25 * blockH, blockH)];
            levelB = block[1];
            stackB.push(block);

        }
        stackA.push([levelA, h]);
        stackB.push([levelB, h]);

        console.log(stackA, stackB);

        var gray;
        function drawStack(stack, x, palette) {
            stack.forEach(function(y, i) {
                if (palette === 'gray') {
                    gray = randomInRange(0.55, 0.85);
                    ctx.fillStyle = 'rgba(0, 0, 0,' + (i + 1) * gray/stackSize + ')';
                } else {
                    ctx.fillStyle = getFill(ctx, palette);
                }

                ctx.beginPath();
                ctx.rect(x, y[0], w/2, y[1] - y[0]);
                ctx.closePath();

                ctx.fill();
            });
        }

        drawStack(stackA, 0, 'gray');
        drawStack(stackB, w/2, 'gray');


        // Draw Mask
        console.log('mask', w/2 + maskSize, maskY);

        ctx.save();
        ctx.beginPath();
        //ctx.moveTo(w/2 + maskSize, maskY);
        ctx.arc(w/2, maskY, maskSize, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        ctx.clip();

        drawStack(stackA, 0, opts.palette);
        drawStack(stackB, w/2, opts.palette);

        ctx.restore();

        // vertical pin
        var nudge = (heightA > heightB) ? -0.5 : 0.5;
        ctx.globalAlpha = 0.3;
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(w/2 + nudge, 0);
        ctx.lineTo(w/2 + nudge, h - Math.max(heightA, heightB));
        ctx.closePath();
        ctx.strokeStyle = '#000000';
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(w/2 + nudge, maskY + maskSize);
        ctx.lineTo(w/2 + nudge, h);
        ctx.closePath();
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();


        // Add effect elements
        // ...


        // add noise
        if (opts.addNoise && window.noiseUtils) {
            if (opts.noiseInput) {
                noiseUtils.applyNoiseCanvas(el, opts.noiseInput);
            } else {
                noiseUtils.addNoiseFromPattern(el, opts.addNoise, w/3);
            }
        }

        // END RENDERING

        // if new canvas child was created, append it
        if (newEl) {
            container.appendChild(el);
        }

    }

    // export
    window.shapestack = shapestack;
}());
