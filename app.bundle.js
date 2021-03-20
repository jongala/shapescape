/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 24);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.randItem = randItem;
exports.randomInRange = randomInRange;
exports.shuffle = shuffle;
exports.setAttrs = setAttrs;
exports.resetTransform = resetTransform;
exports.rotateCanvas = rotateCanvas;
exports.getGradientFunction = getGradientFunction;
exports.getSolidColorFunction = getSolidColorFunction;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// random Array member
function randItem(arr) {
    return arr[Math.floor(arr.length * Math.random())];
}

function randomInRange(min, max) {
    return min + (max - min) * Math.random();
}

// fisher-yates, from https://bost.ocks.org/mike/shuffle/
function shuffle(array) {
    var m = array.length,
        t,
        i;

    // While there remain elements to shuffle…
    while (m) {

        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }

    return array;
}

function setAttrs(el, attrs) {
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
function resetTransform(ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
}

// rotate canvas around center point
function rotateCanvas(ctx, w, h, angle) {
    ctx.translate(w / 2, h / 2);
    ctx.rotate(angle);
    ctx.translate(-w / 2, -h / 2);
}

function getGradientFunction(palette) {
    var p = [].concat(palette);
    return function (ctx, w, h) {
        var bias = Math.random() - 0.5;
        var coords = [];
        if (bias) {
            coords = [randomInRange(0, w), 0, randomInRange(0, w), h];
        } else {
            coords = [0, randomInRange(0, h), w, randomInRange(0, h)];
        }
        var grad = ctx.createLinearGradient.apply(ctx, _toConsumableArray(coords));
        grad.addColorStop(0, randItem(p));
        grad.addColorStop(1, randItem(p));
        return grad;
    };
}

// Creates a function that returns a different random entry
// from @palette each time it is called.
function getSolidColorFunction(palette) {
    var refresh = function refresh() {
        // clone palette before providing func to avoid
        // operating on the input array.
        return [].concat(palette).sort(function (a, b) {
            return Math.random() - 0.5;
        });
    };
    var p = refresh();
    return function () {
        // if we run out of colors, start with a new shuffled palette
        if (!p.length) p = refresh();
        // otherwise pop a color
        return p.pop();
    };
}

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * Add noise to existing artwork, adding small equal values to each r,g,b
 * component of each pixel, by stepping through imageData.
 * Noise values darken or lighten pixels within the bounds of @opacity.
 * @param {node} canvas  input canvas to act upon
 * @param {number} opacity number from 0-1. Values < 0.1 recommended.
 */
function addNoiseToCanvas(canvas) {
    var opacity = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.2;

    var ctx = canvas.getContext('2d');

    var noise = void 0;
    var d = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var px = d.data;
    var n = px.length;
    var random = Math.random;
    var i = 0;
    // manipulate imageData array
    while (i < n) {
        noise = opacity * ((random() - 0.5) * 256) | 0;
        px[i++] += noise;
        px[i++] += noise;
        px[i++] += noise;
        i++; // step i for alpha value
    }

    ctx.putImageData(d, 0, 0);
}

/**
 * Add noise to @canvas efficiently, by creating a separate offscreen noisy
 * canvas, then applying that as a tiled pattern.
 * @param {node} canvas     the canvas to add noise to
 * @param {number} opacity    the intensity of the noise
 * @param {number} tileSize   the size of the pattern tile (a square)
 * @param {boolean} useOverlay if true, will composite using overlay blend mode
 */
function addNoiseFromPattern(canvas, opacity, tileSize, useOverlay) {
    var noiseCanvas = createNoiseCanvas(opacity, tileSize);
    applyNoiseCanvas(canvas, noiseCanvas, useOverlay);

    return {
        noiseCanvas: noiseCanvas,
        canvas: canvas
    };
}

/**
 * Creates an offscreen noisy canvas, where pixels are black or white with
 * alpha values random less than @opacity. This can be applied to other canvases
 * as a pattern for efficient noise application.
 * @param  {number} opacity  Noise intensity. As usual, small values < 0.1 best
 * @param  {number} tileSize The size of the pattern to be created
 * @return {node}          returns a reference to the canvas
 */
function createNoiseCanvas(opacity, tileSize) {
    tileSize = tileSize || 100;
    var canvas = document.createElement('canvas');
    canvas.width = tileSize;
    canvas.height = tileSize;

    // add noise to the offscreen canvas

    var ctx = canvas.getContext('2d');

    var noise = void 0;
    var d = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var px = d.data;
    var n = px.length;
    var random = Math.random;
    var i = 0;
    // manipulate imageData array
    while (i < n) {
        px[i++] = px[i++] = px[i++] = random() > 0.5 ? 255 : 0;
        px[i++] = opacity * random() * 256 | 0;
    }

    ctx.putImageData(d, 0, 0);

    return canvas;
}

/**
 * Actually do the application of @noiseCanvas as a pattern to @targetCanvas
 * @param  {node} targetCanvas the destination artwork
 * @param  {node} noiseCanvas  the input canvas with alpha channel noise
 * @param  {boolean} useOverlay   composite with overlay vs normal
 * @return {node}              return ref to the @targetCanvas
 */
function applyNoiseCanvas(targetCanvas, noiseCanvas, useOverlay) {
    var ctx = targetCanvas.getContext('2d');
    // create a noise pattern from the offscreen canvas
    var noisePattern = ctx.createPattern(noiseCanvas, 'repeat');
    ctx.fillStyle = noisePattern;
    if (useOverlay) {
        ctx.globalCompositeOperation = 'overlay';
    }
    ctx.fillRect(0, 0, targetCanvas.width, targetCanvas.height);
    if (useOverlay) {
        ctx.globalCompositeOperation = 'normal';
    }
    return targetCanvas;
}

exports.default = {
    addNoiseToCanvas: addNoiseToCanvas,
    addNoiseFromPattern: addNoiseFromPattern,
    createNoiseCanvas: createNoiseCanvas,
    applyNoiseCanvas: applyNoiseCanvas
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
// in use
var palettes = {
    ultra: ['#15d6d0', '#4481fc', '#bb19d8', '#f22f1c', '#ffa300', '#fff200'],
    high_contrast: ['#111111', '#444444', '#dddddd', '#f9f9f9'],
    low_contrast: ['#333333', '#666666', '#999999', '#cccccc', '#f9f9f9'],
    black_white_red: ['#111111', '#444444', '#dddddd', '#ffffff', '#880000', '#dd0000'],

    south_beach: ['#0c3646', '#11758e', '#89bed3', '#e4ca49', '#cabd9d', '#f2f0ea'],
    north_beach: ['#1d282e', '#4b4f52', '#0089ad', '#6e92b4', '#b9a583', '#f1e1d1'],
    twilight_beach: ['#030408', '#0c3646', '#4a828f', '#af8c70', '#aaadac', '#ffffff'],
    admiral: ['#0a131c', '#072444', '#3b6185', '#361313', '#c47423', '#b88d40', '#f3efec'],
    plum_sauce: ['#3C2E42', '#B4254B', '#FF804A', '#E8D1A1', '#A5C9C4'],
    fingerspitzen: ['#f4dda8', '#eda87c', '#c8907e', '#9cacc3', '#485e80', '#3b465b'],
    de_stijl: ['#f9f9f9', '#D9AC32', '#ED5045', '#1F3E9C', '#000142'],

    terra_cotta_cactus: ['#5d576b', '#9bc1b8', '#f4f1bb', '#dcc48e', '#ed6a5a'],
    metroid_fusion: ['#DBEED6', '#47BDC2', '#0A7DB8', '#1A3649', '#B24432'],

    candywafer: ['#222222', '#fae1f6', '#b966d3', '#8ED2EE', '#362599', '#fff9de', '#FFC874'],

    magma: ['#000004', '#3b0f70', '#8c2981', '#de4968', '#fe9f6d', '#fcfdbf'],
    inferno: ['#000004', '#420a68', '#932667', '#dd513a', '#fca50a', '#fcffa4'],
    plasma: ['#0d0887', '#6a00a8', '#b12a90', '#e16462', '#fca636', '#f0f921'],
    viridis: ['#440154', '#414487', '#2a788e', '#22a884', '#7ad151', '#fde725']
};

exports.default = palettes;

// older palettes:

var lemon_beach = exports.lemon_beach = ['#d7d7d7', '#979797', '#cabd9d', '#e4ca49', '#89bed3', '#11758e'];
var blush = exports.blush = ['#F8ADAA', '#F8E3AC', '#111111', '#ffffff', '#94552C']; // fragments

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
/*
 * Scaffolding for a drawing function.
 * Implements basic setup for placement, rotation, stroke, fill,
 * and leaving the path open.
 * All the drawing takes place in @renderFunc, which must have the standard
 * signature used in the returned function.
 * The renderFunc should not begin or close paths, or translate the canvas.
 */
function _makeRenderer(renderFunc) {
    return function (ctx, x, y, size, opts) {
        if (!opts.continue) {
            ctx.save();
            ctx.beginPath();
        }

        ctx.translate(x, y);
        if (opts.angle) {
            ctx.rotate(opts.angle);
        }

        // This is where all the drawing happens!
        //
        renderFunc(ctx, x, y, size, opts);
        //
        // Done defining path

        if (!opts.continue) {
            ctx.closePath();
            ctx.restore();
        }

        // Paint pixels
        ctx.fillStyle = opts.fill;
        ctx.strokeStyle = opts.stroke;
        opts.fill && ctx.fill();
        opts.stroke && ctx.stroke();

        return ctx;
    };
}

// Draw a closed circle
var drawCircle = exports.drawCircle = _makeRenderer(function (ctx, x, y, r, opts) {
    ctx.moveTo(r, 0);
    ctx.arc(0, 0, r, 0, 2 * Math.PI, false);
});

// Draw a ring with 50% thickness
var drawRing = exports.drawRing = _makeRenderer(function (ctx, x, y, r, opts) {
    var inner = r * 0.5;

    ctx.moveTo(r, 0);
    ctx.arc(0, 0, r, 0, 2 * Math.PI, false);
    // cutout
    ctx.moveTo(inner, 0);
    ctx.arc(0, 0, inner, 0, 2 * Math.PI, true);
});

// Draw a closed square
var drawSquare = exports.drawSquare = _makeRenderer(function (ctx, x, y, d, opts) {
    ctx.rect(-d, -d, d * 2, d * 2);
});

// Draw a closed rectangle with golden ratio aspect ratio
var drawRect = exports.drawRect = _makeRenderer(function (ctx, x, y, d, opts) {
    var gl = 0.6180339;

    ctx.rect(-d, -d * gl, d * 2, d * 2 * gl);
});

// Draw a square box, 60% thickness
var drawBox = exports.drawBox = _makeRenderer(function (ctx, x, y, d, opts) {
    var r = d * 0.4;

    ctx.moveTo(-d, -d);
    ctx.lineTo(+d, -d);
    ctx.lineTo(+d, +d);
    ctx.lineTo(-d, +d);
    // cutout
    ctx.moveTo(-r, -r);
    ctx.lineTo(-r, +r);
    ctx.lineTo(+r, +r);
    ctx.lineTo(+r, -r);
});

// Generate drawing functions for polygons
function _drawPolygon(SIDES, SCALE) {
    SCALE = SCALE || 1;

    return _makeRenderer(function (ctx, x, y, d, opts) {
        var r = d * SCALE;
        var a = Math.PI * 2 / SIDES;
        function _x(theta) {
            return r * Math.cos(theta - Math.PI / 2);
        }
        function _y(theta) {
            return r * Math.sin(theta - Math.PI / 2);
        }

        ctx.moveTo(_x(a * 0), _y(a * 0));
        for (var i = 1; i <= SIDES; i++) {
            ctx.lineTo(_x(a * i), _y(a * i));
        }
    });
}

// Strict drawing from centerpoint and radial corner placement
var drawExactTriangle = exports.drawExactTriangle = _drawPolygon(3, 1.2);
// Adjusting triangles downward a little fits them more naturally
// near other shapes.
var drawTriangle = exports.drawTriangle = function drawTriangle(ctx, x, y, d, opts) {
    drawExactTriangle(ctx, x, y + d * 0.2, d, opts);
};
var drawPentagon = exports.drawPentagon = _drawPolygon(5, 1.1);
var drawHexagon = exports.drawHexagon = _drawPolygon(6, 1.05);

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.defineFill = defineFill;
exports.expandFill = expandFill;

var _utils = __webpack_require__(0);

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/*
 * The general approach is to define fills in a generic object format,
 * which can be considered the serialized form:
 *
 * myFill = {
 *     type: ['solid', 'linear', 'radial'],
 *     params: {
 *         // whatever you need for the fill type
 *     }
 * }
 *
 * These are returned by defineFill()
 *
 * These can be deserialized by expandFill(), which dispatches to helper functions
 * for each fill type. These return an expanded fill, which is anything that
 * is valid for assignment to context.fillStyle = {}
 * e.g. a string of a hex color, or a defined canvas gradient.
 * 
 */

//--------------------------------------
// SERIALIZE
//--------------------------------------

var defineSolidFill = function defineSolidFill(palette) {
    var f = {
        type: 'solid',
        params: {
            color: (0, _utils.randItem)(palette)
        }
    };
    return f;
};

/**
 * Define a linear fill
 * @param  {context} ctx  the canvas rendering context
 * @param {array} palette an array of color values
 * @param  {num} x    center x of shape, normalized
 * @param  {num} y    center y of shape, normalized
 * @param  {num} size       half the size of the shape (r for circle), normalized
 * @param  {num} skew       scalar to offset endpoints left/right for angled gradient
 * @return {fillStyle}      an object defining a linear gradient, to be processed by expandFill()
 */
var defineLinearGradientFill = function defineLinearGradientFill(palette, x, y, size, skew) {
    var gradient = {
        type: 'linear',
        params: {
            coords: [],
            stops: []
        }
    };
    // 
    // pick xoffset as fraction of size to get a shallow angle
    var xoff = (0, _utils.randomInRange)(-skew / 2, skew / 2) * size;
    // build gradient, add stops
    gradient.params.coords = [x - xoff, y - size, x + xoff, y + size];
    gradient.params.stops.push([0, (0, _utils.randItem)(palette)]);
    gradient.params.stops.push([1, (0, _utils.randItem)(palette)]);
    return gradient;
};

// generic fill definition function
/**
 * Get a fill, either in solid or gradients
 * @param  {context} ctx  the canvas rendering context
 * @param {array} palette an array of color values
 * @param  {num} x    center x of shape, normalized
 * @param  {num} y    center y of shape, normalized
 * @param  {num} size       half the size of the shape (r for circle), normalized
 * @param  {num} skew       scalar to offset endpoints left/right for angled gradient
 * @return {fillStyle}      a custom fill object to be processed by expandFill()
 */
function defineFill(type, palette, x, y, size, skew) {
    // create a fill object
    var fillGenerators = {
        'solid': defineSolidFill,
        'linear': defineLinearGradientFill,
        'radial': defineSolidFill // FIXME
    };
    return fillGenerators[type](palette, x, y, size, skew);
}

//--------------------------------------
// DESERIALIZE
//--------------------------------------


var gradientFromLinearDef = function gradientFromLinearDef(ctx, gradientDef, w, h, scale) {
    var c = [].concat(_toConsumableArray(gradientDef.params.coords));
    c[0] *= w;
    c[1] *= h;
    c[2] *= w;
    c[3] *= h;
    var g = ctx.createLinearGradient.apply(ctx, _toConsumableArray(c));
    gradientDef.params.stops.forEach(function (s) {
        return g.addColorStop.apply(g, _toConsumableArray(s));
    });
    return g;
};

// outer expandFill converts a fill spec to a usable 2D context fill
function expandFill(ctx, fill, w, h, scale) {
    var fillFuncs = {
        'linear': gradientFromLinearDef,
        'radial': function radial(ctx, fill) {
            return fill.params.color;
        }, // FIXME
        'solid': function solid(ctx, fill) {
            return fill.params.color;
        }
    };
    if (fillFuncs[fill.type]) {
        return fillFuncs[fill.type](ctx, fill, w, h, scale);
    } else {
        console.error('Could not resolve fill', fill, w, h, scale);
        return '#808080';
    }
}

/***/ }),
/* 5 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = hexScatter;
// Fast scattering of random-looking points

function hexScatter(spacing, w, h, loosen) {
    loosen = loosen || 1.25;

    var TWOPI = Math.PI * 2;

    var gridSize = spacing * loosen;
    var R = spacing / 2;
    var cellR = gridSize - R;
    var hexW = 2 * 0.8660 * gridSize;
    var hexH = 1.5 * gridSize;
    var cols = Math.ceil(w / hexW) + 1;
    var rows = Math.ceil(h / hexH) + 1;
    var row; // current row in loops
    var col; // current col in loops

    function randomInRange(min, max) {
        return min + Math.random() * (max - min);
    }

    // Generates hexagon center-points for non-overlapping tiling
    function getTiledLayout(w, h, scale) {
        var points = [];
        var hexW = 2 * scale * 0.8660;
        var hexH = scale * 1.5;
        var rows = Math.ceil(h / hexH) + 1;
        var cols = Math.ceil(w / hexW) + 1;
        var count = rows * cols;
        var offset;
        var row;

        for (var i = 0; i < count; i++) {
            row = Math.floor(i / cols);
            offset = row % 2 ? -scale * 0.8660 : 0;
            points.push([i % cols * hexW + offset, row * hexH]);
        }

        return points;
    }

    function avgPoints(points) {
        var avg = [0, 0];
        avg[0] = points.reduce(function (m, v) {
            return m + v[0];
        }, 0) / points.length;
        avg[1] = points.reduce(function (m, v) {
            return m + v[1];
        }, 0) / points.length;
        return avg;
    }

    function isTooClose(p1, p2, d) {
        var dx = p2[0] - p1[0];
        var dy = p2[1] - p1[1];
        return dx * dx + dy * dy < d * d;
    }

    function checkSet(p, others, d) {
        var ok = true;
        others.forEach(function (o) {
            ok = ok && !isTooClose(p, o, d);
        });
        return ok;
    }

    function circumcenter(a, b, c) {
        var ax = a[0];
        var ay = a[1];
        var bx = b[0];
        var by = b[1];
        var cx = c[0];
        var cy = c[1];

        // midpoints
        var midAB = avgPoints([a, b]);
        var midAC = avgPoints([a, c]);

        // slopes
        var mAB = (by - ay) / (bx - ax);
        var mAC = (cy - ay) / (cx - ax);
        // invert for perpendicular
        mAB = -1 / mAB;
        mAC = -1 / mAC;

        // offsets
        var bAB = midAB[1] - mAB * midAB[0];
        var bAC = midAC[1] - mAC * midAC[0];

        var CCx;
        var CCy;

        // algebra!
        CCx = (bAC - bAB) / (mAB - mAC);
        CCy = mAB * CCx + bAB;

        var dx = CCx - ax;
        var dy = CCy - ay;
        var r = Math.sqrt(dx * dx + dy * dy);

        return { x: CCx, y: CCy, r: r };
    }

    var layout = getTiledLayout(w, h, gridSize);
    // [rows…][cols]
    var points = [];
    var topTriangles = [];

    var renderCount = rows * cols; // track points and repacking.

    var out = []; // output points

    var attempts = 0;

    // placement vars
    var cc; // circumcenter from points
    var packed = []; // coords from cc
    var tricc; // circumcenter from packed top triangles
    var tripacked; // coords from tricc

    var start = new Date().getTime();

    layout.forEach(function (p, i) {
        var x = p[0];
        var y = p[1];

        // the point
        var a = randomInRange(0, TWOPI);
        var v = randomInRange(0, cellR);
        var px = x + v * Math.cos(a);
        var py = y + v * Math.sin(a);

        points.push([px, py]);
        out.push([px, py]);

        attempts++;
    });

    // now pack points in top triangles
    var grid = points;
    for (var i = 0; i < grid.length - cols; i++) {
        row = Math.floor(i / cols);

        if (i % cols >= cols - 1) {
            continue;
        }

        var nextRowColOffset = row % 2 ? 0 : 1;
        // top triangles: get points from grid
        var p1 = grid[i];
        var p2 = grid[i + 1];
        var p3 = grid[i + cols + nextRowColOffset];

        cc = circumcenter(p1, p2, p3);
        packed = [cc.x, cc.y];
        attempts++;

        topTriangles[i] = packed;

        if (cc.r > spacing) {
            out.push(packed);
            renderCount++;
        }
    }

    // now pack points in bottom triangles
    for (var i = cols; i < grid.length - 1; i++) {
        row = Math.floor(i / cols);

        var odd = row % 2; // odd or even row
        var step = i % cols; // step within a row

        if (step >= cols - 1) {
            continue;
        }

        var colOffset = odd ? 0 : 1;

        var p1 = grid[i];
        var p2 = grid[i + 1];
        var p3 = grid[i - cols + colOffset];

        cc = circumcenter(p1, p2, p3);
        packed = [cc.x, cc.y];
        attempts++;

        var pp1;
        var pp2;
        var pp3;

        if (odd) {
            pp1 = topTriangles[i - cols - 1];
            pp2 = topTriangles[i - cols - 0];
            pp3 = topTriangles[i];
        } else {
            pp1 = topTriangles[i - cols + 0];
            pp2 = topTriangles[i - cols + 1];
            pp3 = topTriangles[i];
        }

        var hasTriangles = pp1 && pp2 && pp3;

        if (hasTriangles) {
            tricc = circumcenter(pp1, pp2, pp3);
            tripacked = [tricc.x, tricc.y];
            attempts++;
        }

        // check circumcenter against its component points
        var ccOK = cc.r > spacing;
        // now check against the neighboring packed points
        if (ccOK && hasTriangles) {
            ccOK = checkSet(packed, [pp1, pp2, pp3], spacing);
        }

        var tripOK = false;
        if (tricc && !ccOK) {
            tripOK = tricc.r > spacing;

            if (tripOK) {
                tripOK = checkSet(tripacked, [p1, p2, p3], spacing);
            }
        }

        if (ccOK) {
            out.push(packed);
            renderCount++;
        }

        if (tricc && !ccOK) {
            if (tripOK) {
                out.push(tripacked);
                renderCount++;
            }
        }

        if (!ccOK && !tripOK && tricc && hasTriangles) {
            packed = avgPoints([packed, tripacked]);
            attempts++;
            ccOK = checkSet(packed, [p1, p2, p3, pp1, pp2, pp3], spacing);
            if (ccOK) {
                out.push(packed);
                renderCount++;
            }
        }
    }

    var count = out.length;

    console.log(count + ' samples from ' + attempts + ' attempts, ' + (count / attempts * 100).toPrecision(2) + '% efficiency');

    return out;
}

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
var colorbrewer = {
    "Set1": { "3": ["rgb(228,26,28)", "rgb(55,126,184)", "rgb(77,175,74)"], "4": ["rgb(228,26,28)", "rgb(55,126,184)", "rgb(77,175,74)", "rgb(152,78,163)"], "5": ["rgb(228,26,28)", "rgb(55,126,184)", "rgb(77,175,74)", "rgb(152,78,163)", "rgb(255,127,0)"], "6": ["rgb(228,26,28)", "rgb(55,126,184)", "rgb(77,175,74)", "rgb(152,78,163)", "rgb(255,127,0)", "rgb(255,255,51)"], "7": ["rgb(228,26,28)", "rgb(55,126,184)", "rgb(77,175,74)", "rgb(152,78,163)", "rgb(255,127,0)", "rgb(255,255,51)", "rgb(166,86,40)"], "8": ["rgb(228,26,28)", "rgb(55,126,184)", "rgb(77,175,74)", "rgb(152,78,163)", "rgb(255,127,0)", "rgb(255,255,51)", "rgb(166,86,40)", "rgb(247,129,191)"], "9": ["rgb(228,26,28)", "rgb(55,126,184)", "rgb(77,175,74)", "rgb(152,78,163)", "rgb(255,127,0)", "rgb(255,255,51)", "rgb(166,86,40)", "rgb(247,129,191)", "rgb(153,153,153)"], "type": "qual" },
    "Set3": { "3": ["rgb(141,211,199)", "rgb(255,255,179)", "rgb(190,186,218)"], "4": ["rgb(141,211,199)", "rgb(255,255,179)", "rgb(190,186,218)", "rgb(251,128,114)"], "5": ["rgb(141,211,199)", "rgb(255,255,179)", "rgb(190,186,218)", "rgb(251,128,114)", "rgb(128,177,211)"], "6": ["rgb(141,211,199)", "rgb(255,255,179)", "rgb(190,186,218)", "rgb(251,128,114)", "rgb(128,177,211)", "rgb(253,180,98)"], "7": ["rgb(141,211,199)", "rgb(255,255,179)", "rgb(190,186,218)", "rgb(251,128,114)", "rgb(128,177,211)", "rgb(253,180,98)", "rgb(179,222,105)"], "8": ["rgb(141,211,199)", "rgb(255,255,179)", "rgb(190,186,218)", "rgb(251,128,114)", "rgb(128,177,211)", "rgb(253,180,98)", "rgb(179,222,105)", "rgb(252,205,229)"], "9": ["rgb(141,211,199)", "rgb(255,255,179)", "rgb(190,186,218)", "rgb(251,128,114)", "rgb(128,177,211)", "rgb(253,180,98)", "rgb(179,222,105)", "rgb(252,205,229)", "rgb(217,217,217)"], "10": ["rgb(141,211,199)", "rgb(255,255,179)", "rgb(190,186,218)", "rgb(251,128,114)", "rgb(128,177,211)", "rgb(253,180,98)", "rgb(179,222,105)", "rgb(252,205,229)", "rgb(217,217,217)", "rgb(188,128,189)"], "11": ["rgb(141,211,199)", "rgb(255,255,179)", "rgb(190,186,218)", "rgb(251,128,114)", "rgb(128,177,211)", "rgb(253,180,98)", "rgb(179,222,105)", "rgb(252,205,229)", "rgb(217,217,217)", "rgb(188,128,189)", "rgb(204,235,197)"], "12": ["rgb(141,211,199)", "rgb(255,255,179)", "rgb(190,186,218)", "rgb(251,128,114)", "rgb(128,177,211)", "rgb(253,180,98)", "rgb(179,222,105)", "rgb(252,205,229)", "rgb(217,217,217)", "rgb(188,128,189)", "rgb(204,235,197)", "rgb(255,237,111)"], "type": "qual" },
    "Pastel1": { "3": ["rgb(251,180,174)", "rgb(179,205,227)", "rgb(204,235,197)"], "4": ["rgb(251,180,174)", "rgb(179,205,227)", "rgb(204,235,197)", "rgb(222,203,228)"], "5": ["rgb(251,180,174)", "rgb(179,205,227)", "rgb(204,235,197)", "rgb(222,203,228)", "rgb(254,217,166)"], "6": ["rgb(251,180,174)", "rgb(179,205,227)", "rgb(204,235,197)", "rgb(222,203,228)", "rgb(254,217,166)", "rgb(255,255,204)"], "7": ["rgb(251,180,174)", "rgb(179,205,227)", "rgb(204,235,197)", "rgb(222,203,228)", "rgb(254,217,166)", "rgb(255,255,204)", "rgb(229,216,189)"], "8": ["rgb(251,180,174)", "rgb(179,205,227)", "rgb(204,235,197)", "rgb(222,203,228)", "rgb(254,217,166)", "rgb(255,255,204)", "rgb(229,216,189)", "rgb(253,218,236)"], "9": ["rgb(251,180,174)", "rgb(179,205,227)", "rgb(204,235,197)", "rgb(222,203,228)", "rgb(254,217,166)", "rgb(255,255,204)", "rgb(229,216,189)", "rgb(253,218,236)", "rgb(242,242,242)"], "type": "qual" },

    "YlOrRd": { "3": ["rgb(255,237,160)", "rgb(254,178,76)", "rgb(240,59,32)"], "4": ["rgb(255,255,178)", "rgb(254,204,92)", "rgb(253,141,60)", "rgb(227,26,28)"], "5": ["rgb(255,255,178)", "rgb(254,204,92)", "rgb(253,141,60)", "rgb(240,59,32)", "rgb(189,0,38)"], "6": ["rgb(255,255,178)", "rgb(254,217,118)", "rgb(254,178,76)", "rgb(253,141,60)", "rgb(240,59,32)", "rgb(189,0,38)"], "7": ["rgb(255,255,178)", "rgb(254,217,118)", "rgb(254,178,76)", "rgb(253,141,60)", "rgb(252,78,42)", "rgb(227,26,28)", "rgb(177,0,38)"], "8": ["rgb(255,255,204)", "rgb(255,237,160)", "rgb(254,217,118)", "rgb(254,178,76)", "rgb(253,141,60)", "rgb(252,78,42)", "rgb(227,26,28)", "rgb(177,0,38)"], "type": "seq" },
    "YlGnBu": { "3": ["rgb(237,248,177)", "rgb(127,205,187)", "rgb(44,127,184)"], "4": ["rgb(255,255,204)", "rgb(161,218,180)", "rgb(65,182,196)", "rgb(34,94,168)"], "5": ["rgb(255,255,204)", "rgb(161,218,180)", "rgb(65,182,196)", "rgb(44,127,184)", "rgb(37,52,148)"], "6": ["rgb(255,255,204)", "rgb(199,233,180)", "rgb(127,205,187)", "rgb(65,182,196)", "rgb(44,127,184)", "rgb(37,52,148)"], "7": ["rgb(255,255,204)", "rgb(199,233,180)", "rgb(127,205,187)", "rgb(65,182,196)", "rgb(29,145,192)", "rgb(34,94,168)", "rgb(12,44,132)"], "8": ["rgb(255,255,217)", "rgb(237,248,177)", "rgb(199,233,180)", "rgb(127,205,187)", "rgb(65,182,196)", "rgb(29,145,192)", "rgb(34,94,168)", "rgb(12,44,132)"], "9": ["rgb(255,255,217)", "rgb(237,248,177)", "rgb(199,233,180)", "rgb(127,205,187)", "rgb(65,182,196)", "rgb(29,145,192)", "rgb(34,94,168)", "rgb(37,52,148)", "rgb(8,29,88)"], "type": "seq" },
    "PuBu": { "3": ["rgb(236,231,242)", "rgb(166,189,219)", "rgb(43,140,190)"], "4": ["rgb(241,238,246)", "rgb(189,201,225)", "rgb(116,169,207)", "rgb(5,112,176)"], "5": ["rgb(241,238,246)", "rgb(189,201,225)", "rgb(116,169,207)", "rgb(43,140,190)", "rgb(4,90,141)"], "6": ["rgb(241,238,246)", "rgb(208,209,230)", "rgb(166,189,219)", "rgb(116,169,207)", "rgb(43,140,190)", "rgb(4,90,141)"], "7": ["rgb(241,238,246)", "rgb(208,209,230)", "rgb(166,189,219)", "rgb(116,169,207)", "rgb(54,144,192)", "rgb(5,112,176)", "rgb(3,78,123)"], "8": ["rgb(255,247,251)", "rgb(236,231,242)", "rgb(208,209,230)", "rgb(166,189,219)", "rgb(116,169,207)", "rgb(54,144,192)", "rgb(5,112,176)", "rgb(3,78,123)"], "9": ["rgb(255,247,251)", "rgb(236,231,242)", "rgb(208,209,230)", "rgb(166,189,219)", "rgb(116,169,207)", "rgb(54,144,192)", "rgb(5,112,176)", "rgb(4,90,141)", "rgb(2,56,88)"], "type": "seq" },
    "BuPu": { "3": ["rgb(224,236,244)", "rgb(158,188,218)", "rgb(136,86,167)"], "4": ["rgb(237,248,251)", "rgb(179,205,227)", "rgb(140,150,198)", "rgb(136,65,157)"], "5": ["rgb(237,248,251)", "rgb(179,205,227)", "rgb(140,150,198)", "rgb(136,86,167)", "rgb(129,15,124)"], "6": ["rgb(237,248,251)", "rgb(191,211,230)", "rgb(158,188,218)", "rgb(140,150,198)", "rgb(136,86,167)", "rgb(129,15,124)"], "7": ["rgb(237,248,251)", "rgb(191,211,230)", "rgb(158,188,218)", "rgb(140,150,198)", "rgb(140,107,177)", "rgb(136,65,157)", "rgb(110,1,107)"], "8": ["rgb(247,252,253)", "rgb(224,236,244)", "rgb(191,211,230)", "rgb(158,188,218)", "rgb(140,150,198)", "rgb(140,107,177)", "rgb(136,65,157)", "rgb(110,1,107)"], "9": ["rgb(247,252,253)", "rgb(224,236,244)", "rgb(191,211,230)", "rgb(158,188,218)", "rgb(140,150,198)", "rgb(140,107,177)", "rgb(136,65,157)", "rgb(129,15,124)", "rgb(77,0,75)"], "type": "seq" },
    "PuRd": { "3": ["rgb(231,225,239)", "rgb(201,148,199)", "rgb(221,28,119)"], "4": ["rgb(241,238,246)", "rgb(215,181,216)", "rgb(223,101,176)", "rgb(206,18,86)"], "5": ["rgb(241,238,246)", "rgb(215,181,216)", "rgb(223,101,176)", "rgb(221,28,119)", "rgb(152,0,67)"], "6": ["rgb(241,238,246)", "rgb(212,185,218)", "rgb(201,148,199)", "rgb(223,101,176)", "rgb(221,28,119)", "rgb(152,0,67)"], "7": ["rgb(241,238,246)", "rgb(212,185,218)", "rgb(201,148,199)", "rgb(223,101,176)", "rgb(231,41,138)", "rgb(206,18,86)", "rgb(145,0,63)"], "8": ["rgb(247,244,249)", "rgb(231,225,239)", "rgb(212,185,218)", "rgb(201,148,199)", "rgb(223,101,176)", "rgb(231,41,138)", "rgb(206,18,86)", "rgb(145,0,63)"], "9": ["rgb(247,244,249)", "rgb(231,225,239)", "rgb(212,185,218)", "rgb(201,148,199)", "rgb(223,101,176)", "rgb(231,41,138)", "rgb(206,18,86)", "rgb(152,0,67)", "rgb(103,0,31)"], "type": "seq" },
    "RdPu": { "3": ["rgb(253,224,221)", "rgb(250,159,181)", "rgb(197,27,138)"], "4": ["rgb(254,235,226)", "rgb(251,180,185)", "rgb(247,104,161)", "rgb(174,1,126)"], "5": ["rgb(254,235,226)", "rgb(251,180,185)", "rgb(247,104,161)", "rgb(197,27,138)", "rgb(122,1,119)"], "6": ["rgb(254,235,226)", "rgb(252,197,192)", "rgb(250,159,181)", "rgb(247,104,161)", "rgb(197,27,138)", "rgb(122,1,119)"], "7": ["rgb(254,235,226)", "rgb(252,197,192)", "rgb(250,159,181)", "rgb(247,104,161)", "rgb(221,52,151)", "rgb(174,1,126)", "rgb(122,1,119)"], "8": ["rgb(255,247,243)", "rgb(253,224,221)", "rgb(252,197,192)", "rgb(250,159,181)", "rgb(247,104,161)", "rgb(221,52,151)", "rgb(174,1,126)", "rgb(122,1,119)"], "9": ["rgb(255,247,243)", "rgb(253,224,221)", "rgb(252,197,192)", "rgb(250,159,181)", "rgb(247,104,161)", "rgb(221,52,151)", "rgb(174,1,126)", "rgb(122,1,119)", "rgb(73,0,106)"], "type": "seq" },

    "Greys": { "3": ["rgb(240,240,240)", "rgb(189,189,189)", "rgb(99,99,99)"], "4": ["rgb(247,247,247)", "rgb(204,204,204)", "rgb(150,150,150)", "rgb(82,82,82)"], "5": ["rgb(247,247,247)", "rgb(204,204,204)", "rgb(150,150,150)", "rgb(99,99,99)", "rgb(37,37,37)"], "6": ["rgb(247,247,247)", "rgb(217,217,217)", "rgb(189,189,189)", "rgb(150,150,150)", "rgb(99,99,99)", "rgb(37,37,37)"], "7": ["rgb(247,247,247)", "rgb(217,217,217)", "rgb(189,189,189)", "rgb(150,150,150)", "rgb(115,115,115)", "rgb(82,82,82)", "rgb(37,37,37)"], "8": ["rgb(255,255,255)", "rgb(240,240,240)", "rgb(217,217,217)", "rgb(189,189,189)", "rgb(150,150,150)", "rgb(115,115,115)", "rgb(82,82,82)", "rgb(37,37,37)"], "9": ["rgb(255,255,255)", "rgb(240,240,240)", "rgb(217,217,217)", "rgb(189,189,189)", "rgb(150,150,150)", "rgb(115,115,115)", "rgb(82,82,82)", "rgb(37,37,37)", "rgb(0,0,0)"], "type": "seq" }
};

exports.default = colorbrewer;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.defineWaterline = defineWaterline;
exports.drawWaterline = drawWaterline;
exports.waterline = waterline;

var _waterlineSchema = __webpack_require__(9);

var _noiseutils = __webpack_require__(1);

var _noiseutils2 = _interopRequireDefault(_noiseutils);

var _palettes = __webpack_require__(2);

var _palettes2 = _interopRequireDefault(_palettes);

var _utils = __webpack_require__(0);

var _colors = __webpack_require__(4);

var _shapes = __webpack_require__(3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * Define a fill, either in solid or gradients
 * @param  {context} ctx  the canvas rendering context
 * @param {array} palette an array of color values
 * @param  {num} x    center x of shape
 * @param  {num} y    center y of shape
 * @param  {num} size       half the size of the shape (r for circle)
 * @param  {num} skew       scalar to offset endpoints left/right for angled gradient
 * @return {fillStyle}      a solid color or canvas gradient
 */
