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
/******/ 	return __webpack_require__(__webpack_require__.s = 34);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
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

/***/ 1:
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

/***/ 17:
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

/***/ 2:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
// in use
var palettes = {
    ultra: ['#15d6d0', '#4481fc', '#bb19d8', '#f22f1c', '#ffa300', '#fff200'],
    high_contrast: ['#111111', '#444444', '#dddddd', '#f9f9f9'],
    low_contrast: ['#555555', '#777777', '#999999', '#cccccc', '#dddddd'],
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
    blush: ['#111111', '#94552C', '#F8ADAA', '#F8E3AC', '#ffffff'],

    magma: ['#000004', '#3b0f70', '#8c2981', '#de4968', '#fe9f6d', '#fcfdbf'],
    inferno: ['#000004', '#420a68', '#932667', '#dd513a', '#fca50a', '#fcffa4'],
    plasma: ['#0d0887', '#6a00a8', '#b12a90', '#e16462', '#fca636', '#f0f921'],
    viridis: ['#440154', '#414487', '#2a788e', '#22a884', '#7ad151', '#fde725']
};

exports.default = palettes;

// older palettes:

var lemon_beach = exports.lemon_beach = ['#d7d7d7', '#979797', '#cabd9d', '#e4ca49', '#89bed3', '#11758e'];

/***/ }),

/***/ 3:
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

/***/ 34:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(5);

var _noiseutils = __webpack_require__(1);

var _noiseutils2 = _interopRequireDefault(_noiseutils);

var _palettes = __webpack_require__(2);

var _palettes2 = _interopRequireDefault(_palettes);

var _colorbrewer = __webpack_require__(7);

var _colorbrewer2 = _interopRequireDefault(_colorbrewer);

var _truchet = __webpack_require__(17);

var _numerals = __webpack_require__(35);

var _utils = __webpack_require__(0);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Renderers
var Renderer = _truchet.truchet;

// TODO: put this into a resize handler and make it smart
var COUNT = 16;

// GUI controlled opts
var visualOpts = {
    container: document.querySelector('#truchet'),
    clear: true,
    dust: true,
    skew: 1,
    addNoise: 0.04,
    noiseInput: _noiseutils2.default.createNoiseCanvas(0.04, 200),
    count: COUNT
};

var artNode = document.getElementById('truchet');

var timeOpts = {
    container: document.querySelector('#time'),
    clear: true,
    dust: true,
    skew: 1,
    addNoise: false,
    count: COUNT

    // @fast skips re-rendering the canvas in place as an img,
    // which makes for easy saving but slows down rendering
};function loadOpts(opts, fast) {
    visualOpts = Object.assign(visualOpts, opts);
    // render art
    (0, _truchet.truchet)(visualOpts);
}

// Handlers for redraw, batching, and manual saving

function drawNew() {
    requestAnimationFrame(loadOpts);
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

// expose for play
window.visualOpts = visualOpts;

setPalette('plum_sauce');

// draw one to start, take renderer from hash if it is valid

drawNew();
setInterval(function () {
    if (new Date().getSeconds() % 10 === 0) drawNew();
    window.requestAnimationFrame(function () {
        (0, _numerals.numerals)(timeOpts);
    });
}, 1000);

/***/ }),

/***/ 35:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.numerals = numerals;

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

    time: null
};

var PI = Math.PI;

