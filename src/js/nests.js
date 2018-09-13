import { randItem, randomInRange, resetTransform, rotateCanvas, getGradientFunction } from './utils';

export function generateNestDef (w, h, scale) {
    return {
        x: randomInRange(w * 0.1, w * 0.9),
        y: randomInRange(h * 0.1, h * 0.9),
        maxSize: scale * randomInRange(0.5, 1.5),
        minSize: scale * randomInRange(0.1, 0.6),
        steps: Math.floor(randomInRange(3, 7)),
        angle: randomInRange(0, Math.PI/4)
    };
}

let nestDefaults = {
    x: 0,
    y: 0,
    minSize: 200,
    maxSize: 400,
    steps: 4,
    jitter: 0.1,
    angle: 0
}

export function defineNest (o) {
    o = Object.assign(nestDefaults, o);
    let stepSize = (o.maxSize - o.minSize) / o.steps;
    let i = o.steps;
    let j = 1;
    let nest = [];
    let step; // the actual step size in px

    while (i--) {
        step = stepSize * (1 + randomInRange(-o.jitter, + o.jitter));
        nest.push({
            x: o.x,
            y: o.y,
            size: (o.maxSize - j * step)/2,
            angle: o.angle
        });
        j++;
    }
    return nest;
}

