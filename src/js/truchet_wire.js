import noiseUtils from './noiseutils';
import palettes from './palettes';
import { randItem, randomInRange, resetTransform, rotateCanvas, getGradientFunction, getSolidColorFunction } from './utils';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';

const DEFAULTS = {
    container: 'body',
    palette: palettes.high_contrast,
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true,

    mode: null,
    count: 0, // 0 for auto, or an integer
    weight: 0, // 0 for auto, or 1-10 for normalized weights
    contrast: true
}

const PI = Math.PI;

// Main function
export function truchet_wire(options) {
    let opts = Object.assign({}, DEFAULTS, options);

    let container = opts.container;
    let cw = container.offsetWidth;
    let ch = container.offsetHeight;
    let SCALE = Math.min(cw, ch);

    // Find or create canvas child
    let el = container.querySelector('canvas');
    let newEl = false;
    if (!el) {
        container.innerHTML = '';
        el = document.createElement('canvas');
        newEl = true;
    }
    if (newEl || opts.clear) {
        el.width = cw;
        el.height = ch;
    }

    let ctx = el.getContext('2d');

    // util to draw a square and clip following rendering inside
    function moveAndClip(ctx, x, y, size, color) {
        ctx.save();
        ctx.translate(x, y);
        ctx.beginPath();
        ctx.rect(-size/2 - 0.5, -size/2 - 0.5, size + 0.5, size + 0.5);
        ctx.fillStyle = color;
        ctx.closePath();
        ctx.fill();
        ctx.clip();   
    }

    // color funcs
    let randomFill = () => "#" + Math.random().toString(16).slice(2,8);
    let getSolidFill = getSolidColorFunction(opts.palette);

    // define grid
    let count = Math.round(opts.count) || Math.round(randomInRange(4, 9));
    let w = Math.ceil(cw/count);
    let h = w;
    let vcount = Math.ceil(ch/h);

    // setup vars for each cell
    let x = 0;
    let y = 0;
    let xnorm = 0;
    let ynorm = 0;
    let renderer;

    let secondLayer = (Math.random() < 0.5);
    secondLayer = false;

    // play with these random seeds
    let a,b,c;
    a = Math.random();
    b = Math.random();
    c = Math.random();

    // shared colors
    let fg; // hold on…
    let bg = getSolidFill(); // pick bg

    // get palette of non-bg colors
    let contrastPalette = [].concat(opts.palette);
    contrastPalette.splice(opts.palette.indexOf(bg), 1);
    let getContrastColor = getSolidColorFunction(contrastPalette);
    fg = getContrastColor(); // …now set fg in contrast to bg

    // mode settings
    // line weight
    let weight;
    if (opts.weight) {
        weight = w/30 * opts.weight;
    } else {
        weight = w/30 * randomInRange(1,10);
    }



    // box styles

    function _diag() {
        let d = h/2;
        ctx.beginPath();
        ctx.moveTo(-d, -d);
        ctx.lineTo(d, d);
        ctx.stroke();
    }

    function _fan() {
        let d = h/2;
        
        // straight or curved crosspiece?
        let straight = (Math.random() > 0.5);

        ctx.beginPath();
        
        ctx.moveTo(-d, -d);
        ctx.lineTo(-d, d);

        ctx.moveTo(-d, -d);
        ctx.lineTo(-d/2, d);

        ctx.moveTo(-d, -d);
        ctx.lineTo(0, d);

        ctx.moveTo(-d, -d);
        ctx.lineTo(d/2, d);

        ctx.moveTo(-d, -d);
        ctx.lineTo(d, d);

        //

        ctx.moveTo(-d, -d);
        ctx.lineTo(d, -d);

        ctx.moveTo(-d, -d);
        ctx.lineTo(d, -d/2);

        ctx.moveTo(-d, -d);
        ctx.lineTo(d, 0);

        ctx.moveTo(-d, -d);
        ctx.lineTo(d, d/2);

        
        if (straight) {
            ctx.moveTo(d, -d);
            ctx.lineTo(-d, d);    
        }
        
        ctx.stroke();

        if (!straight) {
            drawCircle(ctx, -d, -d, d * 3/2, {fill: 'transparent', stroke: fg});
        }

        drawCircle(ctx, -d, -d, d/2, {fill: bg, stroke: fg});
    }

    function _cross() {
        let d = h/2;
        ctx.beginPath();
        
        ctx.moveTo(-d, -d);
        ctx.lineTo(d, d);

        ctx.moveTo(-d/2, -d);
        ctx.lineTo(d/2, d);

        ctx.moveTo(0, -d);
        ctx.lineTo(0, d);

        ctx.moveTo(d/2, -d);
        ctx.lineTo(-d/2, d);

        ctx.moveTo(d, -d);
        ctx.lineTo(-d, d);
        
        
        ctx.stroke();

        drawCircle(ctx, 0, 0, d/4, {fill: bg, stroke: fg});
    }

    function _sun() {
        let d = h/2;
        ctx.beginPath();
        
        ctx.moveTo(-d, -d);
        ctx.lineTo(d, d);

        ctx.moveTo(-d/2, -d);
        ctx.lineTo(d/2, d);

        ctx.moveTo(0, -d);
        ctx.lineTo(0, d);

        ctx.moveTo(d/2, -d);
        ctx.lineTo(-d/2, d);

        ctx.moveTo(d, -d);
        ctx.lineTo(-d, d);

        //

        ctx.moveTo(-d, -d/2);
        ctx.lineTo(d, d/2);

        ctx.moveTo(-d, 0);
        ctx.lineTo(d, 0);

        ctx.moveTo(-d, d/2);
        ctx.lineTo(d, -d/2);
        
        
        ctx.stroke();

        drawCircle(ctx, 0, 0, d/4, {fill: bg, stroke: fg});
    }

    function _bars() {
        let d = h/2;
        ctx.beginPath();
        
        ctx.moveTo(-d, -d);
        ctx.lineTo(-d, d);

        ctx.moveTo(-d/2, -d);
        ctx.lineTo(-d/2, d);

        ctx.moveTo(-0, -d);
        ctx.lineTo(-0, d);
        
        ctx.moveTo(d/2, -d);
        ctx.lineTo(d/2, d);

        ctx.moveTo(d, -d);
        ctx.lineTo(d, d);
        
        ctx.moveTo(-d, 0);
        ctx.lineTo(d, 0);


        ctx.stroke();


        drawCircle(ctx, -d * .75, 0, d/4, {fill: 'transparent', stroke: fg});
        drawCircle(ctx, -d * .25, 0, d/4, {fill: 'transparent', stroke: fg});
        drawCircle(ctx, d * .25, 0, d/4, {fill: 'transparent', stroke: fg});
        drawCircle(ctx, d * .75, 0, d/4, {fill: 'transparent', stroke: fg});
    }

    function _squares() {
        let d = h/2;

        drawSquare(ctx, 0, 0, d, {fill: 'transparent', stroke: fg});
        drawSquare(ctx, 0, 0, d / (4/3), {fill: 'transparent', stroke: fg});
        drawSquare(ctx, 0, 0, d / 2, {fill: 'transparent', stroke: fg});
        drawSquare(ctx, 0, 0, d / 4, {fill: 'transparent', stroke: fg});

        ctx.rotate(PI/4);

        let diag = d * 0.7071

        drawSquare(ctx, 0, 0, diag * 1.5, {fill: 'transparent', stroke: fg});
        drawSquare(ctx, 0, 0, diag / 1, {fill: 'transparent', stroke: fg});
        drawSquare(ctx, 0, 0, diag / 2, {fill: 'transparent', stroke: fg});
    }

    function _arcs() {
        let d = h/2;

        drawCircle(ctx, -d, -d, h / 1, {fill: 'transparent', stroke: fg});
        drawCircle(ctx, -d, -d, h / 2, {fill: 'transparent', stroke: fg});
        drawCircle(ctx, -d, -d, h / (4/3), {fill: 'transparent', stroke: fg});
        drawCircle(ctx, -d, -d, h / 4, {fill: 'transparent', stroke: fg});

        ctx.beginPath();
        ctx.moveTo(-d, -d);
        ctx.lineTo(d, d);
        ctx.stroke();
    }


    let styles = [_fan, _cross, _sun, _bars, _squares, _arcs];
    //styles = [_cross];



    // mode
    function main (background, double) {
        let factor = (double) ? 1 : 2;
        console.log('factor:', factor);
        background = background || bg;
        ctx.strokeStyle = fg;
        let px, py;
        for (let i = 0; i < (vcount * factor); i++) {
            for (let j = 0; j < (count * factor); j++) {
                // convenience vars
                x = (w/factor) * j;
                y = (h/factor) * i;
                xnorm = x/cw;
                ynorm = y/ch;
                // center point
                px = x + (w/factor) / 2;
                py = y + (h/factor) / 2;

                // shift and clip at center point
                moveAndClip(ctx, px, py, h/factor, background);
                // randomly rotate by 90 degree increment
                ctx.rotate(randItem([0, PI/2, PI, PI * 3/2]));

                // do art in this box
                
                //drawTriangle(ctx, 0, 0, (h/factor)/10, {fill:fg});
                randItem(styles)();

                // unshift, unclip
                ctx.restore();
                resetTransform(ctx);

                drawSquare(ctx, px, py, h/2, {fill: null, stroke: fg});
            }
        }
    }




    // mode
    function mixed (background) {
        background = background || bg;
        let px, py, seed;
        let styles = [
            ()=>{
                renderer = drawCircle;
                px = 0;
                py = 0;
            }
        ];

        for (let i = 0; i < vcount; i++) {
            for (let j = 0; j < count; j++) {
                // convenience vars
                x = w * j;
                y = h * i;
                xnorm = x/cw;
                ynorm = y/ch;

                // shift and clip
                ctx.translate(x, y);
                clipSquare(ctx, w, h, background);

                switch (Math.round(randomInRange(1, 12))){
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                        _circle();
                        break;
                    case 5:
                    case 6:
                    case 7:
                    case 8:
                        _square();
                        break;
                    case 9:
                    case 10:
                    case 11:
                    case 12:
                        _triangle();
                        break;
                }

                // unshift, unclip
                ctx.restore();
                resetTransform(ctx);
            }
        }
    }


    // gather our modes
    let modes = [main];

    // do the loop with one of our modes
    renderer = randItem(modes);
    renderer(bg, weight);

    if (secondLayer) {
        fg = getContrastColor();
        ctx.globalAlpha = 0.8;
        renderer('transparent', (opts.contrast)? weight/2:weight);
        ctx.globalAlpha = 1;
    }

    // add noise
    if (opts.addNoise) {
        if (opts.noiseInput) {
            // apply noise from supplied canvas
            noiseUtils.applyNoiseCanvas(el, opts.noiseInput);
        } else {
            // create noise pattern and apply
            noiseUtils.addNoiseFromPattern(el, opts.addNoise, w / 3);
        }
    }

    // if new canvas child was created, append it
    if (newEl) {
        container.appendChild(el);
    }
}


