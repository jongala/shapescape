import noiseUtils from './noiseutils';
import { randItem, randomInRange, setAttrs, resetTransform, rotateCanvas, getGradientFunction } from './utils';
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




function addShadow(ctx, w, h) {
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 25 * Math.min(w, h) / 800;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
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
    fillStyle: null, // null for auto, ['solid', 'gradient']
    nest: false,
    stack: false,
    fancy: null, // forces auto fanciness
    multiMask: false, // draw multiple masks
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
    let getRandomRenderer = () => {
        return renderMap[randItem(shapes)];
    }

    var grays = ['#111111', '#666666', '#808080', '#999999', '#b4b4b4', '#cccccc', '#e7e7e7', '#f9f9f9'];

    // randomize render style if both styles are false (default)
    let willDrawStack = opts.stack;
    let willDrawNest = opts.nest;
    if (!opts.stack && !opts.nest) {
        willDrawStack = (Math.random() > 0.5);
        willDrawNest = !willDrawStack;
    }

    // rendering styles
    let fancy = opts.fancy;
    let fillStyle = opts.fillStyle;
    let drawShadows = opts.drawShadows;

    // Fancy directive: forces fillStyle and drawShadows options
    // Default behavior is to randomly choose fancy
    if (fancy === null || fancy === undefined) {
        fancy = (Math.random() > 0.5);
    }

    if (fancy) {
        drawShadows = true;
        fillStyle = 'gradient';
    }

    // Set up color fill style
    // map of color function generators
    let colorFuncs = {
        'gradient': getGradientFunction,
        'solid': getSolidColorFunction
    }
    // if no valid fill style is passed, assign one randomly
    if (!['gradient','solid'].includes(fillStyle)) {
        fillStyle = (Math.random() > 0.5) ? 'gradient' : 'solid';
    }
    // generate the fill function based on the palette
    opts.getColor = colorFuncs[fillStyle](opts.palette);


    // BEGIN RENDERING

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
        jitter: 0.1,
        angle: 0
    }
    let nestRenderDefaults = {
        palette: ['#000','#333','#666','#999'],
        alpha: 1,
        blendMode: 'normal'
    }
    let defineNest = (o) => {
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
    let drawNest = (ctx, nest, palette, o) => {
        o = Object.assign(nestRenderDefaults, o);
        resetTransform(ctx);
        let getColor = colorFuncs[fillStyle](palette);
        let ctxBlend = ctx.globalCompositeOperation;
        let ctxAlpha = ctx.globalAlpha;

        ctx.globalCompositeOperation = o.blendMode;
        ctx.globalAlpha = o.alpha;

        nest.forEach((n) => {
            nestRenderer(ctx, n.x, n.y, n.size,
                {
                    fill: getColor(ctx, n.size, n.size),
                    angle: n.angle
                }
            );
        });

        ctx.globalCompositeOperation = ctxBlend;
        ctx.globalAlpha = ctxAlpha;

        resetTransform(ctx);
    }

    let nestOpts = {
        x: randomInRange(w * 0.1, w * 0.9),
        y: randomInRange(w * 0.1, w * 0.9),
        maxSize: scale * randomInRange(1, 2),
        minSize: scale * randomInRange(0.25, 0.75),
        steps: Math.floor(randomInRange(3, 7)),
        angle: randomInRange(0, Math.PI/4)
    };

    let nest = defineNest(nestOpts);

    if (willDrawStack) {
        // rotate the canvas before drawing stacks
        rotateCanvas(ctx, w, h, tilt);

        // Draw stacks with gray
        drawStack(stackA, -w / 4, 'gray');
        drawStack(stackB, w / 2, 'gray');

        // un-rotate to draw main shape
        resetTransform(ctx);
    }

    if (willDrawNest) {
        // draw Nest
        drawNest(ctx, nest, grays, {});
    }


    // Draw main shape + mask
    // --------------------------------------

    if (drawShadows) {
        addShadow(ctx, w, h);
    }


    if (opts.multiMask) {
        ctx.beginPath();
        getRandomRenderer()(ctx, w/4, h/4, scale * randomInRange(0.2,0.25), { fill: '#ffffff', continue:true });
        resetTransform(ctx);
        getRandomRenderer()(ctx, w/4 * 3, h/4, scale * randomInRange(0.2,0.25), { fill: '#ffffff', continue:true });
        resetTransform(ctx);
        getRandomRenderer()(ctx, w/4, h/4 * 3, scale * randomInRange(0.2,0.25), { fill: '#ffffff', continue:true });
        resetTransform(ctx);
        getRandomRenderer()(ctx, w/4 * 3, h/4 * 3, scale * randomInRange(0.2,0.25), { fill: '#ffffff', continue:true });
        resetTransform(ctx);
        ctx.closePath();
    } else {
        renderer(ctx, maskX, maskY, maskSize, { fill: '#ffffff' });
    }

    // clear shadow
    removeShadow(ctx);

    // clip mask
    ctx.clip();

    if (willDrawStack) {
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

    if (willDrawNest) {
        // draw color Nest in front of color stack
        drawNest(ctx, nest, opts.palette, {});

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


    // add a pin shadow if it's an open shape or nest
    if ( !drawShadows &&
        ( nest || ['box', 'ring'].indexOf(shape) >= 0 ) ){
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