function getRandomFill(palette, x, y, size) {
    var skew = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;

    var type = 'solid';
    if (Math.random() < 0.999999) {
        type = 'linear';
    }
    return (0, _colors.defineFill)(type, palette, x, y, size, skew);
}

function drawWave(ctx, y1, c1, c2, y2, w, h, opts) {
    ctx.save();
    if (opts.fill) {
        ctx.fillStyle = opts.fill;
    }
    ctx.beginPath();
    ctx.moveTo(0, y1);
    ctx.bezierCurveTo(w / 3, c1, 2 * w / 3, c2, w, y2);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();

    ctx.fill();
    ctx.restore();
}

function drawSunbeams(ctx, x, y, w, h, fill) {
    var triCount;
    var x2;
    var y2;
    var tw;
    var tx;
    var grad;
    ctx.globalCompositeOperation = 'soft-light';

    if (Math.random() > 0.15) {
        // Most of the time, render many beams at low opacity
        triCount = Math.round((0, _utils.randomInRange)(40, 60));
        ctx.globalAlpha = (0, _utils.randomInRange)(0.1, 0.3);
    } else {
        // … sometimes, render a few beams at more varying opacities
        triCount = Math.round((0, _utils.randomInRange)(5, 10));
        ctx.globalAlpha = (0, _utils.randomInRange)(0.2, 0.8);
    }

    while (triCount--) {
        // Set triangle width, and target x centerpoint.
        // Target x can be on or off page, with width spread bringing part
        // of the beam into the image
        tw = (0, _utils.randomInRange)(w / 30, w / 3); // width range
        tx = (0, _utils.randomInRange)(-w / 3, 4 * w / 3); // target (bottom) x
        ctx.fillStyle = fill || '#fff';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(tx + tw / 2, h);
        ctx.lineTo(tx - tw / 2, h);
        ctx.closePath();
        ctx.fill();
    }
}

function addShadow(ctx, w, h) {
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 3 * Math.min(w, h) / 400;
    ctx.shadowBlur = 10 * Math.min(w, h) / 400;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
}

function removeShadow(ctx) {
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
}

// Draw a waterline shape, clip to it, execute renderFunc,
// then restore canvas to remove clipping
function clipInWaterline(ctx, y1, c1, c2, y2, w, h, renderFunc) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, y1 * h);
    ctx.bezierCurveTo(w / 3, c1 * h, 2 * w / 3, c2 * h, w, y2 * h);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.clip();

    renderFunc(ctx, w, h, y1, y2);

    ctx.closePath();
    ctx.restore();
}

// Map shape names to drawing functions
var renderMap = {
    circle: _shapes.drawCircle,
    ring: _shapes.drawRing,
    triangle: _shapes.drawTriangle,
    square: _shapes.drawSquare,
    box: _shapes.drawBox,
    rect: _shapes.drawRect,
    pentagon: _shapes.drawPentagon,
    hexagon: _shapes.drawHexagon
};

var DEFAULT_OPTIONS = {
    container: 'body',
    palette: _palettes2.default.candywafer,
    drawShadows: true,
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true
};

// For dev use:
// A descriptor of what we think a complete schema should look like.
// Compare structure with the def object produced by defineWaterline().


// Dev util: check a waterline def against the schema, and list any keys
// not yet represented.  This doesn't check for correctness!!!
var checkDef = function checkDef(def, schema) {
    var defKeys = Object.keys(def);
    var schemaKeys = Object.keys(schema);
    var missingKeys = [];
    schemaKeys.map(function (k) {
        if (!defKeys.includes(k)) missingKeys.push(k);
    });
    return missingKeys;
};

// Create a waterline definition from a set of input @options.
// Eventually, this should be a JSON object that fully describes
// a graphic's appearance, with some secondary randomness.
function defineWaterline(options) {
    var opts = Object.assign({}, DEFAULT_OPTIONS, options);
    var shapes = Object.keys(renderMap);
    // shuffle shape list and pick a shape
    shapes.sort(function (a, b) {
        return (0, _utils.randomInRange)(-1, 1);
    });

    // Set up container values that determine sizes and coordinates
    var container = opts.container;
    var w = container.offsetWidth;
    var h = container.offsetHeight;
    var SCALE = Math.min(w, h); // generalized size of the layout

    // temp vars which are used in multiple attributes
    var _shapeSize = (0, _utils.randomInRange)(0.25, 0.4);
    var _shapeX = 1 / 2;
    var _shapeY = (0, _utils.randomInRange)(0.4, 0.6);

    // waves
    var _backLine = [(0, _utils.randomInRange)(0.49, 0.51), (0, _utils.randomInRange)(0.48, 0.52), (0, _utils.randomInRange)(0.48, 0.52), (0, _utils.randomInRange)(0.49, 0.51)];
    var _backTop = Math.min(_backLine[0], _backLine[3]);
    var _frontLine = [(0, _utils.randomInRange)(0.47, 0.52), (0, _utils.randomInRange)(0.45, 0.55), (0, _utils.randomInRange)(0.45, 0.55), (0, _utils.randomInRange)(0.47, 0.52)];
    var _frontTop = Math.min(_frontLine[0], _frontLine[3]);

    // skeleton of a waterline def
    var def = {
        shapeName: shapes[0],
        shapeX: _shapeX,
        shapeY: _shapeY,
        shapeSize: _shapeSize,
        shapeMagnified: _shapeSize * (1 + 1 / (0, _utils.randomInRange)(50, 80)),
        // Rotate shape. Not all renderers will use this.
        shapeAngle: (0, _utils.randomInRange)(-Math.PI / 12, Math.PI / 12),
        shapeFill: getRandomFill(opts.palette, _shapeX, _shapeY, _shapeSize, opts.skew),
        underwaterShapeAlpha: (0, _utils.randomInRange)(0.2, 1),

        // sky fill
        backgroundFill: getRandomFill(opts.palette, 0.5, 0.5, 0.5, opts.skew),

        // waves
        surfaceLine: {
            fill: getRandomFill(opts.palette, 0, _backTop, 1 - _backTop, 0),
            backAlpha: (0, _utils.randomInRange)(0.2, 0.6),
            backOffset: 1 / (0, _utils.randomInRange)(40, 100), // offset between the two waterline waves
            backLine: _backLine,
            frontLine: _frontLine
        },

        // edge
        edgeThickness: 0.005 * Math.random(),
        edgeAlpha: (0, _utils.randomInRange)(0.1, 0.75),
        edgeBlendStops: [(0, _utils.randomInRange)(0, 0.5), (0, _utils.randomInRange)(0.5, 1)]

        // debug: show defs and missing properties
        // console.log('def', def);
        // console.log('missing:', checkDef(def, SCHEMA));

    };window.LASTDEF = def; // debug allow re-run

    return def;
}

