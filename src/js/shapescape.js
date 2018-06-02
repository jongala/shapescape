(function(){
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


    function drawCircle(ctx, x, y, r, fill, stroke, alpha) {
        alpha = (alpha === undefined) ? 1 : alpha;
        ctx.fillStyle = fill;
        ctx.strokeStyle = stroke;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arc(x, y, r, 0, 2 * Math.PI, false);
        ctx.fill();
        stroke && ctx.stroke();
        ctx.closePath();
    }

    function addCircle(ctx, w, h, opts) {
        var x = w/2;
        var y = h * randomInRange(0.4, 0.6);
        var r = Math.min(w,h) * randomInRange(0.2, 0.4);
        drawCircle(
            ctx,
            x,
            y,
            r,
            getFill(ctx, opts.palette, x, y, r, opts.skew)
        );
        return ctx;
    }

    function addTriangle(ctx, w, h, opts) {
        var d = Math.min(w, h) * randomInRange(0.5, 0.85);
        var cx = w/2;
        var cy = randomInRange(h/3, 2 * h/3);
        var leg = Math.cos(30 * Math.PI/180) * (d / 2);
        ctx.fillStyle = getFill(ctx, opts.palette, cx, cy, leg, opts.skew);
        ctx.beginPath();
        ctx.moveTo(cx, cy - leg);
        ctx.lineTo(cx + d/2, cy + leg);
        ctx.lineTo(cx - d/2, cy + leg);
        ctx.closePath();
        ctx.fill();
        return ctx;
    }

    function addSquare(ctx, w, h, opts) {
        var d = Math.min(w, h) * 0.5;
        var x = w/2 - d/2;
        var y = randomInRange(h/3, 2 * h/3) - d/2;
        ctx.fillStyle = getFill(ctx, opts.palette, x, y + d/2, d/2, opts.skew);
        ctx.fillRect(
            x,
            y,
            d,
            d
        );
        return ctx;
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
            'circle': addCircle,
            'triangle': addTriangle,
            'square': addSquare
        };
        var shapes = Object.keys(renderMap);

        // BEGIN RENDERING

        if (opts.drawShadows) {
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 3 * Math.min(w,h)/400;
            ctx.shadowBlur = 10 * Math.min(w,h)/400;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        }

        // add one or two bg blocks
        ctx.fillStyle = getFill(ctx, opts.palette, 0, 0, h, opts.skew);
        ctx.fillRect(0, 0, w, h);
        if (Math.random() > 0.25) {
            var hr = randomInRange(3, 12) * w;
            var hy = hr + randomInRange(0.3, 0.85) * h;
            drawCircle(
                ctx,
                w/2,
                hy,
                hr,
                getFill(ctx, opts.palette, w/2, hy, hr, opts.skew)
            );
        }

        // draw two shape layers in some order:
        // shuffle shape list
        shapes.sort(function(a, b) { return randomInRange(-1, 1)});

        // pop a renderer name, get render func and execute X 2
        renderMap[shapes.pop()](ctx, w, h, opts);
        renderMap[shapes.pop()](ctx, w, h, opts);


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
    window.shapescape = shapescape;
}());
