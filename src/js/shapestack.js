import noiseUtils from './noiseutils';
import { randItem, randomInRange, setAttrs, resetTransform, rotateCanvas } from './utils';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';

// Creates a function that returns a different random entry
// from @palette each time it is called.
function getSolidColorFunction(palette) {
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

let getGradientFunction = (palette) => {
    let p = [].concat(palette);
    return function(ctx, w, h) {
        let bias = Math.random() - 0.5;
        let coords = [];
        if (bias) {
            coords = [
                randomInRange(0, w * 0.25), 0,
                randomInRange(w * 0.75, w), 0
            ]
        } else {
            coords = [
                0, randomInRange(0, h * 0.5),
                0, randomInRange(h * 0.75, h)
            ]
        }
        let grad =  ctx.createLinearGradient(...coords);
        grad.addColorStop(0, randItem(p));
        grad.addColorStop(1, randItem(p));
        return grad;
    }
}


function addShadow(ctx, w, h) {
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0.5 * Math.min(w, h) / 800;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
}

function removeShadow(ctx) {
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
}

const DEFAULTS = {
    container: 'body',
    palette: ['#222222', '#fae1f6', '#b966d3', '#8ED2EE', '#362599', '#fff9de', '#FFC874'],
    drawShadows: false,
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    fillStyle: null, // ['solid', 'gradient']
    nest: false,
    stack: false,
    clear: true
}


// draw it!
function shapestack(options) {
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

    // Setup renderers and default palettes
    var renderer;
    var renderMap = {
        circle: drawCircle,
        ring: drawRing,
        triangle: drawTriangle,
        square: drawSquare,
        box: drawBox,
        rect: drawRect,
        pentagon: drawPentagon,
        hexagon: drawHexagon
    };
    var shapes = Object.keys(renderMap);

    var grays = ['#111111', '#666666', '#808080', '#999999', '#b4b4b4', '#cccccc', '#e7e7e7', '#f9f9f9'];

    // randomize render style if both styles are false (default)
    let stack = opts.stack;
    let nest = opts.nest;
    if (!opts.stack && !opts.nest) {
        stack = (Math.random() > 0.5);
        nest = !stack;
    }

    // Set up color fill style
    let fillStyle = opts.fillStyle;
    // map of color function generators
    let colorFuncs = {
        'gradient': getGradientFunction,
        'solid': getSolidColorFunction
    }
    // if no valid fill style is passed, assign one randomly
    if (['gradient','solid'].indexOf(fillStyle) === -1 ) {
        fillStyle = (Math.random() > 0.5) ? 'gradient' : 'solid';
    }
    // generate the fill function based on the palette
    opts.getColor = colorFuncs[fillStyle](opts.palette);


    // BEGIN RENDERING

    if (opts.drawShadows) {
        addShadow(ctx, w, h);
    }

    // draw background/sky
    var sky = Math.round(randomInRange(204, 245)).toString(16);
    ctx.fillStyle = '#' + sky + sky + sky;
    ctx.fillRect(0, 0, w, h);

    // shuffle shape list and pick a shape
    shapes.sort(function(a, b) {
        return randomInRange(-1, 1);
    });
    var shape = shapes[0];
    renderer = renderMap[shape];

    // do it again for nestRenderer
    shapes.sort(function(a, b) {
        return randomInRange(-1, 1);
    });
    let nestShape = shapes[0];
    let nestRenderer = renderMap[nestShape];

    // pick centerpoint for shape
    var maskX = w / 2;
    var maskY = h * randomInRange(0.45, 0.55);
    var maskSize = Math.min(w, h) * randomInRange(0.33, 0.45);

    // pick angle for stacks
    // only do it if skew option is truthy,
    // and then only some of the time
    var tilt = 0;
    if (opts.skew && Math.random() > 0.25) {
        tilt = randomInRange(0, 6.28);
    }

    // pick depth of stack
    var stackSize = randomInRange(1, 4);
    var heightA = h * randomInRange(0.4, 0.7);
    var heightB = heightA * randomInRange(0.95, 1.05);

    var stackA = [];
    var stackB = [];

    var levelA = h - heightA;
    var levelB = h - heightB;

    var block;

    var i = 1;
    var blockH;
    while (i++ <= stackSize) {
        blockH = heightA / stackSize;
        block = [levelA, levelA + randomInRange(0.25 * blockH, blockH)];
        levelA = block[1];
        stackA.push(block);

        blockH = heightB / stackSize;
        block = [levelB, levelB + randomInRange(0.25 * blockH, blockH)];
        levelB = block[1];
        stackB.push(block);
    }
    stackA.push([levelA, h * 1.5]);
    stackB.push([levelB, h * 1.5]);

    var gray;
    function drawStack(stack, x, palette) {
        stack.forEach(function(y, i) {
            if (palette === 'gray') {
                gray = randomInRange(0.55, 0.85);
                ctx.fillStyle = 'rgba(0, 0, 0,' + (i + 1) * gray / stackSize + ')';
            } else {
                ctx.fillStyle = opts.getColor(ctx, w, y[1] - y[0]);
            }

            ctx.beginPath();
            ctx.rect(x, y[0], x + w, y[1] - y[0]);
            ctx.closePath();

            ctx.fill();
        });
    }

    let nestDefaults = {
        x: 0,
        y: 0,
        minSize: 200,
        maxSize: 400,
        steps: 4,
        angle: 0,
        palette: ['#000','#333','#666','#999'],
        alpha: 1,
        blendMode: 'normal'
    }
    let drawNest = (ctx, shape, o) => {
        o = Object.assign(nestDefaults, o);
        let stepSize = (o.maxSize - o.minSize) / o.steps;
        let i = o.steps;
        let j = 1;
        let ctxBlend = ctx.globalCompositeOperation;
        let ctxAlpha = ctx.globalAlpha;
        let getColor = colorFuncs[fillStyle](o.palette);

        resetTransform(ctx);

        ctx.globalCompositeOperation = o.blendMode;
        ctx.globalAlpha = o.alpha;
        while (i--) {
            shape(ctx, o.x, o.y, (o.maxSize - stepSize * j)/2,
                {
                    fill: getColor(ctx, o.minSize, o.maxSize),
                    angle: o.angle
                }
            );
            j++;
        }
        ctx.globalCompositeOperation = ctxBlend;
        ctx.globalAlpha = ctxAlpha;

        resetTransform(ctx);
    }

    let nestOpts = {
        x: randomInRange(w * 0.1, w * 0.9),
        y: randomInRange(w * 0.1, w * 0.9),
        maxSize: scale * randomInRange(1, 2),
        minSize: scale * randomInRange(0.5, 0.75),
        steps: Math.floor(randomInRange(3, 5)),
        angle: randomInRange(0, Math.PI/4)
    };

    if (stack) {
        // rotate the canvas before drawing stacks
        rotateCanvas(ctx, w, h, tilt);

        // Draw stacks with gray
        drawStack(stackA, -w / 4, 'gray');
        drawStack(stackB, w / 2, 'gray');

        // un-rotate to draw main shape
        resetTransform(ctx);
    }

    if (nest) {
        // draw Nest
        drawNest(ctx, nestRenderer, Object.assign({
            palette: grays,
            alpha: 1,
            blendMode: 'normal'
        }, nestOpts));
    }


    // Draw main shape + mask
    // --------------------------------------


    renderer(ctx, maskX, maskY, maskSize, { fill: '#ffffff' });
    // clear shadow
    removeShadow(ctx);

    // clip mask
    ctx.clip();

    if (stack) {
        // rotate the canvas before drawing stacks
        rotateCanvas(ctx, w, h, tilt);
        // draw color stacks in mask
        drawStack(stackA, -w / 4, opts.palette);
        drawStack(stackB, w / 2, opts.palette);

        if (['box', 'ring'].indexOf(shape) === -1) {
            // vertical pin
            var nudge = heightA > heightB ? -0.5 : 0.5;
            ctx.globalAlpha = 0.3;
            ctx.lineWidth = 1;

            ctx.beginPath();
            ctx.moveTo(w / 2 + nudge, 0);
            ctx.lineTo(w / 2 + nudge, h);
            ctx.closePath();
            ctx.strokeStyle = '#000000';
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(w / 2 + nudge, maskY + maskSize);
            ctx.lineTo(w / 2 + nudge, h);
            ctx.closePath();
            ctx.strokeStyle = '#ffffff';
            ctx.stroke();
        }
    }

    if (nest) {
        // draw color Nest in front of color stack
        drawNest(ctx, nestRenderer, Object.assign({
            palette: opts.palette,
            alpha: 1,
            blendMode: 'normal'
        }, nestOpts));

        // draw a line from nest center thru the mask center and beyond
        let m = (nestOpts.y - maskY) / (nestOpts.x - maskX);
        let theta = Math.atan(m);
        if (nestOpts.x > maskX) {
            theta += Math.PI;
        }
        // oughtta be enough
        let R = w + h;

        ctx.beginPath();
        ctx.moveTo(nestOpts.x, nestOpts.y);
        ctx.lineTo(nestOpts.x + R * Math.cos(theta),
            nestOpts.y + R * Math.sin(theta));
        ctx.closePath();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.33)';
        ctx.stroke();
    }

    // unclip
    ctx.restore();

    // reset transform
    resetTransform(ctx);


    // add a pin shadow if it's an open shape
    if ( nest || ['box', 'ring'].indexOf(shape) >= 0 ){
        //addShadow(ctx, w, h);
        ctx.globalCompositeOperation = 'multiply';
        renderer(ctx, w / 2, maskY, maskSize, { fill: 'transparent', stroke:'#808080' });
        ctx.globalCompositeOperation = 'normal';
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
export default shapestack;