// Draw a waterline, given a @def and rendering @options.
// Eventually, @options should contain only the target element, height, and
// width, while @def determines what is drawn in that space
function drawWaterline(def, options) {
    var opts = Object.assign({}, DEFAULT_OPTIONS, options);

    var container = options.container;

    var w = container.offsetWidth;
    var h = container.offsetHeight;
    var SCALE = Math.min(w, h);

    // Find or create canvas child
    var el = container.querySelector('canvas');
    var newEl = false;
    if (!el) {
        container.innerHTML = '';
        el = document.createElement('canvas');
        newEl = true;
    }
    if (newEl || opts.clear) {
        el.width = w;
        el.height = h;
    }

    var ctx; // canvas ctx or svg tag

    ctx = el.getContext('2d');

    // optional clear
    if (opts.clear) {
        el.width = container.offsetWidth;
        el.height = container.offsetHeight;
        ctx.clearRect(0, 0, w, h);
    }

    // BEGIN RENDERING

    if (opts.drawShadows) {
        addShadow(ctx, w, h);
    }

    // draw background/sky
    ctx.fillStyle = (0, _colors.expandFill)(ctx, def.backgroundFill, w, h, SCALE);
    ctx.fillRect(0, 0, w, h);

    var renderer = renderMap[def.shapeName];

    // pick centerpoint for shape

    // since these may get modified, make local copies
    var shapeSize = def.shapeSize;
    var shapeMagnified = def.shapeMagnified;
    if (def.shapeName === 'rect') {
        // bump up size of rectangles
        shapeSize *= 1.2;
        shapeMagnified *= 1.2;
    }

    // Create a fill we will reuse for both renderings of the shape
    var shapeFill = (0, _colors.expandFill)(ctx, def.shapeFill, w, h, SCALE);

    // Prepare main waterlines

    // Set waterline params for background renderin, and common fill
    var wfill = (0, _colors.expandFill)(ctx, def.surfaceLine.fill, w, h, SCALE); // main waterline fill

    // Draw background waterline at low opacity, slightly offset upward
    ctx.globalAlpha = def.surfaceLine.backAlpha;

    var backgroundOffset = def.surfaceLine.backOffset * h;
    drawWave(ctx, h * def.surfaceLine.backLine[0] - backgroundOffset, h * def.surfaceLine.backLine[1] - backgroundOffset, h * def.surfaceLine.backLine[2] - backgroundOffset, h * def.surfaceLine.backLine[3] - backgroundOffset, w, h, Object.assign({ fill: wfill }, opts));
    ctx.globalAlpha = 1;

    // Draw the shape above waterline
    renderer(ctx, def.shapeX * w, def.shapeY * h, shapeSize * SCALE, {
        fill: shapeFill,
        angle: def.shapeAngle
    });

    // Draw main foreground waterline. We will reuse these params
    // for clipping the underwater elements
    drawWave(ctx, h * def.surfaceLine.frontLine[0], h * def.surfaceLine.frontLine[1], h * def.surfaceLine.frontLine[2], h * def.surfaceLine.frontLine[3], w, h, Object.assign({
        fill: wfill
    }, opts));

    // rendering to be done within the waterline clipping
    function underwater(ctx, w, h, y1, y2) {
        var hz = Math.min(y1, y2);
        removeShadow(ctx);

        // Get a color sample from the underwater background block.
        // This will be used in the wavy overlays. We get it from
        // just below the horizon line in the middle, before we render
        // the underwater half of the main shape.
        var colorSample = ctx.getImageData(w / 2, Math.floor((h - hz) / 2), 1, 1);
        var colorData = colorSample.data;
        var waterLevel = hz;
        var waterColor = colorData[0] + ', ' + colorData[1] + ', ' + colorData[2];
        var waterFill;

        // Draw light beams with the same fill as the water
        // (will render in a different blending mode)
        // The beams start anywhere across width, and somewhere above
        // the top of the image (hence negative y vals)
        drawSunbeams(ctx, (0, _utils.randomInRange)(0, w), (0, _utils.randomInRange)(-2 * h, hz / 2), w, h, wfill);

        // Draw the underwater half of the main shape, a little bigger
        // for the liquid magnification effect. Fade it out to get different
        // apparent depth and clarity in liquid.
        ctx.globalCompositeOperation = 'normal';
        ctx.globalAlpha = def.underwaterShapeAlpha;
        addShadow(ctx, w, h);
        renderer(ctx, def.shapeX * w, def.shapeY * h, shapeMagnified * SCALE, {
            fill: shapeFill,
            angle: def.shapeAngle
        });

        // Function to batch create sets of wavy lines under the water
        function drawWaveSet(composite, ymin, ymax, amin, amax) {
            ctx.globalCompositeOperation = composite || 'normal';
            ymin = ymin || 0;
            ymax = ymax || h;
            amin = amin || 0.2;
            amax = amax || 0.8;

            var waterCount = Math.round((0, _utils.randomInRange)(3, 7));
            var increment = (ymax - ymin) / waterCount;

            while (waterCount--) {
                ctx.globalAlpha = (0, _utils.randomInRange)(amin, amax);
                waterLevel = ymin + waterCount * increment;

                waterFill = ctx.createLinearGradient((0, _utils.randomInRange)(w / 3, 2 * w / 3), (0, _utils.randomInRange)(hz, waterLevel), w / 2, (0, _utils.randomInRange)(waterLevel, h));
                waterFill.addColorStop(0, 'rgba(' + waterColor + ', 1)');
                waterFill.addColorStop(1, 'rgba(' + waterColor + ', 0)');

                drawWave(ctx, waterLevel * (0, _utils.randomInRange)(0.9, 1.1), waterLevel * (0, _utils.randomInRange)(0.9, 1.1), waterLevel * (0, _utils.randomInRange)(0.9, 1.1), waterLevel * (0, _utils.randomInRange)(0.9, 1.1), w, h, {
                    fill: waterFill
                });
            }
        }

        // The waves look bad when they cast shadows
        removeShadow(ctx);

        // Draw light blended waves near the surface
        drawWaveSet('soft-light', hz, hz + (h - hz) / 3, 0.2, 0.8);

        // Draw dark blended waves near the bottom
        drawWaveSet('multiply', hz + (h - hz) / 2, h, 0.1, 0.3);

        // At the top edge, use the main waterline points, then repeat the
        // curve going back to the left, slightly lower.  Fill with a light
        // gradient and blend over.
        var edgeThickness = def.edgeThickness * h + 1.5;
        var edgeFill = ctx.createLinearGradient(0, 0, w, 0);
        edgeFill.addColorStop(0, '#808080');
        edgeFill.addColorStop(def.edgeBlendStops[0], '#fff');
        edgeFill.addColorStop(def.edgeBlendStops[1], '#fff');
        edgeFill.addColorStop(1, '#808080');

        ctx.fillStyle = edgeFill;
        ctx.globalCompositeOperation = 'overlay';
        ctx.globalAlpha = def.edgeAlpha;

        var _def$surfaceLine$fron = _slicedToArray(def.surfaceLine.frontLine, 4),
            wl = _def$surfaceLine$fron[0],
            wc1 = _def$surfaceLine$fron[1],
            wc2 = _def$surfaceLine$fron[2],
            wr = _def$surfaceLine$fron[3];

        ctx.beginPath();
        ctx.moveTo(0, wl * h);
        ctx.bezierCurveTo(w / 3, h * wc1 - 1, 2 * w / 3, h * wc2 - 1, w, h * wr);
        ctx.bezierCurveTo(2 * w / 3, h * wc2 + edgeThickness, w / 3, h * wc1 + edgeThickness, 0, h * wl + 2);
        ctx.closePath();
        ctx.fill();

        if (opts.dust) {
            var spotCount = Math.floor((0, _utils.randomInRange)(200, 1000));
            ctx.globalCompositeOperation = 'soft-light';
            while (--spotCount) {
                ctx.globalAlpha = (0, _utils.randomInRange)(0, 0.5);
                (0, _shapes.drawCircle)(ctx, (0, _utils.randomInRange)(0, w), (0, _utils.randomInRange)(hz, h), (0, _utils.randomInRange)(0.5, 1.5) * w / 800, { fill: '#fff' });
            }
        }
    }

    // Now render the above function inside the waterline clipping area
    clipInWaterline.apply(undefined, [ctx].concat(_toConsumableArray(def.surfaceLine.frontLine), [w, h, underwater]));

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'normal';

    // Add effect elements
    // ...

    // add noise
    if (opts.addNoise) {
        if (opts.noiseInput) {
            _noiseutils2.default.applyNoiseCanvas(el, opts.noiseInput);
        } else {
            _noiseutils2.default.addNoiseFromPattern(el, opts.addNoise, w / 3);
        }
    }

    // END RENDERING

    // if new canvas child was created, append it
    if (newEl) {
        container.appendChild(el);
    }
}

// This wrapper function replaces the old single-function rendering pipeline,
// where you input rendering @options and get a surprise graphic.
function waterline(options) {
    drawWaterline(defineWaterline(options), options);
}

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
// Waterline def schema
var SCHEMA = exports.SCHEMA = {
    shapeName: '',
    shapeY: 0,
    shapeSize: 0,
    shapeMagnified: 0,
    shapeAngle: 0,
    shapeFill: {},
    underwaterShapeAlpha: 1,
    backgroundFill: {},

    surfaceLine: {
        fill: {},
        backAlpha: 1,
        backOffset: 0,
        backLine: [0, 0, 0, 0],
        frontLine: [0, 0, 0, 0]
    },
    sunBeams: {
        alpha: 1,
        beams: [0, 0]
    },

    waveSet: [{
        gradient: { start: [0, 0], end: [0, 0] },
        position: [0, 0, 0, 0],
        alpha: 1
    }],

    edgeThickness: 0,
    edgeAlpha: 1,
    edgeBlendStops: [0.25, 0.75], // left half, right half

    spots: [{
        x: 0,
        y: 0,
        r: 1,
        alpha: 1
    }]

};

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.shapestack = shapestack;

var _noiseutils = __webpack_require__(1);

var _noiseutils2 = _interopRequireDefault(_noiseutils);

var _palettes = __webpack_require__(2);

var _palettes2 = _interopRequireDefault(_palettes);

var _utils = __webpack_require__(0);

var _shapes = __webpack_require__(3);

var _stacks = __webpack_require__(11);

var _nests = __webpack_require__(12);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

var DEFAULTS = {
    container: 'body',
    palette: _palettes2.default.plum_sauce,
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

    // draw it!
};function shapestack(options) {
    var opts = Object.assign(DEFAULTS, options);

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
        el.width = container.offsetWidth;
        el.height = container.offsetHeight;
    }

    var ctx = el.getContext('2d');

    ctx.save();

    // optional clear
    if (opts.clear) {
        ctx.clearRect(0, 0, w, h);
    }

    // Setup renderers and default palettes
    var renderer;
    var renderMap = {
        circle: _shapes.drawCircle,
        ring: _shapes.drawRing,
        triangle: _shapes.drawTriangle,
        square: _shapes.drawSquare,
        box: _shapes.drawBox,
        rect: _shapes.drawRect,
        pentagon: _shapes.drawPentagon,
        hexagon: _shapes.drawHexagon
    };
    var shapes = Object.keys(renderMap);
    var getRandomRenderer = function getRandomRenderer() {
        return renderMap[(0, _utils.randItem)(shapes)];
    };

    var grays = ['#111111', '#666666', '#808080', '#999999', '#b4b4b4', '#cccccc', '#e7e7e7', '#f9f9f9'];

    // randomize render style if both styles are false (default)
    var willDrawStack = opts.stack;
    var willDrawNest = opts.nest;
    if (!opts.stack && !opts.nest) {
        willDrawStack = Math.random() > 0.5;
        willDrawNest = !willDrawStack;
    }

    var willFillMask = Math.random() > 0.5;

    // rendering styles
    var fancy = opts.fancy;
    var fillStyle = opts.fillStyle;
    var drawShadows = opts.drawShadows;

    // Fancy directive: forces fillStyle and drawShadows options
    // Default behavior is to randomly choose fancy
    if (fancy === null || fancy === undefined) {
        fancy = Math.random() > 0.5;
    }

    if (fancy) {
        drawShadows = true;
        fillStyle = 'gradient';
    }

    // Set up color fill style
    // map of color function generators
    var colorFuncs = {
        'gradient': _utils.getGradientFunction,
        'solid': _utils.getSolidColorFunction
        // if no valid fill style is passed, assign one randomly
    };if (!['gradient', 'solid'].includes(fillStyle)) {
        fillStyle = Math.random() > 0.5 ? 'gradient' : 'solid';
    }
    // generate the fill function based on the palette
    opts.getColor = colorFuncs[fillStyle](opts.palette);

    // BEGIN RENDERING
    // ======================================

    // draw background/sky
    var sky = Math.round((0, _utils.randomInRange)(104, 245)).toString(16);
    ctx.fillStyle = '#' + sky + sky + sky;
    ctx.fillRect(0, 0, w, h);

    // shuffle shape list and pick a shape
    shapes.sort(function (a, b) {
        return (0, _utils.randomInRange)(-1, 1);
    });
    var shape = shapes[0];
    renderer = renderMap[shape];

    // do it again for nestRenderer
    shapes.sort(function (a, b) {
        return (0, _utils.randomInRange)(-1, 1);
    });
    var nestShape = shapes[0];
    var nestRenderer = renderMap[nestShape];

    // pick centerpoint for shape
    var maskX = w / 2;
    var maskY = h * (0, _utils.randomInRange)(0.45, 0.55);
    var maskSize = Math.min(w, h) * (0, _utils.randomInRange)(0.33, 0.45);

    // pick angle for stacks
    // only do it if skew option is truthy,
    // and then only some of the time
    var tilt = 0;
    if (opts.skew && Math.random() > 0.25) {
        tilt = (0, _utils.randomInRange)(0, Math.PI * 2);
    }

    // pick depth of stack
    var stackSize = Math.round((0, _utils.randomInRange)(1, 4));
    var heightA = h * (0, _utils.randomInRange)(0.4, 0.6);
    var heightB = heightA * (0, _utils.randomInRange)(0.95, 1.05);
    // define stacks
    var stackA = (0, _stacks.createStack)(heightA, h, stackSize);
    var stackB = (0, _stacks.createStack)(heightB, h, stackSize);

    // pick nest count, and define nests
    var nestCount = Math.round((0, _utils.randomInRange)(1, 3));
    var nests = [];
    for (var i = 0; i < nestCount; i++) {
        nests.push((0, _nests.defineNest)((0, _nests.generateNestDef)(w, h, scale)));
    }

    // now draw background according to style directives
    // --------------------------------------

    if (willDrawStack) {
        // rotate the canvas before drawing stacks
        (0, _utils.rotateCanvas)(ctx, w, h, tilt);

        // Draw stacks with gray
        (0, _stacks.drawStack)(ctx, stackA, -w / 4, w, null);
        (0, _stacks.drawStack)(ctx, stackB, w / 2, w, null);

        // un-rotate to draw main shape
        (0, _utils.resetTransform)(ctx);
    }

    if (willDrawNest) {
        // draw Nest
        nests.forEach(function (n) {
            (0, _nests.drawNest)(ctx, n, nestRenderer, colorFuncs[fillStyle](grays), {});
        });
    }

    // Draw main shape + mask
    // --------------------------------------

    if (drawShadows) {
        addShadow(ctx, w, h);
    }

    var maskFill = '#ffffff';
    if (willFillMask) {
        maskFill = colorFuncs[fillStyle](['#ffffff'].concat(opts.palette))(ctx, w, h);
    }

    if (opts.multiMask) {
        ctx.beginPath();
        getRandomRenderer()(ctx, w / 4, h / 4, scale * (0, _utils.randomInRange)(0.2, 0.25), { fill: maskFill, continue: true });
        (0, _utils.resetTransform)(ctx);
        getRandomRenderer()(ctx, w / 4 * 3, h / 4, scale * (0, _utils.randomInRange)(0.2, 0.25), { fill: maskFill, continue: true });
        (0, _utils.resetTransform)(ctx);
        getRandomRenderer()(ctx, w / 4, h / 4 * 3, scale * (0, _utils.randomInRange)(0.2, 0.25), { fill: maskFill, continue: true });
        (0, _utils.resetTransform)(ctx);
        getRandomRenderer()(ctx, w / 4 * 3, h / 4 * 3, scale * (0, _utils.randomInRange)(0.2, 0.25), { fill: maskFill, continue: true });
        (0, _utils.resetTransform)(ctx);
        ctx.closePath();
    } else {
        renderer(ctx, maskX, maskY, maskSize, { fill: maskFill });
    }

    // clear shadow
    removeShadow(ctx);

    // clip mask
    ctx.save();
    ctx.clip();

    // Draw color stacks or nests inside the mask

    if (willDrawStack) {
        // rotate the canvas before drawing stacks
        (0, _utils.rotateCanvas)(ctx, w, h, tilt);
        // draw color stacks in mask
        (0, _stacks.drawStack)(ctx, stackA, -w / 4, w, opts.getColor);
        (0, _stacks.drawStack)(ctx, stackB, w / 2, w, opts.getColor);

        // draw vertical pin in solid shapes
        if (['box', 'ring'].indexOf(shape) === -1) {
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
        nests.forEach(function (n) {
            (0, _nests.drawNest)(ctx, n, nestRenderer, opts.getColor, {});
        });

        // Draw connecting lines.
        // With a single nest, connect nest center to mask center.
        // With multiple nests, connect last nest to previous nest
        var c1 = { x: 0, y: 0 };
        var c2 = { x: 0, y: 0 };
        if (nests.length === 1) {
            c1 = { x: maskX, y: maskY };
            c2 = nests[0][0];
        } else {
            c1 = nests[nests.length - 2][0];
            c2 = nests[nests.length - 1][0];
        }

        // define the line
        var m = (c2.y - c1.y) / (c2.x - c1.x);
        var theta = Math.atan(m);
        if (c2.x > c1.x) {
            theta += Math.PI;
        }
        // extend it. This oughtta be enough.
        var R = w + h;

        ctx.beginPath();
        ctx.moveTo(c2.x, c2.y);
        ctx.lineTo(c2.x + R * Math.cos(theta), c2.y + R * Math.sin(theta));
        ctx.closePath();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.33)';
        ctx.stroke();
    }

    // unclip
    ctx.restore();

    // reset transform
    (0, _utils.resetTransform)(ctx);

    // add a border if it's an open shape or nest
    if (!drawShadows && (willDrawNest || ['box', 'ring'].indexOf(shape) >= 0)) {
        ctx.globalCompositeOperation = 'multiply';
        renderer(ctx, w / 2, maskY, maskSize, { fill: 'transparent', stroke: '#808080' });
        ctx.globalCompositeOperation = 'normal';
    }

    // Add effect elements
    // ...

    // add noise
    if (opts.addNoise) {
        if (opts.noiseInput) {
            _noiseutils2.default.applyNoiseCanvas(el, opts.noiseInput);
        } else {
            _noiseutils2.default.addNoiseFromPattern(el, opts.addNoise, w / 3);
        }
    }

    // END RENDERING

    // if new canvas child was created, append it
    if (newEl) {
        container.appendChild(el);
    }
}

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createStack = createStack;
exports.drawStack = drawStack;

var _utils = __webpack_require__(0);

function createStack(start, end) {
    var steps = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2;

    var step = (end - start) / steps;
    var stack = [];
    var y = start;
    var block = void 0;
    while (steps) {
        block = [y, y + step * (0, _utils.randomInRange)(0.25, 1)];
        y = block[1];
        stack.push(block);
        steps--;
    }
    stack.push([y, end * 1.5]); // tack on an end block to bleed off canvas
    return stack;
}

// stacks look like [[y1, y2], [y1, y2] ...]
// colorFunc is optional; if null it draws increasingly dark gray bands
function drawStack(ctx, stack, x, w, colorFunc) {
    var gray = void 0;
    stack.forEach(function (y, i) {
        if (!colorFunc) {
            gray = (0, _utils.randomInRange)(0.55, 0.85);
            ctx.fillStyle = 'rgba(0, 0, 0,' + (i + 1) * gray / stack.length + ')';
        } else {
            ctx.fillStyle = colorFunc(ctx, w, y[1] - y[0]);
        }

        ctx.beginPath();
        ctx.rect(x, y[0], x + w, y[1] - y[0]);
        ctx.closePath();

        ctx.fill();
    });
}

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.generateNestDef = generateNestDef;
exports.defineNest = defineNest;
exports.drawNest = drawNest;

var _utils = __webpack_require__(0);

function generateNestDef(w, h, scale) {
    return {
        x: (0, _utils.randomInRange)(w * 0.1, w * 0.9),
        y: (0, _utils.randomInRange)(h * 0.1, h * 0.9),
        maxSize: scale * (0, _utils.randomInRange)(0.6, 1.7),
        minSize: scale * (0, _utils.randomInRange)(0.1, 0.6),
        steps: Math.floor((0, _utils.randomInRange)(3, 7)),
        angle: (0, _utils.randomInRange)(0, Math.PI / 4)
    };
}

var nestDefaults = {
    x: 0,
    y: 0,
    minSize: 200,
    maxSize: 400,
    steps: 4,
    jitter: 0.1,
    angle: 0
};

function defineNest(o) {
    o = Object.assign(nestDefaults, o);
    var stepSize = (o.maxSize - o.minSize) / o.steps;
    var i = o.steps;
    var j = 1;
    var nest = [];
    var step = void 0; // the actual step size in px

    while (i--) {
        step = stepSize * (1 + (0, _utils.randomInRange)(-o.jitter, +o.jitter));
        nest.push({
            x: o.x,
            y: o.y,
            size: (o.maxSize - j * step) / 2,
            angle: o.angle
        });
        j++;
    }
    return nest;
}

var nestRenderDefaults = {
    palette: ['#000', '#333', '#666', '#999'],
    alpha: 1,
    blendMode: 'normal'
};

function drawNest(ctx, nest, shapeFunction, colorFunction, o) {
    o = Object.assign(nestRenderDefaults, o);
    (0, _utils.resetTransform)(ctx);
    var ctxBlend = ctx.globalCompositeOperation;
    var ctxAlpha = ctx.globalAlpha;

    ctx.globalCompositeOperation = o.blendMode;
    ctx.globalAlpha = o.alpha;

    nest.forEach(function (n) {
        shapeFunction(ctx, n.x, n.y, n.size, {
            fill: colorFunction(ctx, n.size, n.size),
            angle: n.angle
        });
    });

    ctx.globalCompositeOperation = ctxBlend;
    ctx.globalAlpha = ctxAlpha;

    (0, _utils.resetTransform)(ctx);
}

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.shapescape = shapescape;

var _noiseutils = __webpack_require__(1);

var _noiseutils2 = _interopRequireDefault(_noiseutils);

var _palettes = __webpack_require__(2);

var _palettes2 = _interopRequireDefault(_palettes);

var _utils = __webpack_require__(0);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Get a fill, either in solid or gradients
 * @param  {context} ctx  the canvas rendering context
 * @param {array} palette an array of color values
 * @param  {num} x    center x of shape
 * @param  {num} y    center y of shape
 * @param  {num} size half the size of the shape (r for circle)
 * @return {fillStyle}      a solid color or canvas gradient
 */
function getFill(ctx, palette, x, y, size, skew) {
    if (Math.random() > 0.9) {
        // solid
        return (0, _utils.randItem)(palette);
    } else {
        // gradient
        // pick xoffset as fraction of size to get a shallow angle
        var xoff = (0, _utils.randomInRange)(-skew / 2, skew / 2) * size;
        // build gradient, add stops
        var grad = ctx.createLinearGradient(x - xoff, y - size, x + xoff, y + size);
        grad.addColorStop(0, (0, _utils.randItem)(palette));
        grad.addColorStop(1, (0, _utils.randItem)(palette));
        return grad;
    }
}

function drawCircle(ctx, x, y, r, fill, stroke, alpha) {
    alpha = alpha === undefined ? 1 : alpha;
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arc(x, y, r, 0, 2 * Math.PI, false);
    ctx.fill();
    stroke && ctx.stroke();
    ctx.closePath();
}

function addCircle(ctx, w, h, opts) {
    var x = w / 2;
    var y = h * (0, _utils.randomInRange)(0.4, 0.6);
    var r = Math.min(w, h) * (0, _utils.randomInRange)(0.2, 0.4);
    drawCircle(ctx, x, y, r, getFill(ctx, opts.palette, x, y, r, opts.skew));
    return ctx;
}

function addTriangle(ctx, w, h, opts) {
    var d = Math.min(w, h) * (0, _utils.randomInRange)(0.5, 0.85);
    var cx = w / 2;
    var cy = (0, _utils.randomInRange)(h / 3, 2 * h / 3);
    var leg = Math.cos(30 * Math.PI / 180) * (d / 2);
    ctx.fillStyle = getFill(ctx, opts.palette, cx, cy, leg, opts.skew);
    ctx.beginPath();
    ctx.moveTo(cx, cy - leg);
    ctx.lineTo(cx + d / 2, cy + leg);
    ctx.lineTo(cx - d / 2, cy + leg);
    ctx.closePath();
    ctx.fill();
    return ctx;
}

function addSquare(ctx, w, h, opts) {
    var d = Math.min(w, h) * 0.5;
    var x = w / 2 - d / 2;
    var y = (0, _utils.randomInRange)(h / 3, 2 * h / 3) - d / 2;
    ctx.fillStyle = getFill(ctx, opts.palette, x, y + d / 2, d / 2, opts.skew);
    ctx.fillRect(x, y, d, d);
    return ctx;
}

