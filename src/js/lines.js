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

    let stops = Math.ceil(randomInRange(3, 30));
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
        pts.push(0);
    }

    ctx.lineWidth = lineInterval * 0.4;
    ctx.strokeStyle = randItem(opts.palette);

    for (let l = 0 ; l <= lines ; l++) {
        ctx.translate(0, lineInterval)
        ctx.moveTo(0, 0);
        ctx.beginPath();
        for (let i=0; i<=stops; i++) {
            pts[i] += randomInRange(-lineInterval/4, lineInterval/4);
            ctx.lineTo(i * stopInterval, pts[i])
        }
        ctx.stroke();
    }



    // BEGIN RENDERING

    // ...


    // Draw main shape + mask
    // --------------------------------------

    // ...


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
