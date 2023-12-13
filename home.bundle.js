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
/******/ 	return __webpack_require__(__webpack_require__.s = 42);
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
exports.randomInt = randomInt;
exports.shuffle = shuffle;
exports.setAttrs = setAttrs;
exports.resetTransform = resetTransform;
exports.rotateCanvas = rotateCanvas;
exports.getGradientFunction = getGradientFunction;
exports.getLocalGradientFunction = getLocalGradientFunction;
exports.getSolidColorFunction = getSolidColorFunction;
exports.hexToRgb = hexToRgb;
exports.colorDistanceArray = colorDistanceArray;
exports.closestColor = closestColor;
exports.scalarVec = scalarVec;
exports.getAngle = getAngle;
exports.getVector = getVector;
exports.averagePoints = averagePoints;
exports.pointsToPath = pointsToPath;
exports.mapKeywordToVal = mapKeywordToVal;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// random Array member
function randItem(arr) {
    return arr[Math.floor(arr.length * Math.random())];
}

function randomInRange(min, max) {
    if (max === undefined) {
        max = min;
        min = 0;
    }
    return min + (max - min) * Math.random();
}

function randomInt(min, max) {
    return Math.round(randomInRange(min, max));
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

function getLocalGradientFunction(palette) {
    var p = [].concat(palette);
    return function (ctx, x, y, size) {
        var bias = Math.random() - 0.5;
        var coords = [];
        if (bias) {
            coords = [randomInRange(x - size, x + size), y - size, randomInRange(x - size, x + size), y + size];
        } else {
            coords = [x - size, randomInRange(y - size, y + size), x + size, randomInRange(y - size, y + size)];
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

// converts @hex to 8-bit array [r, g, b]
function hexToRgb(hex) {
    if (hex[0] === '#') {
        hex = hex.slice(1);
    }
    if (hex.length === 3) {
        hex = '' + hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    function toN(hexFrag) {
        return parseInt(hexFrag, 16);
    }
    return [toN(hex.slice(0, 2)), toN(hex.slice(2, 4)), toN(hex.slice(4, 6))];
}

// Supply @c1, @c2 as [r,g,b] colors.
// Return r,g,b distance components, and a scalar distance as [r,b,g,distance]
// Scalar diff is 0-765
function colorDistanceArray(c1, c2) {
    var dr = void 0,
        dg = void 0,
        db = void 0;
    var _r = (c1[0] + c2[0]) / 2;
    dr = c2[0] - c1[0];
    dg = c2[1] - c1[1];
    db = c2[2] - c1[2];
    // dc = scalar diff
    var dc = Math.sqrt(dr * dr * (2 + _r / 256) + dg * dg * 4 + db * db * (2 + (255 - _r) / 256));
    return [dr, dg, db, dc];
}

// args are rgb in 8 bit array form
// returns {diff, color}
function closestColor(sample, palette) {
    var diffs = palette.map(function (p) {
        return {
            diff: colorDistanceArray(p, sample),
            color: p
        };
    });
    diffs = diffs.sort(function (a, b) {
        return a.diff[3] - b.diff[3];
    });
    return diffs[0];
}

// util for scaling color errors in dithering, but could be useful
function scalarVec(vec, scalar) {
    return vec.map(function (x) {
        return x * scalar;
    });
}

// util
// get angle between @a and @b of form [x, y]
// returns in radians
function getAngle(a, b) {
    var dx = b[0] - a[0];
    var dy = b[1] - a[1];
    return Math.atan2(dy, dx);
}

// util
// get vector between @a and @b of form [x, y]
// return object with x, y = @a, angle, length
function getVector(a, b) {
    var dx = b[0] - a[0];
    var dy = b[1] - a[1];
    var theta = Math.atan2(dy, dx);
    var length = Math.sqrt(dx * dx + dy * dy);
    return {
        x: a[0],
        y: a[1],
        angle: theta,
        length: length
    };
}

// get the average coordinates from an array of
// @points in [x,y] form
function averagePoints(points) {
    var avg = [0, 0];
    for (var i = 0; i < points.length; i++) {
        avg[0] += points[i][0];
        avg[1] += points[i][1];
    }
    avg[0] /= points.length;
    avg[1] /= points.length;
    return avg;
}

// Create a path in @ctx by stepping through the points
// in @points, which are in [x,y] array form
function pointsToPath(ctx, points) {
    // copy the points list, so we don't mutate
    var pts = points.concat([]);
    ctx.beginPath();
    ctx.moveTo.apply(ctx, _toConsumableArray(pts.shift()));
    while (pts.length) {
        ctx.lineTo.apply(ctx, _toConsumableArray(pts.shift()));
    }
    ctx.closePath();
    return ctx;
}

// map named values of props, e.g. low, med, high…
// to values, as defined in the obj @props
// If values are arrays, use @accessor function to pick.
// Respect 'auto' as special case for @name
function mapKeywordToVal(props) {
    var accessor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : randomInRange;

    var names = Object.keys(props);

    return function (name) {
        var label = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'param';

        if (name === 'auto' || name === 'AUTO') {
            name = randItem(names);
            console.log(label + ': auto picked ' + name);
        }
        if (props[name] === undefined) {
            name = names[0];
            console.log(label + ': fell back to ' + name);
        }
        var val = props[name];
        if (Array.isArray(val)) {
            return accessor.apply(undefined, _toConsumableArray(val));
        } else {
            return val;
        }
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
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.drawLine = drawLine;
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
    ctx.lineTo(-d, -d);
    // cutout
    ctx.moveTo(-r, -r);
    ctx.lineTo(-r, +r);
    ctx.lineTo(+r, +r);
    ctx.lineTo(+r, -r);
    ctx.lineTo(-r, -r);
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

// Draw a line from @a to @b, where they are of form [x, y]
function drawLine(ctx, a, b) {
    var _a = _slicedToArray(a, 2),
        x1 = _a[0],
        y1 = _a[1];

    var _b = _slicedToArray(b, 2),
        x2 = _b[0],
        y2 = _b[1];

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
}

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
/* 6 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createTransform = createTransform;
exports.createSourceSinkTransform = createSourceSinkTransform;
exports.opacityTransforms = opacityTransforms;

var _utils = __webpack_require__(0);

var PI = Math.PI;

// Create a function which is a periodic transform of x, y
function createTransform() {
    var rateMin = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var rateMax = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

    var rate1 = (0, _utils.randomInRange)(0, rateMax / 2);
    var rate2 = (0, _utils.randomInRange)(0, rateMax / 2);
    var rate3 = (0, _utils.randomInRange)(rateMax / 2, rateMax);
    var rate4 = (0, _utils.randomInRange)(rateMax / 2, rateMax);

    var phase1 = (0, _utils.randomInRange)(-PI, PI);
    var phase2 = (0, _utils.randomInRange)(-PI, PI);
    var phase3 = (0, _utils.randomInRange)(-PI, PI);
    var phase4 = (0, _utils.randomInRange)(-PI, PI);

    var c1 = (0, _utils.randomInRange)(0, 1);
    var c2 = (0, _utils.randomInRange)(0, 1);
    var c3 = (0, _utils.randomInRange)(0, 1);
    var c4 = (0, _utils.randomInRange)(0, 1);
    return function (xnorm, ynorm) {
        var t1 = Math.sin(xnorm * rate1 * 2 * PI + phase1);
        var t2 = Math.sin(ynorm * rate2 * 2 * PI + phase2);
        var t3 = Math.sin(xnorm * rate3 * 2 * PI + phase3);
        var t4 = Math.sin(ynorm * rate4 * 2 * PI + phase4);
        return (c1 * t1 + c2 * t2 + c3 * t3 + c4 * t4) / (c1 + c2 + c3 + c4);
    };
}

function createSourceSinkTransform() {
    var count = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 4;

    var sources = [];

    while (count--) {
        var src = {
            strength: (0, _utils.randomInRange)(1, 20),
            sign: 1,
            x: (0, _utils.randomInRange)(-0.25, 1.25), // add some overscan
            y: (0, _utils.randomInRange)(-0.25, 1.25)
        };
        if (Math.random() > 0.9) {
            // occasionally make sinks instead of sources
            src.sign *= -1;
        }
        sources.push(src);
    }

    return {
        sources: sources,
        t: function t(xnorm, ynorm) {
            var v = [0, 0]; // force vector to return

            sources.forEach(function (source) {
                var rmin = source.strength / 1000; // magic number


                var dx = xnorm - source.x;
                var dy = ynorm - source.y;
                var _r = dx * dx + dy * dy; // really r squared but that's what we want

                if (_r < rmin) {
                    _r = rmin;
                }; // min r

                var scalar = source.sign * source.strength / _r;

                var _x = scalar * dx;
                var _y = scalar * dy;
                v[0] += _x;
                v[1] += _y;
            });

            return v;
        }
    };
}

function opacityTransforms(maxLen) {
    return [function () {
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
}

/***/ }),
/* 8 */,
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.defineWaterline = defineWaterline;
exports.drawWaterline = drawWaterline;
exports.waterline = waterline;

var _waterlineSchema = __webpack_require__(10);

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
/* 10 */
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
/* 11 */
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

var _stacks = __webpack_require__(12);

var _nests = __webpack_require__(13);

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
/* 12 */
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
/* 13 */
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
/* 14 */
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

var _shapes = __webpack_require__(3);

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

    var cw = container.offsetWidth;
    var ch = container.offsetHeight;
    var SCALE = Math.min(cw, ch);
    var LONG = Math.max(cw, ch);
    var SHORT = Math.min(cw, ch);

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

    var renderer;
    var renderMap = {
        circle: _shapes.drawCircle,
        triangle: _shapes.drawTriangle,
        square: _shapes.drawSquare,
        ring: _shapes.drawRing
        /*pentagon: drawPentagon,
        hexagon: drawHexagon*/
    };
    var shapes = Object.keys(renderMap);

    // BEGIN RENDERING

    if (opts.drawShadows) {
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 3 * SCALE / 400;
        ctx.shadowBlur = 10 * SCALE / 400;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    }

    var shapeOpts = {};

    // mostly, lock them to centerline. Else, nudge each left or right
    var centers = [];
    if (Math.random() < 0.66) {
        centers = [cw / 2, cw / 2, cw / 2];
        shapeOpts.angle = 0;
    } else {
        centers = [cw * (0, _utils.randomInRange)(0.4, 0.6), // shape 1
        cw * (0, _utils.randomInRange)(0.4, 0.6), // shape 2
        cw * (0, _utils.randomInRange)(0.2, 0.8)];
        shapeOpts.angle = (0, _utils.randomInRange)(-1, 1) * Math.PI / 2;
    }

    // Fill utilties
    var getGradientFill = (0, _utils.getLocalGradientFunction)(opts.palette);

    // add one or two bg blocks
    ctx.fillStyle = getGradientFill(ctx, cw / 2, ch / 2, LONG);
    ctx.fillRect(0, 0, cw, ch);
    if (Math.random() < 0.5) {
        var hr = (0, _utils.randomInRange)(3, 12) * cw;
        var hy = hr + (0, _utils.randomInRange)(0.5, 0.85) * ch;
        (0, _shapes.drawCircle)(ctx, centers[2], hy, hr, { fill: (0, _utils.getGradientFunction)(opts.palette)(ctx, cw, ch) });
    }

    // draw two shape layers in some order:
    // shuffle shape list
    shapes.sort(function (a, b) {
        return (0, _utils.randomInRange)(-1, 1);
    });

    // pop a renderer name, get render func and execute X 2
    var _y = void 0;
    var _size = void 0;

    _y = ch * (0, _utils.randomInRange)(0.3, 0.7);
    _size = cw * (0, _utils.randomInRange)(0.25, 0.35);
    renderMap[shapes.pop()](ctx, centers[0], _y, _size, {
        angle: shapeOpts.angle,
        fill: getGradientFill(ctx, centers[0], _y, _size)
    });

    _y = ch * (0, _utils.randomInRange)(0.3, 0.7);
    _size = cw * (0, _utils.randomInRange)(0.25, 0.35);
    renderMap[shapes.pop()](ctx, centers[1], _y, _size, {
        angle: shapeOpts.angle,
        fill: getGradientFill(ctx, centers[1], _y, _size)
    });

    // Add effect elements
    // ...

    // add noise
    if (opts.addNoise) {
        if (opts.noiseInput) {
            _noiseutils2.default.applyNoiseCanvas(el, opts.noiseInput);
        } else {
            _noiseutils2.default.addNoiseFromPattern(el, opts.addNoise, cw / 3);
        }
    }

    // END RENDERING

    // if new canvas child was created, append it
    if (newEl) {
        container.appendChild(el);
    }
}

/***/ }),
/* 15 */
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

    var drawOpts = Object.assign({}, opts);

    // bg styles
    var BG = void 0;
    if (opts.bg === 'auto') {
        BG = (0, _utils.randItem)([].concat(BGLIST));
        //console.log('auto bg, picked', BG);
    } else {
        BG = opts.bg;
    }

    drawOpts.bg = BG;

    // rendering styles
    var drawShapeMask = Math.random() >= 0.3333; // should we draw a shape-masked line set?

    var blendStyle = 'none'; // ['none', 'fg', 'bg']
    var blendSeed = Math.random(); // should blend overlay apply to fg, bg, or neither?

    // we set drawShapeMask and blendStyle now so we can apply the corresponding
    // overlay options when doing multi-section rendering below.
    if (drawShapeMask) {
        if (blendSeed <= 0.25) {
            blendStyle = 'fg';
        } else if (blendSeed <= 0.50) {
            blendStyle = 'bg';
        }
    }

    // debug
    //blendStyle = 'none';

    if (drawOpts.bg === 'gradient') {
        // if we will blend, specify a gradient now and re use it
        drawOpts.blendColors = (0, _utils.getGradientFunction)(opts.palette)(ctx, cw, ch);
    }

    if (blendStyle === 'bg') {
        drawOpts.overlay = 'blend';
    }

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
            Object.assign(drawOpts, { overlay: 'blend' });
        } else {
            Object.assign(drawOpts, { overlay: 'none' });
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
            ctx.fillStyle = opts.blendColors || (0, _utils.getGradientFunction)(opts.palette)(ctx, w, h);
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
            ctx.fillStyle = opts.blendColors || (0, _utils.getGradientFunction)(opts.palette)(ctx, w, h);
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
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.waves = waves;

var _noiseutils = __webpack_require__(1);

var _noiseutils2 = _interopRequireDefault(_noiseutils);

var _palettes = __webpack_require__(2);

var _palettes2 = _interopRequireDefault(_palettes);

var _utils = __webpack_require__(0);

var _shapes = __webpack_require__(3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var PI = Math.PI;

var DETAILS = ['coarse', 'fine'];
var STYLES = ['solid', 'dotted', 'dashed'];
var COLORMODES = ['solid', 'gradient'];

var DEFAULTS = {
    container: 'body',
    palette: _palettes2.default.south_beach,
    detail: 'auto', // enum from DETAILS
    style: 'auto', // enum from STYLES
    colorMode: 'auto', // from FILLS
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
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

// a series of smooth curves with a filled base layer, and then
// variants of the path.
// @w: width
// @h: height
// @count: the number of peaks
// @depth: the number of variant lines
// @amp: amplitude of the wave/trough

function waveband(ctx, x, y, w, h, count, amp, depth, options) {
    var opts = Object.assign({}, options);
    var _lineWidth = ctx.lineWidth;
    var _yoffset = 0;
    var depthStep = amp / (depth + 1);
    if (depth > 5) {
        depthStep += amp / depth;
        //depthStep = depthStep * Math.pow(1.1, depthStep - 5);
    }
    for (var i = 0; i < depth; i++) {
        if (i === 0) {
            // start with a thick solid line
            ctx.setLineDash([]);
            ctx.lineWidth = _lineWidth * (0, _utils.randomInRange)(1.5, 2);
        } else {
            // after, go thinner, and sometimes dotted

            var dashLength = void 0;

            if (opts.style === 'dotted') {
                // dotted lines. keep thicker line weight
                ctx.lineWidth = _lineWidth * 1.5;
                ctx.lineCap = 'round';
                dashLength = _lineWidth * (1 + i) + _lineWidth * .5;
                ctx.setLineDash([0, dashLength]);
                ctx.lineDashOffset = (0, _utils.randomInRange)(-dashLength, 0);
            } else if (opts.style === 'dashed') {
                // dashed lines, which should be thinner
                ctx.lineWidth = _lineWidth;
                ctx.setLineDash([_lineWidth * (depth - i + 1), _lineWidth * 2]);
                ctx.lineDashOffset = (0, _utils.randomInRange)(-_lineWidth * 2, 0);
            } else {
                ctx.lineWidth = _lineWidth;
            }
            opts.fill = null; // after the first pass, remove the fill, so lines overlap
        }

        _yoffset = i * depthStep;
        wavepath(ctx, x, y + _yoffset, w, h - depthStep * i, count, amp, opts);
    }
    // reset lineWidth in case depth = 0;
    ctx.lineWidth = _lineWidth;
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;
}

var WAVELET_DEFAULTS = {
    width: 200,
    rise: 60,
    dip: 30,
    skew: 0.5

    // a peaky little wavelet shape, stands alone
};function wavelet(ctx, x, y, options) {
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

// a pattern of wavelet() renderings
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
    var SCALE = Math.min(cw, ch);
    var LONG = Math.max(cw, ch);
    var SHORT = Math.min(cw, ch);

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

    // Options
    var DETAIL = opts.detail === 'auto' ? (0, _utils.randItem)(DETAILS) : opts.detail;
    var STYLE = opts.style === 'auto' ? (0, _utils.randItem)(STYLES) : opts.style;
    var COLORMODE = opts.colorMode === 'auto' ? (0, _utils.randItem)(COLORMODES) : opts.colorMode;
    var JITTER = (0, _utils.randomInRange)(0.05, 0.25);

    console.log('==================================\nWaves:', DETAIL, STYLE, COLORMODE, JITTER.toPrecision(2));

    var depthRange = [5, 5];
    if (DETAIL === 'coarse') {
        depthRange = [4, 6];
    } else if (DETAIL === 'fine') {
        depthRange = [7, 14];
    }

    ctx.strokeStyle = "black";
    ctx.fillStyle = "#" + Math.random().toString(16).slice(2, 8);

    // setup

    var contrastPalette = [].concat(opts.palette);
    contrastPalette = (0, _utils.shuffle)(contrastPalette);
    var bg = contrastPalette.pop();

    var getSolidFill = (0, _utils.getSolidColorFunction)(contrastPalette);
    var getGradientFill = (0, _utils.getLocalGradientFunction)(contrastPalette);

    var fg = getSolidFill();

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);

    var renderer;
    var renderMap = {
        circle: _shapes.drawCircle,
        //triangle: drawTriangle,
        //square: drawSquare,
        rectangle: _shapes.drawRect
        //box: drawBox,
        //ring: drawRing,
        //pentagon: drawPentagon,
        //hexagon: drawHexagon
    };
    var shapes = Object.keys(renderMap);

    // test bands
    // --------------------------------------


    //wavecurve(ctx, 200, 200, 100, 100, {depth: 5});

    //wavelet(ctx, 200, 400, 100, 100, {depth: 5, sign: 1})

    //waveset(ctx, 0, 0, 800, 800, {wl: 120, wh: 60, dense: 0.35, skew: 0.65});

    //waveband(ctx, 0, 100, cw, 60, 4, 50, 5, {fill: getSolidFill(opts.palette)});

    //waveband(ctx, 0, 100, cw, 120, 3, 50, 3, {fill: getSolidFill(opts.palette)});
    //waveband(ctx, 0, 300, cw, 120, 3, 50, 5, {fill: getSolidFill(opts.palette)});
    //waveband(ctx, 0, 500, cw, 120, 3, 50, 10, {fill: getSolidFill(opts.palette)});


    var strokeColor = Math.random() > 0.5 ? 'white' : 'black';

    var waveStart = void 0,
        waveEnd = void 0;
    waveStart = waveEnd = cw / 2;
    if (Math.random < 0.99995) {
        waveStart *= (0, _utils.randomInRange)(0.8, 1.2);
        waveEnd *= (0, _utils.randomInRange)(0.8, 1.2);
    }
    var waveGradient = function waveGradient(y1, y2) {
        var grad = ctx.createLinearGradient(waveStart, y1, waveEnd, y2);
        grad.addColorStop(0, fg);
        grad.addColorStop(1, bg);
        return grad;
    };

    // cover the canvas in a stack of bands of similar waves
    function simpleCover() {
        var y = 0;
        var x = 0;
        var h_shift = 0;
        var amp = void 0;
        var h = void 0;
        var count = void 0;
        var bandCount = (0, _utils.randomInRange)(10, 40); // number of horizontal bands
        var interval = ch / (bandCount - 1); // px per stripe


        // low or high number of peaks
        // magic number: pleasing waves are about twice as long as they are high
        // this is the max frequency or count to use.
        var baseCount = bandCount * (cw / ch) * 0.5;

        // actual baseCount should be lower
        baseCount *= (0, _utils.randomInRange)(0.2, 0.75);

        // pick line weight from canvas size and number of bands
        var weight = SCALE / 1600 * (0, _utils.randomInRange)(1, 3) + interval / 50;
        ctx.lineWidth = weight;

        y = -interval; // start above the top
        var max_shift = cw / baseCount; // max left offset is one wave

        for (var i = 0; i < bandCount; i++) {
            amp = interval * (0, _utils.randomInRange)(0.75, 1);
            h = interval * 3;

            // shift down if amplitude is less than interval
            y += (interval - amp) / 2;

            // Floating shapes!
            if (Math.random() < 0.3) {
                var _size = SCALE / 8;
                var _x = x + cw * (0, _utils.randomInRange)(0, 1);
                var _y = y + (0, _utils.randomInRange)(_size / 4, _size);
                renderMap[(0, _utils.randItem)(shapes)](ctx, _x, _y, _size, {
                    stroke: strokeColor,
                    fill: getGradientFill(ctx, _x, _y, _size),
                    angle: (0, _utils.randomInRange)(-PI / 4, PI / 4)
                });
            }

            // variation in wave count between bands
            count = Math.ceil(baseCount * (0, _utils.randomInRange)(1, 1.2));
            //count = baseCount;

            // horizontal offsets for natural appearance
            x = -(0, _utils.randomInRange)(0, max_shift);

            var waveFill = bg;
            if (COLORMODE === 'gradient') {
                waveFill = waveGradient(y, y + h * (0, _utils.randomInRange)(1, 2));
            }

            // ctx, x, y, w, h, wavecount, amp, stackdepth, opts
            waveband(ctx, x, y, cw + max_shift, h, count, amp, _utils.randomInt.apply(undefined, _toConsumableArray(depthRange)), {
                fill: waveFill,
                stroke: strokeColor,
                jitter: JITTER,
                style: STYLE
            });

            // step down
            y += interval;
        }
    }

    function nearFar() {
        var y = 0;
        var x = 0;
        var h_shift = 0;
        var amp = void 0;
        var h = void 0;
        var count = void 0;
        var bandCount = 34;
        var interval = ch / bandCount;

        for (var i = 0; i < bandCount; i++) {
            count = Math.max((0, _utils.randomInRange)(bandCount - 2 - i, bandCount + 2 - i), 0.5);
            //count = bandCount/2 + bandCount/2 - (i/2) + randomInt(0, 3);
            count = bandCount - i;
            count = Math.ceil(count);
            amp = 55 / count + i * 1;
            y += amp * 1;
            h = amp * 9;

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
/* 17 */
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
/* 18 */,
/* 19 */
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
    var count = Math.round((0, _utils.randomInRange)(SCALE / 200, SCALE / 80));
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
    //bg = 'white';


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

    // mode
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

        // threshold to draw or not draw at a given cell
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
                var segments = (0, _utils.randItem)([1, 1, 1, 2, 2, 2, 3, 3, 3, 4]);
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
        var c1 = (0, _utils.randomInRange)(0.125, 0.25);
        var c2 = (0, _utils.randomInRange)(.4, 0.8);

        //c1 = 0.00025;
        //c2 = 0.8;

        //c2 = 10;

        var dotScale = (0, _utils.randomInRange)(0.1, 0.5);
        var dotMin = (0, _utils.randomInRange)(0, 0.5 - dotScale);
        var dotFill = getContrastColor();
        var dotSign = Math.random() < 0.5;

        //dotFill = '#ffcc00';
        //dotFill = '#2222aa';

        var xref = Math.random();
        var yref = Math.random();
        if (Math.random() < 0.9999995) {
            xref = yref = 0.5;
        }

        var crossDots = true; //Math.random() < 0.5;
        var crossFill = Math.random() < 0.5 ? fg : bg;
        crossFill = bg;
        var crossScale = (0, _utils.randomInRange)(0.25, .3) * w;

        var cr = void 0;

        var crossPattern = function crossPattern(r) {
            (0, _shapes.drawCircle)(ctx, w * r, h / 2, w * r, { fill: null, stroke: fg });
            (0, _shapes.drawCircle)(ctx, -w * (r - 1), h / 2, w * r, { fill: null, stroke: fg });

            (0, _shapes.drawCircle)(ctx, w / 2, h * r, w * r, { fill: null, stroke: fg });
            (0, _shapes.drawCircle)(ctx, w / 2, -h * (r - 1), h * r, { fill: null, stroke: fg });
        };

        // base line weight
        var weight = (0, _utils.randomInRange)(1, w / 60);
        var gridWeight = weight * (0, _utils.randItem)([1, 1.5, 2]);
        var crossWeight = weight * (0, _utils.randItem)([1, 1.5, 2]);

        ctx.lineWidth = weight;
        console.log('cell width', w, 'line', weight);

        var gridR = w / 2;
        gridR = w * (0, _utils.randomInRange)(0.125, 0.5);

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

                ctx.lineWidth = gridWeight;
                // fg = '#000099';
                // fg = '#2222aa';

                (0, _shapes.drawCircle)(ctx, 0, 0, gridR, { fill: null, stroke: fg });
                (0, _shapes.drawCircle)(ctx, w, 0, gridR, { fill: null, stroke: fg });
                (0, _shapes.drawCircle)(ctx, w, h, gridR, { fill: null, stroke: fg });
                (0, _shapes.drawCircle)(ctx, 0, h, gridR, { fill: null, stroke: fg });

                // fg = '#990000';
                // fg = '#2222aa';
                ctx.lineWidth = crossWeight;

                crossPattern(c1);
                crossPattern(c2);

                if (crossDots && i % 2 === j % 2) {
                    (0, _shapes.drawCircle)(ctx, w / 2, h / 2, crossScale, { fill: crossFill, stroke: fg });
                }

                cr = Math.sqrt(Math.pow(xnorm - xref, 2) + Math.pow(ynorm - yref, 2)) / .7071;
                if (dotSign) {
                    cr = 1 - cr;
                }
                cr = Math.abs(cr);

                (0, _shapes.drawCircle)(ctx, w / 2, h / 2, dotMin + dotScale * w * cr, { fill: dotFill, stroke: fg });

                // drawCircle(ctx,
                //     w/2,
                //     h/2,
                //     dotMin + dotScale * w * cr + ctx.lineWidth * 2,
                //     {fill: null, stroke: fg});


                // unshift, unclip
                ctx.restore();
                (0, _utils.resetTransform)(ctx);
            }
        }
    }

    // gather our modes
    var modes = [snakes, rings, pattern];
    //modes = [pattern];

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
/* 20 */
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
/* 21 */
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
        ctx.moveTo(d * w + w / 2 + ctx.lineWidth, i * h + h / 2);
        ctx.lineTo(cw, i * h + h / 2);
        ctx.strokeStyle = rightColor;
        ctx.stroke();
    };

    var leftLine = function leftLine(d, i) {
        ctx.beginPath();
        ctx.moveTo(d * w - w / 2 - ctx.lineWidth, i * h + h / 2);
        ctx.lineTo(0, i * h + h / 2);
        ctx.strokeStyle = leftColor;
        ctx.stroke();
    };

    var downLine = function downLine(d, i) {
        ctx.beginPath();
        ctx.moveTo(i * w + w / 2, d * h + h / 2 + ctx.lineWidth);
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
/* 22 */
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
/* 23 */
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

var _hexScatter = __webpack_require__(5);

var _hexScatter2 = _interopRequireDefault(_hexScatter);

var _utils = __webpack_require__(0);

var _shapes = __webpack_require__(3);

var _fieldUtils = __webpack_require__(7);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULTS = {
    container: 'body',
    palette: _palettes2.default.de_stijl,
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true,
    colorMode: 'auto', // from COLORMODES or 'auto'
    fieldMode: 'auto', // [auto, harmonic, flow]
    lightMode: 'normal', // [auto, bloom, normal]
    gridMode: 'auto', // [auto, normal, scatter, random]
    density: 'auto' // [auto, coarse, fine]
};

var PI = Math.PI;
var FIELDMODES = ['harmonic', 'flow'];
var LIGHTMODES = ['bloom', 'normal'];
var GRIDMODES = ['normal', 'scatter', 'random'];
var DENSITIES = ['coarse', 'fine'];
var COLORMODES = ['single', 'angle', 'random'];

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
    var FIELDMODE = opts.fieldMode === 'auto' ? (0, _utils.randItem)(FIELDMODES) : opts.fieldMode;
    var COLORMODE = opts.colorMode === 'auto' ? (0, _utils.randItem)(COLORMODES) : opts.colorMode;

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
    console.log('Field: ' + DENSITY + '(' + cellSize + 'px) ' + GRIDMODE + ' ' + FIELDMODE + ' ' + COLORMODE);

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

    // set default tail color
    ctx.strokeStyle = fg;
    // set default dot color
    var dotFill = fg2;

    var rateMax = 3;
    if (DENSITY === 'fine' && Math.random() < 0.5) {
        rateMax = 6;
    }

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
    var lineScale = (0, _utils.randomInRange)(0.7, 2);

    // Displace the center point of each cell by this factor
    // Only do this sometimes, and not when scattering
    var warp = 0;
    if (GRIDMODE !== 'scatter' && Math.random() < 0.5) {
        warp = (0, _utils.randomInRange)(0.75, Math.sqrt(2));
    }

    // Pick an opacity transform to use
    var opacityFunc = (0, _utils.randItem)((0, _fieldUtils.opacityTransforms)(maxLen));

    // a set of independent transforms to use while rendering
    var trans = {
        xbase: (0, _fieldUtils.createTransform)(rateMax), // (x,y)=>0,//
        ybase: (0, _fieldUtils.createTransform)(rateMax), // (x,y)=>0,//
        xtail: (0, _fieldUtils.createTransform)(rateMax), // (x,y)=>0,//
        ytail: (0, _fieldUtils.createTransform)(rateMax), // (x,y)=>0,//
        radius: (0, _fieldUtils.createTransform)(rateMax)
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
            y = size * (Math.floor(i / xcount) - 1) + size / 2;
            pts.push([x, y]);
        }
        return pts;
    }

    var pts = [];

    // If we are warping the grid, we should plot points outside of the canvas
    // bounds to avoid gaps at the edges. Shift them over below.
    var overscan = 1;
    if (warp) {
        overscan = 1.2;
    }

    switch (GRIDMODE) {
        case 'scatter':
            pts = (0, _hexScatter2.default)(cellSize, cw * overscan, ch * overscan);
            break;
        case 'random':
            pts = randomScatter(cellSize, cw * overscan, ch * overscan);
            break;
        default:
            pts = placeNormal(cellSize, cw * overscan, ch * overscan);
    }

    // compensate for overscan by shifting pts back
    if (warp) {
        pts.map(function (p, i) {
            return [p[0] - cw * .1, p[1] - ch * .1];
        });
    }

    var sourceTransform = (0, _fieldUtils.createSourceSinkTransform)(Math.round((0, _utils.randomInRange)(5, 15)));

    // Flags for coloring by angle
    // Don't do special coloring in bloom mode, because it relies on grayscale
    // initial rendering
    var colorTailByAngle = false;
    var colorDotByAngle = false;
    var randomColorThreshold = void 0;
    if (LIGHTMODE !== 'bloom') {
        if (COLORMODE === 'angle') {
            if (Math.random() < 0.6) {
                colorTailByAngle = true;
            }
            if (Math.random() < 0.6) {
                colorDotByAngle = true;
            }
        }
        if (COLORMODE === 'random') {
            randomColorThreshold = 0.66;
        }
    }

    // console.log(`Colors: tails ${colorTailByAngle}, dots: ${colorDotByAngle}`);

    // source/sink stuff
    if (FIELDMODE === 'flow') {
        var totalStrength = 0;
        sourceTransform.sources.forEach(function (source) {
            totalStrength += source.strength;
        });
        lineScale = 1 / totalStrength;
    }

    // step thru points
    pts.forEach(function (p, i) {
        x = p[0];
        y = p[1];
        xnorm = x / cw;
        ynorm = y / ch;

        // shift base points to their warped coordinates
        x = x + cellSize * trans.xbase(xnorm, ynorm) * warp;
        y = y + cellSize * trans.ybase(xnorm, ynorm) * warp;

        // get end of tail coords
        if (FIELDMODE === 'flow') {
            // flow fields (source-sink)
            var flow = sourceTransform.t(xnorm, ynorm);
            _x = flow[0];
            _y = flow[1];
        } else {
            // harmonic fields
            _x = trans.xtail(xnorm, ynorm);
            _y = trans.ytail(xnorm, ynorm);
        }

        var theta = Math.atan2(_y, _x);
        var fillIndex = Math.round(contrastPalette.length * theta / PI / 2);
        var angleColor = contrastPalette[fillIndex];

        if (colorDotByAngle) {
            dotFill = angleColor;
        }
        if (COLORMODE === 'random' && Math.random() < randomColorThreshold) {
            dotFill = getContrastColor();
        }

        // draw dot
        ctx.globalAlpha = 1;
        (0, _shapes.drawCircle)(ctx, x, y, (trans.radius(xnorm, ynorm) + 1) * dotScale, { fill: dotFill });

        ctx.globalAlpha = opacityFunc(_x, _y);

        if (colorTailByAngle) {
            ctx.strokeStyle = angleColor;
        }
        if (COLORMODE === 'random' && Math.random() < randomColorThreshold) {
            ctx.strokeStyle = getContrastColor();
        }

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
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.fragments = fragments;

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
    palette: _palettes2.default.blush,
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
/* 25 */,
/* 26 */,
/* 27 */,
/* 28 */,
/* 29 */,
/* 30 */,
/* 31 */,
/* 32 */,
/* 33 */,
/* 34 */,
/* 35 */,
/* 36 */,
/* 37 */,
/* 38 */,
/* 39 */,
/* 40 */,
/* 41 */,
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(6);

var _noiseutils = __webpack_require__(1);

var _noiseutils2 = _interopRequireDefault(_noiseutils);

var _palettes = __webpack_require__(2);

var _palettes2 = _interopRequireDefault(_palettes);

var _waterline = __webpack_require__(9);

var _shapestack = __webpack_require__(11);

var _shapescape = __webpack_require__(14);

var _lines = __webpack_require__(15);

var _waves = __webpack_require__(16);

var _grid = __webpack_require__(17);

var _circles = __webpack_require__(19);

var _mesh = __webpack_require__(20);

var _walk = __webpack_require__(21);

var _bands = __webpack_require__(22);

var _field = __webpack_require__(23);

var _fragments = __webpack_require__(24);

var _utils = __webpack_require__(0);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Renderers
var RENDERERS = {
    waterline: _waterline.waterline,
    shapestack: _shapestack.shapestack,
    shapescape: _shapescape.shapescape,
    lines: _lines.lines,
    //grid: grid,
    //circles: circles,
    mesh: _mesh.mesh,
    walk: _walk.walk,
    field: _field.field
    //bands: bands,
    //fragments: fragments,
    //waves: waves
};
var initRenderer = (0, _utils.randItem)(Object.keys(RENDERERS)); //'waterline';

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
    container: document.querySelector('#art'),
    clear: true,
    dust: true,
    skew: 1,
    addNoise: 0.04,
    noiseInput: _noiseutils2.default.createNoiseCanvas(0.04, 200)
};

var artNode = document.getElementById('art');

// @fast skips re-rendering the canvas in place as an img,
// which makes for easy saving but slows down rendering
function loadOpts(opts, fast) {
    var img = artNode.querySelector('img');
    img && img.remove();
    visualOpts = Object.assign(visualOpts, opts);
    // render art
    Renderer(visualOpts);
    // set up main download link
    var a = document.getElementById('downloadArt');
    a.onclick = function () {
        return doDownload(a, document.querySelector('#art canvas'));
    };
}

// Handlers for redraw, batching, and manual saving
var timer = void 0; // handle for main timer
var timerBar = document.getElementById('timerBar');
// function redraws automatically. resets renderer every few draws
function resetTimer() {
    clearInterval(timer);
    var counter = 0;
    // remove the animation class from the bar
    timerBar && timerBar.classList.remove('playing');
    // do this in a new frame so we can reset the css animation
    requestAnimationFrame(function () {
        timerBar && timerBar.classList.add('playing');
        timer = setInterval(function () {
            counter++;
            if (counter > 2) {
                setRenderer((0, _utils.randItem)(Object.keys(RENDERERS)));
            } else {
                drawNew();
            }
        }, 6000);
    });
}

function drawNew() {
    removePreview();
    requestAnimationFrame(loadOpts);
    showMain();
}

function drawAndReset() {
    resetTimer();
    drawNew();
}
window.drawNew = drawNew;

document.addEventListener('keydown', function (e) {
    var kode = e.which || e.keyCode;
    if (kode === 32) {
        // space
        drawAndReset();
        e.preventDefault();
        return false;
    } else if (kode === 37 || kode === 39) {
        // left/right arrows
        setRenderer((0, _utils.randItem)(Object.keys(RENDERERS)));
        drawAndReset();
        e.preventDefault();
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

    var canvas = document.querySelector('#art canvas');
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
    return drawAndReset({});
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
    artNode.className = artNode.className.replace(/isHidden/g, '');
}

function hideMain() {
    if (artNode.className.indexOf('isHidden') === -1) {
        artNode.className += 'isHidden ';
    }
}

// expose for play
window.visualOpts = visualOpts;

// draw to start
setRenderer(initRenderer);
resetTimer();

/***/ })
/******/ ]);