import noiseUtils from './noiseutils';
import palettes from './palettes';
import { drawCircle, drawRing, drawExactTriangle, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';
import { randItem, randomInRange, getGradientFunction, getSolidColorFunction } from './utils';

const SILVERS = ['#ffffff','#f2f2f2','#eeeeee','#e7e7e7','#e0e0e0','#d7d7d7'];

// Tile the container
export function grads(options) {
    var defaults = {
        container: 'body',
        palette: palettes.terra_cotta_cactus,
        drawShadows: false,
        addNoise: 0.04,
        noiseInput: null,
        skew: 1, // normalized skew
        clear: true
    };
    var opts = {};
    opts = Object.assign(Object.assign(opts, defaults), options);

    let container = opts.container;
    let cw = container.offsetWidth;
    let ch = container.offsetHeight;
    let SCALE = Math.min(cw, ch);
    let LONG = Math.max(cw, ch);
    let SHORT = Math.min(cw, ch);
    const AREA = cw * ch;

    // Find or create canvas child
    var el = container.querySelector('canvas');
    var newEl = false;
    if (!el) {
        container.innerHTML = '';
        el = document.createElement('canvas');
        newEl = true;
    }
    if (newEl || opts.clear) {
        el.width = cw;
        el.height = ch;
    }

    var ctx; // canvas ctx or svg tag

    ctx = el.getContext('2d');

    // optional clear
    if (opts.clear) {
        el.width = container.offsetWidth;
        el.height = container.offsetHeight;
        ctx.clearRect(0, 0, cw, ch);
    }


    let getSolidFill = getSolidColorFunction(opts.palette);

    /*let x = {
        fill: getGradientFunction(opts.palette)(ctx, cw, ch)
    }*/

    // shadows

    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 25 * Math.min(cw, ch) / 800;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';

    // split into shapes

    let slices = 8;
    let sw = cw/slices;

    let g;

    let colors = opts.palette.length


    for (var i =0; i <= slices; i++) {
        ctx.beginPath();
        ctx.fillStyle = getSolidFill();
        //ctx.fillStyle = getGradientFunction(opts.palette)(ctx, sw, ch)
        
        g = ctx.createLinearGradient(
            0,
            0 + 0.25 * randomInRange(-ch,ch),
            0,
            ch + 0.25 * randomInRange(-ch,ch)
        );
        
        //g.addColorStop(0, opts.palette[0]);
        //g.addColorStop(1, opts.palette[1]);

        for (var c = 0; c<= colors - 1 ; c++) {
            g.addColorStop(1/colors * c, opts.palette[c]);
        }   

        ctx.fillStyle = g;
        
        ctx.rect(i * sw, 0, (i+1) * sw, ch);
        ctx.closePath();
        ctx.fill();
    }



    // Add effect elements
    // ...

    // add noise
    if (opts.addNoise) {
        if (opts.noiseInput) {
            noiseUtils.applyNoiseCanvas(el, opts.noiseInput);
        } else {
            noiseUtils.addNoiseFromPattern(el, opts.addNoise, cw / 3);
        }
    }

    // END RENDERING

    // if new canvas child was created, append it
    if (newEl) {
        container.appendChild(el);
    }
}