// Tile the container
function shapescape(options) {
    var defaults = {
        container: 'body',
        palette: _palettes2.default.candywafer,
        drawShadows: true,
        addNoise: 0.04,
        noiseInput: null,
        skew: 1, // normalized skew
        clear: true
    };
    var opts = {};
    opts = Object.assign(Object.assign(opts, defaults), options);

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
        el.width = w;
        el.height = h;
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
        circle: addCircle,
        triangle: addTriangle,
        square: addSquare
    };
    var shapes = Object.keys(renderMap);

    // BEGIN RENDERING

    if (opts.drawShadows) {
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 3 * Math.min(w, h) / 400;
        ctx.shadowBlur = 10 * Math.min(w, h) / 400;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    }

    // add one or two bg blocks
    ctx.fillStyle = getFill(ctx, opts.palette, 0, 0, h, opts.skew);
    ctx.fillRect(0, 0, w, h);
    if (Math.random() > 0.25) {
        var hr = (0, _utils.randomInRange)(3, 12) * w;
        var hy = hr + (0, _utils.randomInRange)(0.3, 0.85) * h;
        drawCircle(ctx, w / 2, hy, hr, getFill(ctx, opts.palette, w / 2, hy, hr, opts.skew));
    }

    // draw two shape layers in some order:
    // shuffle shape list
    shapes.sort(function (a, b) {
        return (0, _utils.randomInRange)(-1, 1);
    });

    // pop a renderer name, get render func and execute X 2
    renderMap[shapes.pop()](ctx, w, h, opts);
    renderMap[shapes.pop()](ctx, w, h, opts);

    // Add effect elements
    // ...

    // add noise
    if (opts.addNoise) {
        if (opts.noiseInput) {
            _noiseutils2.default.applyNoiseCanvas(el, opts.noiseInput);
        } else {
            _noiseutils2.default.addNoiseFromPattern(el, opts.addNoise, w / 3);
        }
    }

    // END RENDERING

    // if new canvas child was created, append it
    if (newEl) {
        container.appendChild(el);
    }
}

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.lines = lines;
exports.drawLines = drawLines;

var _noiseutils = __webpack_require__(1);

var _noiseutils2 = _interopRequireDefault(_noiseutils);

var _palettes = __webpack_require__(2);

var _palettes2 = _interopRequireDefault(_palettes);

var _utils = __webpack_require__(0);

