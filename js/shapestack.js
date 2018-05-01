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

    // Creates a function that returns a different random entry
    // from @palette each time it is called.
    createFillFunc = function(palette) {
        var refresh = function() {
            return palette.map(function(c){return c}).sort(function(a, b){ return Math.random() - 0.5});
        }
        var p = refresh();
        return function() {
            if (!p.length) p = refresh();
            return p.pop();
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

        ctx.fillStyle = opts.fill || randItem(opts.palette);
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

        ctx.fillStyle = opts.fill || randItem(opts.palette);
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

        ctx.fillStyle = opts.fill || randItem(opts.palette);
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

        ctx.fillStyle = opts.fill || randItem(opts.palette);
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

            ctx.fillStyle = opts.fill || randItem(opts.palette);
            ctx.fill();

            return ctx;
        }
    }

    var drawPentagon = _drawPolygon(5, 1.1);
    var drawHexagon = _drawPolygon(6, 1.05);



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
        opts.getColor = createFillFunc(opts.palette);

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
        var shape = shapes[0];
        renderer = renderMap[shape];

        // pick centerpoint for shape
        var maskX = w/2;
        var maskY = h * randomInRange(0.45, 0.55);
        var maskSize = Math.min(w,h) * randomInRange(0.33, 0.45);

        // pick angle for stacks
        // only do it if skew option is truthy,
        // and then only some of the time
        var tilt = 0;
        if (opts.skew && Math.random() > 0.5) {
            // small angles look bad so avoid them
            tilt = randomInRange(0.15, 0.5);
            // random direction
            tilt *= Math.round(Math.random()) * 2 - 1;
        }

        // pick depth of stack
        var stackSize = randomInRange(1, 4);
        var heightA = h * randomInRange(0.4, 0.7);
        var heightB = heightA * randomInRange(0.95, 1.05);

        var stackA = [];
        var stackB = [];

        var levelA = h - heightA;
        var levelB = h - heightB;

        var block;

        var i = 1;
        var blockH;
        while (i++ <= stackSize) {
            blockH = heightA / stackSize;
            block = [levelA, levelA + randomInRange(0.25 * blockH, blockH)];
            levelA = block[1];
            stackA.push(block);

            blockH = heightB / stackSize;
            block = [levelB, levelB + randomInRange(0.25 * blockH, blockH)];
            levelB = block[1];
            stackB.push(block);

        }
        stackA.push([levelA, h * 1.5]);
        stackB.push([levelB, h * 1.5]);

        var gray;
        function drawStack(stack, x, palette) {
            stack.forEach(function(y, i) {
                if (palette === 'gray') {
                    gray = randomInRange(0.55, 0.85);
                    ctx.fillStyle = 'rgba(0, 0, 0,' + (i + 1) * gray/stackSize + ')';
                } else {
                    ctx.fillStyle = opts.getColor();
                }

                ctx.beginPath();
                ctx.rect(x, y[0], x + w, y[1] - y[0]);
                ctx.closePath();

                ctx.fill();
            });
        }

        ctx.translate(w/2, h/2);
        ctx.rotate(tilt);
        ctx.translate(-w/2, -h/2);

        // Draw stacks with gray
        drawStack(stackA, -w/4, 'gray');
        drawStack(stackB, w/2, 'gray');


        ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Draw main shape + mask
        renderer(ctx, w/2, maskY, maskSize, {fill: '#ffffff'});
        // clip mask
        ctx.clip();

        ctx.translate(w/2, h/2);
        ctx.rotate(tilt);
        ctx.translate(-w/2, -h/2);

        // draw color stacks in mask
        drawStack(stackA, -w/4, opts.palette);
        drawStack(stackB, w/2, opts.palette);

        if (['box','ring'].indexOf(shape) === -1) {

            // vertical pin
            var nudge = (heightA > heightB) ? -0.5 : 0.5;
            ctx.globalAlpha = 0.3;
            ctx.lineWidth = 1;

            ctx.beginPath();
            ctx.moveTo(w/2 + nudge, 0);
            //ctx.lineTo(w/2 + nudge, h - Math.max(heightA, heightB));
            ctx.lineTo(w/2 + nudge, h);
            ctx.closePath();
            ctx.strokeStyle = '#000000';
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(w/2 + nudge, maskY + maskSize);
            ctx.lineTo(w/2 + nudge, h);
            ctx.closePath();
            ctx.strokeStyle = '#ffffff';
            ctx.stroke();
        }

        // unclip
        ctx.restore();

        // reset transform
        ctx.setTransform(1, 0, 0, 1, 0, 0);

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
