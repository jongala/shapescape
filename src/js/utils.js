// random Array member
export function randItem(arr) {
    return arr[Math.floor(arr.length * Math.random())];
}

export function randomInRange(min, max) {
    return min + (max - min) * Math.random();
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
                randomInRange(0, w * 0.25), 0,
                randomInRange(w * 0.75, w), h
            ]
        } else {
            coords = [
                0, randomInRange(0, h * 0.25),
                w, randomInRange(h * 0.75, h)
            ]
        }
        let grad =  ctx.createLinearGradient(...coords);
        grad.addColorStop(0, randItem(p));
        grad.addColorStop(1, randItem(p));
        return grad;
    }
}
