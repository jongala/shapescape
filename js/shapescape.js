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

    function addNoise(canvas, opacity) {
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

    function addNoisePattern(canvas, opacity, tileSize, useOverlay) {
        // create an offscreen canvas where we will generate
        // noise to use as a pattern
        tileSize = tileSize || 100;
        var noise = document.createElement('canvas');
        noise.width = tileSize;
        noise.height = tileSize;
        var noiseCtx = noise.getContext('2d');

        // main canvas context
        var ctx = canvas.getContext('2d');

        // add noise to the offscreen canvas
        addNoise(noise, opacity);

        // create a noise pattern from the offscreen canvas
        var noisePattern = ctx.createPattern(noise, 'repeat');
        ctx.fillStyle = noisePattern;
        if (useOverlay) {
            ctx.globalCompositeOperation = 'overlay';
        }
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (useOverlay) {
            ctx.globalCompositeOperation = 'normal';
        }
    }

    // random Array member
    function randItem(arr) {
        return arr[Math.floor(arr.length * Math.random())];
    }

    function randomInRange(min, max) {
        return (min + (max - min) * Math.random());
    }

    var PALETTE = ['#222222', '#f7d4f8', '#b966d3', '#362599', '#fff9de', '#fae1f6'];

    function getFill() {
        return randItem(PALETTE);
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
        drawCircle(
            ctx,
            w/2,
            h/2,
            Math.min(w,h) * randomInRange(0.2, 0.4),
            getFill()
        );
        return ctx;
    }

    function addTriangle(ctx, w, h, opts) {
        var d = Math.min(w, h) * randomInRange(0.5, 0.85);
        var cx = w/2;
        var cy = randomInRange(h/3, 2 * h/3);
        var leg = Math.cos(30 * Math.PI/180) * (d / 2);
        ctx.fillStyle = getFill();
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
        ctx.fillStyle = getFill();
        ctx.fillRect(
            w/2 - d/2,
            randomInRange(h/3, 2 * h/3) - d/2,
            d,
            d
        );
        return ctx;
    }


    // Tile the container
    function shapescape(options) {
        var defaults = {
            container: 'body',
            scale: 256,
            layout: 'tile', // [tile, overlap]
            pointR: 0.1,
            fillOpacity: 1,
            strokeOpacity: 1,
            pointOpacity: 1,
            pointColor: function(palette, row, col, x, y, w, h) {return null},
            strokeColor: function(palette, row, col, x, y, w, h) {return null},
            fillColor: function(palette, row, col, x, y, w, h) {return randomColor(palette)},
            palette: ['#3399cc', '#774aa4', '#ff0099', '#ffcc00'],
            clear: true
        };
        var opts = {};
        opts = extend(extend(opts, defaults), options);

        // convert color constants to functions
        opts.pointColor = constToFunc(opts.pointColor);
        opts.strokeColor = constToFunc(opts.strokeColor);
        opts.fillColor = constToFunc(opts.fillColor);

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

        // add one or two bg blocks
        ctx.fillStyle = getFill();
        ctx.fillRect(0, 0, w, h);
        if (Math.random() > 0.66) {
            var horizon = randomInRange(h * 0.4, h * 0.85);
            ctx.fillStyle = getFill();
            ctx.fillRect(0, horizon, w, h - horizon);
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
        addNoisePattern(el, 0.04);
      
        // END RENDERING

        // if new canvas child was created, append it
        if (newEl) {
            container.appendChild(el);
        }

    }

    // export
    window.shapescape = shapescape;
}());