var _shapes = __webpack_require__(3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BGLIST = ['white', 'white', 'white', 'solid', 'gradient'];
var OVERLAYLIST = ['shape', 'area', 'blend', 'auto'];

var DEFAULTS = {
    container: 'body',
    palette: _palettes2.default.south_beach,
    bg: 'auto', // one of BGLIST or 'auto'
    overlay: null, // one of OVERLAYLIST or 'auto'
    drawShadows: false,
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true

    // util: random renderers
};var renderMap = {
    circle: _shapes.drawCircle,
    //ring: drawRing,
    triangle: _shapes.drawTriangle,
    square: _shapes.drawSquare,
    //box: drawBox,
    rect: _shapes.drawRect,
    pentagon: _shapes.drawPentagon,
    hexagon: _shapes.drawHexagon
};
var shapes = Object.keys(renderMap);
var getRandomRenderer = function getRandomRenderer() {
    return renderMap[(0, _utils.randItem)(shapes)];
};

// standard renderer, takes options
function lines(options) {
    var opts = Object.assign(DEFAULTS, options);

    var container = opts.container;
    var cw = container.offsetWidth;
    var ch = container.offsetHeight;

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

    // bg styles
    var BG = void 0;
    if (opts.bg === 'auto') {
        BG = (0, _utils.randItem)([].concat(BGLIST));
        //console.log('auto bg, picked', BG);
    } else {
        BG = opts.bg;
    }

    // rendering styles
    var drawShapeMask = Math.random() >= 0.3333; // should we draw a shape-masked line set?

    var blendStyle = 'none'; // ['none', 'fg', 'bg']
    var blendSeed = Math.random(); // should blend overlay apply to fg, bg, or neither?

    // we set drawShapeMask and blendStyle now so we can apply the corresponding
    // overlay options when doing multi-section rendering below.
    if (drawShapeMask) {
        if (blendSeed >= 0.75) {
            blendStyle = 'fg';
        } else if (blendSeed >= 0.25) {
            blendStyle = 'bg';
        }
    }

    if (blendStyle === 'bg') {
        Object.assign(opts, { overlay: 'blend' });
    }

    var drawOpts = Object.assign({}, opts, { bg: BG });

    // divide the canvas into multiple sections?
    var splitPoint = void 0;
    var splitSeed = Math.random();
    if (splitSeed > 0.5 && !drawShapeMask) {
        // left right
        splitPoint = [(0, _utils.randomInRange)(cw * 1 / 4, cw * 3 / 4), 0];

        drawLines(ctx, [0, 0], [splitPoint[0], ch], drawOpts);
        drawLines(ctx, [splitPoint[0], 0], [cw, ch], drawOpts);
    } else {
        // single
        drawLines(ctx, [0, 0], [cw, ch], drawOpts);
    }

    // draw shapemask, if specified above
    if (drawShapeMask) {
        if (blendStyle === 'fg') {
            Object.assign(opts, { overlay: 'blend' });
        } else {
            Object.assign(opts, { overlay: 'none' });
        }

        var maskScale = Math.min(cw, ch) * (0, _utils.randomInRange)(0.25, 0.6);
        // Get and use random shape for masking. No fill required.
        getRandomRenderer()(ctx, cw * (0, _utils.randomInRange)(0.2, 0.8), ch * (0, _utils.randomInRange)(0.2, 0.8), maskScale, { angle: (0, _utils.randomInRange)(0, Math.PI) });
        ctx.save();
        ctx.clip();
        drawLines(ctx, [0, 0], [cw, ch], drawOpts);
        ctx.restore();
        (0, _utils.resetTransform)(ctx);
    }

    // add noise
    if (opts.addNoise) {
        if (opts.noiseInput) {
            _noiseutils2.default.applyNoiseCanvas(el, opts.noiseInput);
        } else {
            _noiseutils2.default.addNoiseFromPattern(el, opts.addNoise, w / 3);
        }
    }

    // if new canvas child was created, append it
    if (newEl) {
        container.appendChild(el);
    }
}

// Renderer:
// In context @ctx draw artwork in the rectangle between @p1 and @p2
// with passed options @opts
function drawLines(ctx, p1, p2, opts) {
    var w = p2[0] - p1[0];
    var h = p2[1] - p1[1];
    var scale = Math.min(w, h); // reference size, regardless of aspect ratio
    var aspect = w / h;

    // translate to the origin point
    ctx.translate(p1[0], p1[1]);

    // mark it, dude
    ctx.save();

    // clip within the region
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    ctx.clip();
    p1 = p1.map(function (v) {
        return v.toFixed(1);
    });
    p2 = p2.map(function (v) {
        return v.toFixed(1);
    });

    // optional clear
    if (opts.clear) {
        ctx.clearRect(0, 0, w, h);
    }

    switch (opts.bg) {
        case 'solid':
            ctx.fillStyle = (0, _utils.randItem)(opts.palette);
            break;
        case 'gradient':
            ctx.fillStyle = (0, _utils.getGradientFunction)(opts.palette)(ctx, w, h);
            break;
        case 'white':
            ctx.fillStyle = 'white';
            break;
        default:
            // set passed value of bg and hope it's a color!
            ctx.fillStyle = opts.bg;

    }
    ctx.fillRect(0, 0, w, h);

    // Pick a render style, which determines some of the values for
    // the primitive params
    // --------------------------------------

    var minStops = void 0;
    var maxStops = void 0;
    var renderStyle = '';

    if (Math.random() > 0.5) {
        renderStyle = 'wave';
    } else {
        renderStyle = 'jagged';
    }

    // debug!
    //renderStyle = 'jagged';
    //renderStyle = 'wave';

    switch (renderStyle) {
        case 'wave':
            minStops = 50;
            maxStops = 200;
            ctx.lineJoin = 'round';
            break;
        case 'jagged':
            minStops = 2;
            maxStops = 30;
            ctx.lineJoin = 'miter';
            break;
    }

    // Set up basic params
    // --------------------------------------

    var stops = Math.ceil((0, _utils.randomInRange)(minStops, maxStops) * aspect);
    var lines = Math.floor((0, _utils.randomInRange)(10, 40) / aspect);

    var stopInterval = w / (stops - 1);
    var lineInterval = h / lines;

    // move endpoints out of frame
    ctx.translate(-stopInterval / 2, -lineInterval / 2);

    //console.log(`${lines} lines @${lineInterval.toFixed(1)}px  X  ${stops} stops @${stopInterval.toFixed(1)}px`)


    var pts = [];
    // create array of zeroes
    for (var i = 0; i <= stops; i++) {
        pts.push([i * stopInterval, 0]);
    }
    var pt = void 0;

    // Assign a line transform function
    // --------------------------------------

    var widthSeed = Math.random();
    var widthFunc = void 0;
    var widthStyle = ''; // ['CONSTANT','INCREASING','DECREASING']
    var minWidth = void 0;
    var maxWidth = void 0;
    var widthStep = void 0;

    if (widthSeed >= 0.66) {
        widthStyle = 'CONSTANT';
    } else if (widthSeed >= 0.33) {
        widthStyle = 'INCREASING';
    } else {
        widthStyle = 'DECREASING';
    }

    switch (widthStyle) {
        case 'CONSTANT':
            var widthScale = (0, _utils.randomInRange)(0.4, 0.5);
            widthFunc = function widthFunc(l) {
                return lineInterval * widthScale;
            };
            break;
        case 'INCREASING':
            maxWidth = lineInterval * (0, _utils.randomInRange)(0.6, 1.1);
            minWidth = 1 + lineInterval * (0, _utils.randomInRange)(0, 0.15);
            widthStep = (maxWidth - minWidth) / (lines - 1);
            widthFunc = function widthFunc(l) {
                return minWidth + l * widthStep;
            };
            break;
        case 'DECREASING':
            maxWidth = lineInterval * (0, _utils.randomInRange)(0.6, 1.1);
            minWidth = 1 + lineInterval * (0, _utils.randomInRange)(0, 0.15);
            widthStep = (maxWidth - minWidth) / (lines - 1);
            widthFunc = function widthFunc(l) {
                return maxWidth - l * widthStep;
            };
            break;
    }

    // Assign a points transform function -- these functions deviate
    // from straight lines.
    // --------------------------------------

    // component pt transform func
    // left/right drift of the line points. Easy to collide, so keep small.
    // Drift looks better with more lines and stops to reveal
    // the resulting patterns, so scale gently with those counts.
    var _xScale = 0.9 * lines / 1000 + 1.3 * stops / 1000;
    var xDrift = function xDrift(x, line, stop) {
        if (stop === 0 || stop === stops) {
            // do not drift the endpoints
            return x;
        }
        return x + stopInterval * (0, _utils.randomInRange)(-_xScale, _xScale);
    };

    // component pt transform func
    // Vertical drift of the line points
    // Baseline value plus some adjustment for line/stop density
    var _yScale = (0, _utils.randomInRange)(0.08, 0.12) + (0, _utils.randomInRange)(17, 23) / (lines * stops);
    var yDrift = function yDrift(y, line, stop) {
        return y + lineInterval * (0, _utils.randomInRange)(-_yScale, _yScale);
    };

    // component pt transform func
    // Waves with drifting phase, to make nice ripples
    var TWOPI = Math.PI * 2;
    var waveCount = (0, _utils.randomInRange)(0.5, 2.5) * aspect;
    var wavePhase = (0, _utils.randomInRange)(lines / 10, lines / 1);
    var yWave = function yWave(y, line, stop) {
        var factor = 0.2 * lineInterval * // scale the wave
        Math.sin(stop / stops * TWOPI * waveCount + // number of waves
        line / wavePhase * TWOPI // move phase with each line
        );
        return y + factor;
    };

    // sample pt transform func
    // Combines lateral and vertical drift functions.
    var drift = function drift(pt, line, stop) {
        return [xDrift(pt[0], line, stop), yDrift(pt[1], line, stop)];
    };

    // sample sin wave transform
    var wave = function wave(pt, line, stop) {
        return [pt[0], yWave(pt[1], line, stop)];
    };

    var styleTransformMap = {
        'wave': wave,
        'jagged': drift

        // assign pt transform func
    };var ptTransform = styleTransformMap[renderStyle];

    // Color transform
    // --------------------------------------
    // ...

    // Draw the lines!
    // --------------------------------------
    // Step through the lines, modifying the pts array as you go.

    // For blend overlays, we need black lines so we can apply true palette
    // colors using screen.
    if (opts.overlay === 'blend') {
        ctx.strokeStyle = 'black';
    } else {
        ctx.strokeStyle = (0, _utils.randItem)(opts.palette);
    }

    for (var l = 0; l <= lines; l++) {
        ctx.lineWidth = widthFunc(l);
        ctx.translate(0, lineInterval);
        ctx.moveTo(0, 0);
        ctx.beginPath();
        for (var s = 0; s <= stops; s++) {
            pts[s] = ptTransform(pts[s], l, s);

            ctx.lineTo(pts[s][0], pts[s][1]);
        }
        ctx.stroke();
    }

    // Add effect elements
    // ...

    // Overlay a shape or area, according to opts.overlay
    // Prepare ctx and render tools:
    (0, _utils.resetTransform)(ctx);
    ctx.translate(p1[0], p1[1]);

    // switch on overlay option…
    if (opts.overlay === 'auto') {
        // if auto overlay, pick one
        opts.overlay = (0, _utils.randItem)([null].concat(OVERLAYLIST));
    }
    switch (opts.overlay) {
        case 'shape':
            ctx.globalCompositeOperation = 'color';
            var renderer = getRandomRenderer();
            renderer(ctx, w / 2, h / 2, scale * (0, _utils.randomInRange)(0.3, 0.45), { fill: (0, _utils.randItem)(opts.palette) });
            break;
        case 'area':
            ctx.globalCompositeOperation = 'color';
            ctx.fillStyle = (0, _utils.randItem)(opts.palette);
            ctx.fillRect(0, 0, w * (0, _utils.randomInRange)(0.25, 0.75), h);
            break;
        case 'blend':
            ctx.globalCompositeOperation = 'screen';
            ctx.fillStyle = (0, _utils.getGradientFunction)(opts.palette)(ctx, w, h);
            ctx.fillRect(0, 0, w, h);
            break;
    }
    // …clean up blending and finish.
    ctx.globalCompositeOperation = 'normal';

    // END RENDERING

    // unclip and remove translation
    ctx.restore();
    (0, _utils.resetTransform)(ctx);
}

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.waves = waves;

var _utils = __webpack_require__(0);

var _shapes = __webpack_require__(3);

var DEFAULTS = {
    container: 'body',
    palette: ['#d7d7d7', '#979797', '#cabd9d', '#e4ca49', '#89bed3', '#11758e'],
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true
};

var WAVEPATH_DEFAULTS = {
    fill: '#000',
    stroke: '#fff',
    jitter: 0.25
};

function jitter(val, amount) {
    if (amount === 0) return val;
    return (0, _utils.randomInRange)(val - val * amount, val + val * amount);
}

// x, y, width, height, (wave)length, amplitude, …
function wavepath(ctx, x, y, w, h, count, amp, options) {
    var opts = Object.assign({}, WAVEPATH_DEFAULTS, options);
    var wl = w / count;
    var x1 = void 0,
        y1 = void 0,
        x2 = void 0,
        y2 = void 0,
        x3 = void 0,
        y3 = void 0;

    //console.log(`${count} waves | ${wl} length`);

    ctx.fillStyle = opts.fill;
    ctx.strokeStyle = opts.stroke;
    ctx.beginPath();
    ctx.moveTo(x, y);

    y1 = y3 = y;
    y2 = y + amp;

    for (var i = 0; i < count; i++) {
        x1 = x + wl * i;
        x2 = x1 + wl / 2;
        x3 = x2 + wl / 2;

        y1 = y3;
        y2 = y + jitter(amp, opts.jitter); // jitter the midpoint based on amp
        y3 = y + jitter(amp * opts.jitter, opts.jitter); // jitter endpoint less

        ctx.bezierCurveTo(x1 + wl / 5, y1, x2 - wl / 5, y2, x2, y2);
        ctx.bezierCurveTo(x2 + wl / 5, y2, x3 - wl / 5, y3, x3, y3);
    }

    ctx.lineTo(x + wl * count, y + h);
    ctx.lineTo(x, y + h);

    ctx.closePath();
    opts.fill && ctx.fill();
    ctx.stroke();
}

function waveband(ctx, x, y, w, h, count, amp, depth, options) {
    var opts = Object.assign({}, options);
    var _lineWidth = ctx.lineWidth;
    ctx.lineWidth *= (0, _utils.randomInRange)(1.5, 2); // start thicc
    for (var i = 0; i < depth; i++) {
        wavepath(ctx, x, y + i * amp / depth, w, h, count, amp, opts);
        opts.fill = null; // after the first pass, remove the fill, so lines overlap
        ctx.lineWidth = _lineWidth; // reset linewidth
    }
}

var WAVELET_DEFAULTS = {
    width: 200,
    rise: 60,
    dip: 30,
    skew: 0.5
};

function wavelet(ctx, x, y, options) {
    var _Object$assign = Object.assign({}, WAVELET_DEFAULTS, options),
        width = _Object$assign.width,
        rise = _Object$assign.rise,
        dip = _Object$assign.dip,
        skew = _Object$assign.skew;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x + width * skew * .333, y - rise / 2, x + width * skew * .666, y - rise / 2, x + width * skew, y - rise);
    ctx.bezierCurveTo(x + width * skew * (1 + 0.333), y - rise / 2, x + width * skew * (1 + 0.666), y - rise / 2, x + width, y);
    ctx.bezierCurveTo(x + width * skew * (1 + 0.666), y + dip * .5, x + width * skew * (1 + 0.333), y + dip * .75, x + width * skew, y + dip);
    ctx.bezierCurveTo(x + width * skew * .666, y + dip * .75, x + width * skew * .333, y + dip * .5, x, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

var WAVES_DEFAULTS = {
    wl: 100,
    wh: 50,
    dense: 0.4,
    skew: 0.5
};

function waveset(ctx, x, y, width, height, opts) {
    opts = Object.assign({}, WAVES_DEFAULTS, opts);
    opts.dense = Math.max(opts.dense, 0.1);
    var cols = Math.ceil(width / (opts.wl * opts.dense));
    var rows = Math.ceil(height / (opts.wh * opts.dense));
    console.log(rows + ' rows, ' + cols + ' cols');
    for (var row = 0; row < rows; row++) {
        for (var col = 0; col < cols + 1 * (row % 2); col++) {
            wavelet(ctx, x + opts.wl * col - opts.wl / 2 * (row % 2), y + opts.wh * row * opts.dense, {
                width: opts.wl,
                rise: opts.wh * 0.666,
                dip: opts.wh * 0.333,
                skew: opts.skew
            });
        }
    }
}

function waves(options) {
    var opts = Object.assign({}, DEFAULTS, options);

    var container = opts.container;
    var cw = container.offsetWidth;
    var ch = container.offsetHeight;

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

    ctx.strokeStyle = "black";
    ctx.fillStyle = "#" + Math.random().toString(16).slice(2, 8);

    // setup
    var getSolidFill = (0, _utils.getSolidColorFunction)(opts.palette);

    //wavecurve(ctx, 200, 200, 100, 100, {depth: 5});

    //wavelet(ctx, 200, 400, 100, 100, {depth: 5, sign: 1})

    //waveset(ctx, 0, 0, 800, 800, {wl: 120, wh: 60, dense: 0.35, skew: 0.65});

    //waveband(ctx, 0, 100, cw, 60, 4, 50, 5, {fill: getSolidFill(opts.palette)});
    //waveband(ctx, 0, 150, cw, 60, 3, 50, 5, {fill: getSolidFill(opts.palette)});


    function simpleCover() {
        var y = 0;
        var x = 0;
        var h_shift = 0;
        var amp = void 0;
        var h = void 0;
        var count = void 0;
        var steps = (0, _utils.randomInRange)(10, 40);
        var interval = ch / steps;

        var baseCount = (0, _utils.randomInRange)(20, 50); // low or high number of peaks

        ctx.lineWidth = 0.5 + interval / 50;

        var strokeColor = Math.random() > 0.5 ? 'white' : 'black';

        y = -interval; // start above the top

        for (var i = 0; i < steps; i++) {
            amp = interval;
            h = amp * 3;

            // variation in wave count based on amplitude
            count = baseCount * (0, _utils.randomInRange)(3, 5) / amp;

            // horizontal offsets for natural appearance
            h_shift = (0, _utils.randomInRange)(0, 0.1);
            x = -h_shift * cw;

            // ctx, x, y, w, h, wavecount, amp, stackdepth, opts
            waveband(ctx, x, y, cw * (1 + h_shift), h, count, amp, 5, {
                fill: getSolidFill(opts.palette),
                stroke: strokeColor,
                jitter: 0.2
            });

            // step down
            y += amp;
        }
    }

    function nearFar() {
        var y = 0;
        var x = 0;
        var h_shift = 0;
        var amp = void 0;
        var h = void 0;
        var count = void 0;
        var steps = 14;
        var interval = ch / steps;

        for (var i = 0; i < steps; i++) {
            count = Math.max((0, _utils.randomInRange)(steps - 2 - i, steps + 2 - i), 0.5);
            amp = 10 + 75 / count;
            y += amp;
            h = amp * 3;

            // horizontal offsets for natural appearance
            h_shift = (0, _utils.randomInRange)(0, 0.1);
            x = -h_shift * cw;

            // make near lines thicker
            ctx.lineWidth = 0.5 + amp / 50;

            // ctx, x, y, w, h, wavecount, amp, stackdepth, opts
            waveband(ctx, x, y, cw * (1 + h_shift), h, count, amp, 5, { fill: getSolidFill(opts.palette) });
        }
    }

    simpleCover();
    //nearFar();


    // if new canvas child was created, append it
    if (newEl) {
        container.appendChild(el);
    }
}

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.grid = grid;

var _noiseutils = __webpack_require__(1);

var _noiseutils2 = _interopRequireDefault(_noiseutils);

var _palettes = __webpack_require__(2);

var _palettes2 = _interopRequireDefault(_palettes);

var _utils = __webpack_require__(0);

var _shapes = __webpack_require__(3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULTS = {
    container: 'body',
    palette: _palettes2.default.south_beach,
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true
};

var PI = Math.PI;

// Main function
function grid(options) {
    var opts = Object.assign({}, DEFAULTS, options);

    var container = opts.container;
    var cw = container.offsetWidth;
    var ch = container.offsetHeight;
    var SCALE = Math.min(cw, ch);

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

    var ctx = el.getContext('2d');

    // available renderers
    var renderMap = {
        //circle: drawCircle,
        //ring: drawRing,
        triangle: _shapes.drawTriangle,
        square: _shapes.drawSquare,
        box: _shapes.drawBox,
        rect: _shapes.drawRect,
        pentagon: _shapes.drawPentagon,
        hexagon: _shapes.drawHexagon
    };
    var shapes = Object.keys(renderMap);
    var getRandomRenderer = function getRandomRenderer() {
        return renderMap[(0, _utils.randItem)(shapes)];
    };

    // util to draw a square and clip following rendering inside
    function clipSquare(ctx, w, h, color) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, w, h);
        ctx.fillStyle = color;
        ctx.closePath();
        ctx.fill();
        ctx.clip();
    }

    // color funcs
    var randomFill = function randomFill() {
        return "#" + Math.random().toString(16).slice(2, 8);
    };
    var getSolidFill = (0, _utils.getSolidColorFunction)(opts.palette);

    // define grid
    var count = Math.round((0, _utils.randomInRange)(4, 9));
    var w = Math.ceil(cw / count);
    var h = w;
    var vcount = Math.ceil(ch / h);

    // setup vars for each cell
    var x = 0;
    var y = 0;
    var xnorm = 0;
    var ynorm = 0;
    var renderer = void 0;

    // play with these random seeds
    var a = void 0,
        b = void 0,
        c = void 0;
    a = Math.random();
    b = Math.random();
    c = Math.random();

    // shared colors
    var fg = getSolidFill();
    var bg = getSolidFill();

    // get palette of non-bg colors
    var contrastPalette = [].concat(opts.palette);
    contrastPalette.splice(opts.palette.indexOf(bg), 1);
    var getContrastColor = (0, _utils.getSolidColorFunction)(contrastPalette);

    // mode
    function maskAndRotate() {
        renderer = getRandomRenderer();
        var colorFunc = void 0;
        // pick a color mode: random, or just fg
        if (Math.random() < 0.33) {
            colorFunc = getContrastColor;
        } else {
            colorFunc = function colorFunc() {
                return fg;
            };
        }
        for (var i = 0; i < vcount; i++) {
            // pick renderers by row here
            // renderer = getRandomRenderer();
            for (var j = 0; j < count; j++) {
                // convenience vars
                x = w * j;
                y = h * i;
                xnorm = x / cw;
                ynorm = y / ch;

                // shift and clip
                ctx.translate(x, y);
                clipSquare(ctx, w, h, bg);

                // draw
                renderer(ctx, w * a + xnorm * (1 - a), // start at a, march across
                h * b + ynorm * (1 - b), // start at b, march down
                w / (c + 1.5), // scale at c
                {
                    fill: colorFunc(),
                    angle: xnorm - a - (ynorm - b) // rotate with position
                });

                // unshift, unclip
                ctx.restore();
                (0, _utils.resetTransform)(ctx);
            }
        }
    }

    // mode
    function layers() {
        var layerCount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 7;


        function drawLayer() {
            var px = void 0,
                py = void 0;
            var s = void 0;

            for (var i = 0; i < vcount; i++) {
                for (var j = 0; j < count; j++) {
                    // convenience vars
                    x = w * j;
                    y = h * i;
                    xnorm = x / cw;
                    ynorm = y / ch;

                    // shift and clip
                    ctx.translate(x, y);
                    clipSquare(ctx, w, h, 'white');

                    // size jitter
                    s = (0, _utils.randomInRange)(0.15, 0.45) * w;
                    // offset a bit, based on available size
                    px = (0, _utils.randomInRange)(-1, 1) * 0.2 * (1 - s);
                    py = (0, _utils.randomInRange)(-1, 1) * 0.2 * (1 - s);

                    // shift to center for rotation
                    ctx.translate(w / 2, h / 2);

                    // draw
                    (0, _shapes.drawSquare)(ctx, px, py, s, {
                        fill: getSolidFill(),
                        angle: (0, _utils.randomInRange)(-1, 1) * 0.1
                    });

                    // unshift, unclip
                    ctx.restore();
                    (0, _utils.resetTransform)(ctx);
                }
            }
        }

        ctx.globalAlpha = Math.pow(0.9, layerCount);
        ctx.globalCompositeOperation = 'multiply';

        while (layerCount--) {
            drawLayer();
        }

        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'normal';
    }

    // gather our modes
    var modes = [maskAndRotate, layers];

    // do the loop with one of our modes
    (0, _utils.randItem)(modes)();

    // add noise
    if (opts.addNoise) {
        if (opts.noiseInput) {
            // apply noise from supplied canvas
            _noiseutils2.default.applyNoiseCanvas(el, opts.noiseInput);
        } else {
            // create noise pattern and apply
            _noiseutils2.default.addNoiseFromPattern(el, opts.addNoise, w / 3);
        }
    }

    // if new canvas child was created, append it
    if (newEl) {
        container.appendChild(el);
    }
}

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.truchet = truchet;

var _noiseutils = __webpack_require__(1);

var _noiseutils2 = _interopRequireDefault(_noiseutils);

var _palettes = __webpack_require__(2);

var _palettes2 = _interopRequireDefault(_palettes);

var _utils = __webpack_require__(0);

var _shapes = __webpack_require__(3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var DEFAULTS = {
    container: 'body',
    palette: _palettes2.default.south_beach,
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true,

    mode: null,
    count: 0, // 0 for auto, or an integer
    weight: 0, // 0 for auto, or 1-10 for normalized weights
    contrast: true
};

var PI = Math.PI;

// Main function
function truchet(options) {
    var opts = Object.assign({}, DEFAULTS, options);

    var container = opts.container;
    var cw = container.offsetWidth;
    var ch = container.offsetHeight;
    var SCALE = Math.min(cw, ch);

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

    var ctx = el.getContext('2d');

    // util to draw a square and clip following rendering inside
    function clipSquare(ctx, w, h, color) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, w, h);
        ctx.fillStyle = color;
        ctx.closePath();
        ctx.fill();
        ctx.clip();
    }

    // color funcs
    var randomFill = function randomFill() {
        return "#" + Math.random().toString(16).slice(2, 8);
    };
    var getSolidFill = (0, _utils.getSolidColorFunction)(opts.palette);

    // define grid
    var count = Math.round(opts.count) || Math.round((0, _utils.randomInRange)(4, 9));
    var w = Math.ceil(cw / count);
    var h = w;
    var vcount = Math.ceil(ch / h);

    // setup vars for each cell
    var x = 0;
    var y = 0;
    var xnorm = 0;
    var ynorm = 0;
    var renderer = void 0;

    var secondLayer = Math.random() < 0.5;

    // play with these random seeds
    var a = void 0,
        b = void 0,
        c = void 0;
    a = Math.random();
    b = Math.random();
    c = Math.random();

    // shared colors
    var fg = void 0; // hold on…
    var bg = getSolidFill(); // pick bg

    // get palette of non-bg colors
    var contrastPalette = [].concat(opts.palette);
    contrastPalette.splice(opts.palette.indexOf(bg), 1);
    var getContrastColor = (0, _utils.getSolidColorFunction)(contrastPalette);
    fg = getContrastColor(); // …now set fg in contrast to bg

    // mode settings
    // line weight
    var weight = void 0;
    if (opts.weight) {
        weight = w / 30 * opts.weight;
    } else {
        weight = w / 30 * (0, _utils.randomInRange)(1, 10);
    }

    // component utils

    // draw a triangle at anchor corner
    function _triangle(anchor, fill) {
        var corners = [[0, 0], [w, 0], [w, h], [0, h]];
        var drawCorners = [];
        fill = fill || getSolidFill();
        if (anchor === undefined) anchor = Math.round((0, _utils.randomInRange)(0, 3));
        drawCorners = [].concat(corners);
        drawCorners.splice(anchor, 1);

        // draw a triangle with the remaining 3 points
        ctx.beginPath();
        ctx.moveTo.apply(ctx, _toConsumableArray(drawCorners[0]));
        ctx.lineTo.apply(ctx, _toConsumableArray(drawCorners[1]));
        ctx.lineTo.apply(ctx, _toConsumableArray(drawCorners[2]));
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
    }

    // draw a circle at anchor corner
    function _circle(anchor, fill) {
        var corners = [[0, 0], [w, 0], [w, h], [0, h]];
        var drawCorners = [];
        fill = fill || getSolidFill();
        if (anchor === undefined) anchor = Math.round((0, _utils.randomInRange)(0, 3));

        (0, _shapes.drawCircle)(ctx, corners[anchor][0], corners[anchor][1], w, {
            fill: fill
        });
    }

    // fill cell
    // first arg is for parity with _triangle and _circle
    function _square(_, fill) {
        fill = fill || getSolidFill();
        ctx.rect(0, 0, w, h);
        ctx.fillStyle = fill;
        ctx.closePath();
        ctx.fill();
    }

    // draw an arc around anchor corner
    function _arc(anchor, color) {
        var corners = [[0, 0], [w, 0], [w, h], [0, h]];
        if (anchor === undefined) anchor = Math.round((0, _utils.randomInRange)(0, 3));

        (0, _shapes.drawCircle)(ctx, corners[anchor][0], corners[anchor][1], w / 2, {
            stroke: color
        });
    }

    // draw arc terminals for anchor corner
    function _terminal(size, anchor, color) {
        var corners = [[w / 2, 0], [w, h / 2], [w / 2, h], [0, h / 2]];
        if (anchor === undefined) anchor = Math.round((0, _utils.randomInRange)(0, 3));
        var a = anchor % corners.length;
        var b = (anchor + 3) % corners.length;

        (0, _shapes.drawCircle)(ctx, corners[a][0], corners[a][1], size, {
            fill: color
        });
        (0, _shapes.drawCircle)(ctx, corners[b][0], corners[b][1], size, {
            fill: color
        });
    }

    // mode
    function circles(background) {
        background = background || bg;
        var px = void 0,
            py = void 0;
        for (var i = 0; i < vcount; i++) {
            for (var j = 0; j < count; j++) {
                // convenience vars
                x = w * j;
                y = h * i;
                xnorm = x / cw;
                ynorm = y / ch;

                // shift and clip
                ctx.translate(x, y);
                clipSquare(ctx, w, h, background);

                _circle();

                // unshift, unclip
                ctx.restore();
                (0, _utils.resetTransform)(ctx);
            }
        }
    }

    // mode
    function triangles(background) {
        background = background || bg;
        for (var i = 0; i < vcount; i++) {
            for (var j = 0; j < count; j++) {
                // convenience vars
                x = w * j;
                y = h * i;
                xnorm = x / cw;
                ynorm = y / ch;

                // shift and clip
                ctx.translate(x, y);
                clipSquare(ctx, w, h, background);

                _triangle();

                // unshift, unclip
                ctx.restore();
                (0, _utils.resetTransform)(ctx);
            }
        }
    }

    // mode
    function mixed(background) {
        background = background || bg;
        var px = void 0,
            py = void 0,
            seed = void 0;
        var styles = [function () {
            renderer = _shapes.drawCircle;
            px = 0;
            py = 0;
        }];

        for (var i = 0; i < vcount; i++) {
            for (var j = 0; j < count; j++) {
                // convenience vars
                x = w * j;
                y = h * i;
                xnorm = x / cw;
                ynorm = y / ch;

                // shift and clip
                ctx.translate(x, y);
                clipSquare(ctx, w, h, background);

                switch (Math.round((0, _utils.randomInRange)(1, 12))) {
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
                (0, _utils.resetTransform)(ctx);
            }
        }
    }

    //mode
    function arcs(background, weight) {
        background = background || bg;
        ctx.lineWidth = weight;
        for (var i = 0; i < vcount; i++) {
            for (var j = 0; j < count; j++) {
                // convenience vars
                x = w * j;
                y = h * i;
                xnorm = x / cw;
                ynorm = y / ch;

                // shift and clip
                ctx.translate(x, y);
                clipSquare(ctx, w, h, background);

                if (Math.random() < 0.5) {
                    _arc(0, fg);
                    _arc(2, fg);
                } else {
                    _arc(1, fg);
                    _arc(3, fg);
                }

                // unshift, unclip
                ctx.restore();
                (0, _utils.resetTransform)(ctx);
            }
        }
    }

    // mode
    function arcs2(background, weight) {
        background = background || bg;
        ctx.lineWidth = weight;

        for (var i = 0; i < vcount; i++) {
            for (var j = 0; j < count; j++) {
                // convenience vars
                x = w * j;
                y = h * i;
                xnorm = x / cw;
                ynorm = y / ch;

                // shift and clip
                ctx.translate(x, y);
                clipSquare(ctx, w, h, background);

                switch (Math.round((0, _utils.randomInRange)(1, 9))) {
                    case 1:
                    case 2:
                        _arc(0, fg);
                        _arc(2, fg);
                        break;
                    case 3:
                    case 4:
                        _arc(1, fg);
                        _arc(3, fg);
                        break;
                    case 5:
                        _arc(0, fg);
                        _terminal(weight / 2, 2, fg);
                        break;
                    case 6:
                        _arc(1, fg);
                        _terminal(weight / 2, 3, fg);
                        break;
                    case 7:
                        _arc(2, fg);
                        _terminal(weight / 2, 0, fg);
                        break;
                    case 8:
                        _arc(3, fg);
                        _terminal(weight / 2, 1, fg);
                        break;
                    case 9:
                        _terminal(weight / 2, 0, fg);
                        _terminal(weight / 2, 2, fg);
                        break;
                }

                // unshift, unclip
                ctx.restore();
                (0, _utils.resetTransform)(ctx);
            }
        }
    }

    // gather our modes
    var modes = [circles, triangles, mixed, arcs, arcs2];

    // do the loop with one of our modes
    renderer = (0, _utils.randItem)(modes);
    renderer(bg, weight);

    if (secondLayer) {
        fg = getContrastColor();
        ctx.globalAlpha = 0.8;
        renderer('transparent', opts.contrast ? weight / 2 : weight);
        ctx.globalAlpha = 1;
    }

    // add noise
    if (opts.addNoise) {
        if (opts.noiseInput) {
            // apply noise from supplied canvas
            _noiseutils2.default.applyNoiseCanvas(el, opts.noiseInput);
        } else {
            // create noise pattern and apply
            _noiseutils2.default.addNoiseFromPattern(el, opts.addNoise, w / 3);
        }
    }

    // if new canvas child was created, append it
    if (newEl) {
        container.appendChild(el);
    }
}

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.circles = circles;

var _noiseutils = __webpack_require__(1);

var _noiseutils2 = _interopRequireDefault(_noiseutils);

var _palettes = __webpack_require__(2);

var _palettes2 = _interopRequireDefault(_palettes);

var _utils = __webpack_require__(0);

var _shapes = __webpack_require__(3);

var _colors = __webpack_require__(4);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var DEFAULTS = {
    container: 'body',
    palette: _palettes2.default.de_stijl,
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true
};

var PI = Math.PI;

// Main function
function circles(options) {
    var opts = Object.assign({}, DEFAULTS, options);

    var container = opts.container;
    var cw = container.offsetWidth;
    var ch = container.offsetHeight;
    var SCALE = Math.min(cw, ch);

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

    var ctx = el.getContext('2d');

    // available renderers
    var renderMap = {
        //circle: drawCircle,
        //ring: drawRing,
        triangle: _shapes.drawTriangle,
        square: _shapes.drawSquare,
        box: _shapes.drawBox,
        rect: _shapes.drawRect,
        pentagon: _shapes.drawPentagon,
        hexagon: _shapes.drawHexagon
    };
    var shapes = Object.keys(renderMap);
    var getRandomRenderer = function getRandomRenderer() {
        return renderMap[(0, _utils.randItem)(shapes)];
    };

    // util to draw a square and clip following rendering inside
    function clipSquare(ctx, w, h, color) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, w, h);
        ctx.fillStyle = color;
        ctx.closePath();
        ctx.fill();
        ctx.clip();
    }

    // color funcs
    var randomFill = function randomFill() {
        return "#" + Math.random().toString(16).slice(2, 8);
    };
    var getSolidFill = (0, _utils.getSolidColorFunction)(opts.palette);

    // define grid
    var count = Math.round((0, _utils.randomInRange)(4, 9));
    var w = Math.ceil(cw / count);
    var h = w;
    var vcount = Math.ceil(ch / h);

    // setup vars for each cell
    var x = 0;
    var y = 0;
    var xnorm = 0;
    var ynorm = 0;
    var renderer = void 0;

    // play with these random seeds
    var a = void 0,
        b = void 0,
        c = void 0;
    a = Math.random();
    b = Math.random();
    c = Math.random();

    // shared colors
    var bg = getSolidFill();

    // get palette of non-bg colors
    var contrastPalette = [].concat(opts.palette);
    contrastPalette.splice(opts.palette.indexOf(bg), 1);
    var getContrastColor = (0, _utils.getSolidColorFunction)(contrastPalette);
    var fg = getContrastColor();

    // mode
    function snakes() {
        ctx.lineCap = 'round';
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, cw, ch);

        var px = void 0,
            py = void 0;

        var weight = (0, _utils.randomInRange)(1, w / 10);
        var lightweight = Math.max(1, weight / 3);

        var c1 = getContrastColor();
        var c2 = getContrastColor();
        var dotColor = c1;

        var dotGradient = (0, _utils.getGradientFunction)([c1, c2, bg])(ctx, cw / 2, ch / 2);

        var set1 = [];
        var set2 = [];

        function loop(color) {
            var ringdefs = [];
            var start = void 0;
            var segments = void 0;
            var r = void 0;
            // hit each cell
            for (var i = 0; i < vcount; i++) {
                for (var j = 0; j < count; j++) {
                    // convenience vars
                    x = w * j;
                    y = h * i;
                    px = x + w / 2;
                    py = y + h / 2;
                    xnorm = px / cw;
                    ynorm = py / ch;

                    start = Math.round((0, _utils.randomInRange)(0, 4));
                    segments = Math.round((0, _utils.randomInRange)(1, 2));
                    r = w / 2 * Math.round((0, _utils.randomInRange)(1, 1));

                    ctx.strokeStyle = color;
                    ctx.lineWidth = weight;

                    dotColor = color;
                    if (Math.random() < 0.75) {
                        // draw circles for many
                        ringdefs.push([px, py, r, PI / 2 * start, PI / 2 * (start + segments), false]);
                    } else if (Math.random() < 0.25) {
                        // draw line
                        ctx.beginPath();
                        if (Math.random() < 0.5) {
                            ctx.moveTo(px, y);
                            ctx.lineTo(px + w, y);
                        } else {
                            ctx.moveTo(x, py);
                            ctx.lineTo(x, py + h);
                        }
                        ctx.stroke();
                    } else {
                        dotColor = fg;
                    }

                    if (Math.random() < 0.125) {
                        (0, _shapes.drawCircle)(ctx, px, py, w / 2 * (0, _utils.randItem)([0.25, 0.5, 1]) - weight / 2 + 0.5, { fill: dotGradient });
                    }

                    // unshift, unclip
                    //ctx.restore();
                    (0, _utils.resetTransform)(ctx);
                }
            }
            return ringdefs;
        }

        set1 = loop(c1);
        set2 = loop(c2);

        // draw rings
        ctx.strokeStyle = c1;
        ctx.lineWidth = weight;
        set1.forEach(function (def) {
            ctx.beginPath();
            ctx.arc.apply(ctx, _toConsumableArray(def));
            ctx.stroke();
        });

        ctx.strokeStyle = c2;
        ctx.lineWidth = weight;
        set2.forEach(function (def) {
            ctx.beginPath();
            ctx.arc.apply(ctx, _toConsumableArray(def));
            ctx.stroke();
        });
    }

    function triPoints(ctx, p1, p2, p3, color) {
        ctx.beginPath;
        ctx.moveTo.apply(ctx, _toConsumableArray(p1));
        ctx.lineTo.apply(ctx, _toConsumableArray(p2));
        ctx.lineTo.apply(ctx, _toConsumableArray(p3));
        ctx.closePath();
        ctx.strokeStyle = color;
        ctx.stroke();
    }

    function rings() {
        ctx.lineCap = 'round';
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, cw, ch);

        var px = void 0,
            py = void 0;

        var weight = (0, _utils.randomInRange)(1, w / 10);
        var lightweight = Math.max(0.5, weight / 3);

        console.log(count + ' by ' + vcount + ' cells');

        var c1 = getContrastColor();
        var c2 = getContrastColor();
        var dotColor = c1;

        var ringdefs = [];
        var centers = [];
        var r = void 0;

        var threshold = 0.5 - .25 * (count / 10);
        console.log('count:', count, 'threshold:', threshold);

        // hit each cell
        for (var i = 0; i < vcount; i++) {
            for (var j = 0; j < count; j++) {
                // convenience vars
                x = w * j;
                y = h * i;
                px = x + w / 2;
                py = y + h / 2;
                xnorm = px / cw;
                ynorm = py / ch;

                var start = Math.round((0, _utils.randomInRange)(0, 4));
                var segments = Math.round((0, _utils.randomInRange)(1, 3));
                r = w / 2 * Math.round((0, _utils.randomInRange)(1, 3));

                ctx.strokeStyle = fg;
                ctx.lineWidth = lightweight;

                if (Math.random() < threshold) {
                    centers.push([px, py]);
                    ringdefs.push([px, py, r, PI / 2 * start, PI / 2 * (start + segments), false]);
                    dotColor = fg;

                    var _a = (0, _utils.randomInRange)(PI / 2 * start, PI / 2 * (start + segments));
                    ctx.beginPath();
                    ctx.moveTo(px, py);
                    ctx.lineTo(px + r * Math.cos(_a), py + r * Math.sin(_a));
                    ctx.stroke();
                } else {
                    dotColor = c1;
                    (0, _shapes.drawCircle)(ctx, px, py, lightweight, { fill: dotColor });
                }

                // unshift, unclip
                //ctx.restore();
                (0, _utils.resetTransform)(ctx);
            }
        }

        // draw connecting lines between dots
        var centers_copy = [].concat(centers);
        ctx.strokeStyle = c1;
        ctx.lineWidth = Math.max(lightweight / 2, 0.5);
        while (centers_copy.length >= 2) {
            ctx.beginPath();
            ctx.moveTo.apply(ctx, _toConsumableArray(centers_copy.pop()));
            ctx.lineTo.apply(ctx, _toConsumableArray(centers_copy.shift()));
            ctx.stroke();
        }

        // draw dots
        centers.forEach(function (c) {
            (0, _shapes.drawCircle)(ctx, c[0], c[1], lightweight, { fill: fg });
        });

        // draw rings
        ctx.strokeStyle = fg;
        ctx.lineWidth = weight;
        ringdefs.forEach(function (def) {
            ctx.beginPath();
            ctx.arc.apply(ctx, _toConsumableArray(def));
            ctx.stroke();
        });
    }

    // mode
    function pattern() {
        var c1 = (0, _utils.randomInRange)(0.125, 0.5);
        var c2 = (0, _utils.randomInRange)(.5, 1);

        var dotScale = (0, _utils.randomInRange)(0.1, 0.5);
        var dotMin = (0, _utils.randomInRange)(0, 0.5 - dotScale);
        var dotFill = getContrastColor();
        var dotSign = Math.random() < 0.5;

        var xref = Math.random();
        var yref = Math.random();
        if (Math.random() < 0.5) {
            xref = yref = 0.5;
        }

        var crossDots = true; //Math.random() < 0.5;
        var crossFill = Math.random() < 0.5 ? fg : bg;
        var crossScale = (0, _utils.randomInRange)(0.25, .3);

        var cr = void 0;

        var crossPattern = function crossPattern(r) {
            (0, _shapes.drawCircle)(ctx, w * r, h / 2, w * r, { fill: null, stroke: fg });
            (0, _shapes.drawCircle)(ctx, -w * (r - 1), h / 2, w * r, { fill: null, stroke: fg });

            (0, _shapes.drawCircle)(ctx, w / 2, h * r, w * r, { fill: null, stroke: fg });
            (0, _shapes.drawCircle)(ctx, w / 2, -h * (r - 1), h * r, { fill: null, stroke: fg });
        };

        ctx.lineWidth = (0, _utils.randomInRange)(1, w / 30);

        for (var i = 0; i < vcount; i++) {
            for (var j = 0; j < count; j++) {
                // convenience vars
                x = w * j;
                y = h * i;
                xnorm = (x + w / 2) / cw;
                ynorm = (y + h / 2) / ch;

                // shift and clip
                ctx.translate(x, y);
                clipSquare(ctx, w, h, bg);

                (0, _shapes.drawCircle)(ctx, 0, 0, w / 2, { fill: null, stroke: fg });
                (0, _shapes.drawCircle)(ctx, w, 0, w / 2, { fill: null, stroke: fg });
                (0, _shapes.drawCircle)(ctx, w, h, w / 2, { fill: null, stroke: fg });
                (0, _shapes.drawCircle)(ctx, 0, h, w / 2, { fill: null, stroke: fg });

                crossPattern(c1);
                crossPattern(c2);

                if (crossDots && i % 2 === j % 2) {
                    //drawCircle(ctx, w/2, h/2, crossScale, {fill: crossFill, stroke: fg});
                }

                cr = Math.sqrt(Math.pow(xnorm - xref, 2) + Math.pow(ynorm - yref, 2)) / .7071;
                if (dotSign) {
                    cr = 1 - cr;
                }
                cr = Math.abs(cr);

                (0, _shapes.drawCircle)(ctx, w / 2, h / 2, dotMin + dotScale * w * cr, { fill: dotFill, stroke: fg });

                (0, _shapes.drawCircle)(ctx, w / 2, h / 2, dotMin + dotScale * w * cr + ctx.lineWidth * 2, { fill: null, stroke: fg });

                // unshift, unclip
                ctx.restore();
                (0, _utils.resetTransform)(ctx);
            }
        }
    }

    // gather our modes
    var modes = [snakes, rings, pattern];

    // do the loop with one of our modes
    (0, _utils.randItem)(modes)();

    // add noise
    if (opts.addNoise) {
        if (opts.noiseInput) {
            _noiseutils2.default.applyNoiseCanvas(el, opts.noiseInput);
        } else {
            _noiseutils2.default.addNoiseFromPattern(el, opts.addNoise, w / 3);
        }
    }

    // if new canvas child was created, append it
    if (newEl) {
        container.appendChild(el);
    }
}

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.mesh = mesh;

