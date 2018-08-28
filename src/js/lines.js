import noiseUtils from './noiseutils';
import { randItem, randomInRange, setAttrs, resetTransform, rotateCanvas } from './utils';


const DEFAULTS = {
    container: 'body',
    palette: ['#222222'],
    bg: '#fff',
    drawShadows: false,
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true
}


// draw it!
function lines(options) {
    let opts = Object.assign(DEFAULTS, options);

    var container = opts.container;

    var w = container.offsetWidth;
    var h = container.offsetHeight;
    var scale = Math.min(w, h); // reference size, regardless of aspect ratio

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
            width: container.offsetWidth,
            height: container.offsetHeight
        });
    }

    var ctx; // canvas ctx or svg tag

    ctx = el.getContext('2d');
    ctx.save();

    // optional clear
    if (opts.clear) {
        el.width = container.offsetWidth;
        el.height = container.offsetHeight;
        ctx.clearRect(0, 0, w, h);
    }

    if (opts.bg === 'auto') {
        ctx.fillStyle = randItem(opts.palette);
    } else {
        ctx.fillStyle = opts.bg;
    }
    ctx.fillRect(0, 0, w, h);

    let stops = Math.ceil(randomInRange(2, 30));
    let lines = Math.floor(randomInRange(10, 40));

    let stopInterval = w / (stops - 1);
    let lineInterval = h / lines;

    ctx.translate(-stopInterval/2, -lineInterval/2);

    console.log(`${lines} (${lineInterval}px) X ${stops} (${stopInterval}px)`)


    // Create point transform (x, y) to create progressive transform from
    // line to line
    // Create color transform (x, y) to blend segments

    let pts = [];
    // create array of zeroes
    for (let i = 0; i<=stops; i++) {
        pts.push([i * stopInterval, 0]);
    }
    let pt;

    ctx.lineWidth = lineInterval * randomInRange(0.4, 0.5);
    ctx.strokeStyle = randItem(opts.palette);

    // component pt transform func
    let xDrift = (x, line, stop) => {
        let scalar = 2 / (lines * stops); // a small number
        return x *= randomInRange(1 - scalar, 1 + scalar);
    }

    // component pt transform func
    let yDrift = (y, line, stop) => {
        let scalar = 0.1 + (20 / (lines * stops))
        return y + randomInRange(-scalar * lineInterval, scalar * lineInterval);
    }



    // sample pt transform func
    let drift = (pt, line, stop) => {
        return [
            xDrift(pt[0], line, stop),
            yDrift(pt[1], line, stop)
        ]
    }


    // assign pt transform func
    let ptTransform = drift;

    for (let l = 0 ; l <= lines ; l++) {
        ctx.translate(0, lineInterval)
        ctx.moveTo(0, 0);
        ctx.beginPath();
        for (let s=0; s<=stops; s++) {
            pts[s] = ptTransform(pts[s], l, s);

            ctx.lineTo(pts[s][0], pts[s][1]);
        }
        ctx.stroke();
    }


    // Add effect elements
    // ...

    // add noise
    if (opts.addNoise) {
        if (opts.noiseInput) {
            noiseUtils.applyNoiseCanvas(el, opts.noiseInput);
        } else {
            noiseUtils.addNoiseFromPattern(el, opts.addNoise, w / 3);
        }
    }

    // END RENDERING

    // if new canvas child was created, append it
    if (newEl) {
        container.appendChild(el);
    }
}

// export
export default lines;
