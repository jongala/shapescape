// random Array member
export function randItem(arr) {
    return arr[Math.floor(arr.length * Math.random())];
}

export function randomInRange(min, max) {
    if (max === undefined) {
        max = min;
        min = 0;
    }
    return min + (max - min) * Math.random();
}

export function randomInt(min, max) {
    return Math.round(randomInRange(min, max));
}

// fisher-yates, from https://bost.ocks.org/mike/shuffle/
export function shuffle(array) {
  var m = array.length, t, i;

  // While there remain elements to shuffle…
  while (m) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}

export function setAttrs(el, attrs) {
    var a;
    if (el && el.setAttribute) {
        for (a in attrs) {
            if (attrs.hasOwnProperty(a)) {
                el.setAttribute(a, attrs[a]);
            }
        }
    }
}

// reset canvas transformations
export function resetTransform(ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
}

// rotate canvas around center point
export function rotateCanvas(ctx, w, h, angle) {
    ctx.translate(w / 2, h / 2);
    ctx.rotate(angle);
    ctx.translate(-w / 2, -h / 2);
}

export function getGradientFunction(palette) {
    let p = [].concat(palette);
    return function(ctx, w, h) {
        let bias = Math.random() - 0.5;
        let coords = [];
        if (bias) {
            coords = [
                randomInRange(0, w), 0,
                randomInRange(0, w), h
            ]
        } else {
            coords = [
                0, randomInRange(0, h),
                w, randomInRange(0, h)
            ]
        }
        let grad =  ctx.createLinearGradient(...coords);
        grad.addColorStop(0, randItem(p));
        grad.addColorStop(1, randItem(p));
        return grad;
    }
}

export function getLocalGradientFunction(palette) {
    let p = [].concat(palette);
    return function(ctx, x, y, size) {
        let bias = Math.random() - 0.5;
        let coords = [];
        if (bias) {
            coords = [
                randomInRange(x - size, x + size), y - size,
                randomInRange(x - size, x + size), y + size
            ]
        } else {
            coords = [
                x - size, randomInRange(y - size, y + size),
                x + size, randomInRange(y - size, y + size)
            ]
        }
        let grad =  ctx.createLinearGradient(...coords);
        grad.addColorStop(0, randItem(p));
        grad.addColorStop(1, randItem(p));
        return grad;
    }
}

// Creates a function that returns a different random entry
// from @palette each time it is called.
export function getSolidColorFunction(palette) {
    var refresh = function() {
        // clone palette before providing func to avoid
        // operating on the input array.
        return [].concat(palette)
            .sort(function(a, b) {
                return Math.random() - 0.5;
            });
    };
    var p = refresh();
    return function() {
        // if we run out of colors, start with a new shuffled palette
        if (!p.length) p = refresh();
        // otherwise pop a color
        return p.pop();
    };
}


// converts @hex to 8-bit array [r, g, b]
export function hexToRgb(hex) {
    if (hex[0] === '#') {
        hex = hex.slice(1);
    }
    if (hex.length === 3) {
        hex = '' + hex[0] + hex[0]
            + hex[1] + hex[1]
            + hex[2] + hex[2];
    }
    function toN(hexFrag) {
        return parseInt(hexFrag, 16)
    }
    return [
        toN(hex.slice(0,2)),
        toN(hex.slice(2,4)),
        toN(hex.slice(4,6))
    ]
}


// Supply @c1, @c2 as [r,g,b] colors.
// Return r,g,b distance components, and a scalar distance as [r,b,g,distance]
// Scalar diff is 0-765
export function colorDistanceArray(c1, c2) {
    let dr, dg, db;
    let _r = (c1[0] + c2[0]) / 2;
    dr = c2[0] - c1[0];
    dg = c2[1] - c1[1];
    db = c2[2] - c1[2];
    // dc = scalar diff
    let dc = Math.sqrt(
        dr * dr * (2 + _r/256) +
        dg * dg * 4 +
        db * db  * (2 + (255 - _r)/256)
    );
    return [dr, dg, db, dc];
}


// args are rgb in 8 bit array form
// returns {diff, color}
export function closestColor (sample, palette) {
    let diffs = palette.map((p)=>{
        return {
            diff: colorDistanceArray(p, sample),
            color: p
        }
    });
    diffs = diffs.sort((a, b) => {
        return (a.diff[3] - b.diff[3]);
    });
    return diffs[0];
}


// util for scaling color errors in dithering, but could be useful
export function scalarVec (vec, scalar) {
    return vec.map((x) => x * scalar);
}

// util
// get angle between @a and @b of form [x, y]
// returns in radians
export function getAngle(a, b) {
    let dx = b[0] - a[0];
    let dy = b[1] - a[1];
    return Math.atan2(dy, dx);
}

// util
// get vector between @a and @b of form [x, y]
// return object with x, y = @a, angle, length
export function getVector(a, b) {
    let dx = b[0] - a[0];
    let dy = b[1] - a[1];
    let theta = Math.atan2(dy , dx);
    let length = Math.sqrt(dx * dx + dy * dy);
    return {
        x: a[0],
        y: a[1],
        angle: theta,
        length: length
    }
}

// get the average coordinates from an array of
// @points in [x,y] form
export function averagePoints(points) {
    let avg = [0, 0];
    for (var i = 0; i < points.length; i++) {
        avg[0] += points[i][0];
        avg[1] += points[i][1];
    }
    avg[0] /= points.length;
    avg[1] /= points.length;
    return avg;
}

// Create a path in @ctx by stepping through the points
// in @points, which are in [x,y] array form
export function pointsToPath(ctx, points) {
    // copy the points list, so we don't mutate
    let pts = points.concat([]);
    ctx.beginPath();
    ctx.moveTo(...(pts.shift()));
    while (pts.length) {
        ctx.lineTo(...(pts.shift()));
    }
    ctx.closePath();
    return ctx;
}


// map named values of props, e.g. low, med, high…
// to values, as defined in the obj @props
// If values are arrays, use @accessor function to pick.
// Respect 'auto' as special case for @name
export function mapKeywordToVal (props, accessor=randomInRange) {
    let names = Object.keys(props);

    return function(name, label='param') {
        if (name === 'auto' || name === 'AUTO') {
            name = randItem(names);
            console.log(`${label}: auto picked ${name}`);
        }
        if (props[name] === undefined) {
            name = names[0];
            console.log(`${label}: fell back to ${name}`);
        }
        let val = props[name];
        if (Array.isArray(val)) {
            return accessor(...val);
        } else {
            return val;
        }
    }
}

// Get boolean value, but be friendly to "false" passed as string
export function friendlyBoolean (prop) {
    if (prop === 'false') return false;
    return !!prop;
}

export function Note(divider=true, time=true) {
    let msgs = [];
    let start_ts = new Date().getTime();
    let end_ts = start_ts;
    this.add = function(t) {
        msgs.push(t);
    }
    this.first = function(t) {
        msgs.unshift(t);
    }
    this.print = function() {
        return msgs.join('\n');
    }
    this.log = function() {
        if (time) {
            end_ts = new Date().getTime();
            this.add(`> Ran in ${end_ts - start_ts}ms`);
        }
        if (divider) {
            this.first('------------------------------');
        }
        console.log(this.print());
    }
    return this;
}