var _noiseutils = __webpack_require__(1);

var _noiseutils2 = _interopRequireDefault(_noiseutils);

var _palettes = __webpack_require__(2);

var _palettes2 = _interopRequireDefault(_palettes);

var _utils = __webpack_require__(0);

var _shapes = __webpack_require__(3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULTS = {
    container: 'body',
    palette: _palettes2.default.de_stijl,
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true
};

function mesh(options) {
    var opts = Object.assign({}, DEFAULTS, options);

    var container = opts.container;
    var cw = container.offsetWidth;
    var ch = container.offsetHeight;
    var SCALE = Math.min(cw, ch);

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

    var ctx = el.getContext('2d');

    // DRAW --------------------------------------

    // define grid
    var count = Math.round((0, _utils.randomInRange)(3, 30));
    var w = cw / count;
    var h = w;
    var vcount = Math.ceil(ch / h);

    // setup vars for each cell
    var x = 0;
    var y = 0;
    var xnorm = 0;
    var ynorm = 0;
    var renderer = void 0;

    // play with these random seeds
    var a = void 0,
        b = void 0,
        c = void 0;
    a = Math.random();
    b = Math.random();
    c = Math.random();

    var getSolidFill = (0, _utils.getSolidColorFunction)(opts.palette);

    // shared colors
    var fg = void 0; // hold on…
    var bg = getSolidFill(); // pick a bg

    // get palette of non-bg colors
    var contrastPalette = (0, _utils.shuffle)([].concat(opts.palette));
    contrastPalette.splice(contrastPalette.indexOf(bg), 1);
    var getContrastColor = (0, _utils.getSolidColorFunction)(contrastPalette);

    fg = getContrastColor(); // fg is another color


    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = (0, _utils.randomInRange)(1, 4) * SCALE / 800;

    ctx.strokeStyle = fg;

    var R = (0, _utils.randomInRange)(2, 5) * SCALE / 800; // dot radius
    var r = R; // radius per node
    var dotFill = (0, _utils.randItem)([fg, fg, 'transparent']);
    // probability thresholds to draw connections
    var drawUp = 0.25;
    var drawLeft = 0.25;
    var drawDL = 0.25;
    var drawDR = 0.25;
    var drawRing = 0.05;
    var isConnected = 0;

    var rTransform = (0, _utils.randItem)([function () {
        return R;
    }, // no scaling
    function () {
        // scale sin curve heavy center
        return 0.5 + (R * Math.sin(xnorm * Math.PI) + R * Math.sin(ynorm * Math.PI)) / 2;
    }, function () {
        // scale away from center linearly
        return 1 + R / 2 * pr;
    }]);

    var pr = void 0; // radius from center

    // choose a connection mode, which determines frequency
    // of the connection types
    var connectionMode = (0, _utils.randItem)([function () {}, // normal/uniform
    function () {}, // normal/uniform
    function () {}, // normal/uniform
    function () {
        // sweep up: bias diagonals on the left/right edge.
        // bias verticals toward the middle
        drawUp = 0.5 * Math.sin(xnorm * Math.PI);
        drawLeft = 0.05;
        drawDL = 0.75 * xnorm;
        drawDR = 0.75 * (1 - xnorm);
    }, function () {
        // sidways and diagonals
        drawUp = drawDR = 0;
        drawLeft = 0.3;
        drawDL = 0.2;
        drawRing = 0.1;
    }, function () {
        // vert and other diagonal
        drawLeft = drawDL = 0;
        drawUp = 0.3;
        drawDR = 0.2;
        drawRing = 0.2;
    }]);

    // Pick the item from @palette by converting the normalized @factor
    // to its nearest index
    var mapToPalette = function mapToPalette(palette, factor) {
        factor = factor % 1; // loop
        return palette[Math.round(factor * (palette.length - 1))];
    };
    var loopPalette = function loopPalette(palette, index) {
        return palette[index % palette.length];
    };

    // reference point is center by default
    var refPoint = [0.5, 0.5];
    if (Math.random() < 0.5) {
        // unless we randomize the refernce point!
        refPoint = [Math.random(), Math.random()];
    }

    // choose stroke color scheme
    var multiColorStrokes = Math.random() < 0.25;

    // work through the points
    for (var i = 0; i < vcount; i++) {
        for (var j = 0; j < count; j++) {
            // convenience vars
            x = w * j + w / 2;
            y = h * i + h / 2;
            xnorm = x / cw;
            ynorm = y / ch;

            isConnected = 0;

            // get distance to reference point
            pr = Math.sqrt(Math.pow(xnorm - refPoint[0], 2) + Math.pow(ynorm - refPoint[1], 2));

            // set dot radius, and draw it
            r = rTransform();
            (0, _shapes.drawCircle)(ctx, x, y, r, { fill: dotFill });

            // adjust connection weights, chosen above
            connectionMode();

            // start drawing connections
            ctx.globalCompositeOperation = 'destination-over';
            ctx.beginPath();
            if (i > 0 && Math.random() < drawUp) {
                if (multiColorStrokes) {
                    ctx.strokeStyle = loopPalette(contrastPalette, 0);
                }
                ctx.moveTo(x, y);
                ctx.lineTo(x, y - h);
                isConnected++;
            }
            if (j > 0 && Math.random() < drawLeft) {
                if (multiColorStrokes) {
                    ctx.strokeStyle = loopPalette(contrastPalette, 1);
                }
                ctx.moveTo(x, y);
                ctx.lineTo(x - w, y);
                isConnected++;
            }
            if (i > 0 && j < count - 1 && Math.random() < drawDL) {
                if (multiColorStrokes) {
                    ctx.strokeStyle = loopPalette(contrastPalette, 2);
                }
                ctx.moveTo(x, y);
                ctx.lineTo(x + w, y - h);
                isConnected++;
            }
            if (i > 0 && j > 0 && Math.random() < drawDR) {
                if (multiColorStrokes) {
                    ctx.strokeStyle = loopPalette(contrastPalette, 3);
                }
                ctx.moveTo(x, y);
                ctx.lineTo(x - w, y - h);
                isConnected++;
            }
            ctx.stroke();
            ctx.closePath();
            ctx.globalCompositeOperation = 'normal';

            // occasionally add rings
            if (isConnected && Math.random() < drawRing) {
                ctx.lineWidth = ctx.lineWidth / 2;
                (0, _shapes.drawCircle)(ctx, x, y, w / 3, { fill: null, stroke: fg });
                ctx.lineWidth = ctx.lineWidth * 2;
                ctx.strokeStyle = fg;
            }
        }
    }

    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);
    ctx.globalCompositeOperation = 'normal';

    // END DRAW --------------------------------------

    // add noise
    if (opts.addNoise) {
        if (opts.noiseInput) {
            _noiseutils2.default.applyNoiseCanvas(el, opts.noiseInput);
        } else {
            _noiseutils2.default.addNoiseFromPattern(el, opts.addNoise, w / 3);
        }
    }

    // if new canvas child was created, append it
    if (newEl) {
        container.appendChild(el);
    }
}

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.walk = walk;

var _noiseutils = __webpack_require__(1);

var _noiseutils2 = _interopRequireDefault(_noiseutils);

var _palettes = __webpack_require__(2);

var _palettes2 = _interopRequireDefault(_palettes);

var _utils = __webpack_require__(0);

var _shapes = __webpack_require__(3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var DEFAULTS = {
    container: 'body',
    palette: _palettes2.default.de_stijl,
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true

    /*
     * Draw survival curves. Pick a bunch of walkers, step along
     * a grid. At each point, choose to go right or down.
     * Save the points according to type (down/right).
     * Decorate the line segments and the grid points.
     * Pick the rightmost and downmost points in each row/column, and
     * decorate those by extending lines to the edges.
     */
};function walk(options) {
    var opts = Object.assign({}, DEFAULTS, options);

    var container = opts.container;
    var cw = container.offsetWidth;
    var ch = container.offsetHeight;
    var SCALE = Math.min(cw, ch);

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

    var ctx = el.getContext('2d');

    // DRAW --------------------------------------

    // define grid
    var count = Math.round((0, _utils.randomInRange)(10, 30));
    var w = cw / count;
    var h = w;
    var vcount = Math.ceil(ch / h);

    // setup vars for each cell
    var x = 0;
    var y = 0;
    var xnorm = 0;
    var ynorm = 0;
    var renderer = void 0;

    // play with these random seeds
    var a = void 0,
        b = void 0,
        c = void 0;
    a = Math.random();
    b = Math.random();
    c = Math.random();

    var getSolidFill = (0, _utils.getSolidColorFunction)(opts.palette);

    // shared colors
    var fg = void 0; // hold on…
    var bg = getSolidFill(); // pick a bg

    // get palette of non-bg colors
    var contrastPalette = (0, _utils.shuffle)([].concat(opts.palette));
    contrastPalette.splice(contrastPalette.indexOf(bg), 1);
    var getContrastColor = (0, _utils.getSolidColorFunction)(contrastPalette);

    fg = getContrastColor(); // fg is another color

    var baseWidth = (0, _utils.randomInRange)(1, 4) * SCALE / 800;

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = baseWidth;
    ctx.strokeStyle = fg;

    var R = (0, _utils.randomInRange)(1, 4) * SCALE / 800; // dot radius
    var r = R; // radius per node
    var dotFill = fg; // randItem([fg, fg, 'transparent']);
    // probability thresholds to draw connections

    var modes = ['descend', 'survival'];
    var MODENAME = (0, _utils.randItem)(modes);

    var drawOverlap = MODENAME !== 'survival';

    var walkers = [];
    var tracks = [];

    var walkerCount = Math.round((0, _utils.randomInRange)(2, 20));
    while (walkerCount--) {
        walkers.push({
            x: MODENAME === 'survival' ? 0 : Math.round((0, _utils.randomInRange)(2, count - 2)),
            y: 0,
            dir: 1 // right or left
        });
    }
    tracks = walkers.map(function (w) {
        return [];
    });

    // threshold to go right vs down
    var goH = 0.5;

    var pr = void 0; // radius from center

    // Pick the item from @palette by converting the normalized @factor
    // to its nearest index
    var mapToPalette = function mapToPalette(palette, factor) {
        factor = factor % 1; // loop
        return palette[Math.round(factor * (palette.length - 1))];
    };

    // reference point is center by default
    var refPoint = [0.5, 0.5];
    if (Math.random() < 0.5) {
        // unless we randomize the refernce point!
        refPoint = [Math.random(), Math.random()];
    }

    // choose stroke color scheme
    var multiColorStrokes = Math.random() < 0.25;

    // arrays to save the places where we chose right or down
    var rightDots = [];
    var downDots = [];
    var leftDots = [];

    // Walking function
    var survival = function survival(walker, i) {
        // For each walker, step till you hit the edges.
        // At each point, choose to go right or down.
        // Save the point into the appropriate dot array after choosing.
        var track = tracks[i];
        while (walker.x < count && walker.y < vcount) {
            if (Math.random() < goH) {
                walker.x += 1;
                rightDots.push([walker.x, walker.y]);
            } else {
                walker.y += 1;
                downDots.push([walker.x, walker.y]);
            }
            track.push([walker.x, walker.y]);
        }
    };

    // Walking function
    var descend = function descend(walker, i) {
        // For each walker, step till you hit the edges.
        // At each point, choose to go right or down.
        // Save the point into the appropriate dot array after choosing.

        var track = tracks[i];
        var start = true; // first step should always go down, so set a flag

        track.push([walker.x, walker.y]);

        while (walker.x < count && walker.y < vcount) {
            if (!start && Math.random() < goH) {
                walker.x += 1 * walker.dir;
                if (walker.dir > 0) {
                    rightDots.push([walker.x, walker.y]);
                } else {
                    leftDots.push([walker.x, walker.y]);
                }
            } else {
                walker.y += 1;
                downDots.push([walker.x, walker.y]);
                walker.dir *= -1;
            }
            start = false;
            track.push([walker.x, walker.y]);
        }
    };

    var rightColor = getContrastColor();
    var leftColor = getContrastColor();
    var downColor = getContrastColor();

    // pick a decoration scheme, each with a right and down decorator function
    var decoration = (0, _utils.randItem)([
    // dots
    {
        rightDeco: function rightDeco(d, i) {
            var _ref = [].concat(_toConsumableArray(d)),
                x = _ref[0],
                y = _ref[1];

            (0, _shapes.drawCircle)(ctx, x * w - w / 2, y * h - h / 2, r, { fill: rightColor });
        },
        leftDeco: function leftDeco(d, i) {
            var _ref2 = [].concat(_toConsumableArray(d)),
                x = _ref2[0],
                y = _ref2[1];

            (0, _shapes.drawCircle)(ctx, x * w + w / 2, y * h - h / 2, r, { fill: leftColor });
        },
        downDeco: function downDeco(d, i) {
            var _ref3 = [].concat(_toConsumableArray(d)),
                x = _ref3[0],
                y = _ref3[1];

            (0, _shapes.drawCircle)(ctx, x * w - w / 2, y * h - h / 2, r, { fill: downColor });
        }
    },
    // squares right, dots down. sized to fit inside each other
    {
        rightDeco: function rightDeco(d, i) {
            var _ref4 = [].concat(_toConsumableArray(d)),
                x = _ref4[0],
                y = _ref4[1];

            (0, _shapes.drawSquare)(ctx, x * w - w / 2, y * h - h / 2, w / 4, { fill: rightColor });
        },
        leftDeco: function leftDeco(d, i) {
            var _ref5 = [].concat(_toConsumableArray(d)),
                x = _ref5[0],
                y = _ref5[1];

            (0, _shapes.drawSquare)(ctx, x * w + w / 2, y * h - h / 2, w / 4, { fill: leftColor });
        },
        downDeco: function downDeco(d, i) {
            var _ref6 = [].concat(_toConsumableArray(d)),
                x = _ref6[0],
                y = _ref6[1];

            (0, _shapes.drawCircle)(ctx, x * w - w / 2, y * h - h / 2, w / 6, { fill: downColor });
        }
    },
    // half-square triangles pointing right or down
    {
        rightDeco: function rightDeco(d, i) {
            var _ref7 = [].concat(_toConsumableArray(d)),
                x = _ref7[0],
                y = _ref7[1];

            ctx.beginPath();
            ctx.moveTo(x * w - w * .25, y * h - h / 2);
            ctx.lineTo(x * w - w * .5, y * h - h * .25 - h / 2);
            ctx.lineTo(x * w - w * .5, y * h + h * .25 - h / 2);
            ctx.closePath();
            ctx.fillStyle = rightColor;
            ctx.fill();
        },
        leftDeco: function leftDeco(d, i) {
            var _ref8 = [].concat(_toConsumableArray(d)),
                x = _ref8[0],
                y = _ref8[1];

            ctx.beginPath();
            ctx.moveTo(x * w + w * .25, y * h - h / 2);
            ctx.lineTo(x * w + w * .5, y * h - h * .25 - h / 2);
            ctx.lineTo(x * w + w * .5, y * h + h * .25 - h / 2);
            ctx.closePath();
            ctx.fillStyle = leftColor;
            ctx.fill();
        },
        downDeco: function downDeco(d, i) {
            var _ref9 = [].concat(_toConsumableArray(d)),
                x = _ref9[0],
                y = _ref9[1];

            ctx.beginPath();
            ctx.moveTo(x * w - w / 2, y * h - h * .25);
            ctx.lineTo(x * w - w * .25 - w / 2, y * h - h * .5);
            ctx.lineTo(x * w + w * .25 - w / 2, y * h - h * .5);
            ctx.closePath();
            ctx.fillStyle = downColor;
            ctx.fill();
        }
    }]);

    // run the walkers to draw the main lines
    var walkFunc = MODENAME === 'survival' ? survival : descend;
    walkers.forEach(walkFunc);

    // util to draw the path of a track
    var drawTrack = function drawTrack(track, width, color) {
        ctx.lineWidth = width;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(track[0][0] * w, track[0][1] * h);
        track.forEach(function (p, i) {
            ctx.lineTo(p[0] * w, p[1] * h);
        });
        ctx.stroke();
    };

    // draw the lines
    tracks.forEach(function (track) {
        drawOverlap && drawTrack(track, baseWidth * 3, bg);
        drawTrack(track, baseWidth, fg);
    });

    // will contain the rightmost and downmost dots in each row and column
    var rightMax = [];
    var leftMax = [];
    var downMax = [];

    // run through the points and assign the rightmost and downmost points
    tracks.forEach(function (t) {
        t.forEach(function (d) {
            var _ref10 = [].concat(_toConsumableArray(d)),
                x = _ref10[0],
                y = _ref10[1];

            if (!rightMax[y] || x > rightMax[y]) {
                rightMax[y] = x;
            }
            if (!leftMax[y] || x < leftMax[y]) {
                leftMax[y] = x;
            }
            if (!downMax[x] || y > downMax[x]) {
                downMax[x] = y;
            }
        });
    });

    // use a narrow line for the grid extensions
    ctx.lineWidth = Math.max(ctx.lineWidth / 2, 0.5);

    var rightLine = function rightLine(d, i) {
        ctx.beginPath();
        ctx.moveTo(d * w + w / 2, i * h + h / 2);
        ctx.lineTo(cw, i * h + h / 2);
        ctx.strokeStyle = rightColor;
        ctx.stroke();
    };

    var leftLine = function leftLine(d, i) {
        ctx.beginPath();
        ctx.moveTo(d * w - w / 2, i * h + h / 2);
        ctx.lineTo(0, i * h + h / 2);
        ctx.strokeStyle = leftColor;
        ctx.stroke();
    };

    var downLine = function downLine(d, i) {
        ctx.beginPath();
        ctx.moveTo(i * w + w / 2, d * h + h / 2);
        ctx.lineTo(i * w + w / 2, ch);
        ctx.strokeStyle = downColor;
        ctx.stroke();
    };

    // draw lines from rightmost and downmost dots to boundaries
    rightMax.forEach(rightLine);

    if (MODENAME === 'descend') {
        leftMax.forEach(leftLine);
    } else if (MODENAME === 'survival') {
        downMax.forEach(downLine);
    }

    // execute the decoration functions on each junction dot
    rightDots.forEach(decoration.rightDeco);
    leftDots.forEach(decoration.leftDeco);
    downDots.forEach(decoration.downDeco);

    // composite in the background
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);
    ctx.globalCompositeOperation = 'normal';

    // END DRAW --------------------------------------

    // add noise
    if (opts.addNoise) {
        if (opts.noiseInput) {
            _noiseutils2.default.applyNoiseCanvas(el, opts.noiseInput);
        } else {
            _noiseutils2.default.addNoiseFromPattern(el, opts.addNoise, w / 3);
        }
    }

    // if new canvas child was created, append it
    if (newEl) {
        container.appendChild(el);
    }
}

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.bands = bands;

var _noiseutils = __webpack_require__(1);

var _noiseutils2 = _interopRequireDefault(_noiseutils);

var _palettes = __webpack_require__(2);

var _palettes2 = _interopRequireDefault(_palettes);

var _utils = __webpack_require__(0);

var _shapes = __webpack_require__(3);

var _colors = __webpack_require__(4);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var DEFAULTS = {
    container: 'body',
    palette: _palettes2.default.fingerspitzen,
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true
};

var PI = Math.PI;

