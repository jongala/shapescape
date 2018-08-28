import noiseUtils from './noiseutils';
import { randItem, randomInRange, setAttrs, resetTransform, rotateCanvas } from './utils';


const DEFAULTS = {
    container: 'body',
    palette: ['#333333'],
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

    var grays = ['#111111', '#666666', '#808080', '#999999', '#b4b4b4', '#cccccc', '#e7e7e7', '#f9f9f9'];


    let stops = Math.round(randomInRange(10, 30));
    let lines = Math.round(randomInRange(20, 40));

    let stopInterval = Math.ceil(w/stops);
    let lineInterval = Math.floor(h/lines);

    ctx.translate(0, -lineInterval/2);

    console.log(`${lines} (${lineInterval}px) X ${stops} (${stopInterval}px)`)



    let line = lines;
    while (line) {
        let y = line * lineInterval;

        ctx.strokeStyle = randItem(opts.palette);
        
        ctx.translate(0, lineInterval)
        ctx.moveTo(0, 0);
        ctx.beginPath();
        for (let i=0; i<=stops; i++) {
            ctx.lineTo(i * stopInterval, randomInRange(-lineInterval/2, lineInterval/2))
        }
        line--;
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