// Main function
function numerals(options) {
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

    // shared colors
    var fg = void 0; // hold on…
    var bg = getSolidFill(); // pick bg

    // get palette of non-bg colors
    var contrastPalette = [].concat(opts.palette);
    contrastPalette.splice(opts.palette.indexOf(bg), 1);
    var getContrastColor = (0, _utils.getSolidColorFunction)(contrastPalette);
    fg = getContrastColor(); // …now set fg in contrast to bg


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

    var numberDefs = {
        0: '891176',
        1: '410101',
        2: '898611',
        3: '717176',
        4: '551101',
        5: '117976',
        6: '891976',
        7: '118210',
        8: '898976',
        9: '897146'
    };

    function drawNumber(N, i, j, fill) {
        var def = numberDefs[N];

        // map serialized hex code to cell styles
        // defined inside drawNumber for ease of passing fills
        var toCell = {
            0: function _() {},
            1: function _() {
                _square(null, fill);
            },
            2: function _() {
                _triangle(2, fill);
            },
            3: function _() {
                _triangle(3, fill);
            },
            4: function _() {
                _triangle(0, fill);
            },
            5: function _() {
                _triangle(1, fill);
            },
            6: function _() {
                _circle(0, fill);
            },
            7: function _() {
                _circle(1, fill);
            },
            8: function _() {
                _circle(2, fill);
            },
            9: function _() {
                _circle(3, fill);
            },
            "a": function a() {
                _square(null, fill);
            },
            "b": function b() {
                _square(null, fill);
            },
            "c": function c() {
                _square(null, fill);
            },
            "d": function d() {
                _square(null, fill);
            },
            "e": function e() {
                _square(null, fill);
            },
            "f": function f() {
                _square(null, fill);
            }
        };

        ctx.translate(i * w, j * h);
        clipSquare(ctx, w, h, 'transparent');
        toCell[def[0]]();
        ctx.restore();

        ctx.translate(w, 0);
        clipSquare(ctx, w, h, 'transparent');
        toCell[def[1]]();
        ctx.restore();

        ctx.translate(-w, h);
        clipSquare(ctx, w, h, 'transparent');
        toCell[def[2]]();
        ctx.restore();

        ctx.translate(w, 0);
        clipSquare(ctx, w, h, 'transparent');
        toCell[def[3]]();
        ctx.restore();

        ctx.translate(-w, h);
        clipSquare(ctx, w, h, 'transparent');
        toCell[def[4]]();
        ctx.restore();

        ctx.translate(w, 0);
        clipSquare(ctx, w, h, 'transparent');
        toCell[def[5]]();
        ctx.restore();

        (0, _utils.resetTransform)(ctx);
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

    var now = new Date();

    var hours = now.getHours();
    if (hours > 12) hours = hours - 12;
    var minutes = now.getMinutes();
    var seconds = now.getSeconds();

    function padNum(n) {
        return n < 10 ? "0" + n.toString() : n.toString();
    }

    hours = padNum(hours);
    minutes = padNum(minutes);
    seconds = padNum(seconds);

    // count === 14
    // smoosh them all together on one line
    /*drawNumber(hours[0], 1, 1, 'white');
    drawNumber(hours[1], 3, 1, 'white');
     drawNumber(minutes[0], 5, 1, 'white');
    drawNumber(minutes[1], 7, 1, 'white');
     drawNumber(seconds[0], 9, 1, 'white');
    drawNumber(seconds[1], 11, 1, 'white');*/

    if (count >= 16) {
        // draw all three on a line
        drawNumber(hours[0], 1, 1, 'white');
        drawNumber(hours[1], 3, 1, 'white');

        drawNumber(minutes[0], 6, 1, 'white');
        drawNumber(minutes[1], 8, 1, 'white');

        drawNumber(seconds[0], 11, 1, 'white');
        drawNumber(seconds[1], 13, 1, 'white');
    } else if (count >= 11 && vcount >= 8) {
        // bump seconds down to their own line
        drawNumber(hours[0], 1, 1, 'white');
        drawNumber(hours[1], 3, 1, 'white');

        drawNumber(minutes[0], 6, 1, 'white');
        drawNumber(minutes[1], 8, 1, 'white');

        drawNumber(seconds[0], 6, 5, 'white');
        drawNumber(seconds[1], 8, 5, 'white');
    } else {
        // hours and minutes only
        drawNumber(hours[0], 1, 1, 'white');
        drawNumber(hours[1], 3, 1, 'white');

        drawNumber(minutes[0], 6, 1, 'white');
        drawNumber(minutes[1], 8, 1, 'white');
    }

    /*drawNumber(0, 1, 1, 'white');
    drawNumber(1, 3, 1, 'white');
    drawNumber(2, 5, 1, 'white');
    drawNumber(3, 7, 1, 'white');
     drawNumber(4, 1, 4, 'white');
    drawNumber(5, 3, 4, 'white');
    drawNumber(6, 5, 4, 'white');
    drawNumber(7, 7, 4, 'white');
     drawNumber(8, 5, 7, 'white');
    drawNumber(9, 7, 7, 'white');*/

    // if new canvas child was created, append it
    if (newEl) {
        container.appendChild(el);
    }
}

/***/ }),

/***/ 5:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 7:
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

/***/ })

/******/ });