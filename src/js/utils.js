// random Array member
export function randItem(arr) {
    return arr[Math.floor(arr.length * Math.random())];
}

export function randomInRange(min, max) {
    return min + (max - min) * Math.random();
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