// Main function
function bands(options) {
    var opts = Object.assign({}, DEFAULTS, options);

    var container = opts.container;
    var cw = container.offsetWidth;
    var ch = container.offsetHeight;
    var SCALE = Math.min(cw, ch);

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

    var ctx = el.getContext('2d');

    // util to draw a square and clip following rendering inside
    function clipSquare(ctx, w, h, color) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, w, h);
        ctx.fillStyle = color;
        ctx.closePath();
        ctx.fill();
        ctx.clip();
    }

    // color funcs
    var randomFill = function randomFill() {
        return "#" + Math.random().toString(16).slice(2, 8);
    };
    var getSolidFill = (0, _utils.getSolidColorFunction)(opts.palette);

    // shared colors
    var bg = getSolidFill();

    // get palette of non-bg colors
    var contrastPalette = [].concat(opts.palette);
    contrastPalette.splice(opts.palette.indexOf(bg), 1);
    var getContrastColor = (0, _utils.getSolidColorFunction)(contrastPalette);
    var fg = getContrastColor();

    // draw

    var count = Math.round((0, _utils.randomInRange)(70, 90));
    var baseStep = cw / count;
    var step = 0;

    var _x = 0;
    var jitter = 0.4;

    ctx.strokeStyle = 'black';

    var _h = void 0;
    var _y = void 0;
    var _w = void 0;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, cw, ch);

    // bands
    for (var i = 0; i <= count; i++) {
        step = baseStep * (0, _utils.randomInRange)(1 - jitter, 1 + jitter);
        _x += step;

        // maybe draw a ghosty band in the background
        if (Math.random() < 0.1) {
            ctx.fillStyle = '#e7e7e7';
            ctx.fillRect(_x, 0, step * (0, _utils.randItem)([1, 2, 3, 4]), ch);
        }

        // set width, height, placement of this colored box
        _w = step * (0, _utils.randomInRange)(0.8, 1);
        _h = ch * (0, _utils.randomInRange)(0.2, 0.7);
        _y = (0, _utils.randomInRange)(0, ch);

        // draw the box
        if (Math.random() < 0.66) {
            ctx.beginPath();
            ctx.fillStyle = getSolidFill();
            ctx.fillRect(_x - _w, _y - _h / 2, _w, _h);
        }

        // draw the dividing band
        ctx.lineWidth = (0, _utils.randomInRange)(0.25, 2);
        ctx.beginPath();
        ctx.moveTo(_x, 0);
        ctx.lineTo(_x, ch);
        ctx.stroke();
    }

    // draw cross band

    var m1 = (0, _utils.randomInRange)(-0.2, 0.2); // slope 1
    var m2 = (0, _utils.randomInRange)(-0.2, 0.2); // slope 2

    var p1 = void 0,
        h1 = void 0; // box 1 placement and height
    var p2 = void 0,
        h2 = void 0;

    p1 = ch * (0, _utils.randomInRange)(0.1, 0.3);
    h1 = ch * (0, _utils.randomInRange)(0.175, 0.275);

    p2 = ch * (0, _utils.randomInRange)(0.1, 0.3);
    h2 = ch * (0, _utils.randomInRange)(0.175, 0.275);

    // box 1
    var box1 = [[0, p1], [cw, p1 + m1 * cw], [cw, p1 + h1 + m1 * cw], [0, p1 + h1]];
    var box2 = [[0, p2], [cw, p2 + m2 * cw], [cw, p2 + h2 + m2 * cw], [0, p2 + h2]];

    ctx.save();
    ctx.fillStyle = getContrastColor();
    ctx.beginPath();

    box1.forEach(function (p, i) {
        if (i === 0) ctx.moveTo.apply(ctx, _toConsumableArray(p));else ctx.lineTo.apply(ctx, _toConsumableArray(p));
    });

    box2.forEach(function (p, i) {
        if (i === 0) ctx.moveTo.apply(ctx, _toConsumableArray(p));else ctx.lineTo.apply(ctx, _toConsumableArray(p));
    });

    ctx.closePath();
    ctx.clip();

    // draw color blocks
    var boxCount = (0, _utils.randItem)([3, 4, 5]);
    var boxWidth = cw / boxCount;
    var boxLeft = 0;
    var boxTop = p1;
    //let cut = randomInRange(topRange[1], bottomRange[0]);
    // top set
    for (var i = 0; i < boxCount; i++) {
        ctx.beginPath();
        //ctx.rect(boxLeft, ch * topRange[0], boxLeft + boxWidth, ch * cut);
        ctx.moveTo(boxLeft, boxTop);
        ctx.lineTo(boxLeft + boxWidth, boxTop + m1 * boxWidth);
        ctx.lineTo(boxLeft + boxWidth, h1 + boxTop + m1 * boxWidth);
        ctx.lineTo(boxLeft, boxTop + h1);
        ctx.fillStyle = getContrastColor();
        ctx.fill();
        boxLeft += boxWidth;
        boxTop += boxWidth * m1;
    }
    // bottom set
    boxLeft = 0;
    boxTop = p2;
    for (var i = 0; i < boxCount; i++) {
        ctx.beginPath();
        //ctx.rect(boxLeft, ch * topRange[0], boxLeft + boxWidth, ch * cut);
        ctx.moveTo(boxLeft, boxTop);
        ctx.lineTo(boxLeft + boxWidth, boxTop + m2 * boxWidth);
        ctx.lineTo(boxLeft + boxWidth, h2 + boxTop + m2 * boxWidth);
        ctx.lineTo(boxLeft, boxTop + h2);
        ctx.fillStyle = getContrastColor();
        ctx.fill();
        boxLeft += boxWidth;
        boxTop += boxWidth * m2;
    }

    // unclip
    ctx.restore();

    // box it in
    var borderWidth = SCALE / (0, _utils.randomInRange)(30, 50);
    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.rect(0, 0, cw, ch);
    ctx.stroke();

    // add noise
    if (opts.addNoise) {
        if (opts.noiseInput) {
            _noiseutils2.default.applyNoiseCanvas(el, opts.noiseInput);
        } else {
            _noiseutils2.default.addNoiseFromPattern(el, opts.addNoise, w / 3);
        }
    }

    // if new canvas child was created, append it
    if (newEl) {
        container.appendChild(el);
    }
}

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.field = field;

var _noiseutils = __webpack_require__(1);

var _noiseutils2 = _interopRequireDefault(_noiseutils);

var _palettes = __webpack_require__(2);

var _palettes2 = _interopRequireDefault(_palettes);

var _hexScatter = __webpack_require__(6);

var _hexScatter2 = _interopRequireDefault(_hexScatter);

var _utils = __webpack_require__(0);

var _shapes = __webpack_require__(3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULTS = {
    container: 'body',
    palette: _palettes2.default.de_stijl,
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true,
    lightMode: 'auto', // [auto, bloom, normal]
    gridMode: 'auto', // [auto, normal, scatter, random]
    density: 'auto' // [auto, coarse, fine]
};

var PI = Math.PI;
var LIGHTMODES = ['bloom', 'normal'];
var GRIDMODES = ['normal', 'scatter', 'random'];
var DENSITIES = ['coarse', 'fine'];

// Main function
function field(options) {
    var opts = Object.assign({}, DEFAULTS, options);

    var container = opts.container;
    var cw = container.offsetWidth;
    var ch = container.offsetHeight;
    var SCALE = Math.min(cw, ch);
    var LONG = Math.max(cw, ch);
    var SHORT = Math.min(cw, ch);
    var AREA = cw * ch;

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

    var ctx = el.getContext('2d');

    // modes and styles
    var LIGHTMODE = opts.lightMode === 'auto' ? (0, _utils.randItem)(LIGHTMODES) : opts.lightMode;
    var GRIDMODE = opts.gridMode === 'auto' ? (0, _utils.randItem)(GRIDMODES) : opts.gridMode;
    var DENSITY = opts.density === 'auto' ? (0, _utils.randItem)(DENSITIES) : opts.density;

    // color funcs
    var getSolidFill = (0, _utils.getSolidColorFunction)(opts.palette);

    // how many cells are in the grid?
    var countMin = void 0,
        countMax = void 0;
    if (DENSITY === 'coarse') {
        countMin = 10;
        countMax = 30;
    } else {
        countMin = 60;
        countMax = 100;
    }

    var cellSize = Math.round(SHORT / (0, _utils.randomInRange)(countMin, countMax));
    //console.log(`cellSize: ${cellSize}, ${GRIDMODE}, ${DENSITY}`);

    // setup vars for each cell
    var x = 0;
    var y = 0;
    var xnorm = 0;
    var ynorm = 0;
    var renderer = void 0;

    // shared colors
    var bg = getSolidFill();

    // get palette of non-bg colors
    var contrastPalette = [].concat(opts.palette);
    contrastPalette.splice(opts.palette.indexOf(bg), 1);
    var getContrastColor = (0, _utils.getSolidColorFunction)(contrastPalette);

    // shared foregrounds
    var fg = getContrastColor();
    var fg2 = getContrastColor();

    // in bloom mode, we draw high-contrast grayscale, and layer
    // palette colors on top
    if (LIGHTMODE === 'bloom') {
        bg = '#222222';
        fg = fg2 = '#cccccc';
    }

    // draw background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);

    ctx.strokeStyle = fg;

    var rateMax = 0.5;
    if (DENSITY === 'fine' && Math.random() < 0.5) {
        rateMax = 5;
    }

    // rate is the number of sin waves across the grid
    var xrate = (0, _utils.randomInRange)(0, rateMax);
    var yrate = (0, _utils.randomInRange)(0, rateMax);
    // set phase offset
    var xphase = (0, _utils.randomInRange)(-PI, PI);
    var yphase = (0, _utils.randomInRange)(-PI, PI);

    // tail vars
    var _x = void 0,
        _y = void 0,
        len = void 0;

    // dotScale will be multiplied by 2. Keep below .25 to avoid bleed.
    // Up to 0.5 will lead to full coverage.
    var dotScale = cellSize * (0, _utils.randomInRange)(0.1, 0.25);
    // line width
    var weight = (0, _utils.randomInRange)(0.5, 3) * SCALE / 800;

    ctx.lineWidth = weight;
    ctx.lineCap = 'round';

    // const used in normalizing transforms
    var maxLen = 2 * Math.sqrt(2);

    // It looks nice to extend lines beyond their cells. how much?
    // Scaled against cellSize
    var lineScale = (0, _utils.randomInRange)(0.7, 3);

    // Displace the center point of each cell by this factor
    // Only do this sometimes, and not when scattering
    var warp = 0;
    if (GRIDMODE !== 'scatter' && Math.random() < 0.5) {
        warp = (0, _utils.randomInRange)(0, Math.sqrt(2));
    }

    // set of functions to transform opacity across grid
    var opacityTransforms = [function () {
        return 1;
    }, function (_x, _y) {
        return Math.abs(_y / _x) / maxLen;
    }, function (_x, _y) {
        return 1 - Math.abs(_y / _x) / maxLen;
    }, function (_x, _y) {
        return Math.abs(_x / _y);
    }, // hides verticals
    function (_x, _y) {
        return Math.abs(_y / _x);
    }, // hides horizontals
    function (_x, _y) {
        return _x / _y;
    }, function (_x, _y) {
        return _y / _x;
    }, function (_x, _y) {
        return _y - _x;
    }, function (_x, _y) {
        return _x - _y;
    }];
    // now pick one
    var opacityFunc = (0, _utils.randItem)(opacityTransforms);

    // Create a function which is a periodic transform of x, y
    function createTransform() {
        var rate1 = (0, _utils.randomInRange)(0, rateMax);
        var rate2 = (0, _utils.randomInRange)(0, rateMax);
        var phase1 = (0, _utils.randomInRange)(-PI, PI);
        var phase2 = (0, _utils.randomInRange)(-PI, PI);
        var c1 = (0, _utils.randomInRange)(0, 1);
        var c2 = (0, _utils.randomInRange)(0, 1);
        return function (x, y) {
            var t1 = Math.sin(x * PI * rate1 + phase1);
            var t2 = Math.sin(y * PI * rate2 + phase2);
            return (c1 * t1 + c2 * t2) / (c1 + c2);
        };
    }

    // a set of independent transforms to use while rendering
    var trans = {
        xbase: createTransform(),
        ybase: createTransform(),
        xtail: createTransform(),
        ytail: createTransform(),
        radius: createTransform()
    };

    function randomScatter(size, w, h) {
        var pts = [];
        var xcount = Math.ceil(w / size);
        var ycount = Math.ceil(h / size);
        var count = xcount * ycount;
        while (count--) {
            pts.push([(0, _utils.randomInRange)(0, w), (0, _utils.randomInRange)(0, h)]);
        }
        return pts;
    }

    function placeNormal(size, w, h) {
        var pts = [];
        var xcount = Math.ceil(w / size) + 2;
        var ycount = Math.ceil(h / size) + 2;
        var count = xcount * ycount;
        var x = void 0,
            y = void 0;
        for (var i = 0; i < count; i++) {
            x = size * (i % xcount - 1) + size / 2;
            y = size * (Math.floor(i / ycount) - 1) + size / 2;
            pts.push([x, y]);
        }
        return pts;
    }

    var pts = [];

    switch (GRIDMODE) {
        case 'scatter':
            //pts = hexScatter(Math.round(SCALE/randomInRange(60,120)), cw, ch);
            pts = (0, _hexScatter2.default)(cellSize, cw, ch);
            break;
        case 'random':
            pts = randomScatter(cellSize, cw, ch);
            break;
        default:
            pts = placeNormal(cellSize, cw, ch);
    }

    // step thru points
    pts.forEach(function (p, i) {
        x = p[0];
        y = p[1];
        xnorm = x / cw;
        ynorm = y / ch;

        _x = trans.xtail(xnorm, ynorm);
        _y = trans.ytail(xnorm, ynorm);
        len = Math.sqrt(_x * _x + _y * _y);

        // shift base points to their warped coordinates
        x = x + cellSize * trans.xbase(xnorm, ynorm) * warp;
        y = y + cellSize * trans.ybase(xnorm, ynorm) * warp;

        ctx.globalAlpha = 1;
        (0, _shapes.drawCircle)(ctx, x, y, (trans.radius(xnorm, ynorm) + 1) * dotScale, { fill: fg2 });

        ctx.globalAlpha = opacityFunc(_x, _y);

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + cellSize * _x * lineScale, y + cellSize * _y * lineScale);
        ctx.stroke();
    });

    ctx.globalAlpha = 1;

    // in bloom mode, we draw a big colorful gradient over the grayscale
    // background, using palette colors and nice blend modes
    if (LIGHTMODE === 'bloom') {
        ctx.globalCompositeOperation = 'color-dodge';

        // bloom with linear gradient
        ctx.fillStyle = (0, _utils.getGradientFunction)(opts.palette)(ctx, cw, ch); //getContrastColor();
        ctx.fillRect(0, 0, cw, ch);

        if (Math.random() < 0.5) {
            // bloom with spot lights
            var dodgeDot = function dodgeDot() {
                var max = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1.5;

                var gx = void 0,
                    gy = void 0,
                    gr1 = void 0,
                    gr2 = void 0;
                gx = (0, _utils.randomInRange)(0, cw);
                gy = (0, _utils.randomInRange)(0, ch);
                gr1 = (0, _utils.randomInRange)(0, 0.25);
                gr2 = (0, _utils.randomInRange)(gr1, max);

                var radial = ctx.createRadialGradient(gx, gy, gr1 * SCALE, gx, gy, gr2 * SCALE);
                radial.addColorStop(0, (0, _utils.randItem)(opts.palette));
                radial.addColorStop(1, '#000000');

                ctx.fillStyle = radial;
                ctx.fillRect(0, 0, cw, ch);
            };
            // try layering dots with varying coverage
            ctx.globalAlpha = (0, _utils.randomInRange)(0.4, 0.7);
            dodgeDot(1.5);
            ctx.globalAlpha = (0, _utils.randomInRange)(0.4, 0.7);
            dodgeDot(1.0);
            ctx.globalAlpha = (0, _utils.randomInRange)(0.7, 0.9);
            dodgeDot(0.5);
            ctx.globalAlpha = 1;
        }

        ctx.globalCompositeOperation = 'normal';
    }

    // add noise
    if (opts.addNoise) {
        if (opts.noiseInput) {
            // apply noise from supplied canvas
            _noiseutils2.default.applyNoiseCanvas(el, opts.noiseInput);
        } else {
            // create noise pattern and apply
            _noiseutils2.default.addNoiseFromPattern(el, opts.addNoise, cw / 3);
        }
    }

    // if new canvas child was created, append it
    if (newEl) {
        container.appendChild(el);
    }
}

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.fragments = fragments;

var _noiseutils = __webpack_require__(1);

var _noiseutils2 = _interopRequireDefault(_noiseutils);

var _palettes = __webpack_require__(2);

var _utils = __webpack_require__(0);

