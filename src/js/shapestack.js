import noiseUtils from './noiseutils';
import { randItem, randomInRange, setAttrs } from './utils';
import { drawCircle, drawRing, drawTriangle, drawSquare, drawRect, drawBox, drawPentagon, drawHexagon } from './shapes';

// Creates a function that returns a different random entry
// from @palette each time it is called.
function createFillFunc(palette) {
    var refresh = function() {
        return palette
            .map(function(c) {
                return c;
            })
            .sort(function(a, b) {
                return Math.random() - 0.5;
            });
    };
    var p = refresh();
    return function() {
        if (!p.length) p = refresh();
        return p.pop();
    };
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

// rotate canvas around center point
function rotateCanvas(ctx, w, h, angle) {
    ctx.translate(w / 2, h / 2);
    ctx.rotate(angle);
    ctx.translate(-w / 2, -h / 2);
}

// reset canvas transformations
function resetCanvas(ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
}

// draw it!
function shapestack(options) {
    var defaults = {
        container: 'body',
        palette: ['#222222', '#fae1f6', '#b966d3', '#8ED2EE', '#362599', '#fff9de', '#FFC874'],
        drawShadows: false,
        addNoise: 0.04,
        noiseInput: null,
        dust: false,
        skew: 1, // normalized skew
        clear: true
    };
    var opts = {};
    opts = Object.assign(Object.assign(opts, defaults), options);
    opts.getColor = createFillFunc(opts.palette);

    var container = options.container;

    var w = container.offsetWidth;
    var h = container.offsetHeight;

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

    // optional clear
    if (opts.clear) {
        el.width = container.offsetWidth;
        el.height = container.offsetHeight;
        ctx.clearRect(0, 0, w, h);
    }

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

    var grays = ['#111111', '#666666', '#999999', '#cccccc', '#f9f9f9'];

    // BEGIN RENDERING

    if (opts.drawShadows) {
        addShadow(ctx, w, h);
    }

    // draw background/sky
    var sky = Math.round(randomInRange(204, 235)).toString(16);
    ctx.fillStyle = '#' + sky + sky + sky;
    ctx.fillRect(0, 0, w, h);

    // shuffle shape list and pick a shape
    shapes.sort(function(a, b) {
        return randomInRange(-1, 1);
    });
    var shape = shapes[0];
    renderer = renderMap[shape];

    // pick centerpoint for shape
    var maskX = w / 2;
    var maskY = h * randomInRange(0.45, 0.55);
    var maskSize = Math.min(w, h) * randomInRange(0.33, 0.45);

    // pick angle for stacks
    // only do it if skew option is truthy,
    // and then only some of the time
    var tilt = 0;
    if (opts.skew && Math.random() > 0.5) {
        // small angles look bad so avoid them
        tilt = randomInRange(0.05, 0.5);
        // random direction
        tilt *= Math.round(Math.random()) * 2 - 1;
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
                ctx.fillStyle = opts.getColor();
            }

            ctx.beginPath();
            ctx.rect(x, y[0], x + w, y[1] - y[0]);
            ctx.closePath();

            ctx.fill();
        });
    }

    // rotate the canvas before drawing stacks
    rotateCanvas(ctx, w, h, tilt);

    // Draw stacks with gray
    drawStack(stackA, -w / 4, 'gray');
    drawStack(stackB, w / 2, 'gray');

    // un-rotate to draw main shape
    resetCanvas(ctx);

    // add a pin shadow if it's an open shape
    if (['box', 'ring'].indexOf(shape) >= 0) {
        addShadow(ctx, w, h);
    }

    // Draw main shape + mask
    renderer(ctx, w / 2, maskY, maskSize, { fill: '#ffffff' });
    // clear shadow
    removeShadow(ctx);

    // clip mask
    ctx.clip();

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
        //ctx.lineTo(w/2 + nudge, h - Math.max(heightA, heightB));
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

    // unclip
    ctx.restore();

    // reset transform
    resetCanvas(ctx);

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
