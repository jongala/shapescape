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

    // random Array member
    function randItem(arr) {
        return arr[Math.floor(arr.length * Math.random())];
    }

    // Random palette member
    function randomColor(PALETTE) {
      return randItem(PALETTE);
    }

    function randomInRange(min, max) {
        return (min + (max - min) * Math.random());
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
        console.log('alpha', alpha);
        ctx.fillStyle = fill;
        //ctx.strokeStyle = stroke;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.arc(x, y, r, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.closePath();
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
        
        // RENDER HERE



        drawCircle(
            ctx,
            w/2,
            h/2,
            Math.min(w,h) * 0.25,
            'black'
        );

        

      

        // if new canvas child was created, append it
        if (newEl) {
            container.appendChild(el);
        }

    }

    // export
    window.shapescape = shapescape;
}());