var _shapes = __webpack_require__(3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var DEFAULTS = {
    container: 'body',
    palette: _palettes.blush,
    drawGrid: 'auto', // [true, false, 'auto']
    addNoise: false, //0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true
};

function getFragmentsFromGrid() {
    var count = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10;
    var pts = arguments[1];

    var frags = [];
    var p1 = void 0,
        p2 = void 0,
        p3 = void 0;
    while (count--) {
        p1 = Math.round((0, _utils.randomInRange)(0, pts.length - 1));
        p2 = Math.round((0, _utils.randomInRange)(p1, pts.length - 1));
        p3 = Math.round((0, _utils.randomInRange)(p2, pts.length - 1));

        frags.push([pts[p1], pts[p2], pts[p3]]);
    }
    return frags;
}

function getFragmentsFromCanvas() {
    var count = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10;
    var cw = arguments[1];
    var ch = arguments[2];

    var frags = [];
    var getPoint = function getPoint(r) {
        var a = (0, _utils.randomInRange)(0, 2 * Math.PI);
        return [r * Math.sin(a) + cw / 2, r * Math.cos(a) + ch / 2];
    };
    var r = 0;
    var scale = Math.min(cw, ch);
    while (count--) {
        r = (0, _utils.randomInRange)(scale * 0.5, scale * 1.5);
        frags.push([getPoint(r), getPoint(r), getPoint(r)]);
    }
    return frags;
}

function getFragments() {
    var count = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10;
    var cw = arguments[1];
    var ch = arguments[2];

    var frags = [];
    var l = void 0,
        r = void 0;
    while (count--) {
        l = (0, _utils.randomInRange)(0, ch);
        r = (0, _utils.randomInRange)(0, ch);
        frags.push([[0, l], [cw, r], [cw, (0, _utils.randomInRange)(r, ch)], [0, (0, _utils.randomInRange)(l, ch)]]);
    }
    return frags;
}

function fragments(options) {
    var opts = Object.assign({}, DEFAULTS, options);

    var container = opts.container;
    var cw = container.offsetWidth;
    var ch = container.offsetHeight;
    var SCALE = Math.min(cw, ch);

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

    // auto opts
    if (opts.drawGrid === 'auto') {
        // draw grid usually
        opts.drawGrid = !!(Math.random() > 0.25);
    }

    // set up renderers
    var renderMap = {
        circle: _shapes.drawCircle,
        ring: _shapes.drawRing,
        triangle: _shapes.drawTriangle,
        square: _shapes.drawSquare,
        box: _shapes.drawBox,
        rect: _shapes.drawRect,
        pentagon: _shapes.drawPentagon,
        hexagon: _shapes.drawHexagon
    };
    var shapes = Object.keys(renderMap);
    var getRandomRenderer = function getRandomRenderer() {
        return renderMap[(0, _utils.randItem)(shapes)];
    };

    // shadow utils
    function addShadow(ctx) {
        var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 3;
        var blur = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10;
        var opacity = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0.2;

        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = offset * SCALE / 400;
        ctx.shadowBlur = blur * SCALE / 400;
        ctx.shadowColor = 'rgba(0, 0, 0, ' + opacity + ')';
    }

    function removeShadow(ctx) {
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
    }

    // set up grid
    var cols = Math.round((0, _utils.randomInRange)(5, 9));
    var w = cw / cols;
    var h = w;
    var rows = Math.ceil(ch / h);
    rows++;
    cols++;
    var count = rows * cols;

    var pts = [];
    for (var i = 0; i < count; i++) {
        pts.push([w * (i % rows), h * Math.floor(i / cols)]);
    }

    // set up drawing variables
    var x = 0;
    var y = 0;
    var xnorm = 0;
    var ynorm = 0;
    var renderer = void 0;

    // play with these
    var a = void 0,
        b = void 0,
        c = void 0;
    a = Math.random();
    b = Math.random();
    c = Math.random();

    // color funcs
    var getSolidFill = (0, _utils.getSolidColorFunction)(opts.palette);
    var getGradientFill = (0, _utils.getGradientFunction)(opts.palette);
    var getrandomFill = function getrandomFill() {
        return "#" + Math.random().toString(16).slice(2, 8);
    };

    // standard foreground and background colors
    var fg = getSolidFill();
    var bg = getGradientFill(ctx, cw, ch);

    // paint the background
    ctx.beginPath();
    ctx.rect(0, 0, cw, ch);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.closePath();

    // define triangles
    //let frags = getFragmentsFromGrid(Math.round(randomInRange(5, 15)), pts);
    //let frags = getFragmentsFromCanvas(Math.round(randomInRange(5, 10)), cw, ch);
    var frags = getFragments(Math.round((0, _utils.randomInRange)(5, 10)), cw, ch);

    // util: draw each fragment
    function drawFragments(ctx, frags, opts) {
        frags.forEach(function (f) {
            // skip some fragments
            if (Math.random() > 0.5) {
                return;
            }

            // add shadows, sometimes
            if (Math.random() > 0.25) {
                addShadow(ctx, (0, _utils.randomInRange)(3, 9), (0, _utils.randomInRange)(5, 15), (0, _utils.randomInRange)(0.15, 0.3));
            } else {
                removeShadow(ctx);
            }

            var frag = f.slice(0); // copy the points array since we will modify
            ctx.fillStyle = getGradientFill(ctx, cw, ch);
            ctx.beginPath();
            ctx.moveTo.apply(ctx, _toConsumableArray(frag.shift()));
            frag.forEach(function (p) {
                ctx.lineTo.apply(ctx, _toConsumableArray(p));
            });
            ctx.closePath();
            ctx.fill();
        });
        removeShadow(ctx);
    }

    // define masks
    var masks = [];
    var maskcount = Math.round((0, _utils.randomInRange)(3, 5));
    masks.push([[0, 0], [cw, 0], [cw, ch], [0, ch]]);
    while (maskcount--) {
        masks.push([[0, 0], [cw, 0], [cw, (0, _utils.randomInRange)(0, ch)], [0, (0, _utils.randomInRange)(0, ch)]]);
    }

    // For each mask, draw the path, clip into it, and draw fragments inside
    masks.forEach(function (m) {
        var _ctx, _ctx2, _ctx3, _ctx4;

        addShadow(ctx, cw, ch);
        ctx.save();
        ctx.beginPath();
        (_ctx = ctx).moveTo.apply(_ctx, _toConsumableArray(m[0]));
        (_ctx2 = ctx).lineTo.apply(_ctx2, _toConsumableArray(m[1]));
        (_ctx3 = ctx).lineTo.apply(_ctx3, _toConsumableArray(m[2]));
        (_ctx4 = ctx).lineTo.apply(_ctx4, _toConsumableArray(m[3]));
        ctx.closePath();
        ctx.fillStyle = 'black';
        //ctx.fill();
        ctx.clip();
        drawFragments(ctx, frags, opts);
        ctx.restore();
    });
    removeShadow(ctx);

    // draw grid
    if (opts.drawGrid) {
        for (var _i = 0; _i < rows; _i++) {
            //renderer = getRandomRenderer();
            renderer = _shapes.drawCircle;
            for (var j = 0; j < cols; j++) {
                // convenience vars
                x = w * j;
                y = h * _i;
                xnorm = x / cw;
                ynorm = y / ch;

                renderer(ctx, x, y, ch / 400, { fill: getSolidFill() });
            }
        }
    }

    // add noise
    if (opts.addNoise) {
        if (opts.noiseInput) {
            _noiseutils2.default.applyNoiseCanvas(el, opts.noiseInput);
        } else {
            _noiseutils2.default.addNoiseFromPattern(el, opts.addNoise, w / 3);
        }
    }

    // if new canvas child was created, append it
    if (newEl) {
        container.appendChild(el);
    }
}

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(5);

var _noiseutils = __webpack_require__(1);

var _noiseutils2 = _interopRequireDefault(_noiseutils);

var _palettes = __webpack_require__(2);

var _palettes2 = _interopRequireDefault(_palettes);

var _colorbrewer = __webpack_require__(7);

var _colorbrewer2 = _interopRequireDefault(_colorbrewer);

var _waterline = __webpack_require__(8);

var _shapestack = __webpack_require__(10);

var _shapescape = __webpack_require__(13);

var _lines = __webpack_require__(14);

var _waves = __webpack_require__(15);

var _grid = __webpack_require__(16);

var _truchet = __webpack_require__(17);

var _circles = __webpack_require__(18);

var _mesh = __webpack_require__(19);

var _walk = __webpack_require__(20);

var _bands = __webpack_require__(21);

var _field = __webpack_require__(22);

var _trails = __webpack_require__(25);

var _fragments = __webpack_require__(23);

var _utils = __webpack_require__(0);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Renderers
var RENDERERS = {
    waterline: _waterline.waterline,
    shapestack: _shapestack.shapestack,
    shapescape: _shapescape.shapescape,
    lines: _lines.lines,
    grid: _grid.grid,
    truchet: _truchet.truchet,
    circles: _circles.circles,
    mesh: _mesh.mesh,
    walk: _walk.walk,
    field: _field.field,
    trails: _trails.trails,
    bands: _bands.bands,
    fragments: _fragments.fragments,
    waves: _waves.waves
};
var initRenderer = 'waterline';

var rendererName;
var Renderer;
var activeButton;

function showRenderPicker(renderers, el) {
    var button = void 0;
    var makeHandler = function makeHandler(r, button) {
        return function (e) {
            setRenderer(r, button);
        };
    };
    for (var r in renderers) {
        button = document.createElement('button');
        (0, _utils.setAttrs)(button, {
            'data-renderer': r,
            'class': 'renderPicker'
        });
        button.innerHTML = r.slice(0, 1).toUpperCase() + r.slice(1);
        button.onclick = makeHandler(r, button);
        el.appendChild(button);
    }
}

function setRenderer(rname, ctrl) {
    rendererName = rname;
    Renderer = RENDERERS[rendererName];
    window.location.hash = rendererName;
    if (ctrl) {
        ctrl.blur();
        activeButton = document.querySelector('.renderPicker.activeRenderer');
        activeButton && activeButton.classList.remove('activeRenderer');
        ctrl.classList.add('activeRenderer');
    }
    drawNew();
}
window.setRenderer = setRenderer;

// GUI controlled opts
var visualOpts = {
    container: document.querySelector('#example'),
    clear: true,
    dust: true,
    skew: 1,
    addNoise: 0.04,
    noiseInput: _noiseutils2.default.createNoiseCanvas(0.04, 200)
};

var exampleNode = document.getElementById('example');

// @fast skips re-rendering the canvas in place as an img,
// which makes for easy saving but slows down rendering
function loadOpts(opts, fast) {
    var img = exampleNode.querySelector('img');
    img && img.remove();
    visualOpts = Object.assign(visualOpts, opts);
    // render art
    Renderer(visualOpts);
    // set up main download link
    var a = document.getElementById('downloadExample');
    a.onclick = function () {
        return doDownload(a, document.querySelector('#example canvas'));
    };
}

// Handlers for redraw, batching, and manual saving

function drawNew() {
    removePreview();
    requestAnimationFrame(loadOpts);
    showMain();
}
window.drawNew = drawNew;

document.addEventListener('keydown', function (e) {
    var kode = e.which || e.keyCode;
    if (kode === 32) {
        // space
        drawNew();
        e.preventDefault();
        return false;
    } else if (kode === 27) {
        // ESC
        removePreview();
    }
});

// Click handler:
// Where @anchor is the <a>, and @el is an image displaying element
// URL encoded pixel data will be extracted from @el and downloaded
// upon click.
function doDownload(anchor, el) {
    function filename() {
        var f = rendererName + '-' + new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').replace(/\.\w+/, '');
        return f;
    }

    anchor.download = filename();

    if (el.nodeName === 'IMG') {
        anchor.href = el.src;
        anchor.onclick = function () {
            anchor.onclick = function () {};
            setTimeout(function () {
                window.URL.revokeObjectURL(blob);
                anchor.removeAttribute('href');
            });
        };
        anchor.click();
    } else if (el.nodeName === 'CANVAS') {
        el.toBlob(function (blob) {
            // from https://github.com/mattdesl/canvas-sketch/blob/master/lib/save.js
            anchor.href = window.URL.createObjectURL(blob);
            anchor.onclick = function () {
                anchor.onclick = function () {};
                setTimeout(function () {
                    window.URL.revokeObjectURL(blob);
                    anchor.removeAttribute('href');
                });
            };
            anchor.click();
        }, 'image/png');
    }

    return false;
}

// Util:
// Create an <img> element,
// Fill it with PNG ObjectURL blob from @canvas,
// Wrap it in an <a> with a download handler,
// Append it to @container.
// The doDownload handler will revoke the URL.
function renderCanvasToImg(canvas, container) {
    canvas.toBlob(function (blob) {
        var image = document.createElement('img');
        image.src = window.URL.createObjectURL(blob);

        var anchor = document.createElement('a');
        anchor.innerHTML = '↓';
        anchor.target = '_blank';
        anchor.onclick = function () {
            return doDownload(anchor, image);
        };

        var wrapper = document.createElement('div');
        wrapper.className = 'downloader';

        wrapper.appendChild(image);
        wrapper.appendChild(anchor);

        container.appendChild(wrapper);
    }, 'image/png');
}

// Create @N new renderings drawn with @opts inputs
// Then render to images with click-to-download handlers
// Append them to div#saved
function createBatch(opts, N) {
    N = N || 9;

    hideMain();

    var canvas = document.querySelector('#example canvas');
    var container = document.querySelector('#saved');

    // render the batch
    container.innerHTML = '';
    for (var i = 0; i < N; i++) {
        requestAnimationFrame(function () {
            loadOpts(opts, true);
            renderCanvasToImg(canvas, container);
        });
    }
}
window.createBatch = createBatch;

// HACK need universal store for def
/*function rerun() {
    drawWaterline(window.LASTDEF, visualOpts);
    drawWaterline(window.LASTDEF, Object.assign({}, visualOpts, {container: document.querySelector('#re-tall')}) );
    drawWaterline(window.LASTDEF, Object.assign({}, visualOpts, {container: document.querySelector('#re-wide')}) );
}
window.rerun = rerun;*/

var appPalettes = Object.assign({ default: null }, _palettes2.default);

// create a batch from a colorbrewer name
function setPalette(pname) {
    if (!appPalettes[pname]) {
        delete visualOpts.palette;
    } else {
        visualOpts.palette = appPalettes[pname];
    }
    return drawNew({});
}
window.setPalette = setPalette;

// populate the selector for colorbrewer palettes
if (_colorbrewer2.default) {
    var cbnames = Object.keys(_colorbrewer2.default);
    cbnames.forEach(function (pname) {
        appPalettes[pname] = _colorbrewer2.default[pname][6];
    });
}

var selectEl = document.querySelector('#paletteSelector');
var pnames = Object.keys(appPalettes);
pnames.forEach(function (pname) {
    var option = document.createElement('option');
    option.value = pname;
    option.innerHTML = pname;
    selectEl.appendChild(option);
});

function useCustomPalette(palette) {
    if (palette && palette.length) {
        visualOpts.palette = palette;
        selectEl.value = 'custom';
        Renderer(visualOpts);
    }
}

var custom = document.querySelector('#customColors');
custom.addEventListener('keypress', function (e) {
    var hexPattern = /#?[0-9a-f]{3,6}/;
    var palette = e.target.value.split(',');
    palette = palette.map(function (s) {
        s = s.trim().replace(/['"']/g, '');
        if (hexPattern.test(s) && !s.startsWith('#')) {
            s = '#' + s;
        }
        return s;
    });
    useCustomPalette(palette);
});

function previewImage(el) {
    var preview = document.createElement('div');
    preview.id = 'preview';
    preview.appendChild(el);
    preview.onclick = function (e) {
        // on click, hide if we click outside the image
        if (e.target.id === 'preview') {
            removePreview();
        }
    };
    // append the elements to display
    document.querySelector('body').appendChild(preview);
    // we must re-bind the click behavior of the download link,
    // which does not come with the cloned element
    var anchor = document.querySelector('#preview .downloader a');
    var image = document.querySelector('#preview .downloader img');
    anchor.onclick = function () {
        return doDownload(anchor, image);
    };
}

function removePreview() {
    var p = document.querySelector('#preview');
    p && p.remove();
}

function showMain() {
    exampleNode.className = exampleNode.className.replace(/isHidden/g, '');
}

function hideMain() {
    if (exampleNode.className.indexOf('isHidden') === -1) {
        exampleNode.className += ' isHidden ';
    }
}

function setSize(className) {
    exampleNode.className = exampleNode.className.replace(/(wide|square|tall)/g, '');
    exampleNode.className += ' ' + className + ' ';
    drawNew();
}
window.setSize = setSize;

document.querySelector('#saved').addEventListener('click', function (e) {
    if (e.target.nodeName === 'IMG') {
        // HACK: this relies on .downloader > img DOM structure
        previewImage(e.target.parentNode.cloneNode(true));
    }
});

exampleNode.addEventListener('click', function (e) {
    renderCanvasToImg(exampleNode.querySelector('canvas'), document.querySelector('#saved'));
});

// expose for play
window.visualOpts = visualOpts;

// draw one to start, take renderer from hash if it is valid

var h = window.location.hash.slice(1);
if (h && RENDERERS.hasOwnProperty(h)) {
    initRenderer = h;
}
showRenderPicker(RENDERERS, document.getElementById('renderPickers'));
setRenderer(initRenderer, document.querySelector("[data-renderer='" + initRenderer + "']"));

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.trails = trails;

var _noiseutils = __webpack_require__(1);

var _noiseutils2 = _interopRequireDefault(_noiseutils);

var _palettes = __webpack_require__(2);

var _palettes2 = _interopRequireDefault(_palettes);

var _hexScatter = __webpack_require__(6);

var _hexScatter2 = _interopRequireDefault(_hexScatter);

var _utils = __webpack_require__(0);

var _shapes = __webpack_require__(3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var PI = Math.PI;
var LIGHTMODES = ['bloom', 'normal'];
var GRIDMODES = ['normal', 'scatter', 'random'];
var COLORMODES = ['length', 'curve', 'origin', 'random'];

var DEFAULTS = {
    container: 'body',
    palette: _palettes2.default.de_stijl,
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true,
    lightMode: 'normal', // from LIGHTMODES
    gridMode: 'scatter', // from GRIDMODES
    colorMode: 'auto', // from COLORMODES
    isolate: true

    // Main function
};function trails(options) {
    var opts = Object.assign({}, DEFAULTS, options);

    var container = opts.container;
    var cw = container.offsetWidth;
    var ch = container.offsetHeight;
    var SCALE = Math.min(cw, ch);
    var LONG = Math.max(cw, ch);
    var SHORT = Math.min(cw, ch);
    var AREA = cw * ch;

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

    var ctx = el.getContext('2d');

    // modes and styles
    var LIGHTMODE = opts.lightMode === 'auto' ? (0, _utils.randItem)(LIGHTMODES) : opts.lightMode;
    var GRIDMODE = opts.gridMode === 'auto' ? (0, _utils.randItem)(GRIDMODES) : opts.gridMode;
    var COLORMODE = opts.colorMode === 'auto' ? (0, _utils.randItem)(COLORMODES) : opts.colorMode;

    // color funcs
    var getSolidFill = (0, _utils.getSolidColorFunction)(opts.palette);

    // how many cells are in the grid?
    var countMin = void 0,
        countMax = void 0;
    countMin = 80;
    countMax = 160;

    var cellSize = Math.round(SHORT / (0, _utils.randomInRange)(countMin, countMax));

    // setup vars for each cell
    var x = 0;
    var y = 0;
    var xnorm = 0;
    var ynorm = 0;
    var renderer = void 0;

    // shared colors
    var bg = getSolidFill();

    // get palette of non-bg colors
    var contrastPalette = [].concat(opts.palette);
    contrastPalette.splice(opts.palette.indexOf(bg), 1);
    //contrastPalette.sort(()=>(randomInRange(-1, 1)));
    var getContrastColor = (0, _utils.getSolidColorFunction)(contrastPalette);
    var colorCount = contrastPalette.length;

    // shared foregrounds
    var fg = getContrastColor();
    var fg2 = getContrastColor();

    // in bloom mode, we draw high-contrast grayscale, and layer
    // palette colors on top
    if (LIGHTMODE === 'bloom') {
        bg = '#222222';
        fg = fg2 = '#cccccc';
    }

    // draw background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);

    ctx.strokeStyle = fg;

    // trails:
    var rateMax = (0, _utils.randomInRange)(1, 10); // this is a bit meta and silly

    // rate is the number of sin waves across the grid
    var xrate = (0, _utils.randomInRange)(0, rateMax);
    var yrate = (0, _utils.randomInRange)(0, rateMax);
    // set phase offset
    var xphase = (0, _utils.randomInRange)(-PI, PI);
    var yphase = (0, _utils.randomInRange)(-PI, PI);

    // tail vars
    var _x = void 0,
        _y = void 0,
        len = void 0;

    // line width
    var weight = SHORT / (0, _utils.randomInRange)(400, 50);

    ctx.lineWidth = weight;
    ctx.lineCap = 'round';

    // const used in normalizing transforms
    var maxLen = 2 * Math.sqrt(2);

    // It looks nice to extend lines beyond their cells. how much?
    // Scaled against cellSize
    var lineScale = (0, _utils.randomInRange)(0.7, 3);

    // Displace the center point of each cell by this factor
    // Only do this sometimes, and not when scattering
    var warp = 0;
    if (GRIDMODE !== 'scatter' && Math.random() < 0.5) {
        warp = (0, _utils.randomInRange)(0, Math.sqrt(2));
    }

    // set of functions to transform opacity across grid
    var opacityTransforms = [function () {
        return 1;
    }, function (_x, _y) {
        return Math.abs(_y / _x) / maxLen;
    }, function (_x, _y) {
        return 1 - Math.abs(_y / _x) / maxLen;
    }, function (_x, _y) {
        return Math.abs(_x / _y);
    }, // hides verticals
    function (_x, _y) {
        return Math.abs(_y / _x);
    }, // hides horizontals
    function (_x, _y) {
        return _x / _y;
    }, function (_x, _y) {
        return _y / _x;
    }, function (_x, _y) {
        return _y - _x;
    }, function (_x, _y) {
        return _x - _y;
    }];
    // now pick one
    var opacityFunc = (0, _utils.randItem)(opacityTransforms);

    // Create a function which is a periodic transform of x, y
    function createTransform() {
        var rateMin = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        var rateMax = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

        var rate1 = (0, _utils.randomInRange)(0, rateMax);
        var rate2 = (0, _utils.randomInRange)(0, rateMax);
        var phase1 = (0, _utils.randomInRange)(-PI, PI);
        var phase2 = (0, _utils.randomInRange)(-PI, PI);
        var c1 = (0, _utils.randomInRange)(0, 1);
        var c2 = (0, _utils.randomInRange)(0, 1);
        return function (x, y) {
            var t1 = Math.sin(x * PI * rate1 + phase1);
            var t2 = Math.sin(y * PI * rate2 + phase2);
            return (c1 * t1 + c2 * t2) / (c1 + c2);
        };
    }

    // a set of independent transforms to use while rendering
    var trans = {
        xbase: createTransform(0, rateMax),
        ybase: createTransform(0, rateMax),
        xtail: createTransform(0, rateMax),
        ytail: createTransform(0, rateMax),
        radius: createTransform(0, rateMax),
        color: createTransform(0, 5 / SHORT) // change colors slowly
    };

    function randomScatter(size, w, h) {
        var pts = [];
        var xcount = Math.ceil(w / size);
        var ycount = Math.ceil(h / size);
        var count = xcount * ycount;
        while (count--) {
            pts.push([(0, _utils.randomInRange)(0, w), (0, _utils.randomInRange)(0, h)]);
        }
        return pts;
    }

    function placeNormal(size, w, h) {
        var pts = [];
        var xcount = Math.ceil(w / size) + 2;
        var ycount = Math.ceil(h / size) + 2;
        var count = xcount * ycount;
        var x = void 0,
            y = void 0;
        for (var i = 0; i < count; i++) {
            x = size * (i % xcount - 1) + size / 2;
            y = size * (Math.floor(i / ycount) - 1) + size / 2;
            pts.push([x, y]);
        }
        return pts;
    }

    var pts = [];

    switch (GRIDMODE) {
        case 'scatter':
            //pts = hexScatter(Math.round(SCALE/randomInRange(60,120)), cw, ch);
            pts = (0, _hexScatter2.default)(cellSize, cw, ch);
            break;
        case 'random':
            pts = randomScatter(cellSize, cw, ch);
            break;
        default:
            pts = placeNormal(cellSize, cw, ch);
    }

    // shuffle the points so trails are initialized randomly
    pts.sort(function () {
        return (0, _utils.randomInRange)(-1, 1);
    });

    // Create another canvas

    var ref = document.querySelector('#ref');
    if (!ref) {
        ref = document.createElement('canvas');
        ref.setAttribute('id', 'ref');
        ref.setAttribute('width', cw);
        ref.setAttribute('height', ch);
        ref.className = 'artContainer';
        //document.querySelector('body').appendChild(ref);
    }
    var rctx = ref.getContext('2d');

    rctx.fillStyle = 'black';
    rctx.fillRect(0, 0, cw, ch);

    rctx.strokeStyle = 'white';
    rctx.lineWidth = weight * 2; // exclusion based on stroke
    rctx.lineCap = 'round';

    // Field trails: for each point, follow the tail functions for
    // a bunch of steps. Seems to work well for 20-100 steps. With more steps
    // you have to fade out opacity as you go to remain legible
    var steps = void 0;
    var stepBase = (0, _utils.randomInRange)(10, 40); // vary this for each trail. See loop.
    lineScale = 0.5; // scalar of the function at each step. small=smooth.

    var dx = void 0,
        dy = void 0;

    ctx.globalAlpha = 1;
    //ctx.globalAlpha = 0.5;
    //ctx.globalCompositeOperation = 'overlay';

    ctx.lineWidth = weight * 0.66;

    var colorVal = void 0; // color transform value
    var colorNorm = void 0; // color val normalized to palette

    var trace = [0, 0]; // color sample

    var tStart = new Date().getTime();

    // to avoid self blocking,
    // hold each trail and defer reference rendering till each is done.
    // This allows self intersection, but avoids self-interference when
    // each step is too small to avoid colliding with the last.
    var trail = [];

    pts.forEach(function (p, i) {
        //ctx.strokeStyle = (i%2)? fg : fg2;
        //ctx.strokeStyle = (i%2)? 'white' : 'black';
        //ctx.strokeStyle = getContrastColor();

        steps = stepBase * (0, _utils.randomInRange)(1, 2);

        x = p[0];
        y = p[1];

        // check reference canvas at start point.
        if (opts.isolate) trace = rctx.getImageData(x, y, 1, 1).data;
        if (trace[0] > 5) {
            return;
        }

        var tlen = 0;
        var tCurve = 0;
        var angle = 0;
        var lastAngle = 0;

        for (var z = 0; z <= steps; z++) {
            x = p[0];
            y = p[1];
            xnorm = x / cw;
            ynorm = y / ch;

            _x = trans.xtail(xnorm, ynorm);
            _y = trans.ytail(xnorm, ynorm);

            dx = cellSize * _x * lineScale;
            dy = cellSize * _y * lineScale;

            // get ref sample
            if (opts.isolate) trace = rctx.getImageData(x + dx, y + dy, 1, 1).data;
            // stop if white
            if (trace[0] > 5) {
                continue;
            }

            // direct draw
            //ctx.beginPath();
            //ctx.moveTo(x, y);
            //ctx.lineTo(
            //    x + dx,
            //    y + dy
            //);
            //ctx.stroke();

            trail.push([x + dx, y + dy]);
            if (COLORMODE === 'length') {
                // tally up the length
                tlen += Math.sqrt(dx * dx + dy * dy);
            }
            if (COLORMODE === 'curve') {
                // add abs change in angle
                // tCurve += Math.abs((Math.atan((y+dy)/(x+dx)) - Math.atan(y/x)));
                angle = Math.atan(dy / dx);
                if (z > 0) {
                    // don't accumulate until second point, otherwise we include
                    // the initial angle of the root position in the tally
                    tCurve += Math.abs(angle - lastAngle);
                }
                lastAngle = angle;
            }

            p[0] = x + dx;
            p[1] = y + dy;
        }

        var trailStart = void 0;
        var trailEnd = void 0;

        // Deferred drawing
        // foreach trail, render it
        if (trail.length) {
            trailStart = trail.shift();
            trailEnd = trail[trail.length - 1];

            // Colors

            if (COLORMODE === 'origin') {
                // set color as a function of position of trail origin
                colorVal = (trans.color(x, y) + 1) / 2;
                colorNorm = Math.round(colorVal * (contrastPalette.length - 1));
                ctx.strokeStyle = contrastPalette[colorNorm] || 'green';
            }

            if (COLORMODE === 'length') {
                colorVal = tlen / (stepBase * 2 * 3); // roughly the expected max length
                //console.log(colorVal);
                colorNorm = Math.round(colorVal * (colorCount - 1));
                ctx.strokeStyle = contrastPalette[colorNorm % colorCount] || 'green';
            }

            if (COLORMODE === 'curve') {
                colorVal = tCurve * 1.2; // magic number
                colorVal = colorVal % PI;
                //console.log(colorVal.toFixed(1));
                colorNorm = Math.round(colorVal * (colorCount - 1));
                ctx.strokeStyle = contrastPalette[colorNorm % colorCount] || 'green';
            }

            if (COLORMODE === 'random') {
                ctx.strokeStyle = getContrastColor();
            }

            // Start drawing

            ctx.beginPath();
            ctx.moveTo.apply(ctx, _toConsumableArray(trailStart));

            rctx.beginPath();
            rctx.moveTo.apply(rctx, _toConsumableArray(trailStart));

            trail.forEach(function (pt, i) {
                ctx.lineTo(pt[0], pt[1]);
                rctx.lineTo(pt[0], pt[1]);
            });
            ctx.stroke();
            rctx.stroke();
            trail = [];
        }
    });

    ctx.globalAlpha = 1;

    // in bloom mode, we draw a big colorful gradient over the grayscale
    // background, using palette colors and nice blend modes
    if (LIGHTMODE === 'bloom') {
        ctx.globalCompositeOperation = 'color-dodge';

        // bloom with linear gradient
        ctx.fillStyle = (0, _utils.getGradientFunction)(opts.palette)(ctx, cw, ch); //getContrastColor();
        ctx.fillRect(0, 0, cw, ch);

        if (Math.random() < 0.5) {
            // bloom with spot lights
            var dodgeDot = function dodgeDot() {
                var max = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1.5;

                var gx = void 0,
                    gy = void 0,
                    gr1 = void 0,
                    gr2 = void 0;
                gx = (0, _utils.randomInRange)(0, cw);
                gy = (0, _utils.randomInRange)(0, ch);
                gr1 = (0, _utils.randomInRange)(0, 0.25);
                gr2 = (0, _utils.randomInRange)(gr1, max);

                var radial = ctx.createRadialGradient(gx, gy, gr1 * SCALE, gx, gy, gr2 * SCALE);
                radial.addColorStop(0, (0, _utils.randItem)(opts.palette));
                radial.addColorStop(1, '#000000');

                ctx.fillStyle = radial;
                ctx.fillRect(0, 0, cw, ch);
            };
            // try layering dots with varying coverage
            ctx.globalAlpha = (0, _utils.randomInRange)(0.4, 0.7);
            dodgeDot(1.5);
            ctx.globalAlpha = (0, _utils.randomInRange)(0.4, 0.7);
            dodgeDot(1.0);
            ctx.globalAlpha = (0, _utils.randomInRange)(0.7, 0.9);
            dodgeDot(0.5);
            ctx.globalAlpha = 1;
        }

        ctx.globalCompositeOperation = 'normal';
    }

    var tEnd = new Date().getTime();

    console.log('rendered in ' + (tEnd - tStart) + 'ms');

    window.ctx = ctx;

    // add noise
    if (opts.addNoise) {
        if (opts.noiseInput) {
            // apply noise from supplied canvas
            _noiseutils2.default.applyNoiseCanvas(el, opts.noiseInput);
        } else {
            // create noise pattern and apply
            _noiseutils2.default.addNoiseFromPattern(el, opts.addNoise, cw / 3);
        }
    }

    // if new canvas child was created, append it
    if (newEl) {
        container.appendChild(el);
    }
}

/***/ })
/******/ ]);