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
/******/ 	return __webpack_require__(__webpack_require__.s = 50);
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
exports.friendlyBoolean = friendlyBoolean;
exports.Note = Note;

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

// Get boolean value, but be friendly to "false" passed as string
function friendlyBoolean(prop) {
    if (prop === 'false') return false;
    return !!prop;
}

function Note() {
    var divider = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
    var time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    var msgs = [];
    var start_ts = new Date().getTime();
    var end_ts = start_ts;
    this.add = function (t) {
        msgs.push(t);
    };
    this.first = function (t) {
        msgs.unshift(t);
    };
    this.print = function () {
        return msgs.join('\n');
    };
    this.log = function () {
        if (time) {
            end_ts = new Date().getTime();
            this.add('> Ran in ' + (end_ts - start_ts) + 'ms');
        }
        if (divider) {
            this.first('------------------------------');
        }
        console.log(this.print());
    };
    return this;
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
exports.drawCross = drawCross;
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

function drawCross(ctx, x, y, r, opts) {
    ctx.strokeStyle = opts.stroke || opts.fill;
    ctx.beginPath();
    ctx.moveTo(x - r, y);
    ctx.lineTo(x + r, y);
    ctx.moveTo(x, y - r);
    ctx.lineTo(x, y + r);
    ctx.stroke();
}

/***/ }),
/* 4 */
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
/* 5 */
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
/* 6 */
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
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.speckle = speckle;
exports.donegal = donegal;
exports.dapple = dapple;

var _hexScatter = __webpack_require__(4);

var _hexScatter2 = _interopRequireDefault(_hexScatter);

var _utils = __webpack_require__(0);

var _shapes = __webpack_require__(3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PI = Math.PI;

/**
 * Speckle the canvas little squares and shapes. This redraws existing canvas
 * @canvas to speckle
 * @speckleSize the size of placed dots
 * @spacing the empty cell size around each dot, relative to speckelSize
 * @fillWith an optional param, accepts "sample", "random", or
 * a function(p) which returns a color, where p = [x,y].
 * If fillWith is not supplied or is not a function, it defaults to "sample"
 * The "random" mode still samples, but from another random point.
 */
function speckle(canvas) {
    var speckleSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;
    var spacing = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 4;
    var fillWith = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'sample';

    var ctx = canvas.getContext('2d');
    var cw = canvas.width;
    var ch = canvas.height;

    // create speckle points
    var speckles = (0, _hexScatter2.default)(speckleSize * spacing, cw, ch);
    // placeholder coloring func
    var speckleColor = void 0;

    // if custom color func was passed, use that.
    // otherwise sample from the image data
    if (typeof fillWith === 'function') {
        // use supplied color generator
        speckleColor = fillWith;
    } else if (fillWith === 'random') {
        // random mode samples from random other points on canvas
        var px = ctx.getImageData(0, 0, cw, ch).data;
        speckleColor = function speckleColor(p) {
            // sample from random point
            p = [(0, _utils.randomInt)(0, cw), (0, _utils.randomInt)(0, ch)];
            var i = 4 * (Math.round(p[0]) + Math.round(p[1]) * cw);
            var sample = px.slice(i, i + 3);
            return 'rgba(' + sample.join(',') + ')';
        };
    } else {
        // default is "sample" mode
        var _px = ctx.getImageData(0, 0, cw, ch).data;
        speckleColor = function speckleColor(p) {
            var i = 4 * (Math.round(p[0]) + Math.round(p[1]) * cw);
            var sample = _px.slice(i, i + 3);
            return 'rgba(' + sample.join(',') + ')';
        };
    }

    // draw a speckle at each point
    speckles.forEach(function (p, i) {
        // skip a fraction of pts for more irregularity
        if (Math.random() < 0.8) {
            (0, _shapes.drawSquare)(ctx, p[0], p[1], speckleSize, {
                fill: speckleColor(p),
                angle: (0, _utils.randomInRange)(0, PI)
            });
        };
    });
}

/**
 * Run multiple passes of speckle(), designed to make a nice donegal fabric
 * appearance. Runs in dense "sample" mode to break up edges, and does a
 * sparse pass in "random" mode or another func supplied in @fillWith
 */
function donegal(canvas) {
    var fillWith = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "random";

    var SCALE = Math.min(canvas.width, canvas.height);
    // coarse sampled speckles to break edges
    speckle(canvas, SCALE * (0, _utils.randomInRange)(.0015, .0030), 4, 'sample');
    // random speckles, widely spaced, for donegal look
    speckle(canvas, SCALE * (0, _utils.randomInRange)(.0010, .0020), (0, _utils.randomInt)(20, 40), fillWith);
    // finer sampled speckles to break edges more
    speckle(canvas, SCALE * (0, _utils.randomInRange)(.0010, .0020), 3, 'sample');

    // conditional, finer still:
    if (SCALE > 1600) {
        // finer sampled speckles to break edges more
        speckle(canvas, SCALE * (0, _utils.randomInRange)(.0005, .0010), 3, 'sample');
    }
}

function dapple(canvas) {
    var SCALE = Math.min(canvas.width, canvas.height);
    // coarse sampled speckles to break edges
    speckle(canvas, SCALE * (0, _utils.randomInRange)(.0016, .0032), (0, _utils.randomInt)(5, 8), 'sample');
    // medium
    speckle(canvas, SCALE * (0, _utils.randomInRange)(.0012, .0024), (0, _utils.randomInt)(4, 7), 'sample');
    // finer sampled speckles to break edges more
    speckle(canvas, SCALE * (0, _utils.randomInRange)(.0008, .0016), (0, _utils.randomInt)(3, 5), 'sample');

    // conditional, finer still:
    if (SCALE > 1600) {
        // finer sampled speckles to break edges more
        speckle(canvas, SCALE * (0, _utils.randomInRange)(.0004, .0008), (0, _utils.randomInt)(3, 5), 'sample');
    }
}

/***/ }),
/* 8 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 9 */
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
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.defineWaterline = defineWaterline;
exports.drawWaterline = drawWaterline;
exports.waterline = waterline;

var _waterlineSchema = __webpack_require__(11);

var _noiseutils = __webpack_require__(1);

var _noiseutils2 = _interopRequireDefault(_noiseutils);

var _palettes = __webpack_require__(2);

var _palettes2 = _interopRequireDefault(_palettes);

var _utils = __webpack_require__(0);

var _colors = __webpack_require__(5);

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
/* 11 */
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
/* 12 */
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

var _stacks = __webpack_require__(13);

var _nests = __webpack_require__(14);

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
/* 13 */
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
/* 14 */
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
/* 15 */
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
/* 16 */
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
    var renderStyle = opts.renderStyle;

    if (!renderStyle || renderStyle == 'auto') {
        if (Math.random() > 0.5) {
            renderStyle = 'wave';
        } else {
            renderStyle = 'jagged';
        }
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
/* 17 */
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
/* 18 */
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
    style: 'auto', // ['masked', 'layers']
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
    var STYLE = opts.style;
    if (!STYLE || STYLE == 'auto') {
        (0, _utils.randItem)(modes)();
    } else {
        if (STYLE === 'masked') {
            maskAndRotate();
        }
        if (STYLE === 'layers') {
            layers();
        }
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
/* 19 */
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

    style: 'auto', // one of modes
    layer: 'auto', // true | false | auto
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

    var secondLayer = void 0;
    if (opts.layer === true || opts.layer === 'true') {
        secondLayer = true;
    }
    if (opts.layer === false || opts.layer === 'false') {
        secondLayer = false;
    }
    if (opts.layer === null || opts.layer === undefined || opts.layer == 'auto') {
        secondLayer = Math.random() < 0.5;
    }

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

    // gather our modes
    var modes = {
        circles: circles,
        triangles: triangles,
        mixed: mixed
    };

    // do the loop with one of our modes
    if (opts.style && modes[opts.style]) {
        renderer = modes[opts.style];
    } else {
        renderer = modes[(0, _utils.randItem)(Object.keys(modes))];
    }
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
/* 20 */
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

var _colors = __webpack_require__(5);

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
        ctx.beginPath();
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
    var modes = { snakes: snakes, rings: rings, pattern: pattern };

    // do the loop with one of our modes
    if (opts.style && modes[opts.style]) {
        renderer = modes[opts.style];
    } else {
        renderer = modes[(0, _utils.randItem)(Object.keys(modes))];
    }
    renderer();

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
/* 22 */
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
/* 23 */
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

var _colors = __webpack_require__(5);

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
/* 24 */
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

var _hexScatter = __webpack_require__(4);

var _hexScatter2 = _interopRequireDefault(_hexScatter);

var _utils = __webpack_require__(0);

var _shapes = __webpack_require__(3);

var _fieldUtils = __webpack_require__(6);

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
    density: 'auto', // [auto, coarse, fine]
    fieldNoise: 'auto' // mapped to values below
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
    var FIELDNOISE = (0, _utils.mapKeywordToVal)({
        // hacky way to weight options by redundantly specifying
        'none': 0,
        'none2': 0,
        'low': 0.125,
        'low2': 0.125,
        'med': 0.25,
        'high': 0.5
    })(opts.fieldNoise, 'fieldNoise');

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

        var xNoise = 0;
        var yNoise = 0;
        if (FIELDNOISE > 0) {
            xNoise = (0, _utils.randomInRange)(-1, 1) * FIELDNOISE;
            yNoise = (0, _utils.randomInRange)(-1, 1) * FIELDNOISE;
        }

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

        _x += xNoise;
        _y += yNoise;

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
/* 25 */
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
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.duos = duos;

var _noiseutils = __webpack_require__(1);

var _noiseutils2 = _interopRequireDefault(_noiseutils);

var _palettes = __webpack_require__(2);

var _palettes2 = _interopRequireDefault(_palettes);

var _shapes = __webpack_require__(3);

var _utils = __webpack_require__(0);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SILVERS = ['#ffffff', '#f2f2f2', '#eeeeee', '#e7e7e7', '#e0e0e0', '#d7d7d7'];

// Tile the container
function duos(options) {
    var defaults = {
        container: 'body',
        palette: _palettes2.default.terra_cotta_cactus,
        drawShadows: false,
        addNoise: 0.04,
        noiseInput: null,
        skew: 1, // normalized skew
        clear: true
    };
    var opts = {};
    opts = Object.assign(Object.assign(opts, defaults), options);

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
        triangle: _shapes.drawExactTriangle,
        square: _shapes.drawSquare,
        ring: _shapes.drawRing
        /*pentagon: drawPentagon,
        hexagon: drawHexagon*/
    };
    var shapes = Object.keys(renderMap);

    // BEGIN RENDERING

    if (opts.drawShadows) {
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 3 * SHORT / 400;
        ctx.shadowBlur = 10 * SHORT / 400;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    }

    var shapeOpts = {};

    // draw two shape layers in some order:
    // shuffle shape list
    shapes.sort(function (a, b) {
        return (0, _utils.randomInRange)(-1, 1);
    });

    var shape1 = renderMap[(0, _utils.randItem)(shapes)];
    var r1 = SHORT * 0.33;
    var x1 = (0, _utils.randomInRange)(r1, cw - r1);
    var y1 = (0, _utils.randomInRange)(r1, ch - r1);
    var a1 = (0, _utils.randomInRange)(-1, 1) * Math.PI / 2;

    var shape2 = renderMap[(0, _utils.randItem)(shapes)];
    var r2 = SHORT * 0.33;
    var x2 = (0, _utils.randomInRange)(r2, cw - r2);
    var y2 = (0, _utils.randomInRange)(r2, ch - r2);
    var a2 = (0, _utils.randomInRange)(-1, 1) * Math.PI / 2;

    // sometimes, lock them to centerline with no angle
    if (Math.random() < 0.2) {
        x1 = x2 = cw / 2;
        a1 = a2 = 0;
    }

    // draw them

    // draw the first shape
    shape1(ctx, x1, y1, r1, {
        angle: a1,
        fill: (0, _utils.getLocalGradientFunction)(opts.palette)(ctx, x1, y1, r1 * (0, _utils.randomInRange)(0.75, 2))
    });

    // draw the second shape twice, using blend modes to draw
    // the intersecting and non-intersecting regions with different colors

    ctx.globalCompositeOperation = 'source-atop';
    shape2(ctx, x2, y2, r2, {
        angle: a2,
        fill: (0, _utils.getLocalGradientFunction)(opts.palette)(ctx, x2, y2, r2 * (0, _utils.randomInRange)(0.75, 2))
    });

    ctx.globalCompositeOperation = 'destination-over';
    shape2(ctx, x2, y2, r2, {
        angle: a2,
        fill: (0, _utils.getLocalGradientFunction)(opts.palette)(ctx, x2, y2, r2 * (0, _utils.randomInRange)(0.75, 2))
    });

    // reset blendmodes
    ctx.globalCompositeOperation = 'normal';
    ctx.lineWidth = SHORT / 800;

    // draw the center points and connecting line
    (0, _shapes.drawCircle)(ctx, x1, y1, SHORT / 150, { fill: 'black' });
    (0, _shapes.drawCircle)(ctx, x2, y2, SHORT / 150, { fill: 'black' });
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = 'black';
    ctx.stroke();

    // draw the shapes again, in black outline
    shape1(ctx, x1, y1, r1, {
        angle: a1,
        fill: null,
        stroke: 'black'
    });

    shape2(ctx, x2, y2, r2, {
        angle: a2,
        fill: null,
        stroke: 'black'
    });

    // rotate the angles for triangle matching
    a1 += Math.PI / 2;
    a2 += Math.PI / 2;

    // OPTIONAL DECORATIONS
    if (Math.random() < 0.5 && x1 !== x2) {
        // EXTEND THE CONNECTING LINE
        //ctx.setLineDash([LONG/150, LONG/100]);
        ctx.strokeStyle = 'black';
        ctx.globalAlpha = (0, _utils.randomInRange)(0.4, 0.6);
        var m = (y2 - y1) / (x2 - x1);
        var b = y1 - m * x1;
        ctx.beginPath();
        ctx.moveTo(0, m * 0 + b);
        ctx.lineTo(cw, m * cw + b);
        ctx.stroke();
        ctx.strokeStyle = 'black';
        //ctx.setLineDash([]);
        ctx.globalAlpha = 1;
    } else if (Math.random() < 0.5 && a1 !== a2) {
        // EXTEND EACH ANGLE LINE
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 + Math.cos(a1) * LONG, y1 + Math.sin(a1) * LONG);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 + Math.cos(a2) * LONG, y2 + Math.sin(a2) * LONG);
        ctx.stroke();
    }

    // draw the background
    // this is done last so we can use blend modes to target the intersections
    // while drawing the shapes. Use the same technique to draw only the
    // unpainted background.
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = (0, _utils.getGradientFunction)(Math.random() < 0.5 ? SILVERS : opts.palette)(ctx, cw, ch);
    ctx.fillRect(0, 0, cw, ch);

    ctx.globalCompositeOperation = 'normal';

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
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.truchetCurves = truchetCurves;

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
    clear: true,

    mode: null,
    count: 0, // 0 for auto, or an integer
    weight: 0, // 0 for auto, or 1-10 for normalized weights
    contrast: true
};

var PI = Math.PI;

// Main function
function truchetCurves(options) {
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

    //mode
    // arcs around opposite corners, other corners blank
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
    // any combination of opposite corners or single corners,
    // with terminals in remaining corners
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

    // mode
    // any permutation of arcs or terminals at each corner;
    function arcs3(background, weight) {
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

                for (var c = 0; c < 4; c++) {
                    // for each corner, randomly choose to either
                    // arc or terminal
                    if (Math.random() < 0.5) {
                        _arc(c, fg);
                    } else {
                        _terminal(weight / 2, c, fg);
                    }
                }

                // unshift, unclip
                ctx.restore();
                (0, _utils.resetTransform)(ctx);
            }
        }
    }

    // gather our modes
    var modes = [arcs, arcs2, arcs3];

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
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.grille = grille;

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
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true,

    inset: 'auto', // or truthy/falsy
    mode: null,
    count: 0, // 0 for auto, or an integer
    weight: 0, // 0 for auto, or 1-10 for normalized weights
    contrast: true
};

var PI = Math.PI;

// Main function
function grille(options) {
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

    // color funcs
    var randomFill = function randomFill() {
        return "#" + Math.random().toString(16).slice(2, 8);
    };
    var getSolidFill = (0, _utils.getSolidColorFunction)(opts.palette);

    // define grid
    var count = Math.round(opts.count) || Math.round((0, _utils.randomInRange)(4, 9));
    var w = Math.floor(cw / count);
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

    // mode settings
    // line weight
    var WEIGHT = void 0;
    if (opts.weight) {
        WEIGHT = 1 + w / 250 * opts.weight;
    } else {
        WEIGHT = 1 + w / 250 * (0, _utils.randomInRange)(1, 10);
    }
    ctx.lineWidth = WEIGHT;

    // Spacing and zoom
    var INSET = void 0;
    if (opts.inset === 'auto') {
        INSET = Math.random() <= 0.5;
    } else {
        INSET = !!opts.inset;
    }
    var ZOOM = INSET ? 1 - 3 * WEIGHT / w : 1;

    // util to draw a square and clip following rendering inside
    function moveAndClip(ctx, x, y, size, color) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(ZOOM, ZOOM);
        ctx.beginPath();
        ctx.rect(-size / 2 - 0.5, -size / 2 - 0.5, size + 1, size + 1);
        ctx.fillStyle = color;
        ctx.closePath();
        ctx.fill();
        ctx.clip();
    }

    // convenience var for center-based boxes
    var d = h / 2;

    // box styles

    var modes = {};

    modes.diag = function () {
        ctx.beginPath();

        ctx.moveTo(-d, -d);
        ctx.lineTo(d, d);

        ctx.moveTo(-d * .5, -d);
        ctx.lineTo(-d, -d * .5);

        ctx.moveTo(0, -d);
        ctx.lineTo(-d, 0);

        ctx.moveTo(d * .5, -d);
        ctx.lineTo(-d, d * .5);

        ctx.moveTo(d, -d);
        ctx.lineTo(-d, d);

        ctx.moveTo(d, -d * .5);
        ctx.lineTo(-d * .5, d);

        ctx.moveTo(d, 0);
        ctx.lineTo(0, d);

        ctx.moveTo(d, d * .5);
        ctx.lineTo(d * .5, d);

        ctx.stroke();
    };

    modes.fan = function () {
        // straight or curved crosspiece?
        var straight = Math.random() > 0.5;

        ctx.beginPath();

        ctx.moveTo(-d, -d);
        ctx.lineTo(-d, d);

        ctx.moveTo(-d, -d);
        ctx.lineTo(-d / 2, d);

        ctx.moveTo(-d, -d);
        ctx.lineTo(0, d);

        ctx.moveTo(-d, -d);
        ctx.lineTo(d / 2, d);

        ctx.moveTo(-d, -d);
        ctx.lineTo(d, d);

        //

        ctx.moveTo(-d, -d);
        ctx.lineTo(d, -d);

        ctx.moveTo(-d, -d);
        ctx.lineTo(d, -d / 2);

        ctx.moveTo(-d, -d);
        ctx.lineTo(d, 0);

        ctx.moveTo(-d, -d);
        ctx.lineTo(d, d / 2);

        if (straight) {
            ctx.moveTo(d, -d);
            ctx.lineTo(-d, d);
        }

        ctx.stroke();

        if (!straight) {
            (0, _shapes.drawCircle)(ctx, -d, -d, d * 3 / 2, { fill: 'transparent', stroke: fg });
        }

        (0, _shapes.drawCircle)(ctx, -d, -d, d / 2, { fill: bg, stroke: fg });
    };

    modes.cross = function () {
        ctx.beginPath();

        ctx.moveTo(-d, -d);
        ctx.lineTo(d, d);

        ctx.moveTo(-d / 2, -d);
        ctx.lineTo(d / 2, d);

        ctx.moveTo(0, -d);
        ctx.lineTo(0, d);

        ctx.moveTo(d / 2, -d);
        ctx.lineTo(-d / 2, d);

        ctx.moveTo(d, -d);
        ctx.lineTo(-d, d);

        ctx.stroke();

        (0, _shapes.drawCircle)(ctx, 0, 0, d / 4, { fill: bg, stroke: fg });
    };

    modes.sun = function () {
        ctx.beginPath();

        ctx.moveTo(-d, -d);
        ctx.lineTo(d, d);

        ctx.moveTo(-d / 2, -d);
        ctx.lineTo(d / 2, d);

        ctx.moveTo(0, -d);
        ctx.lineTo(0, d);

        ctx.moveTo(d / 2, -d);
        ctx.lineTo(-d / 2, d);

        ctx.moveTo(d, -d);
        ctx.lineTo(-d, d);

        //

        ctx.moveTo(-d, -d / 2);
        ctx.lineTo(d, d / 2);

        ctx.moveTo(-d, 0);
        ctx.lineTo(d, 0);

        ctx.moveTo(-d, d / 2);
        ctx.lineTo(d, -d / 2);

        ctx.stroke();

        (0, _shapes.drawCircle)(ctx, 0, 0, d / 5, { fill: bg, stroke: fg });
    };

    modes.offset = function () {
        ctx.beginPath();

        var pts = [[-d, -d], [-d / 2, -d], [0, -d], [d / 2, -d],
        //[d, -d],
        [d, -d / 2], [d, 0], [d, d / 2],
        //[d, d],
        [d / 2, d], [0, d], [-d / 2, d],
        //[-d, d],
        [-d, d / 2], [-d, 0], [-d, -d / 2]];

        var center = [-d / 3, -d / 3];

        pts.forEach(function (p) {
            ctx.moveTo.apply(ctx, center);
            ctx.lineTo.apply(ctx, _toConsumableArray(p));
        });

        ctx.stroke();

        (0, _shapes.drawCircle)(ctx, -d * 1.9, -d * 1.9, h * 1.5, { fill: null, stroke: fg });
        _shapes.drawCircle.apply(undefined, [ctx].concat(center, [d / 4, { fill: bg, stroke: fg }]));
    };

    modes.bars = function () {
        ctx.beginPath();

        ctx.moveTo(-d, -d);
        ctx.lineTo(-d, d);

        ctx.moveTo(-d / 2, -d);
        ctx.lineTo(-d / 2, d);

        ctx.moveTo(-0, -d);
        ctx.lineTo(-0, d);

        ctx.moveTo(d / 2, -d);
        ctx.lineTo(d / 2, d);

        ctx.moveTo(d, -d);
        ctx.lineTo(d, d);

        ctx.moveTo(-d, 0);
        ctx.lineTo(d, 0);

        ctx.stroke();

        (0, _shapes.drawCircle)(ctx, -d * .75, 0, d / 4, { fill: 'transparent', stroke: fg });
        (0, _shapes.drawCircle)(ctx, 0, 0, d / 2, { fill: 'transparent', stroke: fg });
        (0, _shapes.drawCircle)(ctx, d * .75, 0, d / 4, { fill: 'transparent', stroke: fg });
    };

    modes.notes = function () {
        ctx.beginPath();

        ctx.moveTo(-d, -d);
        ctx.lineTo(-d, d);

        ctx.moveTo(-d / 2, -d);
        ctx.lineTo(-d / 2, d);

        ctx.moveTo(-0, -d);
        ctx.lineTo(-0, d);

        ctx.moveTo(d / 2, -d);
        ctx.lineTo(d / 2, d);

        ctx.moveTo(d, -d);
        ctx.lineTo(d, d);

        ctx.stroke();

        (0, _shapes.drawCircle)(ctx, -d * .75, -d * .75, d / 4, { fill: 'transparent', stroke: fg });
        (0, _shapes.drawCircle)(ctx, -d * .25, -d * .25, d / 4, { fill: 'transparent', stroke: fg });
        (0, _shapes.drawCircle)(ctx, d * .25, d * .25, d / 4, { fill: 'transparent', stroke: fg });
        (0, _shapes.drawCircle)(ctx, d * .75, d * .75, d / 4, { fill: 'transparent', stroke: fg });
    };

    modes.circleSet = function () {
        ctx.beginPath();

        ctx.moveTo(-d * .5, -d);
        ctx.lineTo(-d * .5, d);

        ctx.moveTo(0, -d);
        ctx.lineTo(0, d);

        ctx.moveTo(d * .5, -d);
        ctx.lineTo(d * .5, d);

        ctx.moveTo(-d, -d * .5);
        ctx.lineTo(d, -d * .5);

        ctx.moveTo(-d, 0);
        ctx.lineTo(d, 0);

        ctx.moveTo(-d, d * .5);
        ctx.lineTo(d, d * .5);

        ctx.stroke();

        var r = d / 5;

        (0, _shapes.drawCircle)(ctx, d * -.5, -d * .5, r, { fill: bg, stroke: fg });
        (0, _shapes.drawCircle)(ctx, d * 0, -d * .5, r, { fill: bg, stroke: fg });
        (0, _shapes.drawCircle)(ctx, d * .5, -d * .5, r, { fill: bg, stroke: fg });

        (0, _shapes.drawCircle)(ctx, d * -.5, 0, r, { fill: bg, stroke: fg });
        (0, _shapes.drawCircle)(ctx, d * 0, 0, r, { fill: bg, stroke: fg });
        (0, _shapes.drawCircle)(ctx, d * .5, 0, r, { fill: bg, stroke: fg });

        (0, _shapes.drawCircle)(ctx, d * -.5, d * .5, r, { fill: bg, stroke: fg });
        (0, _shapes.drawCircle)(ctx, d * 0, d * .5, r, { fill: bg, stroke: fg });
        (0, _shapes.drawCircle)(ctx, d * .5, d * .5, r, { fill: bg, stroke: fg });
    };

    modes.standUps = function () {
        ctx.beginPath();

        var ringEdge = -d * .3;

        ctx.moveTo(-d * .5, -d);
        ctx.lineTo(-d * .5, -d * .5);

        ctx.moveTo(0, -d);
        ctx.lineTo(0, -d * .5);

        ctx.moveTo(d * .5, -d);
        ctx.lineTo(d * .5, -d * .5);

        ctx.moveTo(-d, -d * .5);
        ctx.lineTo(d, -d * .5);

        if (Math.random() < 0.5) {
            // criss cross

            ctx.moveTo(-d, d);
            ctx.lineTo(-d * .5, ringEdge);
            ctx.lineTo(0, d);
            ctx.lineTo(d * .5, ringEdge);
            ctx.lineTo(d, d);

            ctx.moveTo(-d, ringEdge);
            ctx.lineTo(-d * .5, d);
            ctx.lineTo(0, ringEdge);
            ctx.lineTo(d * .5, d);
            ctx.lineTo(d, ringEdge);
        } else {
            // zig zag

            ctx.moveTo(-d, ringEdge);
            ctx.lineTo(-d * .75, d);
            ctx.lineTo(-d * .5, ringEdge);
            ctx.lineTo(-d * .25, d);
            ctx.lineTo(0, ringEdge);
            ctx.lineTo(d * .25, d);
            ctx.lineTo(d * .5, ringEdge);
            ctx.lineTo(d * .75, d);
            ctx.lineTo(d, ringEdge);
        }

        ctx.stroke();

        // rings
        (0, _shapes.drawCircle)(ctx, -d, -d * .5, d / 5, { fill: bg, stroke: fg });
        (0, _shapes.drawCircle)(ctx, -d * .5, -d * .5, d / 5, { fill: bg, stroke: fg });
        (0, _shapes.drawCircle)(ctx, 0, -d * .5, d / 5, { fill: bg, stroke: fg });
        (0, _shapes.drawCircle)(ctx, d * .5, -d * .5, d / 5, { fill: bg, stroke: fg });
        (0, _shapes.drawCircle)(ctx, d, -d * .5, d / 5, { fill: bg, stroke: fg });
    };

    modes.squares = function () {

        (0, _shapes.drawSquare)(ctx, 0, 0, d, { fill: 'transparent', stroke: fg });
        (0, _shapes.drawSquare)(ctx, 0, 0, d / (4 / 3), { fill: 'transparent', stroke: fg });
        (0, _shapes.drawSquare)(ctx, 0, 0, d / 2, { fill: 'transparent', stroke: fg });
        (0, _shapes.drawSquare)(ctx, 0, 0, d / 4, { fill: 'transparent', stroke: fg });

        ctx.rotate(PI / 4);

        var diag = d * 0.7071;

        (0, _shapes.drawSquare)(ctx, 0, 0, diag * 1.5, { fill: 'transparent', stroke: fg });
        (0, _shapes.drawSquare)(ctx, 0, 0, diag / 1, { fill: 'transparent', stroke: fg });
        (0, _shapes.drawSquare)(ctx, 0, 0, diag / 2, { fill: 'transparent', stroke: fg });
    };

    modes.arcs = function () {

        (0, _shapes.drawCircle)(ctx, -d, -d, h / 1, { fill: 'transparent', stroke: fg });
        (0, _shapes.drawCircle)(ctx, -d, -d, h / 2, { fill: 'transparent', stroke: fg });
        (0, _shapes.drawCircle)(ctx, -d, -d, h / (4 / 3), { fill: 'transparent', stroke: fg });
        (0, _shapes.drawCircle)(ctx, -d, -d, h / 4, { fill: 'transparent', stroke: fg });

        ctx.beginPath();
        ctx.moveTo(-d, -d);
        ctx.lineTo(d, d);
        ctx.stroke();
    };

    modes.arcSide = function () {

        (0, _shapes.drawCircle)(ctx, 0, -d, d / 2, { fill: null, stroke: fg });
        (0, _shapes.drawCircle)(ctx, 0, -d, d / 1, { fill: null, stroke: fg });

        (0, _shapes.drawCircle)(ctx, 0, d, d / 2, { fill: null, stroke: fg });
        (0, _shapes.drawCircle)(ctx, 0, d, d / 1, { fill: null, stroke: fg });

        (0, _shapes.drawCircle)(ctx, 0, 0, d / 2, { fill: null, stroke: fg });
        (0, _shapes.drawCircle)(ctx, 0, 0, d / 1, { fill: null, stroke: fg });

        ctx.beginPath();
        ctx.moveTo(0, -d);
        ctx.lineTo(0, d);
        ctx.stroke();
    };

    modes.arcCorners = function () {
        (0, _shapes.drawCircle)(ctx, -d, -d, h / 1, { fill: 'transparent', stroke: fg });
        (0, _shapes.drawCircle)(ctx, -d, -d, h / 2, { fill: 'transparent', stroke: fg });
        (0, _shapes.drawCircle)(ctx, -d, -d, h / (4 / 3), { fill: 'transparent', stroke: fg });
        (0, _shapes.drawCircle)(ctx, -d, -d, h / 4, { fill: 'transparent', stroke: fg });

        (0, _shapes.drawCircle)(ctx, d, d, h / 1, { fill: 'transparent', stroke: fg });
        (0, _shapes.drawCircle)(ctx, d, d, h / 2, { fill: 'transparent', stroke: fg });
        (0, _shapes.drawCircle)(ctx, d, d, h / (4 / 3), { fill: 'transparent', stroke: fg });
        (0, _shapes.drawCircle)(ctx, d, d, h / 4, { fill: 'transparent', stroke: fg });
    };

    modes.flower = function () {
        (0, _shapes.drawCircle)(ctx, 0, -d, d / 1, { fill: null, stroke: fg });
        (0, _shapes.drawCircle)(ctx, 0, d, d / 1, { fill: null, stroke: fg });
        (0, _shapes.drawCircle)(ctx, -d, 0, d / 1, { fill: null, stroke: fg });
        (0, _shapes.drawCircle)(ctx, d, 0, d / 1, { fill: null, stroke: fg });

        (0, _shapes.drawCircle)(ctx, 0, 0, d / 4, { fill: bg, stroke: fg });
    };

    modes.herringbone = function () {
        function up(y) {
            ctx.moveTo(-d, -d + y);
            ctx.lineTo(0, -d + y - d);
        }

        function down(y) {
            ctx.moveTo(d, -d + y);
            ctx.lineTo(0, -d + y - d);
        }

        ctx.beginPath();

        for (var i = 0; i <= 6; i++) {
            up(i * d / 2);
            down(i * d / 2);
        }

        ctx.moveTo(0, -d);
        ctx.lineTo(0, d);

        ctx.stroke();
    };

    // TESTING
    //opts.mode = 'diag';


    // mode
    function main(background, double) {
        background = background || bg;
        ctx.strokeStyle = fg;
        var px = void 0,
            py = void 0;
        ctx.fillStyle = background;
        ctx.rect(0, 0, cw, ch);
        ctx.fill();
        for (var i = 0; i < vcount; i++) {
            for (var j = 0; j < count; j++) {
                // convenience vars
                x = w * j;
                y = h * i;
                xnorm = x / cw;
                ynorm = y / ch;
                // center point
                px = x + w / 2;
                py = y + h / 2;

                // shift and clip at center point
                moveAndClip(ctx, px, py, h, background);
                // randomly rotate by 90 degree increment
                ctx.rotate((0, _utils.randItem)([0, PI / 2, PI, PI * 3 / 2]));

                // do art in this box
                if (opts.mode && modes[opts.mode]) {
                    modes[opts.mode]();
                } else {
                    modes[(0, _utils.randItem)(Object.keys(modes))]();
                }

                // unshift, unclip
                ctx.restore();
                (0, _utils.resetTransform)(ctx);

                // draw border box after unclipping, to avoid aliasing
                (0, _shapes.drawSquare)(ctx, px, py, h / 2 * ZOOM, { fill: null, stroke: fg });
            }
        }
    }

    main(bg);

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
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.fieldShape = fieldShape;

var _noiseutils = __webpack_require__(1);

var _noiseutils2 = _interopRequireDefault(_noiseutils);

var _palettes = __webpack_require__(2);

var _palettes2 = _interopRequireDefault(_palettes);

var _hexScatter = __webpack_require__(4);

var _hexScatter2 = _interopRequireDefault(_hexScatter);

var _utils = __webpack_require__(0);

var _shapes = __webpack_require__(3);

var _fieldUtils = __webpack_require__(6);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var DEFAULTS = {
    container: 'body',
    palette: _palettes2.default.metroid_fusion,
    addNoise: 0.04,
    noiseInput: null,
    clear: true,
    debug: false,
    colorMode: 'auto', // from COLORMODES or 'auto'
    fieldMode: 'auto', // [auto, harmonic, flow]
    lightMode: 'normal', // [auto, bloom, normal]
    drawEdges: 'auto' // [auto, true, false]
};

var PI = Math.PI;
var FIELDMODES = ['harmonic', 'flow'];
var LIGHTMODES = ['bloom', 'normal'];
var COLORMODES = ['single', 'angle', 'random'];

// Main function
function fieldShape(options) {
    var opts = Object.assign({}, DEFAULTS, options);

    var container = opts.container;
    var cw = container.offsetWidth;
    var ch = container.offsetHeight;
    var SCALE = Math.min(cw, ch);
    var LONG = Math.max(cw, ch);
    var SHORT = Math.min(cw, ch);
    var AREA = cw * ch;
    // canvas center x and y
    var cx = cw / 2;
    var cy = ch / 2;

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
    var DEBUG = opts.debug;
    var LIGHTMODE = opts.lightMode === 'auto' ? (0, _utils.randItem)(LIGHTMODES) : opts.lightMode;
    var FIELDMODE = opts.fieldMode === 'auto' ? (0, _utils.randItem)(FIELDMODES) : opts.fieldMode;
    var COLORMODE = opts.colorMode === 'auto' ? (0, _utils.randItem)(COLORMODES) : opts.colorMode;
    var POLYEDGES = opts.drawEdges === 'auto' ? (0, _utils.randItem)([true, false]) : opts.drawEdges;

    console.log('FieldShape: ' + FIELDMODE + ' ' + COLORMODE + ' ' + LIGHTMODE + ' ' + POLYEDGES);

    // color funcs
    var getSolidFill = (0, _utils.getSolidColorFunction)(opts.palette);

    // how many cells are in the grid?
    var countMin = void 0,
        countMax = void 0;

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

    var tailLength = SCALE / (0, _utils.randomInRange)(30, 50);

    // tail vars
    var _x = void 0,
        _y = void 0,
        len = void 0;

    // dotScale will be multiplied by 2. Keep below .25 to avoid bleed.
    // Up to 0.5 will lead to full coverage.
    var dotScale = tailLength * (0, _utils.randomInRange)(0.1, 0.25);
    // line width
    var weight = (0, _utils.randomInRange)(0.5, 3) * SCALE / 800;

    ctx.lineWidth = weight;
    ctx.lineCap = 'round';

    // const used in normalizing transforms
    var maxLen = 2 * Math.sqrt(2);

    // It looks nice to extend lines beyond their cells. how much?
    // Scaled against tailLength
    var lineScale = (0, _utils.randomInRange)(0.7, 2);

    // Pick an opacity transform to use
    var opacityFunc = (0, _utils.randItem)((0, _fieldUtils.opacityTransforms)(maxLen));

    // a set of independent transforms to use while rendering
    var trans = {
        xbase: (0, _fieldUtils.createTransform)(rateMax), // (x,y)=>0,//
        ybase: (0, _fieldUtils.createTransform)(rateMax), // (x,y)=>0,//
        xtail: (0, _fieldUtils.createTransform)(rateMax), // (x,y)=>0,//
        ytail: (0, _fieldUtils.createTransform)(rateMax), // (x,y)=>0,//
        radius: (0, _fieldUtils.createTransform)(rateMax)

        // Make a reference canvas, fill it black
    };var ref = document.querySelector('#ref');
    if (!ref) {
        ref = document.createElement('canvas');
        ref.setAttribute('id', 'ref');
        ref.setAttribute('width', cw);
        ref.setAttribute('height', ch);
        ref.className = 'artContainer';
        //document.querySelector('body').appendChild(ref);
    }
    var refctx = ref.getContext('2d');
    // fill ref with black
    refctx.fillStyle = 'black';
    refctx.fillRect(0, 0, cw, ch);
    // set to white to draw shapes
    refctx.fillStyle = 'white';

    // with a set of imageData, get the color at x,y
    function colorFromReference(x, y, imageData) {
        var c = [];
        return c;
    }

    // edge spacing
    var SPACING = SCALE / (0, _utils.randomInRange)(35, 50);

    // place points along shapes
    function circlePoints(x, y, size) {
        var theta = 0;
        var N = 200;
        var r = size;
        for (var i = 0; i < N; i++) {
            theta += PI * 2 / N;
            pts.push([x + r * Math.cos(theta), y + r * Math.sin(theta)]);
        }
    }

    // Return an array of vertices defining a regular polygon
    // centered at @x, @y, with @sides, @size, and @angle
    function makeRegularVertices() {
        var sides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 4;
        var x = arguments[1];
        var y = arguments[2];
        var size = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 100;
        var angle = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;

        var vertices = [];
        var a = Math.PI * 2 / sides;
        function _x(theta) {
            return size * Math.cos(theta + angle - Math.PI / 2);
        }
        function _y(theta) {
            return size * Math.sin(theta + angle - Math.PI / 2);
        }

        for (var i = 1; i <= sides; i++) {
            vertices.push([_x(a * i), _y(a * i)]);
        }

        vertices = vertices.map(function (v, i) {
            return [v[0] + x, v[1] + y];
        });

        return vertices;
    }

    // Create points at @spacing along polygon defined by @vertices
    // Append to @pts and return modified @pts
    function getEdgePointsFromVertices(vertices) {
        var spacing = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;

        // place points at vertices
        var pts = [];
        pts.push.apply(pts, _toConsumableArray(vertices));

        // for each edge:
        // get vector for edges by subtracing vertex coordinates
        function drawEdge(edge, pts) {
            // for each edge, get nearest number of whole number of steps based
            // on spacing

            var steps = Math.floor(edge.length / spacing);
            var inc = edge.length / steps;

            DEBUG && console.log(steps + ' steps at ' + inc.toPrecision(3) + 'px each');

            // start at vertex and move along edge vector in increments,
            // placing points
            // do this by dividing the edge vector by edge spacing scalar?
            // step along in increments until end vertex is reached

            for (var i = 0; i < steps; i++) {
                pts.push([edge.x + i * inc * Math.cos(edge.angle), edge.y + i * inc * Math.sin(edge.angle)]);
            }
        }

        vertices.forEach(function (v, i) {
            drawEdge((0, _utils.getVector)(v, vertices[(i + 1) % vertices.length]), pts);
        });

        return pts;
    }

    // Create points at @spacing along polygon defined by @vertices
    // Append to @pts and return modified @pts
    function drawShapeFromVertices(ctx, vertices) {
        //ctx.globalAlpha = 0.5;
        ctx.fillStyle = 'white';

        ctx.beginPath();
        ctx.moveTo.apply(ctx, _toConsumableArray(vertices.pop()));
        while (vertices.length) {
            ctx.lineTo.apply(ctx, _toConsumableArray(vertices.pop()));
        }
        ctx.closePath();
        ctx.fill();

        ctx.globalAlpha = 1;

        return vertices;
    }

    // Convenience function: compose the vertex and point placement functions
    // to draw a complete polygon
    function placePolygonPoints() {
        var sides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 4;
        var x = arguments[1];
        var y = arguments[2];
        var size = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 100;
        var angle = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
        var spacing = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 20;

        return getEdgePointsFromVertices(makeRegularVertices(sides, x, y, size, angle), spacing);
    }

    // util used for scaling shapes
    function distanceFromEdge(x, y) {
        var dx = Math.min(x, cw - x);
        var dy = Math.min(y, ch - y);
        // normalize gap to the larger dimension of the canvas
        return Math.min(dx, dy) / LONG;
    }

    // Define N shapes placed along a ring at some random interval, which
    // may loop. Move the ring a bit offset from the true center.
    // Returns a list of vertices.
    var placeShapesOnRing = function placeShapesOnRing() {
        var ringPoints = [];

        var shapeR = SCALE * (0, _utils.randomInRange)(0.25, 0.4);
        var N = (0, _utils.randomInt)(2, 6);
        var shapeAngle = PI / (0, _utils.randomInt)(1, N);

        var _cx = void 0,
            _cy = void 0; // adjusted center point
        var _r = SCALE * (0, _utils.randomInRange)(0, 0.2);
        _cx = cx + _r * Math.cos(shapeAngle);
        _cy = cy + _r * Math.sin(shapeAngle);

        for (var i = 0; i < N; i++) {
            var _x10 = void 0,
                _y2 = void 0;
            _x10 = _cx + shapeR * Math.cos(i * shapeAngle);
            _y2 = _cy + shapeR * Math.sin(i * shapeAngle);
            ringPoints = ringPoints.concat([makeRegularVertices((0, _utils.randomInt)(3, 6), _x10, _y2, SCALE * (0, _utils.randomInRange)(0.1, 0.3), PI * (0, _utils.randomInRange)(0, 1), SCALE / (0, _utils.randomInRange)(25, 55))]);
        }

        if (DEBUG) {
            ctx.globalAlpha = 0.33;
            ctx.lineWidth = 1;
            (0, _shapes.drawCircle)(ctx, _cx, _cy, shapeR, { stroke: fg2 });
            ctx.lineWidth = weight;
            ctx.globalAlpha = 1;
        }

        return ringPoints;
    };

    function placeShapesRandomly(N) {
        N = N || (0, _utils.randomInt)(3, 6);
        var shapePoints = [];

        // place them randomly
        // find distance to closest edge
        // make shapes near edges large, away from edges small
        // allow centers to be outside of area.

        for (var i = 0; i < N; i++) {
            var _x11 = void 0,
                _y3 = void 0;
            _x11 = (0, _utils.randomInRange)(0, cw);
            _y3 = (0, _utils.randomInRange)(0, ch);

            var scalar = 1 - distanceFromEdge(_x11, _y3);
            scalar = scalar * scalar * scalar;

            shapePoints = shapePoints.concat([makeRegularVertices((0, _utils.randomInt)(3, 6), _x11, _y3, SCALE * (0, _utils.randomInRange)(0.3, 0.5) * scalar, PI * (0, _utils.randomInRange)(0, 1), SCALE / (0, _utils.randomInRange)(25, 55))]);
        }

        return shapePoints;
    }

    function placeShapesOnLine() {
        var N = (0, _utils.randomInt)(3, 6);
        var shapePoints = [];

        // points along each side of the canvas
        var sides = (0, _utils.shuffle)([[cw * (0, _utils.randomInRange)(0.2, 0.8), 0], [cw, ch * (0, _utils.randomInRange)(0.2, 0.8)], [cw * (0, _utils.randomInRange)(0.2, 0.8), ch], [0, ch * (0, _utils.randomInRange)(0.2, 0.8)]]);

        // choose random combo
        var p1 = sides.pop();
        var p2 = sides.pop();

        if (DEBUG) {
            ctx.globalAlpha = 0.5;
            // trace line
            ctx.strokeStyle = fg;
            ctx.lineWidth = 1;
            ctx.moveTo.apply(ctx, _toConsumableArray(p1));
            ctx.lineTo.apply(ctx, _toConsumableArray(p2));
            ctx.stroke();
            ctx.lineWidth = weight;
        }

        // draw shapes along the line
        for (var i = 0; i < N; i++) {
            var _x12 = void 0,
                _y4 = void 0,
                d = void 0;
            // interpolate at random spot along p1 -> p2
            d = (0, _utils.randomInRange)(0, 1);
            _x12 = d * p1[0] + (1 - d) * p2[0];
            _y4 = d * p1[1] + (1 - d) * p2[1];

            var scalar = 1 - distanceFromEdge(_x12, _y4);
            scalar = scalar * scalar * scalar;

            shapePoints = shapePoints.concat([makeRegularVertices((0, _utils.randomInt)(3, 6), _x12, _y4, SCALE * (0, _utils.randomInRange)(0.3, 0.5) * scalar, PI * (0, _utils.randomInRange)(0, 1), SCALE / (0, _utils.randomInRange)(25, 55))]);
        }

        return shapePoints;
    }

    // make a collection of placement functions that we can pick from
    var placementFunctions = [placeShapesOnRing, placeShapesOnLine, placeShapesRandomly];

    // create field transform
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

    // draw a single point in the field
    function drawPoints(points) {
        var drawTails = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
        var drawDots = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

        points.forEach(function (p, i) {
            x = p[0];
            y = p[1];
            xnorm = x / cw;
            ynorm = y / ch;

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

            if (drawDots) {
                if (colorDotByAngle) {
                    dotFill = angleColor;
                }
                if (COLORMODE === 'random' && Math.random() < randomColorThreshold) {
                    dotFill = getContrastColor();
                }

                // draw dot
                ctx.globalAlpha = 1;
                (0, _shapes.drawCircle)(ctx, x, y, (trans.radius(xnorm, ynorm) + 1) * dotScale, { stroke: dotFill });
            }

            if (drawTails) {
                ctx.globalAlpha = opacityFunc(_x, _y);

                if (colorTailByAngle) {
                    ctx.strokeStyle = angleColor;
                }
                if (COLORMODE === 'random' && Math.random() < randomColorThreshold) {
                    ctx.strokeStyle = getContrastColor();
                }

                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + tailLength * _x * lineScale, y + tailLength * _y * lineScale);
                ctx.stroke();
            }
        });
    }

    // --------------------------------------
    // draw stuff:


    // -> Get a set of polygon vertices
    var polyVertices = [];
    polyVertices = (0, _utils.randItem)(placementFunctions)();

    // -> scatter a background field

    // Draw the background field from scattered points, with only tails
    // Use a shorter tail length and thickness to make this less dominant
    var baseScale = lineScale;
    lineScale = baseScale / 3;

    var bgField = (0, _hexScatter2.default)(tailLength, cw, ch);
    drawPoints(bgField, true, false);

    // -> draw the polygon edges, if desired

    // Restore full tail length and thickness to draw points derived from
    // the polygons
    lineScale = baseScale;
    ctx.lineWidth = weight * 2;

    // Pick a random placement function and draw the edges
    if (POLYEDGES) {
        polyVertices.forEach(function (polygon, i) {
            drawPoints(getEdgePointsFromVertices(polygon, SPACING), true, true);
        });
    }

    // -> select the background points that overlap polygons

    // draw the polys to the reference canvas
    polyVertices.forEach(function (polygon, i) {
        drawShapeFromVertices(refctx, polygon);
    });

    // step thru the field points, check their position against reference
    // and create a new list
    var pointsInsidePolys = [];
    bgField.forEach(function (p, i) {
        if (refctx.getImageData.apply(refctx, _toConsumableArray(p).concat([1, 1])).data[0] > 128) {
            pointsInsidePolys.push(p);
        }
    });

    // -> draw the polygon field points

    ctx.lineWidth = weight;
    lineScale = baseScale / 2;
    drawPoints(pointsInsidePolys, true, true);

    // reset alpha for any following draw operations
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
/* 30 */
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

var _hexScatter = __webpack_require__(4);

var _hexScatter2 = _interopRequireDefault(_hexScatter);

var _utils = __webpack_require__(0);

var _shapes = __webpack_require__(3);

var _fieldUtils = __webpack_require__(6);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var PI = Math.PI;
var FIELDMODES = ['harmonic', 'flow'];
var GRIDMODES = ['normal', 'scatter', 'random'];
var COLORMODES = ['length', 'curve', 'change', /*'origin',*/'mono', 'duo', 'random'];
var STYLES = ['round', 'square'];

var DEFAULTS = {
    container: 'body',
    palette: _palettes2.default.de_stijl,
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true,
    fieldMode: 'auto', // [auto, harmonic, flow]
    gridMode: 'scatter', // from GRIDMODES
    colorMode: 'auto', // from COLORMODES
    style: 'auto', // from STYLES
    fieldNoise: 'auto', // mapped to values below
    mixWeight: false,
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
    var FIELDMODE = opts.fieldMode === 'auto' ? (0, _utils.randItem)(FIELDMODES) : opts.fieldMode;
    var GRIDMODE = opts.gridMode === 'auto' ? (0, _utils.randItem)(GRIDMODES) : opts.gridMode;
    var COLORMODE = opts.colorMode === 'auto' ? (0, _utils.randItem)(COLORMODES) : opts.colorMode;
    var STYLE = opts.style === 'auto' ? (0, _utils.randItem)(STYLES) : opts.style;
    var FIELDNOISE = (0, _utils.mapKeywordToVal)({
        // hacky way to weight options by redundantly specifying
        'none': 0,
        'none2': 0,
        'none3': 0,
        'none4': 0,
        'low': 0.125,
        'low2': 0.125,
        'low3': 0.125,
        'med': 0.25,
        'med2': 0.25,
        'high': 0.5
    })(opts.fieldNoise, 'fieldNoise');

    console.log('==================================\nTrails:', FIELDMODE, GRIDMODE, COLORMODE, STYLE);

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

    // draw background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);

    ctx.strokeStyle = fg;

    // trails:
    var rateMax = (0, _utils.randomInRange)(0.5, 5); // this is a bit meta and silly

    // tail vars
    var _x = void 0,
        _y = void 0,
        len = void 0;

    // line width
    var weight = SHORT / (0, _utils.randomInRange)(400, 75);

    ctx.lineWidth = weight;
    ctx.lineCap = STYLE;
    ctx.lineJoin = "bevel";

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

    // Pick an opacity transform to use
    var opacityFunc = (0, _utils.randItem)((0, _fieldUtils.opacityTransforms)(maxLen));

    // a set of independent transforms to use while rendering
    var trans = {
        //xbase: createTransform(0, rateMax),
        //ybase: createTransform(0, rateMax),
        xtail: (0, _fieldUtils.createTransform)(0, rateMax),
        ytail: (0, _fieldUtils.createTransform)(0, rateMax),
        //radius: createTransform(0, rateMax),
        color: (0, _fieldUtils.createTransform)(0, 5 / SHORT) // change colors slowly
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
    var rctx = ref.getContext('2d', { willReadFrequently: true });

    rctx.fillStyle = 'black';
    rctx.fillRect(0, 0, cw, ch);

    rctx.strokeStyle = 'white';
    rctx.lineWidth = weight * 2; // exclusion based on stroke
    rctx.lineCap = STYLE;

    // Field trails: for each point, follow the tail functions for
    // a bunch of steps. Seems to work well for 20-100 steps. With more steps
    // you have to fade out opacity as you go to remain legible
    var steps = void 0;
    var stepBase = (0, _utils.randomInRange)(6, 30); // vary this for each trail. See loop.
    lineScale = 0.7; // scalar of the function at each step. small=smooth.

    var dx = void 0,
        dy = void 0;

    ctx.globalAlpha = 1;
    //ctx.globalAlpha = 0.5;
    //ctx.globalCompositeOperation = 'overlay';

    ctx.lineWidth = weight;

    var colorVal = void 0; // color transform value
    var colorNorm = void 0; // color val normalized to palette

    var trace = [0, 0]; // color sample

    var tStart = new Date().getTime();

    // source/sink stuff
    var sourceTransform = (0, _fieldUtils.createSourceSinkTransform)(Math.round((0, _utils.randomInRange)(5, 15)));
    if (FIELDMODE === 'flow') {
        var totalStrength = 0;
        sourceTransform.sources.forEach(function (source) {
            totalStrength += source.strength;
        });
        lineScale = 1 / totalStrength;
    }

    // to avoid self blocking,
    // hold each trail and defer reference rendering till each is done.
    // This allows self intersection, but avoids self-interference when
    // each step is too small to avoid colliding with the last.
    var trail = [];

    if (!opts.isolate) {
        ctx.globalAlpha = (0, _utils.randomInRange)(0.5, 0.75);
        //ctx.globalCompositeOperation = 'overlay';
        stepBase = (0, _utils.randomInRange)(20, 40); // near normal max. TODO make this more interesting
        weight = (0, _utils.randomInRange)(0.5, 1.5); // thinner lines
        ctx.lineWidth = weight;
    }

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
        var tChange = 0;
        var angle = 0;
        var lastAngle = 0;
        var ddx = void 0,
            ddy = void 0;
        var lastDelta = [0, 0];

        if (opts.mixWeight) {
            ctx.lineWidth = weight * Math.tan(PI * (0, _utils.randomInRange)(0, 0.27));
            rctx.lineWidth = ctx.lineWidth * 2;
        }

        for (var z = 0; z <= steps; z++) {
            x = p[0];
            y = p[1];
            xnorm = x / cw;
            ynorm = y / ch;

            var xNoise = 0;
            var yNoise = 0;
            if (FIELDNOISE > 0) {
                xNoise = (0, _utils.randomInRange)(-1, 1) * FIELDNOISE;
                yNoise = (0, _utils.randomInRange)(-1, 1) * FIELDNOISE;
            }

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

            // use lineScale to scale field effects, apply cellSize to both
            // field and noise factors
            dx = cellSize * (_x * lineScale + xNoise);
            dy = cellSize * (_y * lineScale + yNoise);

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
            if (COLORMODE === 'change') {
                ddx = dx - lastDelta[0];
                ddy = dy - lastDelta[1];
                tChange += Math.sqrt(ddx * ddx + ddy * ddy);
                lastDelta = [dx, dy];
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

            if (COLORMODE === 'change') {
                colorVal = tChange * 0.2; // magic number
                //console.log(colorVal.toFixed(1));
                colorNorm = Math.round(colorVal * (colorCount - 1));
                ctx.strokeStyle = contrastPalette[colorNorm % colorCount] || 'green';
            }

            if (COLORMODE === 'mono') {
                ctx.strokeStyle = fg;
            }

            if (COLORMODE === 'duo') {
                ctx.strokeStyle = (0, _utils.randItem)([fg, fg2]);
            }

            if (COLORMODE === 'random') {
                ctx.strokeStyle = getContrastColor();
            }

            // Start drawing

            ctx.beginPath();
            ctx.moveTo.apply(ctx, _toConsumableArray(trailStart));

            if (opts.isolate) {
                rctx.beginPath();
                rctx.moveTo.apply(rctx, _toConsumableArray(trailStart));
            }

            trail.forEach(function (pt, i) {
                ctx.lineTo(pt[0], pt[1]);
                opts.isolate && rctx.lineTo(pt[0], pt[1]);
            });
            ctx.stroke();
            opts.isolate && rctx.stroke();
            trail = [];
        }
    });

    ctx.globalAlpha = 1;

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

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.clouds = clouds;

var _noiseutils = __webpack_require__(1);

var _noiseutils2 = _interopRequireDefault(_noiseutils);

var _palettes = __webpack_require__(2);

var _palettes2 = _interopRequireDefault(_palettes);

var _utils = __webpack_require__(0);

var _shapes = __webpack_require__(3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULTS = {
    container: 'body',
    palette: _palettes2.default.fingerspitzen,
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
var TWOPI = PI * 2;

// Main function
function clouds(options) {
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

    // color funcs
    var getSolidFill = (0, _utils.getSolidColorFunction)(opts.palette);

    // shared colors
    var bg = getSolidFill();

    // get palette of non-bg colors
    var contrastPalette = [].concat(opts.palette);
    contrastPalette.splice(opts.palette.indexOf(bg), 1);
    var getContrastColor = (0, _utils.getSolidColorFunction)(contrastPalette);

    // shared foregrounds
    var fg = getContrastColor();
    var fg2 = getContrastColor();

    // special fill functions
    var getBgGradient = (0, _utils.getGradientFunction)(['#ffffff', bg]);
    var getCloudFill = function getCloudFill(y1, y2) {
        var color = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : bg;

        var grad = ctx.createLinearGradient(0, y1, 0, y2);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(1, color);
        return grad;
    };

    // draw

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);

    var rateMax = 3;

    function createTransform() {
        var rate1 = (0, _utils.randomInRange)(0, rateMax);
        var rate2 = (0, _utils.randomInRange)(0, rateMax);
        var phase1 = (0, _utils.randomInRange)(-PI, PI);
        var phase2 = (0, _utils.randomInRange)(-PI, PI);
        var c1 = (0, _utils.randomInRange)(1, 2);
        var c2 = (0, _utils.randomInRange)(0, 1);
        return function (x, y) {
            var t1 = Math.sin(x * PI * rate1 + phase1);
            var t2 = Math.sin(y * PI * rate2 + phase2);
            return (c1 * t1 + c2 * t2) / (c1 + c2);
        };
    }

    var wave = createTransform();

    var pointCount = cw / 4;
    var x = void 0,
        y = void 0,
        r = void 0;

    var r_seed = void 0;

    var waveScale = SHORT / 8;
    var harmScale = waveScale / 2;
    var bubbleSize = void 0;
    var bubbleMax = ch / 4;

    var cloudSize = void 0;
    var cloudSizeMax = void 0;

    var xnorm = void 0,
        ynorm = void 0;
    var countNorm = void 0;

    ctx.lineCap = 'round';

    // test seeds
    var cx = (0, _utils.randomInRange)(cw * .25, cw * .75);
    var cy = (0, _utils.randomInRange)(ch * .25, ch * .75);
    var cr = SCALE / 6;

    // elliptical cluster func
    var drawCluster = function drawCluster(ctx, cx, cy, size) {
        var maxSize = size;
        var eccentricity = 0.618;

        var pointCount = void 0;

        // ellipse constraints:
        // x = a * cos(t);
        // y = b * sin(t);
        // native func:
        // ctx.ellipse(x, y, 2a, 2b, rotation, startAngle, endAngle);

        pointCount = 6;
        //pointCount = 12;
        //pointCount = 24;

        // ideally we draw a main large ellipse
        // then draw medium ellipses near the lower corners,
        // then a few mixed in the primary axes and upper corners.

        var theta = void 0;

        for (var i = 0; i <= pointCount; i++) {

            //theta = TWOPI/pointCount * i;
            theta = PI * (0, _utils.randomInRange)(0, 1);

            r = (0, _utils.randomInRange)(maxSize / 4, maxSize);

            x = r * Math.cos(theta);
            y = r * eccentricity * Math.sin(theta);

            size = maxSize * (1 - r / size) + maxSize / 4;
            size = maxSize / 4 + 0.75 * maxSize * (Math.cos(2 * theta) + 1) / 2;

            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';

            ctx.beginPath();
            ctx.ellipse(cx + x, cy + y, size, size * eccentricity, 0, 0, TWOPI);
            ctx.fill();
            //ctx.stroke();
        }

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(cx, cy, maxSize, maxSize * eccentricity, 0, 0, TWOPI);
        ctx.stroke();
        ctx.fill();
    };

    //drawCluster(ctx, cx, cy, cr);

    var clusterCount = 3;
    clusterCount = Math.round(cw / 250);

    // now draw many clusters

    cloudSizeMax = SCALE / 4;

    for (var i = 0; i < clusterCount; i++) {
        countNorm = i / clusterCount;
        x = i * cw / clusterCount + cw / clusterCount * .5;
        y = wave(countNorm, 0) * waveScale; // input a normalized value
        y += ch / 2; // center, roughly

        cloudSize = (0, _utils.randomInRange)(0.5, 1) * cloudSizeMax;
        r_seed = Math.random();

        console.log('cloudSize', cloudSize, cloudSizeMax);

        y -= (0, _utils.randomInRange)(0, waveScale);

        drawCluster(ctx, x, y, cloudSize);

        /*drawCircle(ctx, x, y , harmScale, {
           fill: null,
           stroke: fg
        });*/
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
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.grads = grads;

var _noiseutils = __webpack_require__(1);

var _noiseutils2 = _interopRequireDefault(_noiseutils);

var _palettes = __webpack_require__(2);

var _palettes2 = _interopRequireDefault(_palettes);

var _shapes = __webpack_require__(3);

var _utils = __webpack_require__(0);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SILVERS = ['#ffffff', '#f2f2f2', '#eeeeee', '#e7e7e7', '#e0e0e0', '#d7d7d7'];

var PI = Math.PI;
var TWOPI = PI * 2;

// Tile the container
function grads(options) {
    var defaults = {
        container: 'body',
        palette: _palettes2.default.plum_sauce,
        middleOut: 'auto', // 'auto' 'true' 'false'
        drawShadows: false,
        optics: true, // 'auto', true, false
        addNoise: 0.04,
        noiseInput: null,
        clear: true
    };
    var opts = {};
    opts = Object.assign(Object.assign(opts, defaults), options);

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

    var ctx; // canvas ctx or svg tag

    ctx = el.getContext('2d');

    // optional clear
    if (opts.clear) {
        el.width = container.offsetWidth;
        el.height = container.offsetHeight;
        ctx.clearRect(0, 0, cw, ch);
    }

    var getSolidFill = (0, _utils.getSolidColorFunction)(opts.palette);

    // drawing order
    var MIDDLEOUT = void 0;
    if (opts.middleOut === 'auto') {
        MIDDLEOUT = Math.random() > 0.5;
    } else if (opts.middleOut === 'false') {
        MIDDLEOUT = false;
    } else {
        MIDDLEOUT = true;
    }

    var OPTICS = void 0;
    if (opts.optics === 'auto') {
        OPTICS = Math.random() < 0.5;
    } else if (opts.optics === 'false') {
        OPTICS = false;
    } else {
        OPTICS = !!opts.optics;
    }

    // shadows
    function shadowsOn() {
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 25 * Math.min(cw, ch) / 800;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    }

    function shadowsOff() {
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;
        ctx.shadowColor = 0;
    }

    // split into shapes
    // add some slices, add more for high aspect ratios
    var sliceCount = Math.round((0, _utils.randomInRange)(6, 10) * cw / ch);
    if (sliceCount % 2 == 0) sliceCount++;

    var sw = cw / sliceCount;

    var g = void 0;

    var colors = opts.palette.length;

    var slices = [];

    if (Math.random() > 0.5) {
        opts.palette = opts.palette.reverse();
    }

    // Array of functions which will define slices. Slices are just arrays of gradients.
    var sliceGenerators = [
    // random
    function (count) {
        var slices = [];
        for (var i = 0; i <= count; i++) {
            g = ctx.createLinearGradient(0, 0 + 0.25 * (0, _utils.randomInRange)(-ch, ch), 0, ch + 0.25 * (0, _utils.randomInRange)(-ch, ch));

            for (var c = 0; c <= colors - 1; c++) {
                g.addColorStop(1 / colors * c, opts.palette[c]);
            }

            slices.push(g);
        }
        return slices;
    },
    // sine
    function (count) {
        var slices = [];
        var rate = (0, _utils.randomInRange)(0.5, 2);
        var phase = (0, _utils.randomInRange)(-PI, PI);
        var a1 = (0, _utils.randomInRange)(0.2, 1.5);
        var a2 = (0, _utils.randomInRange)(0.2, 1.5);

        for (var i = 0; i <= count; i++) {
            g = ctx.createLinearGradient(0, 0 + 0.25 * a1 * ch * Math.sin(rate * (i / count * TWOPI + phase)), 0, ch + 0.25 * a2 * ch * Math.sin(rate * (i / count * TWOPI + phase)));

            for (var c = 0; c <= colors - 1; c++) {
                g.addColorStop(1 / colors * c, opts.palette[c]);
            }

            slices.push(g);
        }
        return slices;
    }];

    slices = sliceGenerators[1](sliceCount);

    // Step through the slices, and draw a rectangle with the gradient defined in each slice

    // A utility function to draw a single slice
    function drawSliceAtIndex(i) {
        shadowsOn();

        ctx.beginPath();
        ctx.fillStyle = slices[i];
        ctx.rect(i * sw, 0, sw, ch);
        ctx.closePath();
        ctx.fill();

        if (OPTICS) {
            shadowsOff();

            var steps = 60;
            var inc = sw / steps;

            var coef = 0.05;
            var vscale = void 0;

            ctx.save();
            for (var j = 0; j < steps; j++) {
                (0, _utils.resetTransform)(ctx);

                vscale = 1 + coef;
                vscale -= 4 / PI * coef * Math.sin(PI * j / steps);
                vscale -= 4 / PI * coef * 1 / 2 * Math.sin(PI * 2 * j / steps);
                vscale -= 4 / PI * coef * 1 / 4 * Math.sin(PI * 4 * j / steps);
                // vscale -= 4/PI * coef * 1/8 * Math.sin(PI * 8 * j/steps);
                // vscale -= 4/PI * coef * 1/16 * Math.sin(PI * 16 * j/steps);
                // vscale -= 4/PI * coef * 1/32 * Math.sin(PI * 32 * j/steps);

                ctx.translate(0, ch / 2);
                ctx.scale(1, vscale);
                ctx.translate(0, -ch / 2);

                ctx.beginPath();
                ctx.fillStyle = slices[i];
                ctx.rect(i * sw + j * inc, 0, inc + 0.5, ch);

                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();
        }
    }

    // If middle out, alternate outward from the center slice, to get nice shadow stacking
    // Otherwise just draw them in order
    if (MIDDLEOUT) {
        // start in the middle and alternate outward
        var middle = Math.floor(sliceCount / 2);
        var steps = 0;
        var increment = 1;

        drawSliceAtIndex(middle);
        steps = 1;
        while (steps < sliceCount) {
            drawSliceAtIndex(middle + increment);
            drawSliceAtIndex(middle - increment);
            increment++;
            steps += 2;
        }
    } else {
        // draw each slice in order
        for (var i = 0; i < slices.length; i++) {
            drawSliceAtIndex(i);
        }
    }

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
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.doodle = doodle;

var _noiseutils = __webpack_require__(1);

var _noiseutils2 = _interopRequireDefault(_noiseutils);

var _palettes = __webpack_require__(2);

var _palettes2 = _interopRequireDefault(_palettes);

var _hexScatter = __webpack_require__(4);

var _hexScatter2 = _interopRequireDefault(_hexScatter);

var _utils = __webpack_require__(0);

var _fieldUtils = __webpack_require__(6);

var _shapes = __webpack_require__(3);

var _speckle = __webpack_require__(7);

var _roughen = __webpack_require__(34);

var _roughen2 = _interopRequireDefault(_roughen);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var DEFAULTS = {
    container: 'body',
    palette: _palettes2.default.north_beach,
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true,
    roughen: 4, // integer number of passes, or 0 for none
    density: 'coarse' // [auto, coarse, fine]
};

var PI = Math.PI;
var TWOPI = Math.PI;
var DENSITIES = ['coarse', 'fine'];

// Main function
function doodle(options) {
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
    var DENSITY = opts.density === 'auto' ? (0, _utils.randItem)(DENSITIES) : opts.density;

    // color funcs
    var getSolidFill = (0, _utils.getSolidColorFunction)(opts.palette);

    // how many cells are in the grid?
    var countMin = void 0,
        countMax = void 0;
    if (DENSITY === 'coarse') {
        countMin = 15;
        countMax = 25;
    } else {
        countMin = 60;
        countMax = 100;
    }

    var cellSize = Math.round(SHORT / (0, _utils.randomInRange)(countMin, countMax));
    //console.log(`cellSize: ${cellSize}, countMin:${countMin}, countMax:${countMax}, ${GRIDMODE}, ${DENSITY}`);

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

    // draw background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);
    ctx.lineJoin = 'round';

    ctx.strokeStyle = fg;

    var cellCount = cw / cellSize;
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
    var dotScale = cellSize * (0, _utils.randomInRange)(0.1, 0.2);
    // line width
    var weight = cellSize * (0, _utils.randomInRange)(0.05, 0.15);

    ctx.lineWidth = weight;
    ctx.lineCap = 'round';

    // --------------------------------------
    // BEGIN SHAPES
    // --------------------------------------

    var drawDash2 = function drawDash2(ctx, x, y, size, opts) {
        var angle = opts.angle || (0, _utils.randomInRange)(0, PI);
        var d = size * (0, _utils.randomInRange)(0.75, 1);
        var gap = size / 2;
        var jitter = 0.3;

        ctx.translate(x, y);
        ctx.rotate(angle);

        ctx.beginPath();

        ctx.translate(weight * (0, _utils.randomInRange)(-jitter, jitter), weight * (0, _utils.randomInRange)(-jitter, jitter));

        ctx.moveTo(-d, -gap);
        ctx.lineTo(d, -gap);

        ctx.translate(weight * (0, _utils.randomInRange)(-jitter, jitter), weight * (0, _utils.randomInRange)(-jitter, jitter));

        ctx.moveTo(-d, gap);
        ctx.lineTo(d, gap);

        ctx.stroke();

        (0, _utils.resetTransform)(ctx);
    };

    var drawDash3 = function drawDash3(ctx, x, y, size, opts) {
        var angle = opts.angle || (0, _utils.randomInRange)(0, PI);
        var d = size * (0, _utils.randomInRange)(0.75, 1);
        var gap = size / 3 * 1.75; // make room for extra stroke
        var jitter = 0.33;

        ctx.translate(x, y);
        ctx.rotate(angle);

        ctx.beginPath();

        // randomize between strokes
        ctx.translate(weight * (0, _utils.randomInRange)(-jitter, jitter), weight * (0, _utils.randomInRange)(-jitter, jitter));
        d *= (0, _utils.randomInRange)(0.9, 1.1);

        ctx.moveTo(-d, -gap);
        ctx.lineTo(d, -gap);

        // randomize between strokes
        ctx.translate(weight * (0, _utils.randomInRange)(-jitter, jitter), weight * (0, _utils.randomInRange)(-jitter, jitter));
        d *= (0, _utils.randomInRange)(0.9, 1.1);

        ctx.moveTo(-d, 0);
        ctx.lineTo(d, 0);

        // randomize between strokes
        ctx.translate(weight * (0, _utils.randomInRange)(-jitter, jitter), weight * (0, _utils.randomInRange)(-jitter, jitter));
        d *= (0, _utils.randomInRange)(0.9, 1.1);

        ctx.moveTo(-d, gap);
        ctx.lineTo(d, gap);

        ctx.stroke();

        (0, _utils.resetTransform)(ctx);
    };

    var drawHash2 = function drawHash2(ctx, x, y, size, opts) {
        var angle = opts.angle || (0, _utils.randomInRange)(0, PI);
        drawDash2(ctx, x, y, size, { angle: angle });
        drawDash2(ctx, x, y, size, { angle: angle + PI / 2 });
    };

    var drawHash3 = function drawHash3(ctx, x, y, size, opts) {
        var angle = opts.angle || (0, _utils.randomInRange)(0, PI);
        drawDash3(ctx, x, y, size, { angle: angle });
        drawDash3(ctx, x, y, size, { angle: angle + PI / 2 });
    };

    var drawSpiral = function drawSpiral(ctx, x, y, size, opts) {
        var count = 30; // points

        var t = (0, _utils.randomInRange)(0, TWOPI);
        var arc = TWOPI * (0, _utils.randomInRange)(3, 5);

        var direction = (0, _utils.randItem)([-1, 1]);

        // func to return an x,y point for theta, r
        // bake in offset t and the direction
        var f = function f(theta, r) {
            return [Math.cos(t + theta * direction) * r, Math.sin(t + theta * direction) * r];
        };

        ctx.beginPath();
        ctx.moveTo(x, y);

        for (var i = 0; i < count; i++) {
            // r scaling is magic number, I don't know why the scaling to
            // count isn't working
            var _f = f(i * arc / count, i * size / count * 0.6),
                _f2 = _slicedToArray(_f, 2),
                _x2 = _f2[0],
                _y2 = _f2[1];

            x += _x2;
            y += _y2;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    };

    var drawSquiggle = function drawSquiggle(ctx, x, y, size, opts) {
        var angle = opts.angle || (0, _utils.randomInRange)(0, PI);

        ctx.translate(x, y);
        ctx.rotate(angle);

        ctx.beginPath();

        var _x = -size / 2;
        var _y = -size / 2;

        var steps = (0, _utils.randomInt)(3, 6);

        ctx.beginPath();
        ctx.moveTo(_x, _y);

        for (var i = 0; i < steps; i++) {
            var dir = i % 2 ? 1 : -1;
            ctx.quadraticCurveTo(_x, _y + size / 2 * dir, _x + size / steps, _y + size * dir);
            _x = _x + size / steps;
            _y = _y + size * dir;
        }

        ctx.stroke();

        (0, _utils.resetTransform)(ctx);
    };

    var drawLightning = function drawLightning(ctx, x, y, size, opts) {
        var angle = opts.angle || (0, _utils.randomInRange)(0, PI * 2);

        // these look a little better a little bigger
        size *= (0, _utils.randomInRange)(1, 1.2);

        ctx.translate(x, y);
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.moveTo(0, size * -1); // top left
        ctx.lineTo(size * 0.7, size * -1); // top right
        ctx.lineTo(size * 0.26, size * -0.35); // middle right
        ctx.lineTo(size * 0.67, size * -0.35); // middle push right
        ctx.lineTo(size * -0.55, size * 1); // bottom point
        ctx.lineTo(size * -0.10, size * -0.08); // middle left
        ctx.lineTo(size * -0.42, size * -0.08); // middle push left
        ctx.closePath(); // return to top left

        ctx.stroke();
        (0, _utils.resetTransform)(ctx);
    };

    var drawStar = function drawStar(ctx, x, y, size, opts) {
        var angle = opts.angle || (0, _utils.randomInRange)(0, PI * 2);

        size *= (0, _utils.randomInRange)(1, 1.2);

        // define the star
        var pts = [];
        pts.push([0, -1]);
        pts.push([0.59, 0.95]);
        pts.push([-0.86, -0.26]);
        pts.push([0.86, -0.26]);
        pts.push([-0.59, 0.95]);
        pts.push([0, -1]);

        // scale points and add jitter
        var jitter = 0.2;
        pts = pts.map(function (p) {
            return [p[0] * size * (1 + jitter * (0, _utils.randomInRange)(-1, 1)), p[1] * size * (1 + jitter * (0, _utils.randomInRange)(-1, 1))];
        });

        ctx.translate(x, y);
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.moveTo.apply(ctx, _toConsumableArray(pts.shift()));
        while (pts.length) {
            ctx.lineTo.apply(ctx, _toConsumableArray(pts.shift()));
        }

        ctx.stroke();
        ctx.resetTransform(ctx);
    };

    // --------------------------------------
    // END SHAPES
    // --------------------------------------


    // a set of independent transforms to use while rendering
    var trans = {
        radius: (0, _fieldUtils.createTransform)(0, rateMax),
        angle: (0, _fieldUtils.createTransform)(0, rateMax),
        color: (0, _fieldUtils.createTransform)(0, rateMax / 4)
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

    var pts = [];

    // If we are warping the grid, we should plot points outside of the canvas
    // bounds to avoid gaps at the edges. Shift them over below.
    var overscan = 1;

    pts = (0, _hexScatter2.default)(cellSize, cw * overscan, ch * overscan);

    var shapes = [drawDash2, drawDash3, _shapes.drawCircle, _shapes.drawTriangle, _shapes.drawSquare, _shapes.drawRect, drawSpiral, drawHash2, drawHash3, drawSquiggle, drawLightning, drawStar];

    shapes = (0, _utils.shuffle)(shapes);
    //shapes = [drawStar];

    var colorCount = contrastPalette.length;

    // point renderers:
    var drawPointsWithRandomColorRandomShape = function drawPointsWithRandomColorRandomShape(p, i) {
        x = p[0];
        y = p[1];
        xnorm = x / cw;
        ynorm = y / ch;

        ctx.fillStyle = null;
        ctx.strokeStyle = getContrastColor();

        (0, _utils.randItem)(shapes)(ctx, x, y, dotScale + (1 + trans.radius(xnorm, ynorm)) * (cellSize / 2 - dotScale) / 2.5, {
            fill: null,
            stroke: ctx.strokeStyle, //fg2,
            angle: PI * trans.angle(xnorm, ynorm)
        });
    };

    var drawPointsWithColorField = function drawPointsWithColorField(p, i) {
        x = p[0];
        y = p[1];
        xnorm = x / cw;
        ynorm = y / ch;

        var colorIndex = Math.round((trans.color(xnorm, ynorm) + 1) * colorCount) % colorCount;

        ctx.fillStyle = null;
        ctx.strokeStyle = contrastPalette[colorIndex];

        (0, _utils.randItem)(shapes)(ctx, x, y, dotScale + (1 + trans.radius(xnorm, ynorm)) * (cellSize / 2 - dotScale) / 2.5, {
            fill: null,
            stroke: contrastPalette[colorIndex], //fg2,
            angle: PI * trans.angle(xnorm, ynorm)
        });
    };

    var drawPointsWithShapesFromColors = function drawPointsWithShapesFromColors(p, i) {
        x = p[0];
        y = p[1];
        xnorm = x / cw;
        ynorm = y / ch;

        var colorIndex = Math.round((trans.color(xnorm, ynorm) + 1) / 2 * colorCount) % colorCount;

        var shapeFunc = shapes[colorIndex % shapes.length];

        ctx.fillStyle = null;
        ctx.strokeStyle = contrastPalette[colorIndex];

        shapeFunc(ctx, x, y, dotScale + (1 + trans.radius(xnorm, ynorm)) * (cellSize / 2 - dotScale) / 2.5, {
            fill: null,
            stroke: contrastPalette[colorIndex], //fg2,
            angle: (0, _utils.randomInRange)(PI * 2) //PI * trans.angle(xnorm, ynorm)
        });
    };

    var drawPointsWithConsistentColoredShapes = function drawPointsWithConsistentColoredShapes(p, i) {
        x = p[0];
        y = p[1];
        xnorm = x / cw;
        ynorm = y / ch;

        var shapeIndex = (0, _utils.randomInt)(shapes.length - 1);

        var colorIndex = shapeIndex % contrastPalette.length;

        var shapeFunc = shapes[shapeIndex];

        ctx.fillStyle = null;
        ctx.strokeStyle = contrastPalette[colorIndex];

        shapeFunc(ctx, x, y, dotScale + (1 + trans.radius(xnorm, ynorm)) * (cellSize / 2 - dotScale) / 2.5, {
            fill: null,
            stroke: contrastPalette[colorIndex], //fg2,
            angle: PI * trans.angle(xnorm, ynorm)
        });
    };

    // create collection of point renderers
    var pointRenderers = {
        //drawPointsWithRandomColorRandomShape,
        drawPointsWithColorField: drawPointsWithColorField,
        drawPointsWithShapesFromColors: drawPointsWithShapesFromColors,
        drawPointsWithConsistentColoredShapes: drawPointsWithConsistentColoredShapes

        // step thru points with selected renderer
    };pts.forEach(pointRenderers[(0, _utils.randItem)(Object.keys(pointRenderers))]);

    // reset canvas
    ctx.globalAlpha = 1;

    // donegal roughening
    if (opts.roughen > 0) {
        (0, _speckle.donegal)(el, 'random');
    }

    // classic roughen via shifting pixels
    (0, _roughen2.default)(el, opts.roughen);

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
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = roughen;

var _utils = __webpack_require__(0);

// DEPRECATED IN FAVOR OF postprocess/speckle.js:dapple

function roughen(canvas) {
    var steps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 3;

    if (!steps) return;
    var ctx = canvas.getContext('2d');
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var px = imageData.data; // px to manipulate

    var refCtx = canvas.getContext('2d');
    var ref = refCtx.getImageData(0, 0, canvas.width, canvas.height).data; // reference copy

    var n = px.length;
    var w = canvas.width;
    var h = canvas.height;
    var newIdx = void 0;

    var scratch = document.createElement('canvas');
    scratch.width = w;
    scratch.height = h;
    var scratchCtx = scratch.getContext('2d');

    var directions = [-1, 1, -w, w];
    var distances = [1, 2, 3];

    function shift_pixels(alpha) {
        for (var i = 0; i <= n; i += 4) {
            newIdx = 4 * (0, _utils.randItem)(directions) * (0, _utils.randItem)(distances);
            newIdx += i;
            if (newIdx > n) {
                newIdx = newIdx % n;
            }
            if (newIdx < 0) {
                newIdx = n - newIdx;
            }
            px[newIdx + 0] = ref[i + 0];
            px[newIdx + 1] = ref[i + 1];
            px[newIdx + 2] = ref[i + 2];
            px[newIdx + 3] = ref[i + 3];
        }

        scratchCtx.putImageData(imageData, 0, 0);
        ctx.globalAlpha = alpha;

        ctx.fillStyle = ctx.createPattern(scratch, 'repeat');
        ctx.fillRect(0, 0, w, h);
    }

    var eachAlpha = 1 / (steps + 2);
    while (steps) {
        shift_pixels(eachAlpha);
        steps--;
    }

    ctx.globalAlpha = 1;
}

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.pillars = pillars;

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
    clear: true,
    shadows: 'auto', // [auto, true, false] auto = 50/50
    gridMode: 'normal', // [auto, normal, scatter, random]
    density: 'auto' // [auto, coarse, fine]
};

var PI = Math.PI;
var GRIDMODES = ['normal', 'scatter', 'random'];
var DENSITIES = ['coarse', 'fine'];

// Main function
function pillars(options) {
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
    var GRIDMODE = opts.gridMode === 'auto' ? (0, _utils.randItem)(GRIDMODES) : opts.gridMode;
    var DENSITY = opts.density === 'auto' ? (0, _utils.randItem)(DENSITIES) : opts.density;
    var SHADOWS = opts.shadows === 'auto' ? (0, _utils.randItem)([true, false]) : opts.shadows;

    // color funcs
    var getSolidFill = (0, _utils.getSolidColorFunction)(opts.palette);

    // how many cells are in the grid?
    var countMin = void 0,
        countMax = void 0;
    if (DENSITY === 'coarse') {
        countMin = 5;
        countMax = 10;
    } else {
        countMin = 10;
        countMax = 25;
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
    var fg3 = getContrastColor();

    // draw background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);

    ctx.strokeStyle = fg;

    var cellCount = cw / cellSize;
    var rateMax = 3;
    if (DENSITY === 'fine' && Math.random() < 0.5) {
        rateMax = 6;
    }

    // tail vars
    var _x = void 0,
        _y = void 0,
        len = void 0;

    // line width
    var weight = cellSize * (0, _utils.randomInRange)(0.25, .866);

    ctx.lineWidth = weight;
    ctx.lineCap = 'round';

    // The max height of each column. Thinner cols can be taller.
    var max = cellSize * (0, _utils.randomInRange)(0.5, 1 / (weight / cellSize));

    // --------------------------------------


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

    // a set of independent transforms to use while rendering
    var trans = {
        x: createTransform(rateMax), // (x,y)=>0,//
        y: createTransform(rateMax), // (x,y)=>0,//
        h: createTransform(rateMax) // (x,y)=>0,//
    };

    function hexPack(size, w, h) {
        var pts = [];
        var xcount = Math.ceil(w / size) + 2;
        var ycount = Math.ceil(h / (size * .8660)) + 10; // extra rows
        var count = xcount * ycount;
        var x = void 0,
            y = void 0;
        var shift = void 0;
        for (var j = 0; j <= ycount; j++) {
            shift = j % 2 ? size * .5 : 0;
            for (var i = 0; i <= xcount; i++) {
                x = size * i - shift;
                y = size * j * .8660;
                pts.push([x, y]);
            }
        }
        return pts;
    }

    var pts = [];

    // If we are warping the grid, we should plot points outside of the canvas
    // bounds to avoid gaps at the edges. Shift them over below.
    var overscan = 1;

    pts = hexPack(cellSize, cw, ch);

    var shadowAngle = (0, _utils.randomInRange)(0.2, 0.66) * (0, _utils.randItem)([-1, 1]);
    var shadowStrength = (0, _utils.randomInRange)(0.1, 0.3);

    // step thru points
    pts.forEach(function (p, i) {
        x = p[0];
        y = p[1];
        xnorm = x / cw;
        ynorm = y / ch;

        _x = trans.x(xnorm, ynorm);
        _y = (trans.y(xnorm, ynorm) + 1) / 2 * max;

        if (_y < 0) console.log('oh no', _y);

        // add jitter
        //_y += 0.15 * cellSize * randomInRange(-1, 1);
        _y *= (0, _utils.randomInRange)(1, 1.15);

        ctx.translate(x, y);

        // draw shadow first

        if (opts.shadows) {
            ctx.strokeStyle = 'black';
            ctx.globalAlpha = shadowStrength;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(_y * shadowAngle, _y);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        // draw main post
        var grad = ctx.createLinearGradient(0, -_y, 0, 2 * max - _y);
        grad.addColorStop(0, fg);
        grad.addColorStop(1, fg2);
        ctx.strokeStyle = grad;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -_y);
        ctx.stroke();

        (0, _shapes.drawCircle)(ctx, 0, -_y, weight / 2 - weight / 8, { fill: fg3 });

        ctx.translate(-x, -y);
    });

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
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.rings = rings;

var _noiseutils = __webpack_require__(1);

var _noiseutils2 = _interopRequireDefault(_noiseutils);

var _palettes = __webpack_require__(2);

var _palettes2 = _interopRequireDefault(_palettes);

var _hexScatter = __webpack_require__(4);

var _hexScatter2 = _interopRequireDefault(_hexScatter);

var _utils = __webpack_require__(0);

var _shapes = __webpack_require__(3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PI = Math.PI;
var TWOPI = PI * 2;
var STYLES = ['normal']; // TODO

var DEFAULTS = {
    container: 'body',
    palette: _palettes2.default.plum_sauce,
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true,
    style: 'auto', // from STYLES
    mixWeight: false,
    isolate: true

    // Main function
};function rings(options) {
    var opts = Object.assign({}, DEFAULTS, options);

    var container = opts.container;
    var cw = container.offsetWidth;
    var ch = container.offsetHeight;
    var SCALE = Math.min(cw, ch);
    var LONG = Math.max(cw, ch);
    var SHORT = Math.min(cw, ch);
    var AREA = cw * ch;
    var ASPECT = LONG / SHORT;

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
    var STYLE = opts.style === 'auto' ? (0, _utils.randItem)(STYLES) : opts.style;

    console.log('==================================\nRings:', STYLE);

    // color funcs
    var getSolidFill = (0, _utils.getSolidColorFunction)(opts.palette);

    // setup

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

    // draw background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);

    // rings

    /*
    Approach:
    - choose some center points
    - define a set of widening rings around each center point
    - each ring is solid or dashed, and of varying length and offset
    - all ring defs are in a common array, which we shuffle so they will
      be drawn interleaved if ring clusters overlap
    - around the last center point, draw radial rays, either starting at
      ring edge going outward, or at outer perimeter coming inward.
    - on top of this, draw rings twice: once with extra thickness in the
      background color, then again with a random foreground color.
      This leaves a cutout/outline where they overlap.
    */

    // max line weight depends on canvas size
    var MAXWEIGHT = SCALE / (50 + LONG / 100);
    ctx.lineWidth = MAXWEIGHT;
    console.log('max thickness', MAXWEIGHT);

    var centers = []; // array of center points
    var rings = []; // array of all rings

    // pick a few center points
    // more for large layouts
    var centerCount = (0, _utils.randomInt)(2, 2 + SCALE / 400);
    // more rings per group in large and stretched layouts
    var ringsPerGroup = [5 + Math.round(SCALE / 150), 10 + Math.round(ASPECT * 20)];
    var spacing = 3; // between rings

    // Radius to step outward, intial value. Keep in outer scope because
    // rays will rely on this for drawing too.
    var r = 0;

    // center vars
    // Scatter points coarsely
    // These numbers aren't great
    var MARGIN = SHORT / 12;
    var pts = (0, _hexScatter2.default)(SHORT * 0.5, cw - MARGIN * 2, ch - MARGIN * 2);

    pts.forEach(function (p, i) {
        p[0] += MARGIN;
        p[1] += MARGIN;
        // The scatter algo will place points out of bounds or near edges.
        // Discard those points.
        var bounds = true;
        if (p[0] > cw - MARGIN) bounds = false;
        if (p[0] < MARGIN) bounds = false;
        if (p[1] > ch - MARGIN) bounds = false;
        if (p[1] < MARGIN) bounds = false;

        if (bounds) {
            centers.push({ x: p[0], y: p[1] });
            //drawCircle(ctx,p[0], p[1], 30, {fill:'red'});
        }
    });

    // Limit centers, since hexscatter has a lot of overscan and does
    // poorly when cell size is large compared to container.
    // Allow more centers for stretched layouts.
    centers = (0, _utils.shuffle)(centers);
    var maxCenters = Math.ceil(ASPECT);
    centers = centers.slice(0, maxCenters);

    // Step through the centers and create ring clusters for each
    centers.forEach(function (center, i) {
        // intial r
        r = SCALE / 20;

        var ringCount = _utils.randomInt.apply(undefined, ringsPerGroup);
        // make several rings
        while (ringCount--) {
            // create a ring
            var thickness = (0, _utils.randomInRange)(MAXWEIGHT / 4, MAXWEIGHT);
            r += thickness / 2 + spacing;

            var arcLength = void 0;
            var arcOffset = void 0;

            // choose between incomplete or complete rings
            if (Math.random() < 0.75) {
                // incomplete vary from 1/4 to 3/4 turn
                arcLength = (0, _utils.randomInRange)(TWOPI * 1 / 3, TWOPI * 5 / 7);
                arcOffset = (0, _utils.randomInRange)(0, PI * 2);
            } else {
                // complete circle
                arcLength = PI * 2;
                arcOffset = 0;
            }

            // define the ring
            var ring = {
                x: center.x,
                y: center.y,
                r: r,
                start: arcOffset,
                end: arcOffset + arcLength,
                reverse: 0, //(Math.random() > 0.5),
                thickness: thickness,
                color: getContrastColor(),
                dashes: ''

                // push it to rings[]
            };rings.push(ring);

            // increment r by ring thickness + spacing
            r += ring.thickness / 2 + spacing;
        }
    });

    console.log(rings.length + ' rings around ' + centers.length + ' centers');

    /**
     * util for drawing rays
     * from @p1 to @p2, at thickness @weight.
     * Start solid and draws the last @dottedFraction dotted or dashed,
     * depending on weight.
     * Relies on a global context ctx;
     * */
    function dottedLine(p1, p2, weight) {
        var dottedFraction = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0.33;

        ctx.lineWidth = weight;

        var _p = _slicedToArray(p1, 2),
            x1 = _p[0],
            y1 = _p[1];

        var _p2 = _slicedToArray(p2, 2),
            x2 = _p2[0],
            y2 = _p2[1];

        var dx = x2 - x1;
        var dy = y2 - y1;

        var d = Math.sqrt(dx * dx + dy * dy);

        var t = Math.atan(dy / dx);
        if (x2 < x1) t += PI;

        var mx = x1 + Math.cos(t) * d * (1 - dottedFraction);
        var my = y1 + Math.sin(t) * d * (1 - dottedFraction);

        // start solid
        ctx.lineCap = 'butt';
        ctx.setLineDash([]);
        ctx.lineDashOffset = 0;
        // draw solid segment
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(mx, my);
        ctx.stroke();

        // dotted portion:
        ctx.beginPath();
        ctx.lineCap = 'round';
        if (weight <= 4) {
            // thin strokes
            ctx.setLineDash([weight, weight * 4]);
            ctx.lineDashOffset = 0;
        } else {
            // thick strokes
            ctx.setLineDash([0, weight * 2]);
            ctx.lineDashOffset = weight * 1;
        }
        ctx.moveTo(mx, my);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // reset dashes for any following drawing
        ctx.setLineDash([]);
        ctx.lineDashOffset = 0;
    }

    // draw rays
    // start from the last incremented value of r
    var minRayRadius = r + MAXWEIGHT;
    var maxrayEnd = rayStart * (0, _utils.randomInRange)(1.1, 2);
    var rayStart = void 0,
        rayEnd = void 0;

    var rayStyle = (0, _utils.randItem)(['INNER', 'OUTER']);

    // bigger circle = room for more rays
    var rayCount = void 0;
    if (rayStyle === 'OUTER') {
        rayCount = (0, _utils.randomInt)(60, 120);
    } else {
        rayCount = (0, _utils.randomInt)(40, 80);
    }

    console.log(rayCount + ' rays');
    var rays = [];
    // use the last center, because that corresponds to the r value we are using
    var rayCenter = centers[centers.length - 1];

    // linecap for rays is always butt, for precise origin
    ctx.lineCap = 'butt';
    var dottedFraction = void 0; // will pass to dottedLine with various values

    // step through the rays
    for (var i = 0; i < rayCount; i++) {
        ctx.strokeStyle = getContrastColor();

        var theta = i * TWOPI / rayCount;
        var _rayEnd = minRayRadius * (0, _utils.randomInRange)(1.1, 2);
        var _cos = void 0,
            _sin = void 0;
        _cos = Math.cos(theta);
        _sin = Math.sin(theta);

        var _start = void 0,
            _end = void 0;
        if (rayStyle === 'INNER') {
            _start = minRayRadius;
            _end = _rayEnd;
        } else if (rayStyle === 'OUTER') {
            _start = LONG * 1.44;
            _end = _rayEnd;
        } else {
            return;
        }

        var rayWidth = void 0;

        // rays have alternating thickness and dottedness
        if (i % 2) {
            dottedFraction = 0;
            rayWidth = (0, _utils.randomInRange)(1, MAXWEIGHT);
        } else {
            dottedFraction = (0, _utils.randomInRange)(0.15, 0.33);
            rayWidth = (0, _utils.randomInRange)(1, MAXWEIGHT / 2);
        }

        // draw with dotted line util
        dottedLine([rayCenter.x + _cos * _start, rayCenter.y + _sin * _start], [rayCenter.x + _cos * _end, rayCenter.y + _sin * _end], rayWidth, dottedFraction);
    }

    // prepare linecap for rings
    // prefer square, use round sometimes
    ctx.lineCap = (0, _utils.randItem)(['round', 'square', 'square', 'square', 'square']);

    // then shuffle rings to interleave
    rings = (0, _utils.shuffle)(rings);

    // for each ring, draw it
    rings.forEach(function (ring, i) {
        // draw this ring

        var dash = ring.thickness * (0, _utils.randomInRange)(0.5, 5);

        // sometimes set dashes, others do continuous lines
        if (Math.random() < 0.5) {
            ctx.setLineDash([dash, dash * (0, _utils.randomInRange)(0, 3) + ring.thickness]);
            ctx.lineDashOffset = -spacing; // to get shadow around dashes
        } else {
            ctx.setLineDash([]);
        }

        // draw a shadow with bg color and extra thickness
        ctx.beginPath();
        var cap = spacing / ring.r; // extend the shadow a bit around the end
        ctx.arc(ring.x, ring.y, ring.r, ring.start - cap, ring.end + cap, ring.reverse);
        ctx.lineWidth = ring.thickness + 2 * spacing;
        ctx.strokeStyle = bg;
        ctx.stroke();

        // draw the fg ring with a rando color
        ctx.lineDashOffset = 0;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.r, ring.start, ring.end, ring.reverse);
        ctx.lineWidth = ring.thickness;
        ctx.strokeStyle = ring.color;
        ctx.stroke();
    });

    // clear dash settings
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;

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
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.plants = plants;

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
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true,

    splitting: 'auto',
    budding: 'auto',
    stopping: 'auto',
    flowering: 'auto',
    divergence: 'auto', // degrees
    growthDecay: 'auto',
    curvature: 'auto',
    straightening: 'auto',
    thinning: 'auto',
    leaning: 'auto',
    roughness: 'auto',
    knobbiness: 'auto'
};

var PI = Math.PI;

// Main function
function plants(options) {
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

    // Props

    // hello world
    console.log('--------------------------------------\nPlants');

    var SPLITTING = (0, _utils.mapKeywordToVal)({
        'low': 0.2,
        'med': 0.3,
        'high': 0.4
    })(opts.splitting, 'splitting');
    var BUDDING = (0, _utils.mapKeywordToVal)({
        'low': 0.2,
        'med': 0.3,
        'high': 0.5
    })(opts.budding, 'budding');
    var STOPPING = (0, _utils.mapKeywordToVal)({
        'low': 0.1,
        'med': 0.2,
        'high': 0.3
    })(opts.stopping, 'stopping');
    var FLOWERING = (0, _utils.mapKeywordToVal)({
        'none': 0,
        'low': 0.25,
        'med': 0.6,
        'high': 0.8,
        'all': 1
    })(opts.flowering, 'flowering');
    var DIVERGENCE = (0, _utils.mapKeywordToVal)({
        'low': [15, 30],
        'med': [30, 60],
        'high': [60, 90]
    })(opts.divergence, 'divergence') * PI / 180; //opts.divergence * PI / 180; // input is in degrees
    var GROWTHDECAY = (0, _utils.mapKeywordToVal)({
        'low': 0.9,
        'med': 0.8,
        'high': 0.7
    })(opts.growthDecay, 'decay');
    var CURVATURE = (0, _utils.mapKeywordToVal)({
        'low': [0, 0.05],
        'med': [0.05, 0.1],
        'high': [0.1, 0.15]
    })(opts.curvature, 'curvature');
    var STRAIGHTENING = (0, _utils.mapKeywordToVal)({
        'low': 1,
        'med': 0.85,
        'high': [0.7, 0.8]
    })(opts.straightening, 'straightening');
    var THINNING = (0, _utils.mapKeywordToVal)({
        'low': [0.97, 1],
        'med': [0.92, 0.95],
        'high': [0.85, 0.9]
    })(opts.thinning, 'thinning');
    var LEANING = (0, _utils.mapKeywordToVal)({
        'low': [0, 0.15],
        'med': [0.15, 0.25],
        'high': [0.25, 0.35]
    })(opts.leaning, 'leaning');
    var ROUGHNESS = (0, _utils.mapKeywordToVal)({
        'off': 0,
        'low': 0.15,
        'med': 0.2,
        'high': 0.3
    })(opts.roughness, 'roughness');
    var KNOBBINESS = (0, _utils.mapKeywordToVal)({
        'off': 0,
        'low': [0.1, 0.15],
        'med': [0.2, 0.3],
        'high': [0.25, 0.35]
    })(opts.knobbiness, 'knobbiness');

    // color funcs
    var randomFill = function randomFill() {
        return "#" + Math.random().toString(16).slice(2, 8);
    };
    var getSolidFill = (0, _utils.getSolidColorFunction)(opts.palette);

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
    var accentColor = getContrastColor();

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);

    // directly draw from a to b
    function drawAbsoluteLineSegment(a, b) {
        ctx.beginPath();
        ctx.moveTo.apply(ctx, _toConsumableArray(a));
        ctx.lineTo.apply(ctx, _toConsumableArray(b));
        ctx.stroke();

        console.log('drawLineSegment from ' + a + ' to ' + b);
    }

    // draw from x, y, by transforming the canvas and moving
    // "horizontally" for length.
    function drawLineSegment(x, y, angle, length) {
        ctx.translate(x, y);
        ctx.rotate(-angle);

        // draw "horizontally" from a to b
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(length, 0);
        ctx.stroke();

        var x2 = void 0,
            y2 = void 0;
        x2 = length * Math.cos(angle);
        y2 = length * Math.sin(angle);

        // reset transforms
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        return [x2, y2];
    }

    // draw from a to b, by transforming the canvas and moving
    // "horizontally" across.
    // Draw with a trace of dots.
    // Use ROUGHNESS for jitter, and KNOBBINESS to scatter extra dots
    // around endpoints.
    function drawPlantSegment(x, y, angle, length) {
        var size = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 3;
        var curvature = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0.2;
        var color = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : fg;

        // translate to a, point toward b
        ctx.translate(x, y);
        ctx.rotate(-angle);

        // draw "horizontally" from a to b
        ctx.beginPath();
        ctx.moveTo(0, 0);

        // min size of tracing dot in case thinning takes us too far down
        size = Math.max(size, 0.75);

        length *= (0, _utils.randomInRange)(0.75, 1.25); // randomize length

        var steps = Math.round(length);
        var inc = length / steps;
        var _x = void 0,
            _y = void 0;
        for (var i = 0; i < steps; i++) {
            _x = inc * i;
            _y = curvature * length * Math.sin(i / steps * PI);
            _y += (0, _utils.randomInRange)(-1, 1) * ROUGHNESS * size; // jitter
            (0, _shapes.drawCircle)(ctx, _x, _y, size / 2, { fill: color });
        }

        var x2 = void 0,
            y2 = void 0;
        x2 = x + length * Math.cos(-angle);
        y2 = y + length * Math.sin(-angle);

        if (KNOBBINESS > 0) {
            // draw cluster near the ends
            var bx = void 0,
                by = void 0;
            var knobLength = size * 2;

            var knobCount = 20;

            // near end
            for (var i = 0; i < knobCount; i++) {
                bx = (0, _utils.randomInRange)(0, knobLength);
                by = KNOBBINESS * (0, _utils.randItem)([-1, 1]) * (knobLength - bx);
                (0, _shapes.drawCircle)(ctx, bx, by, size / 2, { fill: color });
            }
            // far end
            for (var i = 0; i < knobCount; i++) {
                bx = (0, _utils.randomInRange)(0, knobLength);
                by = KNOBBINESS * (0, _utils.randItem)([-1, 1]) * (knobLength - bx);
                (0, _shapes.drawCircle)(ctx, length - bx, by, size / 2, { fill: color });
            }
        }

        // reset transforms
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        //console.log(`traceSegment from ${x},${y} to ${x2},${y2}, angle ${angle * 180/PI} len ${length}`);

        return [x2, y2];
    }

    // draw a bud or flower
    function drawTip(x, y, angle, size, color) {
        if (Math.random() < FLOWERING) {
            drawFlower.apply(undefined, arguments);
        } else {
            drawBud.apply(undefined, arguments);
        }
    }

    // closed, solid fg colored bud
    function drawBud(x, y, angle, size, color) {
        ctx.translate(x, y);
        ctx.rotate(-angle);

        color = color || 'red';

        ctx.beginPath();

        ctx.lineWidth = size;
        ctx.lineCap = 'round';

        var _x = size * 2;
        var len = size * (0, _utils.randomInRange)(3, 5);
        var height = size * 2;

        // draw leaf shape with two simple curves
        ctx.moveTo(_x, 0);
        ctx.quadraticCurveTo(_x + len / 2, height, _x + len, 0);
        ctx.quadraticCurveTo(_x + len / 2, -height, _x, 0);

        ctx.strokeStyle = fg;
        ctx.fillStyle = fg;

        ctx.fill();
        ctx.stroke();

        // reset transforms
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.setLineDash([]);
    }

    // flower with contrasting fill
    function drawFlower(x, y, angle, size, color) {
        ctx.translate(x, y);
        ctx.rotate(-angle);

        color = color || 'red';

        ctx.beginPath();

        ctx.lineWidth = size;
        ctx.lineCap = 'round';

        var _x = size * 2;
        var len = size * (0, _utils.randomInRange)(7, 10);
        var height = size * 4;

        // draw leaf shape with two simple curves
        ctx.moveTo(_x, 0);
        ctx.quadraticCurveTo(_x + len / 2, height, _x + len, 0);
        ctx.quadraticCurveTo(_x + len / 2, -height, _x, 0);

        ctx.strokeStyle = fg;
        ctx.fillStyle = color;

        ctx.fill();
        ctx.stroke();

        // center stroke
        ctx.lineWidth *= (0, _utils.randomInRange)(0.6, 0.8);

        var dash = len * (0, _utils.randomInRange)(0.3, 0.7);
        ctx.setLineDash([dash, (0, _utils.randomInRange)(len * 0.3, dash)]);
        ctx.beginPath();
        ctx.moveTo(_x, 0);
        ctx.lineTo(_x + len, 0);
        ctx.stroke();

        //drawCircle(ctx, size * 1.5, 0, size * 3, {fill: color, stroke: fg});


        // reset transforms
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.setLineDash([]);
    }

    // --------------------------------------
    // Test objects
    // --------------------------------------

    // random points
    var p1 = void 0,
        p2 = void 0;
    p1 = [(0, _utils.randomInRange)(0, cw), (0, _utils.randomInRange)(0, ch)];
    p2 = [(0, _utils.randomInRange)(0, cw), (0, _utils.randomInRange)(0, ch)];

    // draw the test points
    // drawCircle(ctx, ...p1, 10, {fill:null, stroke:'red'});
    // drawCircle(ctx, ...p2, 10, {fill:null, stroke:'blue'});

    var v = (0, _utils.getVector)(p1, p2);

    // test segment renderers
    // ctx.strokeStyle = '#39c';
    // drawLineSegment(p1[0], p1[1], v.angle, v.length);

    // ctx.strokeStyle = '#39c';
    // traceSegment(p1[0], p1[1], v.angle, v.length, 3, -0.2);

    // console.log(`Test with angle ${v.angle} (${v.angle * 180/PI})`)


    // --------------------------------------
    // Real stuff
    // --------------------------------------


    // background lines:
    // --------------------------------------

    var vines = [];
    var vineCount = cw / (0, _utils.randomInRange)(15, 30);
    var vineColor = getContrastColor();
    var vineWidth = cw / (0, _utils.randomInRange)(600, 1200);
    vineWidth = Math.max(vineWidth, 1);

    ctx.strokeStyle = vineColor;
    ctx.lineWidth = vineWidth;
    ctx.globalAlpha = (0, _utils.randomInRange)(0.2, 0.4);

    for (var i = 0; i < vineCount; i++) {
        var vx = cw / vineCount * (i + 1 / 2);
        var vh = (0, _utils.randomInRange)(ch * 0.05, ch * 0.5);
        drawLineSegment(vx, 0, -PI / 2, vh);
        (0, _shapes.drawCircle)(ctx, vx, vh, cw / vineCount * (0, _utils.randomInRange)(0.5, 0.75), { fill: vineColor });

        // draw more dots up the vine
        // each higher than the last
        // offset slightly left/right

        var maxDots = 4;
        var last = 1;
        var seed = 1;

        for (var j = 0; j < maxDots; j++) {
            seed = Math.random();
            if (seed < last) {
                (0, _shapes.drawCircle)(ctx, vx + (0, _utils.randomInRange)(-cw / vineCount, cw / vineCount), vh * seed, cw / vineCount * (0, _utils.randomInRange)(0.5, 0.75), { fill: vineColor });

                last = seed;
            }
        }
    }
    ctx.globalAlpha = 1;

    // branch setup
    // --------------------------------------

    // Set up initial branches
    var branches = [];
    var branchCount = Math.round(cw / 100);

    // Define initial branch properties
    for (var i = 0; i < branchCount; i++) {
        branches.push({
            x: cw / branchCount * (i + 1 / 2),
            y: ch + (0, _utils.randomInRange)(0, 70),
            angle: PI / 2 + (0, _utils.randomInRange)(-PI / 8, PI / 8),
            width: SCALE / 100 * (0, _utils.randomInRange)(0.5, 0.75),
            budSize: SCALE / 100 * (0, _utils.randomInRange)(0.33, 0.5),
            curvature: CURVATURE,
            lean: (0, _utils.randomInRange)(-1, 1),
            color: 'color',
            stepCount: (0, _utils.randomInt)(5, 7),
            length: ch / 2 / 6 / GROWTHDECAY //SCALE / 10 / GROWTHDECAY
        });
    }

    // branch loop
    // --------------------------------------


    while (branches.length) {
        branches.forEach(function (branch, i) {
            // main branch propagation logic

            var curveSign = branch.stepCount % 2 ? 1 : -1;

            // remove dead branches
            if (branch.stepCount <= 0) {
                // remove dead branches
                branches.splice(i, 1);
                drawTip(branch.x, branch.y, branch.angle, branch.budSize, accentColor);
                return;
            }

            // remaining branches continue and draw,
            // then decide to split or bud


            // draw main branch

            // first in background as mask
            /*traceSegment(
                branch.x,
                branch.y,
                branch.angle,
                branch.length,
                branch.width * 3,
                branch.curvature * curveSign,
                bg
            );*/

            // then in fg

            var _drawPlantSegment = drawPlantSegment(branch.x, branch.y, branch.angle, branch.length, branch.width, branch.curvature * curveSign, fg);

            var _drawPlantSegment2 = _slicedToArray(_drawPlantSegment, 2);

            branch.x = _drawPlantSegment2[0];
            branch.y = _drawPlantSegment2[1];


            var splitSign = void 0;
            splitSign = curveSign * -1;

            // gap between new branch and base branch
            var splitGap = branch.width * 2;

            if (Math.random() < SPLITTING && branch.stepCount > 1) {
                // split a new branch sometimes

                // debug: highlight branch point
                //drawCircle(ctx, branch.x, branch.y, branch.width * 5, {fill:null,stroke:'#ace'});

                // only kink new branch
                var splitAngle = branch.angle - DIVERGENCE * splitSign;

                // ok fine kink both branches a little
                var kinkFactor = branch.lean > 0 ? 1 : -1;
                kinkFactor *= 0.3;

                branch.angle += kinkFactor * DIVERGENCE;
                splitAngle += kinkFactor * DIVERGENCE;

                // push a clean copy of the branch as a new branch.
                // add a little gap along the vector before starting the new branch
                // reverse the curvature so its ready for the next step
                branches.push(Object.assign({}, branch, {
                    x: branch.x + splitGap * Math.cos(splitAngle),
                    y: branch.y - splitGap * Math.sin(splitAngle),
                    angle: splitAngle,
                    width: branch.width * THINNING,
                    curvature: -branch.curvature
                }));
            } else if (Math.random() < BUDDING && branch.stepCount > 1) {
                // add a bud
                //branch.angle -= diverge * splitSign;
                drawTip(branch.x, branch.y, branch.angle + DIVERGENCE, branch.budSize, accentColor);
            } else if (Math.random() < STOPPING) {
                // stop and bud
                branch.stepCount = 0; // will draw next pass
            }

            // update the branch
            branch.stepCount--;
            branch.length *= GROWTHDECAY; // reduce length each time
            branch.curvature *= STRAIGHTENING; // straighten out each time
            branch.width *= THINNING; // thin out each time
            branch.angle += branch.lean * LEANING;
        });
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
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.scales = scales;

var _noiseutils = __webpack_require__(1);

var _noiseutils2 = _interopRequireDefault(_noiseutils);

var _palettes = __webpack_require__(2);

var _palettes2 = _interopRequireDefault(_palettes);

var _utils = __webpack_require__(0);

var _shapes = __webpack_require__(3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Accepts array @options, with elements [opt, weight].
// Returns an array with each @opt inserted @weight times.
// This is a very stupid way to pick randItem from enumerable options with
// different weights for each item.
function weightedPickList(options) {
    var list = [];
    options.forEach(function (weighted, i) {
        var _weighted = _slicedToArray(weighted, 2),
            opt = _weighted[0],
            weight = _weighted[1];

        for (var n = 0; n < weight; n++) {
            list.push(opt);
        }
    });
    return list;
}

// how to pick scale styles
var STYLES = weightedPickList([['patches', 2], ['fields', 5], ['stripes', 1]]);
// how much of the palette to use
var COLORDEPTHS = ['small', 'medium', 'medium', 'large'];

var DEFAULTS = {
    container: 'body',
    palette: _palettes2.default.north_beach,
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true,

    style: 'auto', // how to arrange scales
    colorDepth: 'auto', // how much of the palette to use
    edges: 'auto' // consistent edge coloring
};

var PI = Math.PI;

// Main function
function scales(options) {
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

    // Modes and styles
    // --------------------------------------

    var STYLE = opts.style === 'auto' ? (0, _utils.randItem)(STYLES) : opts.style;
    var COLORDEPTH = opts.colorDepth === 'auto' ? (0, _utils.randItem)(COLORDEPTHS) : opts.colorDepth;
    var EDGES = opts.edges === 'auto' ? Math.random() < 0.5 : opts.edges;

    console.log('Scales: ' + STYLE + ', ' + COLORDEPTH + ' colors, edges: ' + EDGES);

    // Color funcs
    // --------------------------------------

    var getSolidFill = (0, _utils.getSolidColorFunction)(opts.palette);

    // shared colors
    var bg = getSolidFill();

    // get palette of non-bg colors
    var contrastPalette = [].concat(opts.palette);
    contrastPalette.splice(opts.palette.indexOf(bg), 1);
    var getContrastColor = (0, _utils.getSolidColorFunction)(contrastPalette);

    // shared foregrounds
    var fg = getContrastColor();
    var fg2 = getContrastColor();
    var fg3 = getContrastColor();
    //fg3 = fg;

    // fill background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);

    // set default stroke
    ctx.strokeStyle = fg;

    // Draw Stuff
    // --------------------------------------

    // scale styles
    // --------------------------------------

    ctx.lineCap = 'round';

    var scaleFunctions = [function (x, y, r, c1, c2, c3) {
        // 2C simple circle
        (0, _shapes.drawCircle)(ctx, x, y, r * 1.0, { fill: c1 });
        (0, _shapes.drawCircle)(ctx, x, y, r * 0.9, { fill: c2 });
        (0, _shapes.drawCircle)(ctx, x, y, r * 0.85, { fill: c1 });
        (0, _shapes.drawCircle)(ctx, x, y, r * 0.75, { fill: c2 });
    }, function (x, y, r, c1, c2, c3) {
        // 2C thin lines
        (0, _shapes.drawCircle)(ctx, x, y, r * 1.0, { fill: c1 });
        (0, _shapes.drawCircle)(ctx, x, y, r * 0.9, { fill: c2 });
        (0, _shapes.drawCircle)(ctx, x, y, r * 0.75, { fill: c1 });
        (0, _shapes.drawCircle)(ctx, x, y, r * 0.65, { fill: c2 });
        (0, _shapes.drawCircle)(ctx, x, y, r * 0.5, { fill: c1 });
        (0, _shapes.drawCircle)(ctx, x, y, r * 0.4, { fill: c2 });
        (0, _shapes.drawCircle)(ctx, x, y, r * 0.25, { fill: c1 });
        (0, _shapes.drawCircle)(ctx, x, y, r * 0.15, { fill: c2 });
    }, function (x, y, r, c1, c2, c3) {
        // 2C evenly spaced rings
        (0, _shapes.drawCircle)(ctx, x, y, r * 1.0, { fill: c1 });
        (0, _shapes.drawCircle)(ctx, x, y, r * 0.8, { fill: c2 });
        (0, _shapes.drawCircle)(ctx, x, y, r * 0.6, { fill: c1 });
        (0, _shapes.drawCircle)(ctx, x, y, r * 0.4, { fill: c2 });
        (0, _shapes.drawCircle)(ctx, x, y, r * 0.2, { fill: c1 });
    }, function (x, y, r, c1, c2, c3) {
        // 3C thin middle ring
        (0, _shapes.drawCircle)(ctx, x, y, r * 1.0, { fill: c1 });
        (0, _shapes.drawCircle)(ctx, x, y, r * 0.9, { fill: c2 });
        (0, _shapes.drawCircle)(ctx, x, y, r * 0.6, { fill: c3 });
        (0, _shapes.drawCircle)(ctx, x, y, r * 0.5, { fill: c2 });
        (0, _shapes.drawCircle)(ctx, x, y, r * 0.2, { fill: c3 });
    }, function (x, y, r, c1, c2, c3) {
        // 3C twin middle ring
        (0, _shapes.drawCircle)(ctx, x, y, r * 1.0, { fill: c1 });
        (0, _shapes.drawCircle)(ctx, x, y, r * 0.9, { fill: c2 });
        (0, _shapes.drawCircle)(ctx, x, y, r * 0.7, { fill: c3 });
        (0, _shapes.drawCircle)(ctx, x, y, r * 0.6, { fill: c2 });
        (0, _shapes.drawCircle)(ctx, x, y, r * 0.5, { fill: c3 });
        (0, _shapes.drawCircle)(ctx, x, y, r * 0.4, { fill: c2 });
        (0, _shapes.drawCircle)(ctx, x, y, r * 0.2, { fill: c3 });
    }, function (x, y, r, c1, c2, c3) {
        // 3C dots
        var lineWidth = r * 0.25;
        ctx.lineWidth = lineWidth;
        ctx.setLineDash([0, lineWidth * 1.33]);
        (0, _shapes.drawCircle)(ctx, x, y, r * 1.0, { fill: c1 });
        (0, _shapes.drawCircle)(ctx, x, y, r * 0.9, { fill: c2 });
        (0, _shapes.drawCircle)(ctx, x, y, r * 0.55, { fill: null, stroke: c3 });
        (0, _shapes.drawCircle)(ctx, x, y, r * 0.2, { fill: c1 });
        // reset line dashes for other renderers
        ctx.setLineDash([]);
    }, function (x, y, r, c1, c2, c3) {
        // 3C double dots
        var lineWidth = r * 0.175;
        ctx.lineWidth = lineWidth;
        ctx.setLineDash([0, lineWidth * 1.5]);
        (0, _shapes.drawCircle)(ctx, x, y, r * 1.0, { fill: c1 });
        (0, _shapes.drawCircle)(ctx, x, y, r * 0.9, { fill: c2 });
        (0, _shapes.drawCircle)(ctx, x, y, r * 0.675, { fill: null, stroke: c3 });
        (0, _shapes.drawCircle)(ctx, x, y, r * 0.425, { fill: null, stroke: c3 });
        (0, _shapes.drawCircle)(ctx, x, y, r * 0.2, { fill: c3 });
        ctx.setLineDash([]);
    }];

    var scaleRenderer = (0, _utils.randItem)(scaleFunctions);
    //scaleRenderer = scaleFunctions[scaleFunctions.length-1];


    // grid stuff
    // --------------------------------------

    var v_spacing = 0.3; // .5 or less
    var h_spacing = 0.915; //

    // map spacing from v to h
    // .1 -> .75
    // .2 -> .8
    // .23 -> .845
    // .25 -> .85
    // .28 -> .90
    // .3 -> .915
    // .3333 -> .93 // .3333 and above shows full center dots
    // .4 -> .96
    // .5 -> 1


    var ref = (0, _utils.randomInt)(10, 15); // horizontal reference count
    ref = Math.round(cw / (0, _utils.randomInRange)(60, 90));
    var size = Math.round(cw / ref);
    var xcount = Math.ceil(cw / size * 1 / h_spacing) + 2;
    var ycount = Math.ceil(ch / size) * 1 / v_spacing + 2;
    var count = xcount * ycount;

    var pts = [];
    var x = void 0,
        y = void 0;
    for (var j = 0; j < ycount; j++) {
        for (var i = 0; i <= xcount; i++) {
            x = size * i * h_spacing; // + size / 2;
            if (j % 2) x += size / 2 * h_spacing;
            y = j * size * v_spacing; // + size / 2;
            pts.push([x, y]);
        }
    }

    // end grid
    // --------------------------------------


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

    // a set of independent transforms to use while rendering
    var trans = {
        style: createTransform(0, 3),
        color: createTransform(0, 3)
    };

    var xnorm = void 0,
        ynorm = void 0;

    var renderSet = [].concat(scaleFunctions);
    renderSet.sort(function () {
        return Math.random() - 0.5;
    });

    var clusterNodes = [];
    if (STYLE === 'patches') {
        // Scatter a point for each rendering style we have
        // At render time, we will check to see which clusterNode a given scale
        // is closest to, then use the renderer with the same index as its
        // closest node.
        renderSet.forEach(function (p, i) {
            // Use x,y between 0 and 1 because we will compare to normalize coords
            clusterNodes.push([(0, _utils.randomInRange)(0, 1), (0, _utils.randomInRange)(0, 1)]);
        });
    }

    // set up vars for color cycling across styles
    var styleCount = renderSet.length;
    var c1 = fg,
        c2 = fg2,
        c3 = fg3;

    // How many times through the style set?
    // Run through more times for large COLORDEPTH

    var CYCLES = 1;
    if (COLORDEPTH === 'large') {
        CYCLES = 2;
    }

    // Finally: step through the points in the scale placements, and draw
    // a scale at each point
    pts.forEach(function (p, i) {
        x = p[0];
        y = p[1];
        xnorm = x / cw;
        ynorm = y / ch;

        var renderIndex = 0;

        //console.log(Math.floor(ynorm * (scaleFunctions.length - 1)));

        if (STYLE === 'patches') {
            // pick renderer closest to this point
            var minR = 2; // max squared dimension for normalized vals
            var R = void 0;
            clusterNodes.forEach(function (n, i) {
                var dx = xnorm - n[0];
                var dy = ynorm - n[1];
                R = dx * dx + dy * dy;
                if (R < minR) {
                    minR = R;
                    renderIndex = i;
                }
                //console.log(`renderer ${i}: ${R}`);
            });
            //console.log(`picked renderer ${renderIndex} with distance ${R}`);
            scaleRenderer = renderSet[renderIndex];

            // Define colors from the contrast palette,
            // aligned to the render styles.
            // Stepping through by index this way ensures that adjacent
            // styles share some colors
            if (COLORDEPTH !== 'small') {
                c1 = contrastPalette[(renderIndex + 0) % contrastPalette.length];
                c2 = contrastPalette[(renderIndex + 1) % contrastPalette.length];
                c3 = contrastPalette[(renderIndex + 2) % contrastPalette.length];
            }
            if (EDGES) {
                c1 = bg;
            }
        } else if (STYLE === 'fields') {

            // field term is periodic function, pushed into postive vals
            var f = (trans.style(xnorm, ynorm) + 1) / 2;
            var _renderIndex = Math.round(f * (renderSet.length - 1) * CYCLES);

            scaleRenderer = renderSet[_renderIndex % renderSet.length];

            // Define colors from the contrast palette,
            // aligned to the render styles.
            // Stepping through by index this way ensures that adjacent
            // styles share some colors
            if (COLORDEPTH !== 'small') {
                c1 = contrastPalette[(_renderIndex + 0) % contrastPalette.length];
                c2 = contrastPalette[(_renderIndex + 1) % contrastPalette.length];
                c3 = contrastPalette[(_renderIndex + 2) % contrastPalette.length];
            }
            if (EDGES) {
                c1 = bg;
            }
        } else {
            // STYLE === 'stripes'
            // draw in bands based on ynorm
            renderIndex = Math.round(ynorm * (renderSet.length - 1));
            scaleRenderer = renderSet[renderIndex];

            // Define colors from the contrast palette,
            // aligned to the render styles.
            // Stepping through by index this way ensures that adjacent
            // styles share some colors
            if (COLORDEPTH !== 'small') {
                c1 = contrastPalette[(renderIndex + 0) % contrastPalette.length];
                c2 = contrastPalette[(renderIndex + 1) % contrastPalette.length];
                c3 = contrastPalette[(renderIndex + 2) % contrastPalette.length];
            }
            if (EDGES) {
                c1 = bg;
            }
        }

        scaleRenderer(x, y, size / 2, c1, c2, c3);
    });

    // debug: draw the reference nodes
    // ctx.font = '14px sans-serif';
    // ctx.textAlign = 'center';
    // ctx.textBaseline = 'middle'
    // clusterNodes.forEach((n, i)=>{
    //     drawCircle(ctx, cw * n[0], ch * n[1], 10, {fill: 'black'});
    //     ctx.fillStyle = 'white';
    //     ctx.fillText(i, cw * n[0], ch * n[1]);
    // });


    // Finish up
    // --------------------------------------

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
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.sweater = sweater;

var _noiseutils = __webpack_require__(1);

var _noiseutils2 = _interopRequireDefault(_noiseutils);

var _palettes = __webpack_require__(2);

var _palettes2 = _interopRequireDefault(_palettes);

var _hexScatter = __webpack_require__(4);

var _hexScatter2 = _interopRequireDefault(_hexScatter);

var _speckle = __webpack_require__(7);

var _utils = __webpack_require__(0);

var _shapes = __webpack_require__(3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULTS = {
    container: 'body',
    palette: _palettes2.default.admiral,
    addNoise: 0.04,
    noiseInput: null,
    clear: true,
    style: 'auto', // from STYLES
    mixWeight: false,
    isolate: true
};

var PI = Math.PI;
var TWOPI = PI * 2;
var STYLES = ['normal']; // TODO

var DEBUG = false;

// Main function
function sweater(options) {
    var startTime = new Date().getTime();
    var opts = Object.assign({}, DEFAULTS, options);

    var container = opts.container;
    var cw = container.offsetWidth;
    var ch = container.offsetHeight;
    var SCALE = Math.min(cw, ch);
    var LONG = Math.max(cw, ch);
    var SHORT = Math.min(cw, ch);
    var AREA = cw * ch;
    var ASPECT = LONG / SHORT;

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

    var ctx = el.getContext('2d', { willReadFrequently: true });

    // modes and styles
    var STYLE = opts.style === 'auto' ? (0, _utils.randItem)(STYLES) : opts.style;

    console.log('==================================\nSweater:', STYLE);

    // color funcs
    var getSolidFill = (0, _utils.getSolidColorFunction)(opts.palette);

    // setup

    // shared colors
    var bg = getSolidFill();

    // get palette of non-bg colors
    var contrastPalette = [].concat(opts.palette);
    contrastPalette.splice(opts.palette.indexOf(bg), 1);
    //contrastPalette.sort(()=>(randomInRange(-1, 1)));
    var getContrastColor = (0, _utils.getSolidColorFunction)(contrastPalette);
    var colorCount = contrastPalette.length;

    // draw background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);

    // rings

    /*
    Approach:
    - choose some center points
    - draw nested sets of rings around each point
    - each ring has a solid stroke for a base color, and a dashed stroke
    - these create a radial checkerboard pattern
    */

    // max line weight depends on canvas size
    //const MAXWEIGHT = SCALE / (50 + LONG/100);
    //const MAXWEIGHT = SCALE / 20;
    var MAXWEIGHT = SCALE / 10;
    ctx.lineWidth = MAXWEIGHT;
    var MINWEIGHT = MAXWEIGHT / 2.5;
    console.log('max thickness', MAXWEIGHT, ' min thickness', MINWEIGHT.toPrecision(2));

    var centers = []; // array of center points
    var rings = []; // array of all rings

    // pick a few center points
    // more for large layouts
    var centerCount = (0, _utils.randomInt)(2, 2 + SCALE / 400);

    // center vars
    // Scatter points coarsely
    // These numbers aren't great
    var MARGIN = SHORT / 12;
    var pts = (0, _hexScatter2.default)(SHORT * 0.5, cw - MARGIN * 2, ch - MARGIN * 2);

    pts.forEach(function (p, i) {
        centers.push({ x: p[0], y: p[1] });
        DEBUG && (0, _shapes.drawCircle)(ctx, p[0], p[1], 30, { fill: 'red' });
    });

    // put a single center somewhere way out, radially from the center
    var alpha = (0, _utils.randomInRange)(0, TWOPI);
    var dist = LONG * (0, _utils.randomInRange)(1, 4);
    centers = [{ x: cw / 2 + dist * Math.cos(alpha), y: ch / 2 + dist * Math.sin(alpha) }];

    // Limit centers, since hexscatter has a lot of overscan and does
    // poorly when cell size is large compared to container.
    // Allow more centers for stretched layouts.
    centers = (0, _utils.shuffle)(centers);
    //let maxCenters = Math.ceil(ASPECT);
    //centers = centers.slice(0, maxCenters);

    ctx.lineCap = 'butt'; //

    var STRETCHSET = [1, 1, 1, 1.618, 1.618, 2];

    // Step through the centers and create ring clusters for each

    function doCenters() {
        var centers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var thickness = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : MAXWEIGHT;
        var CHECKER = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

        var skipStrokeThreshold = CHECKER ? 0 : 0.2;

        centers.forEach(function (center, i) {
            // intial r
            var r = dist * (0, _utils.randomInRange)(1.2, 1.6);
            var R = r; // keep original value, as we step inward

            // set initial stretch style
            var STRETCH = (0, _utils.randItem)(STRETCHSET);

            // baseline thickness is passed in as @thickness

            // Assume dash length will equal thickness
            // Find a value near thickness that will give a whole number
            // of dashes
            var C = r * 2 * PI;
            var n = C / thickness;
            var N = Math.round(n);
            var dash = C / N; // the dash length for whole number
            var gap = dash * STRETCH; // set gap relative to dash
            thickness = dash; // reset thickness to the gap

            var skipStroke = 0;

            var ringColor = void 0;
            if (CHECKER) {
                STRETCH = 1; // force pure checker
                ringColor = function ringColor(i) {
                    return i % 2 ? 'black' : 'white';
                };
            } else {
                ringColor = getSolidFill;
            }

            var ring = 0;

            // make several rings
            while (r > SCALE / 20) {
                ring++;
                // create a ring
                var arcLength = PI * 2;
                var arcOffset = 0;

                // recalculate dashes for new r
                C = r * 2 * PI;
                dash = C / N;
                gap = dash * STRETCH;
                thickness = dash;

                // don't know why this fudge is needed. Rounding?
                ctx.lineWidth = thickness + 2;

                // Stroke skipping:
                // Sometimes, set skipStroke to skip several lines. Then
                // decrement the skip count as you go. Pick skip count and
                // skip likelihood to have a nice mix of contiguous drawn
                // and skipped lines.
                // When starting a skip sequence, reset the STRETCH style,
                // so the following band has its own style.
                if (skipStroke) {
                    skipStroke--;
                } else {
                    // sometimes set skipping and stretch.
                    // most of the time, do nothing, and just draw
                    if (Math.random() < skipStrokeThreshold) {
                        skipStroke = (0, _utils.randomInt)(2, 4);
                        if (!CHECKER) STRETCH = (0, _utils.randItem)(STRETCHSET);
                    }
                }

                // draw the solid ring, then draw dashed on top

                ctx.setLineDash([]); // solid ring
                ctx.beginPath();
                ctx.arc(center.x, center.y, r, 0, 2 * PI);
                ctx.strokeStyle = ringColor(ring);
                if (!skipStroke) ctx.stroke();

                // dashed ring
                ctx.setLineDash([dash, gap]);

                // draw the fg ring with a rando color
                ctx.lineDashOffset = 0;
                ctx.beginPath();
                ctx.arc(center.x, center.y, r, 0, 2 * PI);
                ctx.strokeStyle = ringColor(ring + 1);
                if (!skipStroke) ctx.stroke();

                // increment r by ring thickness
                r = r - thickness;
            }
        });
    }

    // do the centers with normal settings
    var renderThickness = (0, _utils.randomInRange)(MINWEIGHT, MAXWEIGHT);
    doCenters(centers, renderThickness, false);

    // redraw the centers overlaying with dark/light colors
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = (0, _utils.randomInt)(2, 5) / 100;
    doCenters(centers, renderThickness / (0, _utils.randomInt)(4, 8), true);
    ctx.globalCompositeOperation = 'normal';
    ctx.globalAlpha = 1;

    console.log(rings.length + ' rings around ' + centers.length + ' centers');

    // func to draw a set of parallel square-patterned stripes
    var drawStripes = function drawStripes(cx, cy) {
        var N = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 6;
        var angle = arguments[3];
        var thickness = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : MAXWEIGHT * .66;

        ctx.lineWidth = thickness;

        var norm = angle + PI;
        var x1 = cx;

        for (var i = 0; i < N; i++) {
            // solid line for bg
            ctx.strokeStyle = getSolidFill();
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(0, cy + i * thickness);
            ctx.lineTo(cw, cy + i * thickness);
            ctx.stroke();

            // dashed line for checkers
            ctx.strokeStyle = getSolidFill();
            ctx.setLineDash([thickness, thickness]);
            ctx.beginPath();
            ctx.moveTo(0, cy + i * thickness);
            ctx.lineTo(cw, cy + i * thickness);
            ctx.stroke();
        }
    };

    // draw horizontal stripes somewhere
    //drawStripes(cw/2, ch - SCALE/4, randomInt(4,8), 0, MAXWEIGHT * randomInRange(0.5, 0.8));

    // clear dash settings
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;

    // donegal
    // do custom donegal with larger dots than the default

    // coarse sampled speckles to break edges
    (0, _speckle.speckle)(el, SCALE * (0, _utils.randomInRange)(.0015, .0040), 4, 'sample');
    // random speckles for donegal look
    (0, _speckle.speckle)(el, SCALE * (0, _utils.randomInRange)(.0020, .0040), (0, _utils.randomInt)(12, 24), getSolidFill);
    // fine sampled speckles to break edges more
    (0, _speckle.speckle)(el, SCALE * (0, _utils.randomInRange)(.001, .002), 3, 'sample');

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

    var endTime = new Date().getTime();
    console.log('Rendered in ' + (endTime - startTime) + 'ms');
}

/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.tricycles = tricycles;

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
    style: 'auto',
    addNoise: 0.04,
    noiseInput: null,
    clear: true
};

var PI = Math.PI;
var TWOPI = PI * 2;

var STYLES = ['simple', 'complex']; // or auto

// Main function
function tricycles(options) {
    var opts = Object.assign({}, DEFAULTS, options);

    var container = opts.container;
    var cw = container.offsetWidth;
    var ch = container.offsetHeight;
    var SCALE = Math.min(cw, ch);
    var LONG = Math.max(cw, ch);
    var SHORT = Math.min(cw, ch);
    var AREA = cw * ch;
    var ASPECT = LONG / SHORT;

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

    // opts
    // --------------------------------------
    var STYLE = STYLES.indexOf(opts.style) >= 0 ? opts.style : 'auto';

    // Color funcs
    // --------------------------------------

    var getSolidFill = (0, _utils.getSolidColorFunction)(opts.palette);

    // shared colors
    var bg = getSolidFill();

    // get palette of non-bg colors
    var contrastPalette = [].concat(opts.palette);
    contrastPalette.splice(opts.palette.indexOf(bg), 1);
    var getContrastColor = (0, _utils.getSolidColorFunction)(contrastPalette);

    var getContrastSequence = function getContrastSequence(i) {
        return contrastPalette[i % contrastPalette.length];
    };

    // shared foregrounds
    var fg = getContrastColor();
    var fg2 = getContrastColor();
    var fg3 = getContrastColor();

    // fill background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);

    // set default stroke
    ctx.strokeStyle = fg;

    var LINE1 = Math.max(SCALE / 400, 1);
    var LINE2 = LINE1 / 2;
    var LINE3 = LINE1 / 3;

    ctx.lineWidth = LINE1;

    // Utils
    // --------------------------------------

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

    function drawTriPoints(ctx, p1, p2, p3, color) {
        ctx.beginPath();
        ctx.moveTo.apply(ctx, _toConsumableArray(p1));
        ctx.lineTo.apply(ctx, _toConsumableArray(p2));
        ctx.lineTo.apply(ctx, _toConsumableArray(p3));
        ctx.closePath();
        ctx.strokeStyle = color;
        ctx.stroke();
    }

    // function to draw @n radial lines out from a point
    function radiateFromPoint(p) {
        var n = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 36;

        var step = TWOPI / n;
        var R = LONG * 3;
        var offset = (0, _utils.randomInRange)(0, PI);

        for (var i = 0; i < n; i++) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + R * Math.cos(i * step + offset), p.y + R * Math.sin(i * step + offset));
            ctx.stroke();
        }
    }

    // function to draw many circles around a point
    function outwardRings(p) {
        var n = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 36;
        var color = arguments[2];

        var outerR = LONG * 2;
        var step = outerR / n;
        var expansion = 1.02;

        for (var i = 0; i < n; i++) {
            (0, _shapes.drawCircle)(ctx, p.x, p.y, i * step, { stroke: color });
            step *= expansion;
        }
    }

    var decorators = [radiateFromPoint, outwardRings];

    // Draw Stuff
    // --------------------------------------

    // Draw some points. We will step through, looking at three at a time,
    // and define circles. Adjacent circles will have two points in common.
    var points = [];

    // point placement function
    var quadrants = function quadrants() {
        points.push([(0, _utils.randomInt)(0, cw / 2), (0, _utils.randomInt)(0, ch / 2)]);
        points.push([(0, _utils.randomInt)(cw / 2, cw), (0, _utils.randomInt)(0, ch / 2)]);
        points.push([(0, _utils.randomInt)(0, cw / 2), (0, _utils.randomInt)(ch / 2, ch)]);
        points.push([(0, _utils.randomInt)(cw / 2, cw), (0, _utils.randomInt)(ch / 2, ch)]);

        // points.push([cw/2, randomInt(0, ch/2)]);
        // points.push([cw/2, randomInt(ch/2, ch)]);
        // points.push([randomInt(0, cw/2) , ch/2]);
        // points.push([randomInt(cw/2, cw), ch/2]);

        points = (0, _utils.shuffle)(points);
    };

    // point placement function
    var ring = function ring() {
        var steps = (0, _utils.randomInt)(8, 24);
        var inc = TWOPI / steps;
        var startAngle = (0, _utils.randomInRange)(TWOPI);

        // baseline radius of the ellipse that plots the points
        var radiusFraction = (0, _utils.randomInRange)(20, 30) / 100;

        var offset = void 0;
        var _x = void 0,
            _y = void 0;

        // go around the ellipse defined by canvas, dropping points
        for (var i = 0; i < steps; i++) {
            // alternate moving in and out by the offset fraction
            offset = i % 2 ? 1 : -1;
            offset *= (0, _utils.randomInRange)(0, 20) / 100;

            _x = cw / 2 + cw * (radiusFraction + offset) * Math.cos(i * inc + startAngle);
            _y = ch / 2 + ch * (radiusFraction + offset) * Math.sin(i * inc + startAngle);

            points.push([_x, _y]);
        }

        // For every 10 points we have, drop 1
        var skipCount = Math.floor(steps / 10);
        while (skipCount--) {
            points.splice((0, _utils.randomInt)(points.length - 1), 1);
        }
    };

    // point placement function
    // TODO fix params
    var alternate = function alternate(a, b, steps) {
        var _x = void 0,
            _y = void 0;
        // debug
        if (Math.random() < 0.5) {
            // left right
            a = [0, (0, _utils.randomInRange)(ch)];
            b = [cw, (0, _utils.randomInRange)(ch)];
        } else {
            // top bottom
            a = [(0, _utils.randomInRange)(cw), 0];
            b = [(0, _utils.randomInRange)(cw), ch];
        }

        var v = (0, _utils.getVector)(a, b);
        steps = Math.round(8 * v.length / SHORT);
        var inc = v.length / steps;

        _x = v.x;
        _y = v.y;

        var offset = SCALE / 10;
        var orthogonal = void 0;

        for (var i = 0; i < steps; i++) {
            _x += v.length / steps * Math.cos(v.angle);
            _y += v.length / steps * Math.sin(v.angle);

            //drawCircle(ctx, _x, _y, 5, {fill:'green'});

            orthogonal = i % 2 ? PI / 2 : -PI / 2;
            orthogonal += v.angle;

            offset = SCALE * (0, _utils.randomInRange)(0.1, 0.4);
            // sometimes make big steps pop out for variety
            if (Math.random() < 0.125) {
                offset *= 1.5;
            }

            points.push([_x + offset * Math.cos(orthogonal), _y + offset * Math.sin(orthogonal)]);
        }

        ctx.beginPath();
        ctx.moveTo.apply(ctx, _toConsumableArray(a));
        ctx.lineTo.apply(ctx, _toConsumableArray(b));
        ctx.stroke();

        // let split = randomInt(points.length);
        // points = points.slice(0, split).concat(points.slice(split, -1));
    };

    // run setup functions according to style prop
    var setupFuncs = [];
    if (STYLE === 'simple') {
        quadrants();
    } else if (STYLE === 'complex') {
        (0, _utils.randItem)([alternate, ring])();
    } else {
        // auto case
        (0, _utils.randItem)([quadrants, alternate, ring])();
    }

    // set up circles
    var circles = [];

    // space between circles and background drawings
    var margin = SCALE / (0, _utils.randomInt)(20, 60);

    // draw fewer rays when there will be many circles
    var rayCount = 150 / Math.log(points.length);
    var decorationThreshold = 0.66 / Math.log(points.length);

    // step through points:
    // define circles
    for (var i = 0; i < points.length - 2; i++) {
        var c = circumcenter.apply(undefined, _toConsumableArray(points.slice(i, i + 3)));

        var color = getContrastColor();
        c.color = color;

        // add circle to collection
        circles.push(c);
    }

    // now step through circles and draw background decorations
    ctx.lineWidth = LINE3;
    circles.forEach(function (c) {
        ctx.strokeStyle = c.color;
        var decorationCount = Math.round(rayCount + rayCount * c.r / SCALE);

        // for few circles, decorate all. For more, only some
        if (circles.length <= 3) {
            (0, _utils.randItem)(decorators)(c, decorationCount, c.color);
        } else if (Math.random() < decorationThreshold) {
            (0, _utils.randItem)(decorators)(c, decorationCount, c.color);
        }
    });

    // now step through circles and draw bg mask over decorations
    circles.forEach(function (c) {
        margin = SCALE / (0, _utils.randomInt)(20, 60);
        (0, _shapes.drawCircle)(ctx, c.x, c.y, c.r + margin, { stroke: null, fill: bg });
    });

    // step through points to draw triangles
    for (var i = 0; i < points.length - 2; i++) {
        var _c = circles[i];
        var _color = _c.color;

        ctx.lineWidth = LINE2;
        ctx.setLineDash([LINE2 * 9, LINE2 * 6]);
        drawTriPoints.apply(undefined, [ctx].concat(_toConsumableArray(points.slice(i, i + 3)), [_color]));
        ctx.lineWidth = LINE1;
        ctx.setLineDash([]);

        // // center to circle spoke
        // ctx.strokeStyle = color;
        // ctx.beginPath();
        // ctx.moveTo(c.x, c.y);
        // ctx.lineTo(...points[i]);
        // ctx.stroke();
    }

    // now step through circles and draw the rings
    ctx.lineWidth = LINE1;
    circles.forEach(function (c) {
        (0, _shapes.drawCircle)(ctx, c.x, c.y, c.r, { stroke: c.color, fill: null });
        // draw center
        // drawCircle(ctx, c.x, c.y, SCALE/200, {fill: c.color});
    });

    // ---

    // step through points
    // draw connecting bar between shared points
    // alternates based on triangle pairs
    ctx.lineWidth = LINE1;
    // for (var i = 0; i < points.length - 2; i++) {
    //     let idx = (i % 2) ? i : i + 1;

    //     ctx.strokeStyle = fg;
    //     ctx.beginPath();
    //     ctx.moveTo(...points[idx]);
    //     ctx.lineTo(...points[idx + 1]);
    //     ctx.stroke();
    // }


    // ---
    // draw all points on top of everything
    points.forEach(function (p) {
        (0, _shapes.drawCircle)(ctx, p[0], p[1], SCALE / 100, { fill: fg });
    });

    // Finish up
    // --------------------------------------

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
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _utils = __webpack_require__(0);

// Nested arrays of error coefs. Use zeroes up to the "current" px
// which means they imply forward-only propagation.
var kernelDefs = {
    atkinson: [[0, 0, 1 / 8, 1 / 8], [1 / 8, 1 / 8, 1 / 8, 0], [0, 1 / 8, 0, 0]],
    floydsteinberg: [[0, 0, 7 / 16], [3 / 16, 5 / 16, 1 / 16]],
    burkes: [[0, 0, 0, 8 / 32, 4 / 32], [2 / 32, 4 / 32, 8 / 32, 4 / 32, 2 / 32]],
    sierra3: [[0, 0, 0, 5 / 32, 3 / 32], [2 / 32, 4 / 32, 5 / 32, 4 / 32, 2 / 32], [0 / 32, 2 / 32, 3 / 32, 2 / 32, 0 / 32]],
    // jarvice judice ninke
    jjn: [[0, 0, 0, 7 / 48, 5 / 48], [3 / 48, 5 / 48, 7 / 48, 5 / 48, 3 / 48], [1 / 48, 3 / 48, 5 / 48, 3 / 48, 1 / 48]],
    stucki: [[0, 0, 0, 8 / 42, 4 / 42], [2 / 42, 4 / 42, 8 / 42, 4 / 42, 2 / 42], [1 / 42, 2 / 42, 4 / 42, 2 / 42, 1 / 42]]

    // use a set of arrays defining a dithering kernel as @kernel
    // to propagate errors into @px pixels at index @idx, using image
    // @width to set the row offsets.
    // This does full color dithering so uses an @errorArray of
    // r,g,b,x component errors. Where x is either alpha or, in this case,
    // a scalar of r,g,b used for sorting elsewhere.
};function propagate_errors(px, idx, errorArray, width, kernel) {
    // get an offset based on array length
    var koffset = Math.ceil(kernel[0].length / 2) - 1;
    var rowOffset = 0;
    var pxOffset = 0;
    var er = void 0,
        eg = void 0,
        eb = void 0,
        es = void 0;

    // index offset from half of width
    // then step through each array
    // each time add a width

    kernel.forEach(function (row, j) {
        rowOffset = j * width;
        row.forEach(function (weight, i) {
            var _scalarVec = (0, _utils.scalarVec)(errorArray, weight);

            var _scalarVec2 = _slicedToArray(_scalarVec, 4);

            er = _scalarVec2[0];
            eg = _scalarVec2[1];
            eb = _scalarVec2[2];
            es = _scalarVec2[3];


            pxOffset = idx + (rowOffset + i - koffset) * 4;

            px[pxOffset + 0] += er;
            px[pxOffset + 1] += eg;
            px[pxOffset + 2] += eb;
            px[pxOffset + 3] += 0;
        });
    });

    return px;
}

// Single pass function to dither an image using colors in @palette
// Relies on closestColor() -> colorDistanceArray() and other utils above
function ditherPalette(image, palette) {
    var kernelName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'burkes';

    var tStart = new Date().getTime();

    var kernel = kernelDefs[kernelName] || kernelDefs['burkes'];
    var width = image.width;
    var sampleColor = [0, 0, 0]; // r, g, b
    var sampleError = [0, 0, 0];
    var closest = void 0;

    var px = image.data;

    var rgbPalette = palette.map(function (p) {
        return (0, _utils.hexToRgb)(p);
    });

    // use colorDistances to get values
    for (var i = 0; i < image.data.length; i += 4) {
        sampleColor = [px[i], px[i + 1], px[i + 2]];

        // check each pixel, find closest palette color. get error.
        closest = (0, _utils.closestColor)(sampleColor, // sample, which includes errors
        rgbPalette // … to the palette colors
        );

        // replace pixel with palette color
        px[i] = closest.color[0];
        px[i + 1] = closest.color[1];
        px[i + 2] = closest.color[2];
        px[i + 3] = 255;

        // Add error to the neighboring pixel values.
        // Pass in the specified kernel
        px = propagate_errors(px, i, closest.diff, width, kernel);
    }

    var tFinish = new Date().getTime();
    console.log('Dithered to palette with ' + kernelName + ' in ' + (tFinish - tStart) + 'ms');
    return image;
}

//--------------------------------------

// from pixel data @idata at index @i return a basic rgb luminosity
// using sqrt of color components using "standard" perceptual coefs
function flume(idata, i) {
    return Math.sqrt(0.299 * idata[i] * idata[i] + 0.587 * idata[i + 1] * idata[i + 1] + 0.114 * idata[i + 2] * idata[i + 2]);
}

// use a set of arrays defining a dithering kernel as @kernel
// to propagate errors into @px, a SINGLE CHANNEL pixels array,
// at index @idx, using image @width to set the row offsets.
// This does luminosity dithering so uses a scalar @error
function propagate_luminosity_errors(px, idx, error, width, kernel) {
    // get an offset based on array length
    var koffset = Math.ceil(kernel[0].length / 2) - 1;
    var rowOffset = 0;
    var pxOffset = 0;
    var prop_error = void 0;

    // index offset from half of width
    // then step through each array
    // each time add a width

    kernel.forEach(function (row, j) {
        rowOffset = j * width;
        row.forEach(function (weight, i) {
            prop_error = error * weight;
            pxOffset = idx + (rowOffset + i - koffset);
            px[pxOffset] += prop_error;
        });
    });

    return px;
}

// Single pass function to dither an image using luminosity
function ditherLuminosity(image) {
    var kernelName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'burkes';

    var tStart = new Date().getTime();

    var kernel = kernelDefs[kernelName] || kernelDefs['burkes'];
    var width = image.width;

    var luminance = new Uint8ClampedArray(image.width * image.height);

    // populate luminance array
    for (var l = 0, i = 0; i < image.data.length; l++, i += 4) {
        luminance[l] = flume(image.data, i);
    }

    // now step through the luminance, check threshold, and
    // apply new b/w value to px. Record raw error and propagate
    // through the luminance array.
    for (var _l = 0, _i = 0; _i < image.data.length; _l++, _i += 4) {
        var value = luminance[_l] < 129 ? 0 : 255;
        var error = luminance[_l] - value;
        image.data.fill(value, _i, _i + 3);

        // propagate errors into luminance
        luminance = propagate_luminosity_errors(luminance, _l, error, width, kernel);
    }

    var tFinish = new Date().getTime();
    console.log('Dithered to luminosity with ' + kernelName + ' in ' + (tFinish - tStart) + 'ms');
    return image;
}

//--------------------------------------

exports.default = {
    kernelDefs: kernelDefs,
    ditherPalette: ditherPalette,
    ditherLuminosity: ditherLuminosity
};

/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.halftoneCMYK = halftoneCMYK;
exports.halftoneSpotColors = halftoneSpotColors;

var _utils = __webpack_require__(0);

// Adapted from https://gist.github.com/ucnv/249486
// Use an adaptive @dotSize, 1 is small, 2 is med,  3 is large
function halftoneCMYK(canvas) {
    var dotSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
    var palette = arguments[2];


    // get context and dims for input/output canvas
    var display = canvas.getContext('2d');
    var w = canvas.width;
    var h = canvas.height;

    // capture and remove shadow settings
    var canvasShadowBlur = display.shadowBlur;
    var canvasShadowColor = display.shadowColor;
    display.shadowBlur = 0;
    display.shadowColor = 'transparent';

    var dim = Math.min(w, h);

    // calculate the actual dot size
    // add a sqrt factor normalized to an 800px canvas, to grow the dots
    // somewhat with canvas size.
    var interval = (3 + dotSize * 2) * Math.sqrt(dim / 800);
    interval = Math.round(interval);
    // console.log(`dotSize = ${dotSize}, interval=${interval}`);

    // The source canvas takes a snapshot of the input/output canvas,
    // which will be re-applied to the scratch canvas at different
    // angles for each color to be applied
    var source = document.createElement('canvas');
    source.width = w;
    source.height = h;
    var sourceCtx = source.getContext('2d');
    // capture the image once onto the offscreen source canvas;
    sourceCtx.drawImage(canvas, 0, 0);

    // Blank the output canvas after copying it out, so we draw halftones
    // on a clean canvas, instead of on top of the original.
    display.fillStyle = '#fff';
    display.fillRect(0, 0, w, h);

    // For each color in the palette, create an offscreen canvas.
    // We will draw directly to these layers, then composite them
    // to the output canvas later. This lets us use the 'multiply'
    // globalCompositeOperation (or another) without the big
    // performance penalty that seems to come from making many draw calls
    // in non-"normal" composite modes
    var layers = palette.map(function (c, i) {
        var layer = document.createElement('canvas');
        layer.width = w;
        layer.height = h;
        return layer;
    });

    // draw the color to the layer
    var drawColor = function drawColor(interval, colorObj, layer) {

        // console.log('drawColor', colorObj);

        // get an offscreen layer to draw to
        var layerCtx = layer.getContext('2d');

        // set transform for angle of color screen
        var rad = colorObj.angle % 90 * Math.PI / 180;
        var sinr = Math.sin(rad),
            cosr = Math.cos(rad);
        var ow = w * cosr + h * sinr;
        var oh = h * cosr + w * sinr;

        // scratch canvas
        var c = document.createElement('canvas');
        c.width = ow + interval;
        c.height = oh + interval; // add margins to avoid getImageData's out of range errors
        c.setAttribute('willReadFrequently', true);

        // rotate the scratch canvas to the screen angle, draw the source img
        var scratch = c.getContext('2d');
        scratch.willReadFrequently = true;
        scratch.translate(0, w * sinr);
        scratch.rotate(-rad);
        scratch.drawImage(source, 0, 0);

        // position the rendering layer to match screen angle
        layerCtx.translate(w * sinr * sinr, -w * sinr * cosr);
        layerCtx.rotate(rad);
        layerCtx.fillStyle = colorObj.color;

        // Loop through @interval pixels, width and height.
        // Keep a running tally of color diffs from the palette reference
        // for the whole block. At the end, divide by number of px.
        for (var y = 0; y < oh; y += interval) {
            for (var x = 0; x < ow; x += interval) {
                var pixels = scratch.getImageData(x, y, interval, interval).data;
                var sum = 0,
                    count = 0;
                for (var i = 0; i < pixels.length; i += 4) {
                    if (pixels[i + 3] == 0) continue;
                    var r = 255 - pixels[i];
                    var g = 255 - pixels[i + 1];
                    var b = 255 - pixels[i + 2];
                    var k = Math.min(r, g, b);

                    if (colorObj.name != 'k' && k == 255) sum += 0; // avoid divide by zero
                    else if (colorObj.name == 'k') sum += k / 255;else if (colorObj.name == 'c') sum += (r - k) / (255 - k);else if (colorObj.name == 'm') sum += (g - k) / (255 - k);else if (colorObj.name == 'y') sum += (b - k) / (255 - k);
                    count++;
                }

                if (count == 0) continue;
                var rate = sum / count;
                rate = Math.max(0, rate);
                // clipping only needed with multiply blend
                layerCtx.save();
                layerCtx.beginPath();
                layerCtx.moveTo(x, y);
                layerCtx.lineTo(x + interval, y);
                layerCtx.lineTo(x + interval, y + interval);
                layerCtx.lineTo(x, y + interval);
                layerCtx.clip();
                // end clipping
                layerCtx.beginPath();
                layerCtx.arc(x + interval / 2, y + interval / 2, Math.SQRT1_2 * interval * rate, 0, Math.PI * 2, true);
                layerCtx.fill();
                layerCtx.restore();
            }
        }

        // reset
        layerCtx.rotate(-rad);
        layerCtx.translate(-w * sinr * sinr, w * sinr * cosr);

        // clear DOM element
        c = null;
    }; // drawColor()

    // step through palette, drawing colors to layers
    palette.forEach(function (colorObj, i) {
        drawColor(interval, colorObj, layers[i]);
    });

    // step through layers, and composite them onto the output canvas
    display.globalCompositeOperation = 'multiply';
    display.globalAlpha = 0.8086;
    layers.forEach(function (layer, i) {
        display.drawImage(layer, 0, 0);
        layer = null; // clear DOM element
    });
    display.globalCompositeOperation = 'normal';

    source = null; // clear DOM element

    // re-apply shadow settings
    display.shadowBlur = canvasShadowBlur;
    display.shadowColor = canvasShadowColor;
} // halftoneCMYK()


// halftone version that takes a custom palette
// scale colors according to best match, so close colors
// work alone, and don't get over-printed by other nearby colors
function halftoneSpotColors(canvas) {
    var dotSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
    var palette = arguments[2];

    var angles = [45, 75, 30, 85, 22.5, 62.5, 15, 0];

    // get context and dims for input/output canvas
    var display = canvas.getContext('2d');
    var w = canvas.width;
    var h = canvas.height;

    // capture and remove shadow settings
    var canvasShadowBlur = display.shadowBlur;
    var canvasShadowColor = display.shadowColor;
    display.shadowBlur = 0;
    display.shadowColor = 'transparent';

    var hexPalette = palette.map(_utils.hexToRgb);

    var dim = Math.min(w, h);

    // calculate the actual dot size
    // add a sqrt factor normalized to an 800px canvas, to grow the dots
    // somewhat with canvas size.
    var interval = (3 + dotSize * 2) * Math.sqrt(dim / 800);
    interval = Math.round(interval);
    // console.log(`dotSize = ${dotSize}, interval=${interval}`);

    // The source canvas takes a snapshot of the input/output canvas,
    // which will be re-applied to the scratch canvas at different
    // angles for each color to be applied
    var source = document.createElement('canvas');
    source.width = w;
    source.height = h;
    var sourceCtx = source.getContext('2d');
    // capture the image once onto the offscreen source canvas;
    sourceCtx.drawImage(canvas, 0, 0);

    // Blank the output canvas after copying it out, so we draw halftones
    // on a clean canvas, instead of on top of the original.
    display.fillStyle = '#fff';
    display.fillRect(0, 0, w, h);

    // For each color in the palette, create an offscreen canvas.
    // We will draw directly to these layers, then composite them
    // to the output canvas later. This lets us use the 'multiply'
    // globalCompositeOperation (or another) without the big
    // performance penalty that seems to come from making many draw calls
    // in non-"normal" composite modes
    var layers = palette.map(function (c, i) {
        var layer = document.createElement('canvas');
        layer.width = w;
        layer.height = h;
        return layer;
    });

    // draw the color to the layer
    var drawColor = function drawColor(interval, hex, angle, layer) {

        // console.log('drawColor', colorObj);
        var color = (0, _utils.hexToRgb)(hex);

        // get an offscreen layer to draw to
        var layerCtx = layer.getContext('2d');

        // set transform for angle of color screen

        var rad = angle % 90 * Math.PI / 180;
        var sinr = Math.sin(rad),
            cosr = Math.cos(rad);
        var ow = w * cosr + h * sinr;
        var oh = h * cosr + w * sinr;

        // scratch canvas
        var c = document.createElement('canvas');
        c.width = ow + interval;
        c.height = oh + interval; // add margins to avoid getImageData's out of range errors
        c.setAttribute('willReadFrequently', true);

        // rotate the scratch canvas to the screen angle, draw the source img
        var scratch = c.getContext('2d');
        scratch.willReadFrequently = true;
        scratch.translate(0, w * sinr);
        scratch.rotate(-rad);
        scratch.drawImage(source, 0, 0);

        // position the rendering layer to match screen angle
        layerCtx.translate(w * sinr * sinr, -w * sinr * cosr);
        layerCtx.rotate(rad);
        layerCtx.fillStyle = hex;

        // Loop through @interval pixels, width and height.
        // Keep a running tally of color diffs from the palette reference
        // for the whole block. At the end, divide by number of px.
        for (var y = 0; y < oh; y += interval) {
            for (var x = 0; x < ow; x += interval) {
                var pixels = scratch.getImageData(x, y, interval, interval).data;
                var sum = 0,
                    count = 0;
                var agg = [0, 0, 0];
                for (var i = 0; i < pixels.length; i += 4) {
                    if (pixels[i + 3] == 0) continue;

                    agg[0] += pixels[i + 0];
                    agg[1] += pixels[i + 1];
                    agg[2] += pixels[i + 2];

                    count++;
                }

                if (count == 0) continue;
                agg = (0, _utils.scalarVec)(agg, 1 / count);
                agg = agg.map(Math.round);

                // get closest color in the palette. Includes closest.diff
                var closest = (0, _utils.closestColor)(agg, hexPalette);
                var closestNorm = closest.diff[3] / 765;

                // get diff from current color and sample
                var diff = (0, _utils.colorDistanceArray)(color, agg);
                var diffNorm = diff[3] / 765;

                // calc the ink rate from the distance in the current color diff
                var rate = 1 - diffNorm; // * (1 - closest.diff)/diff;

                /*let thresh = 220;
                if (agg[0] > thresh && agg[1] > thresh && agg[2] > thresh) {
                    //continue;
                    rate = 0;
                }*/

                // Renormalize the dot size based on closeness to the closest
                // This way if there is an exact match, only the close color
                // is printed, and others aren't needlessly mixed in
                if (diffNorm > 0) {
                    rate = rate * (closestNorm / diffNorm);
                } else {
                    rate = 2;
                }

                // debug
                if (x > 400 && x < 410 && y > 400 && y < 410) {
                    console.log(agg, closest, diff, 'closestNorm: ' + closestNorm + ', diffNorm: ' + diffNorm + ', rate: ' + rate);
                }

                rate = Math.max(0, rate);
                // clipping only needed with multiply blend
                layerCtx.save();
                layerCtx.beginPath();
                layerCtx.moveTo(x, y);
                layerCtx.lineTo(x + interval + 0.5, y);
                layerCtx.lineTo(x + interval + 0.5, y + interval + 0.5);
                layerCtx.lineTo(x, y + interval + 0.5);
                layerCtx.clip();
                // end clipping
                layerCtx.beginPath();
                layerCtx.arc(x + interval / 2, y + interval / 2, Math.SQRT1_2 * interval * rate, 0, Math.PI * 2, true);
                layerCtx.fill();
                layerCtx.restore();
            }
        }

        // reset
        layerCtx.rotate(-rad);
        layerCtx.translate(-w * sinr * sinr, w * sinr * cosr);

        // clear DOM element
        c = null;
    }; // drawColor()

    // step through palette, drawing colors to layers
    palette.forEach(function (hex, i) {
        drawColor(interval, hex, angles[i], layers[i]);
    });

    // step through layers, and composite them onto the output canvas
    //display.globalCompositeOperation = 'multiply';
    //display.globalAlpha = 0.8086;
    layers.forEach(function (layer, i) {
        display.drawImage(layer, 0, 0);
        layer = null; // clear DOM element
    });
    display.globalCompositeOperation = 'normal';

    source = null; // clear DOM element

    // re-apply shadow settings
    display.shadowBlur = canvasShadowBlur;
    display.shadowColor = canvasShadowColor;
} // halftoneCMYK()

/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.fracture = fracture;

var _utils = __webpack_require__(0);

var _shapes = __webpack_require__(3);

// create a copy of @canvas, redraw its contents, and randomize its id
function copyCanvas(canvas) {
    var copy = canvas.cloneNode();
    var copyctx = copy.getContext('2d');
    copyctx.drawImage(canvas, 0, 0);
    copy.setAttribute('id', 'canvas' + (Math.random() * (1 << 24)).toString(16));
    return copy;
}

function fracture(canvas) {
    var regions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;


    var ctx = canvas.getContext('2d');
    var copy = copyCanvas(canvas);

    var cw = canvas.width;
    var ch = canvas.height;
    var SCALE = Math.min(cw, ch);

    // convenience for randomInRange:
    var rn = _utils.randomInRange;

    // flag for thick plate rendering
    var THICK = Math.random() < 0.5;
    var magSteps = 10;
    // scale offset for thick plate rendering
    var offset = SCALE / 800 * (0, _utils.randomInRange)(0.4, 0.7);

    console.log('fragment, ' + regions + ' regions');

    // create a series of masks
    for (var i = 0; i < regions; i++) {
        // set magnification effect for each fragment
        var magnification = (0, _utils.randomInRange)(0.01, 0.03);

        //console.log(`fragment: magnification:${(magnification*100).toPrecision(2)}%, offsets:${offsetx.toPrecision(2)},${offsety.toPrecision(2)}`);

        // create clip path and draw inside
        // --------------------------------------

        // slice the canvas across each corner, or left to right
        // we will pick one of these for each fracture path
        // move the boundaries outside the canvas to avoid drawing visible
        // strokes along the canvas edges
        var xmin = void 0,
            ymin = void 0;
        var xmax = void 0,
            ymax = void 0;
        xmin = ymin = -10;
        xmax = cw + 10;
        ymax = ch + 10;
        // we define these in the loop so the random values differ for each
        // fragment region
        var vertices = [
        // left, top
        [[xmin, rn(ymax)], [xmin, ymin], [rn(xmax), ymin]],
        // left, right
        [[xmin, rn(ymax)], [xmin, ymin], [xmax, ymin], [xmax, rn(ymax)]],
        // right, left
        [[xmax, rn(ymax)], [xmax, ymax], [xmin, ymax], [xmin, rn(ymax)]],
        // top, right
        [[rn(xmax), ymin], [xmax, ymin], [xmax, rn(ymax)]],
        // left, bottom
        [[rn(xmax), ymax], [xmin, ymax], [xmin, rn(ymax)]],
        // right, bottom
        [[xmax, rn(ymax)], [xmax, ymax], [rn(xmax), ymax]],
        // top, bottom
        [[rn(xmax), ymin], [xmin, ymin], [xmin, ymax], [rn(xmax), ymax]],
        // top, bottom 2
        [[rn(xmax), ymin], [xmax, ymin], [xmax, ymax], [rn(xmax), ymax]]];

        // select a set of vertices
        var v = (0, _utils.randItem)(vertices);
        // get centerpoint for scaling

        var _averagePoints = (0, _utils.averagePoints)(v),
            _averagePoints2 = _slicedToArray(_averagePoints, 2),
            cx = _averagePoints2[0],
            cy = _averagePoints2[1];

        // get edge direction so we can offset at 90deg from it


        var edgePts = [v[0], v[v.length - 1]];
        var theta = Math.atan2(edgePts[1][1] - edgePts[0][1], edgePts[1][0] - edgePts[0][0]);
        theta += Math.PI / 2;

        // must save before clipping to be able to unclip via restore
        ctx.save();

        // build the mask path and clip
        (0, _utils.pointsToPath)(ctx, v);
        ctx.clip();

        // translate to fragment center point and magnify
        ctx.translate(cx, cy);
        ctx.scale(magnification + 1, magnification + 1);
        ctx.translate(-cx, -cy);

        ctx.globalCompositeOperation = 'normal';
        ctx.globalAlpha = 1;

        if (THICK) {
            // repeat steps to drag copies of the image away from
            // the fragment edge, to create refractive effect
            var steps = magSteps;
            while (steps--) {
                // offset the canvas at 90deg from its edge, one step at a time
                ctx.translate(-offset * Math.cos(theta), -offset * Math.sin(theta));

                // build the mask path at translated coords and re-clip
                (0, _utils.pointsToPath)(ctx, v);
                ctx.clip();

                // Draw it
                ctx.drawImage(copy, 0, 0);
            }
        } else {
            // Just draw the magnified copy
            ctx.drawImage(copy, 0, 0);
        }

        // unmagnify
        (0, _utils.resetTransform)(ctx);
        // unclip
        ctx.restore();

        // Glass decorations
        // --------------------------------------

        // pick edge weight
        var weight = SCALE / 800 * (0, _utils.randomInRange)(2, 3.5);
        ctx.lineWidth = weight;

        // we will re-use these coordinates in multiple gradients for
        // edge and face decoration
        var gradientPoints = [rn(cw), rn(ch), rn(cw), rn(ch)];

        // By compositing pink and green in overlapping strokes via color-dodge
        // we get a pink fringe, green fringe, and white overlap area.
        // A light gradient will overlay the whole area and hilite other edges.
        // A dark gradient will create a subtle shadow effect

        // This determines the separation of the two colors for edge hilites
        // 0 would be total overlap which composites to white.
        // 0.5 would have no overlap, and show pure color edges adjacently.
        var diffract = weight * (0, _utils.randomInRange)(0.25, 0.55);

        // Create gradients for the edges, using common coordinates but
        // different colors to align them and suggest unified light source
        var pinkGrad = ctx.createLinearGradient.apply(ctx, gradientPoints);
        pinkGrad.addColorStop(0, 'rgba(255, 0, 255, 0.9)');
        pinkGrad.addColorStop(0.5, 'rgba(255, 0, 255, 0.4)');
        pinkGrad.addColorStop(1, 'rgba(255, 0, 255, 0.2)');

        var greenGrad = ctx.createLinearGradient.apply(ctx, gradientPoints);
        greenGrad.addColorStop(0, 'rgba(0, 255, 0, 0.9)');
        greenGrad.addColorStop(0.5, 'rgba(0, 255, 0, 0.4)');
        greenGrad.addColorStop(1, 'rgba(0, 255, 0, 0.2)');

        var lightGrad = ctx.createLinearGradient.apply(ctx, gradientPoints);
        lightGrad.addColorStop(0, '#ffffff');
        lightGrad.addColorStop(0.5, '#666f6a');
        lightGrad.addColorStop(1, '#224433');

        var darkGrad = ctx.createLinearGradient.apply(ctx, gradientPoints);
        darkGrad.addColorStop(0, '#333333');
        darkGrad.addColorStop(0.5, '#555555');
        darkGrad.addColorStop(1, '#666666');

        // Create a gradient with different coordinates for the edge face
        // since it should have different light source
        var edgeGrad = ctx.createLinearGradient(rn(cw), rn(ch), rn(cw), rn(ch));
        edgeGrad.addColorStop(0, '#ffffff');
        edgeGrad.addColorStop(0.5, '#668877');
        edgeGrad.addColorStop(1, '#1a4d33');

        // separate coords for the inner edge of thick plates
        var innerEdgeGrad = ctx.createLinearGradient(rn(cw), rn(ch), rn(cw), rn(ch));
        innerEdgeGrad.addColorStop(0, '#ffffff');
        innerEdgeGrad.addColorStop(0.5, '#666f6a');
        innerEdgeGrad.addColorStop(1, '#224433');

        // fill the masked area with the white gradient, lightly.
        // use overlay composite for relatively color neutral effects
        ctx.save();
        (0, _utils.pointsToPath)(ctx, v);
        ctx.clip();
        ctx.globalCompositeOperation = 'overlay';
        ctx.globalAlpha = (0, _utils.randomInRange)(0.15, 0.25);
        ctx.fillStyle = lightGrad;
        ctx.fillRect(0, 0, cw, ch);
        ctx.restore();

        // dark edge at the far side.
        ctx.globalCompositeOperation = 'overlay';
        ctx.globalAlpha = (0, _utils.randomInRange)(0.1, 0.5);
        ctx.strokeStyle = darkGrad;
        ctx.translate(2 * diffract * Math.cos(theta), 2 * diffract * Math.sin(theta));
        _shapes.drawLine.apply(undefined, [ctx].concat(edgePts));
        ctx.stroke();
        ctx.translate(-2 * diffract * Math.cos(theta), -2 * diffract * Math.sin(theta));

        // TODO come back to this
        if (THICK) {
            var thickness = offset * magSteps;

            // some thick plates get strong edge face decoration
            var BRIGHTEDGE = Math.random() < 0.5;

            // heavy stroke of light gradient to show thickness of plate
            ctx.globalCompositeOperation = 'overlay';
            ctx.globalAlpha = BRIGHTEDGE ? (0, _utils.randomInRange)(0.6, 0.9) : (0, _utils.randItem)([0, (0, _utils.randomInRange)(0.2)]);
            ctx.lineWidth = thickness;
            ctx.translate(-(thickness / 2 + diffract) * Math.cos(theta), -(thickness / 2 + diffract) * Math.sin(theta));
            _shapes.drawLine.apply(undefined, [ctx].concat(edgePts));
            ctx.strokeStyle = edgeGrad;
            ctx.stroke();
            ctx.translate((thickness / 2 + diffract) * Math.cos(theta), (thickness / 2 + diffract) * Math.sin(theta));

            // lighter stroke for inner edge
            ctx.lineWidth = weight / 2;

            // light inner edge to catch other plate edge hilite
            ctx.globalCompositeOperation = 'color-dodge';
            ctx.globalAlpha = BRIGHTEDGE ? (0, _utils.randomInRange)(0.4, 0.8) : (0, _utils.randItem)([0, 0, (0, _utils.randomInRange)(0.2)]);
            ctx.strokeStyle = innerEdgeGrad;
            ctx.translate(-(thickness + diffract) * Math.cos(theta), -(thickness + diffract) * Math.sin(theta));
            _shapes.drawLine.apply(undefined, [ctx].concat(edgePts));
            ctx.stroke();
            ctx.translate((thickness + diffract) * Math.cos(theta), (thickness + diffract) * Math.sin(theta));

            // restore standard line weight
            ctx.lineWidth = weight;
        }

        // composite in color for fake chromatic aberration
        ctx.globalCompositeOperation = 'color-dodge';
        ctx.globalAlpha = 0.9;

        // draw a pink edge at the reference path
        ctx.strokeStyle = pinkGrad;
        (0, _utils.pointsToPath)(ctx, v);
        ctx.stroke();

        // then a green edge offset by a fraction of stroke width
        ctx.strokeStyle = greenGrad;
        ctx.translate(diffract * Math.cos(theta), diffract * Math.sin(theta));
        (0, _utils.pointsToPath)(ctx, v);
        ctx.stroke();
        ctx.translate(-diffract * Math.cos(theta), -diffract * Math.sin(theta));

        // reset transforms
        (0, _utils.resetTransform)(ctx);
    }

    // reset basic canvas params before exiting
    ctx.globalCompositeOperation = 'normal';
    ctx.globalAlpha = 1;
    // clean up the copy canvas node
    copy.remove();
}

/***/ }),
/* 44 */,
/* 45 */,
/* 46 */,
/* 47 */,
/* 48 */,
/* 49 */,
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(8);

var _lilGui = __webpack_require__(51);

var _lilGui2 = _interopRequireDefault(_lilGui);

var _noiseutils = __webpack_require__(1);

var _noiseutils2 = _interopRequireDefault(_noiseutils);

var _palettes = __webpack_require__(2);

var _palettes2 = _interopRequireDefault(_palettes);

var _colorbrewer = __webpack_require__(9);

var _colorbrewer2 = _interopRequireDefault(_colorbrewer);

var _waterline = __webpack_require__(10);

var _shapestack = __webpack_require__(12);

var _shapescape = __webpack_require__(15);

var _duos = __webpack_require__(26);

var _lines = __webpack_require__(16);

var _waves = __webpack_require__(17);

var _grid = __webpack_require__(18);

var _truchet = __webpack_require__(19);

var _truchetCurves = __webpack_require__(27);

var _grille = __webpack_require__(28);

var _circles = __webpack_require__(20);

var _mesh = __webpack_require__(21);

var _walk = __webpack_require__(22);

var _bands = __webpack_require__(23);

var _field = __webpack_require__(24);

var _fieldShape = __webpack_require__(29);

var _trails = __webpack_require__(30);

var _fragments = __webpack_require__(25);

var _clouds = __webpack_require__(31);

var _grads = __webpack_require__(32);

var _doodle = __webpack_require__(33);

var _pillars = __webpack_require__(35);

var _rings = __webpack_require__(36);

var _plants = __webpack_require__(37);

var _scales = __webpack_require__(38);

var _sweater = __webpack_require__(39);

var _tricycles = __webpack_require__(40);

var _utils = __webpack_require__(0);

var _dither = __webpack_require__(41);

var _dither2 = _interopRequireDefault(_dither);

var _speckle = __webpack_require__(7);

var _halftone = __webpack_require__(42);

var _fracture = __webpack_require__(43);

var _galleryCollection = __webpack_require__(52);

var _galleryCollection2 = _interopRequireDefault(_galleryCollection);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Renderers


// utils
var RENDERERS = {
    waterline: _waterline.waterline,
    shapestack: _shapestack.shapestack,
    shapescape: _shapescape.shapescape,
    duos: _duos.duos,
    lines: _lines.lines,
    grid: _grid.grid,
    truchet: _truchet.truchet,
    "truchet-Curves": _truchetCurves.truchetCurves,
    grille: _grille.grille,
    circles: _circles.circles,
    mesh: _mesh.mesh,
    walk: _walk.walk,
    field: _field.field,
    "field-Shape": _fieldShape.fieldShape,
    trails: _trails.trails,
    bands: _bands.bands,
    fragments: _fragments.fragments,
    waves: _waves.waves,
    grads: _grads.grads,
    doodle: _doodle.doodle,
    pillars: _pillars.pillars,
    rings: _rings.rings,
    plants: _plants.plants,
    scales: _scales.scales,
    sweater: _sweater.sweater,
    tricycles: _tricycles.tricycles
    //clouds: clouds
};

// gallery collection


// postprocess

// renderers

var initRenderer = 'waterline';

var rendererName;
var Renderer;
var activeButton;

// util to format renderer names for display
function formatRendererName(inputName) {
    var formattedName = inputName.slice(0, 1).toUpperCase() + inputName.slice(1);
    formattedName = formattedName.replace('-', ' ');
    return formattedName;
}

// generate a series of buttons for each renderer in @renderers
// format their names using formatRendererNAme
// append the buttons to @el
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
        button.innerHTML = formatRendererName(r);
        button.onclick = makeHandler(r, button);
        el.appendChild(button);
    }
}

// select a renderer to use, update the window hash
// does not draw anything
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
}
window.setRenderer = setRenderer;

//======================================
// POSTPROCESS
//======================================

function roughenMain() {
    var canvas = document.querySelector('#example canvas');
    var ctx = canvas.getContext('2d');
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    (0, _speckle.dapple)(canvas);
}
window.roughenMain = roughenMain;

function donegalMain() {
    var canvas = document.querySelector('#example canvas');
    (0, _speckle.donegal)(canvas, 'random');
}

window.donegalMain = donegalMain;

//--------------------------------------

function ditherToLuminosity() {
    var canvas = document.querySelector('#example canvas');
    var ctx = canvas.getContext('2d');
    var idata = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var dithered = _dither2.default.ditherLuminosity(idata, 'atkinson');

    // apply the dithered data back
    //ctx.putImageData(dithered, 0, 0);

    // OR: draw dithered data to an offscreen canvas,
    // then apply that to original image via 'overlay'
    var ditherCanvas = document.createElement('canvas');
    ditherCanvas.width = canvas.width;
    ditherCanvas.height = canvas.height;
    var ditherctx = ditherCanvas.getContext('2d');
    ditherctx.putImageData(dithered, 0, 0);

    ctx.globalAlpha = 0.5;
    ctx.globalCompositeOperation = 'overlay';
    ctx.drawImage(ditherCanvas, 0, 0);
    ctx.globalAlpha = 1;

    ctx.globalCompositeOperation = 'normal';
}
window.ditherToLuminosity = ditherToLuminosity;

//--------------------------------------


function ditherToPalette() {
    var canvas = document.querySelector('#example canvas');

    // Create a basic palette of black and white if no palette exists
    var basePalette = ['#000000', '#ffffff'];
    var renderPalette = [].concat(basePalette);
    if (visualOpts.palette && visualOpts.palette.length) {
        // If we have a palette, add it to the black and white, and add gray
        // for marks used in some renderers that aren't palette driven
        renderPalette = renderPalette.concat(visualOpts.palette).concat(['#7d7d7d']);
    }
    // draw directly to the active canvas with dithered data.
    var ctx = canvas.getContext('2d');
    var idata = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var dithered = _dither2.default.ditherPalette(idata, renderPalette, 'atkinson');

    // apply the dithered data back
    ctx.putImageData(dithered, 0, 0);
}

window.ditherToPalette = ditherToPalette;

//--------------------------------------

// Halftone
function halftoneProcess() {
    var tStart = new Date().getTime();

    var canvas = document.querySelector('#example canvas');
    canvas.setAttribute('willReadFrequently', true);

    var cmyk = [{
        name: 'y',
        color: 'rgba(255,255,0)',
        angle: 0
    }, {
        name: 'm',
        color: 'rgba(255,0,255)',
        angle: 75
    }, {
        name: 'c',
        color: 'rgba(0,255,255)',
        angle: 15
    }, {
        name: 'k',
        color: 'rgba(0,0,0)',
        angle: 45
    }];

    (0, _halftone.halftoneCMYK)(canvas, 2, cmyk);

    var tEnd = new Date().getTime();
    console.log('Ran halftoneProcess in ' + (tEnd - tStart) + 'ms');
}

window.halftoneProcess = halftoneProcess;

function halftoneSpot() {
    var tStart = new Date().getTime();

    var canvas = document.querySelector('#example canvas');
    var palette = [];

    // use working palette, or fall back to rgb + black
    if (visualOpts.palette && visualOpts.palette.length) {
        palette = visualOpts.palette;
    } else {
        // cmyk: ['#000000', '#ff00ff', '#00ffff', '#ffff00'];
        palette = ['#ff0000', '#00ff00', '#0000ff', '#000000'];
    }

    //palette.push('#e7e7e7');

    (0, _halftone.halftoneSpotColors)(canvas, 2, palette);

    var tEnd = new Date().getTime();
    console.log('Ran halftoneSpot in ' + (tEnd - tStart) + 'ms');
}

window.halftoneSpot = halftoneSpot;

/* Fracture
-------------------------------------- */

var fractureImage = function fractureImage() {
    var canvas = document.querySelector('#example canvas');
    (0, _fracture.fracture)(canvas, 2);
};

window.fractureImage = fractureImage;

var shatterImage = function shatterImage() {
    var canvas = document.querySelector('#example canvas');
    //fracture(canvas, 64);
    var steps = 5;
    while (steps--) {
        (0, _fracture.fracture)(canvas, 4);
    }
};

window.shatterImage = shatterImage;

/* ======================================
END POSTPROCESS
====================================== */

/* ======================================
BEGIN STYLES
====================================== */

var worksEl = document.getElementById('works');
var worksHTML = '';

function selectWork(div) {
    var sel = works.querySelector('.selected');
    sel && sel.classList.remove('selected');
    div.classList.add('selected');
}

_galleryCollection2.default.forEach(function (item) {
    // decorate the element
    var el = document.createElement('div');
    el.setAttribute('class', 'work');
    el.innerHTML = '<strong>' + item.name + '</strong><span class="description">' + (item.description || '') + '</span>';
    // set event handler
    var handler = function handler(e) {
        e.preventDefault();
        //Renderer = item.renderer;
        setRenderer(item.renderer);
        loadOpts(item.opts);
        selectWork(el);
    };
    el.addEventListener('click', handler);
    worksEl.appendChild(el);
});

/* ======================================
END STYLES
====================================== */

// GUI controlled opts
var baseOpts = {
    container: document.querySelector('#example'),
    clear: true,
    dust: true,
    skew: 1,
    addNoise: 0.04,
    noiseInput: _noiseutils2.default.createNoiseCanvas(0.04, 200)
};
var visualOpts = Object.assign({}, baseOpts);

var exampleNode = document.getElementById('example');

// @fast skips re-rendering the canvas in place as an img,
// which makes for easy saving but slows down rendering
function loadOpts(opts, fast) {
    var img = exampleNode.querySelector('img');
    img && img.remove();
    visualOpts = Object.assign({}, baseOpts, opts);
    // render art
    Renderer(visualOpts);
}

// set up main download link
var a = document.getElementById('downloadExample');
a.onclick = function () {
    return doDownload(a, document.querySelector('#example canvas'));
};

// Handlers for redraw, batching, and manual saving

function redraw() {
    removePreview();
    //requestAnimationFrame(loadOpts);
    requestAnimationFrame(function () {
        Renderer(visualOpts);
    });
    showMain();
}
window.redraw = redraw;

document.addEventListener('keydown', function (e) {
    var kode = e.which || e.keyCode;
    if (kode === 32) {
        // space
        redraw();
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
    return redraw({});
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
    option.innerHTML = pname.replace(/_/g, ' ');
    if (pname === "default") {
        option.innerHTML = "default colors";
    }
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
    exampleNode.className = className;
    redraw();
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

// setRenderer(initRenderer, document.querySelector("[data-renderer='" + initRenderer + "']"));

/***/ }),
/* 51 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BooleanController", function() { return BooleanController; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ColorController", function() { return ColorController; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Controller", function() { return Controller; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FunctionController", function() { return FunctionController; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GUI", function() { return GUI; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "NumberController", function() { return NumberController; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "OptionController", function() { return OptionController; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "StringController", function() { return StringController; });
/**
 * lil-gui
 * https://lil-gui.georgealways.com
 * @version 0.19.2
 * @author George Michael Brower
 * @license MIT
 */

/**
 * Base class for all controllers.
 */
class Controller {

	constructor( parent, object, property, className, elementType = 'div' ) {

		/**
		 * The GUI that contains this controller.
		 * @type {GUI}
		 */
		this.parent = parent;

		/**
		 * The object this controller will modify.
		 * @type {object}
		 */
		this.object = object;

		/**
		 * The name of the property to control.
		 * @type {string}
		 */
		this.property = property;

		/**
		 * Used to determine if the controller is disabled.
		 * Use `controller.disable( true|false )` to modify this value.
		 * @type {boolean}
		 */
		this._disabled = false;

		/**
		 * Used to determine if the Controller is hidden.
		 * Use `controller.show()` or `controller.hide()` to change this.
		 * @type {boolean}
		 */
		this._hidden = false;

		/**
		 * The value of `object[ property ]` when the controller was created.
		 * @type {any}
		 */
		this.initialValue = this.getValue();

		/**
		 * The outermost container DOM element for this controller.
		 * @type {HTMLElement}
		 */
		this.domElement = document.createElement( elementType );
		this.domElement.classList.add( 'controller' );
		this.domElement.classList.add( className );

		/**
		 * The DOM element that contains the controller's name.
		 * @type {HTMLElement}
		 */
		this.$name = document.createElement( 'div' );
		this.$name.classList.add( 'name' );

		Controller.nextNameID = Controller.nextNameID || 0;
		this.$name.id = `lil-gui-name-${++Controller.nextNameID}`;

		/**
		 * The DOM element that contains the controller's "widget" (which differs by controller type).
		 * @type {HTMLElement}
		 */
		this.$widget = document.createElement( 'div' );
		this.$widget.classList.add( 'widget' );

		/**
		 * The DOM element that receives the disabled attribute when using disable().
		 * @type {HTMLElement}
		 */
		this.$disable = this.$widget;

		this.domElement.appendChild( this.$name );
		this.domElement.appendChild( this.$widget );

		// Don't fire global key events while typing in a controller
		this.domElement.addEventListener( 'keydown', e => e.stopPropagation() );
		this.domElement.addEventListener( 'keyup', e => e.stopPropagation() );

		this.parent.children.push( this );
		this.parent.controllers.push( this );

		this.parent.$children.appendChild( this.domElement );

		this._listenCallback = this._listenCallback.bind( this );

		this.name( property );

	}

	/**
	 * Sets the name of the controller and its label in the GUI.
	 * @param {string} name
	 * @returns {this}
	 */
	name( name ) {
		/**
		 * The controller's name. Use `controller.name( 'Name' )` to modify this value.
		 * @type {string}
		 */
		this._name = name;
		this.$name.textContent = name;
		return this;
	}

	/**
	 * Pass a function to be called whenever the value is modified by this controller.
	 * The function receives the new value as its first parameter. The value of `this` will be the
	 * controller.
	 *
	 * For function controllers, the `onChange` callback will be fired on click, after the function
	 * executes.
	 * @param {Function} callback
	 * @returns {this}
	 * @example
	 * const controller = gui.add( object, 'property' );
	 *
	 * controller.onChange( function( v ) {
	 * 	console.log( 'The value is now ' + v );
	 * 	console.assert( this === controller );
	 * } );
	 */
	onChange( callback ) {
		/**
		 * Used to access the function bound to `onChange` events. Don't modify this value directly.
		 * Use the `controller.onChange( callback )` method instead.
		 * @type {Function}
		 */
		this._onChange = callback;
		return this;
	}

	/**
	 * Calls the onChange methods of this controller and its parent GUI.
	 * @protected
	 */
	_callOnChange() {

		this.parent._callOnChange( this );

		if ( this._onChange !== undefined ) {
			this._onChange.call( this, this.getValue() );
		}

		this._changed = true;

	}

	/**
	 * Pass a function to be called after this controller has been modified and loses focus.
	 * @param {Function} callback
	 * @returns {this}
	 * @example
	 * const controller = gui.add( object, 'property' );
	 *
	 * controller.onFinishChange( function( v ) {
	 * 	console.log( 'Changes complete: ' + v );
	 * 	console.assert( this === controller );
	 * } );
	 */
	onFinishChange( callback ) {
		/**
		 * Used to access the function bound to `onFinishChange` events. Don't modify this value
		 * directly. Use the `controller.onFinishChange( callback )` method instead.
		 * @type {Function}
		 */
		this._onFinishChange = callback;
		return this;
	}

	/**
	 * Should be called by Controller when its widgets lose focus.
	 * @protected
	 */
	_callOnFinishChange() {

		if ( this._changed ) {

			this.parent._callOnFinishChange( this );

			if ( this._onFinishChange !== undefined ) {
				this._onFinishChange.call( this, this.getValue() );
			}

		}

		this._changed = false;

	}

	/**
	 * Sets the controller back to its initial value.
	 * @returns {this}
	 */
	reset() {
		this.setValue( this.initialValue );
		this._callOnFinishChange();
		return this;
	}

	/**
	 * Enables this controller.
	 * @param {boolean} enabled
	 * @returns {this}
	 * @example
	 * controller.enable();
	 * controller.enable( false ); // disable
	 * controller.enable( controller._disabled ); // toggle
	 */
	enable( enabled = true ) {
		return this.disable( !enabled );
	}

	/**
	 * Disables this controller.
	 * @param {boolean} disabled
	 * @returns {this}
	 * @example
	 * controller.disable();
	 * controller.disable( false ); // enable
	 * controller.disable( !controller._disabled ); // toggle
	 */
	disable( disabled = true ) {

		if ( disabled === this._disabled ) return this;

		this._disabled = disabled;

		this.domElement.classList.toggle( 'disabled', disabled );
		this.$disable.toggleAttribute( 'disabled', disabled );

		return this;

	}

	/**
	 * Shows the Controller after it's been hidden.
	 * @param {boolean} show
	 * @returns {this}
	 * @example
	 * controller.show();
	 * controller.show( false ); // hide
	 * controller.show( controller._hidden ); // toggle
	 */
	show( show = true ) {

		this._hidden = !show;

		this.domElement.style.display = this._hidden ? 'none' : '';

		return this;

	}

	/**
	 * Hides the Controller.
	 * @returns {this}
	 */
	hide() {
		return this.show( false );
	}

	/**
	 * Changes this controller into a dropdown of options.
	 *
	 * Calling this method on an option controller will simply update the options. However, if this
	 * controller was not already an option controller, old references to this controller are
	 * destroyed, and a new controller is added to the end of the GUI.
	 * @example
	 * // safe usage
	 *
	 * gui.add( obj, 'prop1' ).options( [ 'a', 'b', 'c' ] );
	 * gui.add( obj, 'prop2' ).options( { Big: 10, Small: 1 } );
	 * gui.add( obj, 'prop3' );
	 *
	 * // danger
	 *
	 * const ctrl1 = gui.add( obj, 'prop1' );
	 * gui.add( obj, 'prop2' );
	 *
	 * // calling options out of order adds a new controller to the end...
	 * const ctrl2 = ctrl1.options( [ 'a', 'b', 'c' ] );
	 *
	 * // ...and ctrl1 now references a controller that doesn't exist
	 * assert( ctrl2 !== ctrl1 )
	 * @param {object|Array} options
	 * @returns {Controller}
	 */
	options( options ) {
		const controller = this.parent.add( this.object, this.property, options );
		controller.name( this._name );
		this.destroy();
		return controller;
	}

	/**
	 * Sets the minimum value. Only works on number controllers.
	 * @param {number} min
	 * @returns {this}
	 */
	min( min ) {
		return this;
	}

	/**
	 * Sets the maximum value. Only works on number controllers.
	 * @param {number} max
	 * @returns {this}
	 */
	max( max ) {
		return this;
	}

	/**
	 * Values set by this controller will be rounded to multiples of `step`. Only works on number
	 * controllers.
	 * @param {number} step
	 * @returns {this}
	 */
	step( step ) {
		return this;
	}

	/**
	 * Rounds the displayed value to a fixed number of decimals, without affecting the actual value
	 * like `step()`. Only works on number controllers.
	 * @example
	 * gui.add( object, 'property' ).listen().decimals( 4 );
	 * @param {number} decimals
	 * @returns {this}
	 */
	decimals( decimals ) {
		return this;
	}

	/**
	 * Calls `updateDisplay()` every animation frame. Pass `false` to stop listening.
	 * @param {boolean} listen
	 * @returns {this}
	 */
	listen( listen = true ) {

		/**
		 * Used to determine if the controller is currently listening. Don't modify this value
		 * directly. Use the `controller.listen( true|false )` method instead.
		 * @type {boolean}
		 */
		this._listening = listen;

		if ( this._listenCallbackID !== undefined ) {
			cancelAnimationFrame( this._listenCallbackID );
			this._listenCallbackID = undefined;
		}

		if ( this._listening ) {
			this._listenCallback();
		}

		return this;

	}

	_listenCallback() {

		this._listenCallbackID = requestAnimationFrame( this._listenCallback );

		// To prevent framerate loss, make sure the value has changed before updating the display.
		// Note: save() is used here instead of getValue() only because of ColorController. The !== operator
		// won't work for color objects or arrays, but ColorController.save() always returns a string.

		const curValue = this.save();

		if ( curValue !== this._listenPrevValue ) {
			this.updateDisplay();
		}

		this._listenPrevValue = curValue;

	}

	/**
	 * Returns `object[ property ]`.
	 * @returns {any}
	 */
	getValue() {
		return this.object[ this.property ];
	}

	/**
	 * Sets the value of `object[ property ]`, invokes any `onChange` handlers and updates the display.
	 * @param {any} value
	 * @returns {this}
	 */
	setValue( value ) {

		if ( this.getValue() !== value ) {

			this.object[ this.property ] = value;
			this._callOnChange();
			this.updateDisplay();

		}

		return this;

	}

	/**
	 * Updates the display to keep it in sync with the current value. Useful for updating your
	 * controllers when their values have been modified outside of the GUI.
	 * @returns {this}
	 */
	updateDisplay() {
		return this;
	}

	load( value ) {
		this.setValue( value );
		this._callOnFinishChange();
		return this;
	}

	save() {
		return this.getValue();
	}

	/**
	 * Destroys this controller and removes it from the parent GUI.
	 */
	destroy() {
		this.listen( false );
		this.parent.children.splice( this.parent.children.indexOf( this ), 1 );
		this.parent.controllers.splice( this.parent.controllers.indexOf( this ), 1 );
		this.parent.$children.removeChild( this.domElement );
	}

}

class BooleanController extends Controller {

	constructor( parent, object, property ) {

		super( parent, object, property, 'boolean', 'label' );

		this.$input = document.createElement( 'input' );
		this.$input.setAttribute( 'type', 'checkbox' );
		this.$input.setAttribute( 'aria-labelledby', this.$name.id );

		this.$widget.appendChild( this.$input );

		this.$input.addEventListener( 'change', () => {
			this.setValue( this.$input.checked );
			this._callOnFinishChange();
		} );

		this.$disable = this.$input;

		this.updateDisplay();

	}

	updateDisplay() {
		this.$input.checked = this.getValue();
		return this;
	}

}

function normalizeColorString( string ) {

	let match, result;

	if ( match = string.match( /(#|0x)?([a-f0-9]{6})/i ) ) {

		result = match[ 2 ];

	} else if ( match = string.match( /rgb\(\s*(\d*)\s*,\s*(\d*)\s*,\s*(\d*)\s*\)/ ) ) {

		result = parseInt( match[ 1 ] ).toString( 16 ).padStart( 2, 0 )
			+ parseInt( match[ 2 ] ).toString( 16 ).padStart( 2, 0 )
			+ parseInt( match[ 3 ] ).toString( 16 ).padStart( 2, 0 );

	} else if ( match = string.match( /^#?([a-f0-9])([a-f0-9])([a-f0-9])$/i ) ) {

		result = match[ 1 ] + match[ 1 ] + match[ 2 ] + match[ 2 ] + match[ 3 ] + match[ 3 ];

	}

	if ( result ) {
		return '#' + result;
	}

	return false;

}

const STRING = {
	isPrimitive: true,
	match: v => typeof v === 'string',
	fromHexString: normalizeColorString,
	toHexString: normalizeColorString
};

const INT = {
	isPrimitive: true,
	match: v => typeof v === 'number',
	fromHexString: string => parseInt( string.substring( 1 ), 16 ),
	toHexString: value => '#' + value.toString( 16 ).padStart( 6, 0 )
};

const ARRAY = {
	isPrimitive: false,

	// The arrow function is here to appease tree shakers like esbuild or webpack.
	// See https://esbuild.github.io/api/#tree-shaking
	match: v => Array.isArray( v ),

	fromHexString( string, target, rgbScale = 1 ) {

		const int = INT.fromHexString( string );

		target[ 0 ] = ( int >> 16 & 255 ) / 255 * rgbScale;
		target[ 1 ] = ( int >> 8 & 255 ) / 255 * rgbScale;
		target[ 2 ] = ( int & 255 ) / 255 * rgbScale;

	},
	toHexString( [ r, g, b ], rgbScale = 1 ) {

		rgbScale = 255 / rgbScale;

		const int = ( r * rgbScale ) << 16 ^
			( g * rgbScale ) << 8 ^
			( b * rgbScale ) << 0;

		return INT.toHexString( int );

	}
};

const OBJECT = {
	isPrimitive: false,
	match: v => Object( v ) === v,
	fromHexString( string, target, rgbScale = 1 ) {

		const int = INT.fromHexString( string );

		target.r = ( int >> 16 & 255 ) / 255 * rgbScale;
		target.g = ( int >> 8 & 255 ) / 255 * rgbScale;
		target.b = ( int & 255 ) / 255 * rgbScale;

	},
	toHexString( { r, g, b }, rgbScale = 1 ) {

		rgbScale = 255 / rgbScale;

		const int = ( r * rgbScale ) << 16 ^
			( g * rgbScale ) << 8 ^
			( b * rgbScale ) << 0;

		return INT.toHexString( int );

	}
};

const FORMATS = [ STRING, INT, ARRAY, OBJECT ];

function getColorFormat( value ) {
	return FORMATS.find( format => format.match( value ) );
}

class ColorController extends Controller {

	constructor( parent, object, property, rgbScale ) {

		super( parent, object, property, 'color' );

		this.$input = document.createElement( 'input' );
		this.$input.setAttribute( 'type', 'color' );
		this.$input.setAttribute( 'tabindex', -1 );
		this.$input.setAttribute( 'aria-labelledby', this.$name.id );

		this.$text = document.createElement( 'input' );
		this.$text.setAttribute( 'type', 'text' );
		this.$text.setAttribute( 'spellcheck', 'false' );
		this.$text.setAttribute( 'aria-labelledby', this.$name.id );

		this.$display = document.createElement( 'div' );
		this.$display.classList.add( 'display' );

		this.$display.appendChild( this.$input );
		this.$widget.appendChild( this.$display );
		this.$widget.appendChild( this.$text );

		this._format = getColorFormat( this.initialValue );
		this._rgbScale = rgbScale;

		this._initialValueHexString = this.save();
		this._textFocused = false;

		this.$input.addEventListener( 'input', () => {
			this._setValueFromHexString( this.$input.value );
		} );

		this.$input.addEventListener( 'blur', () => {
			this._callOnFinishChange();
		} );

		this.$text.addEventListener( 'input', () => {
			const tryParse = normalizeColorString( this.$text.value );
			if ( tryParse ) {
				this._setValueFromHexString( tryParse );
			}
		} );

		this.$text.addEventListener( 'focus', () => {
			this._textFocused = true;
			this.$text.select();
		} );

		this.$text.addEventListener( 'blur', () => {
			this._textFocused = false;
			this.updateDisplay();
			this._callOnFinishChange();
		} );

		this.$disable = this.$text;

		this.updateDisplay();

	}

	reset() {
		this._setValueFromHexString( this._initialValueHexString );
		return this;
	}

	_setValueFromHexString( value ) {

		if ( this._format.isPrimitive ) {

			const newValue = this._format.fromHexString( value );
			this.setValue( newValue );

		} else {

			this._format.fromHexString( value, this.getValue(), this._rgbScale );
			this._callOnChange();
			this.updateDisplay();

		}

	}

	save() {
		return this._format.toHexString( this.getValue(), this._rgbScale );
	}

	load( value ) {
		this._setValueFromHexString( value );
		this._callOnFinishChange();
		return this;
	}

	updateDisplay() {
		this.$input.value = this._format.toHexString( this.getValue(), this._rgbScale );
		if ( !this._textFocused ) {
			this.$text.value = this.$input.value.substring( 1 );
		}
		this.$display.style.backgroundColor = this.$input.value;
		return this;
	}

}

class FunctionController extends Controller {

	constructor( parent, object, property ) {

		super( parent, object, property, 'function' );

		// Buttons are the only case where widget contains name
		this.$button = document.createElement( 'button' );
		this.$button.appendChild( this.$name );
		this.$widget.appendChild( this.$button );

		this.$button.addEventListener( 'click', e => {
			e.preventDefault();
			this.getValue().call( this.object );
			this._callOnChange();
		} );

		// enables :active pseudo class on mobile
		this.$button.addEventListener( 'touchstart', () => {}, { passive: true } );

		this.$disable = this.$button;

	}

}

class NumberController extends Controller {

	constructor( parent, object, property, min, max, step ) {

		super( parent, object, property, 'number' );

		this._initInput();

		this.min( min );
		this.max( max );

		const stepExplicit = step !== undefined;
		this.step( stepExplicit ? step : this._getImplicitStep(), stepExplicit );

		this.updateDisplay();

	}

	decimals( decimals ) {
		this._decimals = decimals;
		this.updateDisplay();
		return this;
	}

	min( min ) {
		this._min = min;
		this._onUpdateMinMax();
		return this;
	}

	max( max ) {
		this._max = max;
		this._onUpdateMinMax();
		return this;
	}

	step( step, explicit = true ) {
		this._step = step;
		this._stepExplicit = explicit;
		return this;
	}

	updateDisplay() {

		const value = this.getValue();

		if ( this._hasSlider ) {

			let percent = ( value - this._min ) / ( this._max - this._min );
			percent = Math.max( 0, Math.min( percent, 1 ) );

			this.$fill.style.width = percent * 100 + '%';

		}

		if ( !this._inputFocused ) {
			this.$input.value = this._decimals === undefined ? value : value.toFixed( this._decimals );
		}

		return this;

	}

	_initInput() {

		this.$input = document.createElement( 'input' );
		this.$input.setAttribute( 'type', 'text' );
		this.$input.setAttribute( 'aria-labelledby', this.$name.id );

		// On touch devices only, use input[type=number] to force a numeric keyboard.
		// Ideally we could use one input type everywhere, but [type=number] has quirks
		// on desktop, and [inputmode=decimal] has quirks on iOS.
		// See https://github.com/georgealways/lil-gui/pull/16

		const isTouch = window.matchMedia( '(pointer: coarse)' ).matches;

		if ( isTouch ) {
			this.$input.setAttribute( 'type', 'number' );
			this.$input.setAttribute( 'step', 'any' );
		}

		this.$widget.appendChild( this.$input );

		this.$disable = this.$input;

		const onInput = () => {

			let value = parseFloat( this.$input.value );

			if ( isNaN( value ) ) return;

			if ( this._stepExplicit ) {
				value = this._snap( value );
			}

			this.setValue( this._clamp( value ) );

		};

		// Keys & mouse wheel
		// ---------------------------------------------------------------------

		const increment = delta => {

			const value = parseFloat( this.$input.value );

			if ( isNaN( value ) ) return;

			this._snapClampSetValue( value + delta );

			// Force the input to updateDisplay when it's focused
			this.$input.value = this.getValue();

		};

		const onKeyDown = e => {
			// Using `e.key` instead of `e.code` also catches NumpadEnter
			if ( e.key === 'Enter' ) {
				this.$input.blur();
			}
			if ( e.code === 'ArrowUp' ) {
				e.preventDefault();
				increment( this._step * this._arrowKeyMultiplier( e ) );
			}
			if ( e.code === 'ArrowDown' ) {
				e.preventDefault();
				increment( this._step * this._arrowKeyMultiplier( e ) * -1 );
			}
		};

		const onWheel = e => {
			if ( this._inputFocused ) {
				e.preventDefault();
				increment( this._step * this._normalizeMouseWheel( e ) );
			}
		};

		// Vertical drag
		// ---------------------------------------------------------------------

		let testingForVerticalDrag = false,
			initClientX,
			initClientY,
			prevClientY,
			initValue,
			dragDelta;

		// Once the mouse is dragged more than DRAG_THRESH px on any axis, we decide
		// on the user's intent: horizontal means highlight, vertical means drag.
		const DRAG_THRESH = 5;

		const onMouseDown = e => {

			initClientX = e.clientX;
			initClientY = prevClientY = e.clientY;
			testingForVerticalDrag = true;

			initValue = this.getValue();
			dragDelta = 0;

			window.addEventListener( 'mousemove', onMouseMove );
			window.addEventListener( 'mouseup', onMouseUp );

		};

		const onMouseMove = e => {

			if ( testingForVerticalDrag ) {

				const dx = e.clientX - initClientX;
				const dy = e.clientY - initClientY;

				if ( Math.abs( dy ) > DRAG_THRESH ) {

					e.preventDefault();
					this.$input.blur();
					testingForVerticalDrag = false;
					this._setDraggingStyle( true, 'vertical' );

				} else if ( Math.abs( dx ) > DRAG_THRESH ) {

					onMouseUp();

				}

			}

			// This isn't an else so that the first move counts towards dragDelta
			if ( !testingForVerticalDrag ) {

				const dy = e.clientY - prevClientY;

				dragDelta -= dy * this._step * this._arrowKeyMultiplier( e );

				// Clamp dragDelta so we don't have 'dead space' after dragging past bounds.
				// We're okay with the fact that bounds can be undefined here.
				if ( initValue + dragDelta > this._max ) {
					dragDelta = this._max - initValue;
				} else if ( initValue + dragDelta < this._min ) {
					dragDelta = this._min - initValue;
				}

				this._snapClampSetValue( initValue + dragDelta );

			}

			prevClientY = e.clientY;

		};

		const onMouseUp = () => {
			this._setDraggingStyle( false, 'vertical' );
			this._callOnFinishChange();
			window.removeEventListener( 'mousemove', onMouseMove );
			window.removeEventListener( 'mouseup', onMouseUp );
		};

		// Focus state & onFinishChange
		// ---------------------------------------------------------------------

		const onFocus = () => {
			this._inputFocused = true;
		};

		const onBlur = () => {
			this._inputFocused = false;
			this.updateDisplay();
			this._callOnFinishChange();
		};

		this.$input.addEventListener( 'input', onInput );
		this.$input.addEventListener( 'keydown', onKeyDown );
		this.$input.addEventListener( 'wheel', onWheel, { passive: false } );
		this.$input.addEventListener( 'mousedown', onMouseDown );
		this.$input.addEventListener( 'focus', onFocus );
		this.$input.addEventListener( 'blur', onBlur );

	}

	_initSlider() {

		this._hasSlider = true;

		// Build DOM
		// ---------------------------------------------------------------------

		this.$slider = document.createElement( 'div' );
		this.$slider.classList.add( 'slider' );

		this.$fill = document.createElement( 'div' );
		this.$fill.classList.add( 'fill' );

		this.$slider.appendChild( this.$fill );
		this.$widget.insertBefore( this.$slider, this.$input );

		this.domElement.classList.add( 'hasSlider' );

		// Map clientX to value
		// ---------------------------------------------------------------------

		const map = ( v, a, b, c, d ) => {
			return ( v - a ) / ( b - a ) * ( d - c ) + c;
		};

		const setValueFromX = clientX => {
			const rect = this.$slider.getBoundingClientRect();
			let value = map( clientX, rect.left, rect.right, this._min, this._max );
			this._snapClampSetValue( value );
		};

		// Mouse drag
		// ---------------------------------------------------------------------

		const mouseDown = e => {
			this._setDraggingStyle( true );
			setValueFromX( e.clientX );
			window.addEventListener( 'mousemove', mouseMove );
			window.addEventListener( 'mouseup', mouseUp );
		};

		const mouseMove = e => {
			setValueFromX( e.clientX );
		};

		const mouseUp = () => {
			this._callOnFinishChange();
			this._setDraggingStyle( false );
			window.removeEventListener( 'mousemove', mouseMove );
			window.removeEventListener( 'mouseup', mouseUp );
		};

		// Touch drag
		// ---------------------------------------------------------------------

		let testingForScroll = false, prevClientX, prevClientY;

		const beginTouchDrag = e => {
			e.preventDefault();
			this._setDraggingStyle( true );
			setValueFromX( e.touches[ 0 ].clientX );
			testingForScroll = false;
		};

		const onTouchStart = e => {

			if ( e.touches.length > 1 ) return;

			// If we're in a scrollable container, we should wait for the first
			// touchmove to see if the user is trying to slide or scroll.
			if ( this._hasScrollBar ) {

				prevClientX = e.touches[ 0 ].clientX;
				prevClientY = e.touches[ 0 ].clientY;
				testingForScroll = true;

			} else {

				// Otherwise, we can set the value straight away on touchstart.
				beginTouchDrag( e );

			}

			window.addEventListener( 'touchmove', onTouchMove, { passive: false } );
			window.addEventListener( 'touchend', onTouchEnd );

		};

		const onTouchMove = e => {

			if ( testingForScroll ) {

				const dx = e.touches[ 0 ].clientX - prevClientX;
				const dy = e.touches[ 0 ].clientY - prevClientY;

				if ( Math.abs( dx ) > Math.abs( dy ) ) {

					// We moved horizontally, set the value and stop checking.
					beginTouchDrag( e );

				} else {

					// This was, in fact, an attempt to scroll. Abort.
					window.removeEventListener( 'touchmove', onTouchMove );
					window.removeEventListener( 'touchend', onTouchEnd );

				}

			} else {

				e.preventDefault();
				setValueFromX( e.touches[ 0 ].clientX );

			}

		};

		const onTouchEnd = () => {
			this._callOnFinishChange();
			this._setDraggingStyle( false );
			window.removeEventListener( 'touchmove', onTouchMove );
			window.removeEventListener( 'touchend', onTouchEnd );
		};

		// Mouse wheel
		// ---------------------------------------------------------------------

		// We have to use a debounced function to call onFinishChange because
		// there's no way to tell when the user is "done" mouse-wheeling.
		const callOnFinishChange = this._callOnFinishChange.bind( this );
		const WHEEL_DEBOUNCE_TIME = 400;
		let wheelFinishChangeTimeout;

		const onWheel = e => {

			// ignore vertical wheels if there's a scrollbar
			const isVertical = Math.abs( e.deltaX ) < Math.abs( e.deltaY );
			if ( isVertical && this._hasScrollBar ) return;

			e.preventDefault();

			// set value
			const delta = this._normalizeMouseWheel( e ) * this._step;
			this._snapClampSetValue( this.getValue() + delta );

			// force the input to updateDisplay when it's focused
			this.$input.value = this.getValue();

			// debounce onFinishChange
			clearTimeout( wheelFinishChangeTimeout );
			wheelFinishChangeTimeout = setTimeout( callOnFinishChange, WHEEL_DEBOUNCE_TIME );

		};

		this.$slider.addEventListener( 'mousedown', mouseDown );
		this.$slider.addEventListener( 'touchstart', onTouchStart, { passive: false } );
		this.$slider.addEventListener( 'wheel', onWheel, { passive: false } );

	}

	_setDraggingStyle( active, axis = 'horizontal' ) {
		if ( this.$slider ) {
			this.$slider.classList.toggle( 'active', active );
		}
		document.body.classList.toggle( 'lil-gui-dragging', active );
		document.body.classList.toggle( `lil-gui-${axis}`, active );
	}

	_getImplicitStep() {

		if ( this._hasMin && this._hasMax ) {
			return ( this._max - this._min ) / 1000;
		}

		return 0.1;

	}

	_onUpdateMinMax() {

		if ( !this._hasSlider && this._hasMin && this._hasMax ) {

			// If this is the first time we're hearing about min and max
			// and we haven't explicitly stated what our step is, let's
			// update that too.
			if ( !this._stepExplicit ) {
				this.step( this._getImplicitStep(), false );
			}

			this._initSlider();
			this.updateDisplay();

		}

	}

	_normalizeMouseWheel( e ) {

		let { deltaX, deltaY } = e;

		// Safari and Chrome report weird non-integral values for a notched wheel,
		// but still expose actual lines scrolled via wheelDelta. Notched wheels
		// should behave the same way as arrow keys.
		if ( Math.floor( e.deltaY ) !== e.deltaY && e.wheelDelta ) {
			deltaX = 0;
			deltaY = -e.wheelDelta / 120;
			deltaY *= this._stepExplicit ? 1 : 10;
		}

		const wheel = deltaX + -deltaY;

		return wheel;

	}

	_arrowKeyMultiplier( e ) {

		let mult = this._stepExplicit ? 1 : 10;

		if ( e.shiftKey ) {
			mult *= 10;
		} else if ( e.altKey ) {
			mult /= 10;
		}

		return mult;

	}

	_snap( value ) {

		// This would be the logical way to do things, but floating point errors.
		// return Math.round( value / this._step ) * this._step;

		// Using inverse step solves a lot of them, but not all
		// const inverseStep = 1 / this._step;
		// return Math.round( value * inverseStep ) / inverseStep;

		// Not happy about this, but haven't seen it break.
		const r = Math.round( value / this._step ) * this._step;
		return parseFloat( r.toPrecision( 15 ) );

	}

	_clamp( value ) {
		// either condition is false if min or max is undefined
		if ( value < this._min ) value = this._min;
		if ( value > this._max ) value = this._max;
		return value;
	}

	_snapClampSetValue( value ) {
		this.setValue( this._clamp( this._snap( value ) ) );
	}

	get _hasScrollBar() {
		const root = this.parent.root.$children;
		return root.scrollHeight > root.clientHeight;
	}

	get _hasMin() {
		return this._min !== undefined;
	}

	get _hasMax() {
		return this._max !== undefined;
	}

}

class OptionController extends Controller {

	constructor( parent, object, property, options ) {

		super( parent, object, property, 'option' );

		this.$select = document.createElement( 'select' );
		this.$select.setAttribute( 'aria-labelledby', this.$name.id );

		this.$display = document.createElement( 'div' );
		this.$display.classList.add( 'display' );

		this.$select.addEventListener( 'change', () => {
			this.setValue( this._values[ this.$select.selectedIndex ] );
			this._callOnFinishChange();
		} );

		this.$select.addEventListener( 'focus', () => {
			this.$display.classList.add( 'focus' );
		} );

		this.$select.addEventListener( 'blur', () => {
			this.$display.classList.remove( 'focus' );
		} );

		this.$widget.appendChild( this.$select );
		this.$widget.appendChild( this.$display );

		this.$disable = this.$select;

		this.options( options );

	}

	options( options ) {

		this._values = Array.isArray( options ) ? options : Object.values( options );
		this._names = Array.isArray( options ) ? options : Object.keys( options );

		this.$select.replaceChildren();

		this._names.forEach( name => {
			const $option = document.createElement( 'option' );
			$option.textContent = name;
			this.$select.appendChild( $option );
		} );

		this.updateDisplay();

		return this;

	}

	updateDisplay() {
		const value = this.getValue();
		const index = this._values.indexOf( value );
		this.$select.selectedIndex = index;
		this.$display.textContent = index === -1 ? value : this._names[ index ];
		return this;
	}

}

class StringController extends Controller {

	constructor( parent, object, property ) {

		super( parent, object, property, 'string' );

		this.$input = document.createElement( 'input' );
		this.$input.setAttribute( 'type', 'text' );
		this.$input.setAttribute( 'spellcheck', 'false' );
		this.$input.setAttribute( 'aria-labelledby', this.$name.id );

		this.$input.addEventListener( 'input', () => {
			this.setValue( this.$input.value );
		} );

		this.$input.addEventListener( 'keydown', e => {
			if ( e.code === 'Enter' ) {
				this.$input.blur();
			}
		} );

		this.$input.addEventListener( 'blur', () => {
			this._callOnFinishChange();
		} );

		this.$widget.appendChild( this.$input );

		this.$disable = this.$input;

		this.updateDisplay();

	}

	updateDisplay() {
		this.$input.value = this.getValue();
		return this;
	}

}

const stylesheet = `.lil-gui {
  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: 1;
  font-weight: normal;
  font-style: normal;
  text-align: left;
  color: var(--text-color);
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  --background-color: #1f1f1f;
  --text-color: #ebebeb;
  --title-background-color: #111111;
  --title-text-color: #ebebeb;
  --widget-color: #424242;
  --hover-color: #4f4f4f;
  --focus-color: #595959;
  --number-color: #2cc9ff;
  --string-color: #a2db3c;
  --font-size: 11px;
  --input-font-size: 11px;
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  --font-family-mono: Menlo, Monaco, Consolas, "Droid Sans Mono", monospace;
  --padding: 4px;
  --spacing: 4px;
  --widget-height: 20px;
  --title-height: calc(var(--widget-height) + var(--spacing) * 1.25);
  --name-width: 45%;
  --slider-knob-width: 2px;
  --slider-input-width: 27%;
  --color-input-width: 27%;
  --slider-input-min-width: 45px;
  --color-input-min-width: 45px;
  --folder-indent: 7px;
  --widget-padding: 0 0 0 3px;
  --widget-border-radius: 2px;
  --checkbox-size: calc(0.75 * var(--widget-height));
  --scrollbar-width: 5px;
}
.lil-gui, .lil-gui * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.lil-gui.root {
  width: var(--width, 245px);
  display: flex;
  flex-direction: column;
  background: var(--background-color);
}
.lil-gui.root > .title {
  background: var(--title-background-color);
  color: var(--title-text-color);
}
.lil-gui.root > .children {
  overflow-x: hidden;
  overflow-y: auto;
}
.lil-gui.root > .children::-webkit-scrollbar {
  width: var(--scrollbar-width);
  height: var(--scrollbar-width);
  background: var(--background-color);
}
.lil-gui.root > .children::-webkit-scrollbar-thumb {
  border-radius: var(--scrollbar-width);
  background: var(--focus-color);
}
@media (pointer: coarse) {
  .lil-gui.allow-touch-styles, .lil-gui.allow-touch-styles .lil-gui {
    --widget-height: 28px;
    --padding: 6px;
    --spacing: 6px;
    --font-size: 13px;
    --input-font-size: 16px;
    --folder-indent: 10px;
    --scrollbar-width: 7px;
    --slider-input-min-width: 50px;
    --color-input-min-width: 65px;
  }
}
.lil-gui.force-touch-styles, .lil-gui.force-touch-styles .lil-gui {
  --widget-height: 28px;
  --padding: 6px;
  --spacing: 6px;
  --font-size: 13px;
  --input-font-size: 16px;
  --folder-indent: 10px;
  --scrollbar-width: 7px;
  --slider-input-min-width: 50px;
  --color-input-min-width: 65px;
}
.lil-gui.autoPlace {
  max-height: 100%;
  position: fixed;
  top: 0;
  right: 15px;
  z-index: 1001;
}

.lil-gui .controller {
  display: flex;
  align-items: center;
  padding: 0 var(--padding);
  margin: var(--spacing) 0;
}
.lil-gui .controller.disabled {
  opacity: 0.5;
}
.lil-gui .controller.disabled, .lil-gui .controller.disabled * {
  pointer-events: none !important;
}
.lil-gui .controller > .name {
  min-width: var(--name-width);
  flex-shrink: 0;
  white-space: pre;
  padding-right: var(--spacing);
  line-height: var(--widget-height);
}
.lil-gui .controller .widget {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: var(--widget-height);
}
.lil-gui .controller.string input {
  color: var(--string-color);
}
.lil-gui .controller.boolean {
  cursor: pointer;
}
.lil-gui .controller.color .display {
  width: 100%;
  height: var(--widget-height);
  border-radius: var(--widget-border-radius);
  position: relative;
}
@media (hover: hover) {
  .lil-gui .controller.color .display:hover:before {
    content: " ";
    display: block;
    position: absolute;
    border-radius: var(--widget-border-radius);
    border: 1px solid #fff9;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
}
.lil-gui .controller.color input[type=color] {
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
.lil-gui .controller.color input[type=text] {
  margin-left: var(--spacing);
  font-family: var(--font-family-mono);
  min-width: var(--color-input-min-width);
  width: var(--color-input-width);
  flex-shrink: 0;
}
.lil-gui .controller.option select {
  opacity: 0;
  position: absolute;
  width: 100%;
  max-width: 100%;
}
.lil-gui .controller.option .display {
  position: relative;
  pointer-events: none;
  border-radius: var(--widget-border-radius);
  height: var(--widget-height);
  line-height: var(--widget-height);
  max-width: 100%;
  overflow: hidden;
  word-break: break-all;
  padding-left: 0.55em;
  padding-right: 1.75em;
  background: var(--widget-color);
}
@media (hover: hover) {
  .lil-gui .controller.option .display.focus {
    background: var(--focus-color);
  }
}
.lil-gui .controller.option .display.active {
  background: var(--focus-color);
}
.lil-gui .controller.option .display:after {
  font-family: "lil-gui";
  content: "↕";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  padding-right: 0.375em;
}
.lil-gui .controller.option .widget,
.lil-gui .controller.option select {
  cursor: pointer;
}
@media (hover: hover) {
  .lil-gui .controller.option .widget:hover .display {
    background: var(--hover-color);
  }
}
.lil-gui .controller.number input {
  color: var(--number-color);
}
.lil-gui .controller.number.hasSlider input {
  margin-left: var(--spacing);
  width: var(--slider-input-width);
  min-width: var(--slider-input-min-width);
  flex-shrink: 0;
}
.lil-gui .controller.number .slider {
  width: 100%;
  height: var(--widget-height);
  background: var(--widget-color);
  border-radius: var(--widget-border-radius);
  padding-right: var(--slider-knob-width);
  overflow: hidden;
  cursor: ew-resize;
  touch-action: pan-y;
}
@media (hover: hover) {
  .lil-gui .controller.number .slider:hover {
    background: var(--hover-color);
  }
}
.lil-gui .controller.number .slider.active {
  background: var(--focus-color);
}
.lil-gui .controller.number .slider.active .fill {
  opacity: 0.95;
}
.lil-gui .controller.number .fill {
  height: 100%;
  border-right: var(--slider-knob-width) solid var(--number-color);
  box-sizing: content-box;
}

.lil-gui-dragging .lil-gui {
  --hover-color: var(--widget-color);
}
.lil-gui-dragging * {
  cursor: ew-resize !important;
}

.lil-gui-dragging.lil-gui-vertical * {
  cursor: ns-resize !important;
}

.lil-gui .title {
  height: var(--title-height);
  line-height: calc(var(--title-height) - 4px);
  font-weight: 600;
  padding: 0 var(--padding);
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
  outline: none;
  text-decoration-skip: objects;
}
.lil-gui .title:before {
  font-family: "lil-gui";
  content: "▾";
  padding-right: 2px;
  display: inline-block;
}
.lil-gui .title:active {
  background: var(--title-background-color);
  opacity: 0.75;
}
@media (hover: hover) {
  body:not(.lil-gui-dragging) .lil-gui .title:hover {
    background: var(--title-background-color);
    opacity: 0.85;
  }
  .lil-gui .title:focus {
    text-decoration: underline var(--focus-color);
  }
}
.lil-gui.root > .title:focus {
  text-decoration: none !important;
}
.lil-gui.closed > .title:before {
  content: "▸";
}
.lil-gui.closed > .children {
  transform: translateY(-7px);
  opacity: 0;
}
.lil-gui.closed:not(.transition) > .children {
  display: none;
}
.lil-gui.transition > .children {
  transition-duration: 300ms;
  transition-property: height, opacity, transform;
  transition-timing-function: cubic-bezier(0.2, 0.6, 0.35, 1);
  overflow: hidden;
  pointer-events: none;
}
.lil-gui .children:empty:before {
  content: "Empty";
  padding: 0 var(--padding);
  margin: var(--spacing) 0;
  display: block;
  height: var(--widget-height);
  font-style: italic;
  line-height: var(--widget-height);
  opacity: 0.5;
}
.lil-gui.root > .children > .lil-gui > .title {
  border: 0 solid var(--widget-color);
  border-width: 1px 0;
  transition: border-color 300ms;
}
.lil-gui.root > .children > .lil-gui.closed > .title {
  border-bottom-color: transparent;
}
.lil-gui + .controller {
  border-top: 1px solid var(--widget-color);
  margin-top: 0;
  padding-top: var(--spacing);
}
.lil-gui .lil-gui .lil-gui > .title {
  border: none;
}
.lil-gui .lil-gui .lil-gui > .children {
  border: none;
  margin-left: var(--folder-indent);
  border-left: 2px solid var(--widget-color);
}
.lil-gui .lil-gui .controller {
  border: none;
}

.lil-gui label, .lil-gui input, .lil-gui button {
  -webkit-tap-highlight-color: transparent;
}
.lil-gui input {
  border: 0;
  outline: none;
  font-family: var(--font-family);
  font-size: var(--input-font-size);
  border-radius: var(--widget-border-radius);
  height: var(--widget-height);
  background: var(--widget-color);
  color: var(--text-color);
  width: 100%;
}
@media (hover: hover) {
  .lil-gui input:hover {
    background: var(--hover-color);
  }
  .lil-gui input:active {
    background: var(--focus-color);
  }
}
.lil-gui input:disabled {
  opacity: 1;
}
.lil-gui input[type=text],
.lil-gui input[type=number] {
  padding: var(--widget-padding);
  -moz-appearance: textfield;
}
.lil-gui input[type=text]:focus,
.lil-gui input[type=number]:focus {
  background: var(--focus-color);
}
.lil-gui input[type=checkbox] {
  appearance: none;
  width: var(--checkbox-size);
  height: var(--checkbox-size);
  border-radius: var(--widget-border-radius);
  text-align: center;
  cursor: pointer;
}
.lil-gui input[type=checkbox]:checked:before {
  font-family: "lil-gui";
  content: "✓";
  font-size: var(--checkbox-size);
  line-height: var(--checkbox-size);
}
@media (hover: hover) {
  .lil-gui input[type=checkbox]:focus {
    box-shadow: inset 0 0 0 1px var(--focus-color);
  }
}
.lil-gui button {
  outline: none;
  cursor: pointer;
  font-family: var(--font-family);
  font-size: var(--font-size);
  color: var(--text-color);
  width: 100%;
  height: var(--widget-height);
  text-transform: none;
  background: var(--widget-color);
  border-radius: var(--widget-border-radius);
  border: none;
}
@media (hover: hover) {
  .lil-gui button:hover {
    background: var(--hover-color);
  }
  .lil-gui button:focus {
    box-shadow: inset 0 0 0 1px var(--focus-color);
  }
}
.lil-gui button:active {
  background: var(--focus-color);
}

@font-face {
  font-family: "lil-gui";
  src: url("data:application/font-woff;charset=utf-8;base64,d09GRgABAAAAAAUsAAsAAAAACJwAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABHU1VCAAABCAAAAH4AAADAImwmYE9TLzIAAAGIAAAAPwAAAGBKqH5SY21hcAAAAcgAAAD0AAACrukyyJBnbHlmAAACvAAAAF8AAACEIZpWH2hlYWQAAAMcAAAAJwAAADZfcj2zaGhlYQAAA0QAAAAYAAAAJAC5AHhobXR4AAADXAAAABAAAABMAZAAAGxvY2EAAANsAAAAFAAAACgCEgIybWF4cAAAA4AAAAAeAAAAIAEfABJuYW1lAAADoAAAASIAAAIK9SUU/XBvc3QAAATEAAAAZgAAAJCTcMc2eJxVjbEOgjAURU+hFRBK1dGRL+ALnAiToyMLEzFpnPz/eAshwSa97517c/MwwJmeB9kwPl+0cf5+uGPZXsqPu4nvZabcSZldZ6kfyWnomFY/eScKqZNWupKJO6kXN3K9uCVoL7iInPr1X5baXs3tjuMqCtzEuagm/AAlzQgPAAB4nGNgYRBlnMDAysDAYM/gBiT5oLQBAwuDJAMDEwMrMwNWEJDmmsJwgCFeXZghBcjlZMgFCzOiKOIFAB71Bb8AeJy1kjFuwkAQRZ+DwRAwBtNQRUGKQ8OdKCAWUhAgKLhIuAsVSpWz5Bbkj3dEgYiUIszqWdpZe+Z7/wB1oCYmIoboiwiLT2WjKl/jscrHfGg/pKdMkyklC5Zs2LEfHYpjcRoPzme9MWWmk3dWbK9ObkWkikOetJ554fWyoEsmdSlt+uR0pCJR34b6t/TVg1SY3sYvdf8vuiKrpyaDXDISiegp17p7579Gp3p++y7HPAiY9pmTibljrr85qSidtlg4+l25GLCaS8e6rRxNBmsnERunKbaOObRz7N72ju5vdAjYpBXHgJylOAVsMseDAPEP8LYoUHicY2BiAAEfhiAGJgZWBgZ7RnFRdnVJELCQlBSRlATJMoLV2DK4glSYs6ubq5vbKrJLSbGrgEmovDuDJVhe3VzcXFwNLCOILB/C4IuQ1xTn5FPilBTj5FPmBAB4WwoqAHicY2BkYGAA4sk1sR/j+W2+MnAzpDBgAyEMQUCSg4EJxAEAwUgFHgB4nGNgZGBgSGFggJMhDIwMqEAYAByHATJ4nGNgAIIUNEwmAABl3AGReJxjYAACIQYlBiMGJ3wQAEcQBEV4nGNgZGBgEGZgY2BiAAEQyQWEDAz/wXwGAAsPATIAAHicXdBNSsNAHAXwl35iA0UQXYnMShfS9GPZA7T7LgIu03SSpkwzYTIt1BN4Ak/gKTyAeCxfw39jZkjymzcvAwmAW/wgwHUEGDb36+jQQ3GXGot79L24jxCP4gHzF/EIr4jEIe7wxhOC3g2TMYy4Q7+Lu/SHuEd/ivt4wJd4wPxbPEKMX3GI5+DJFGaSn4qNzk8mcbKSR6xdXdhSzaOZJGtdapd4vVPbi6rP+cL7TGXOHtXKll4bY1Xl7EGnPtp7Xy2n00zyKLVHfkHBa4IcJ2oD3cgggWvt/V/FbDrUlEUJhTn/0azVWbNTNr0Ens8de1tceK9xZmfB1CPjOmPH4kitmvOubcNpmVTN3oFJyjzCvnmrwhJTzqzVj9jiSX911FjeAAB4nG3HMRKCMBBA0f0giiKi4DU8k0V2GWbIZDOh4PoWWvq6J5V8If9NVNQcaDhyouXMhY4rPTcG7jwYmXhKq8Wz+p762aNaeYXom2n3m2dLTVgsrCgFJ7OTmIkYbwIbC6vIB7WmFfAAAA==") format("woff");
}`;

function _injectStyles( cssContent ) {
	const injected = document.createElement( 'style' );
	injected.innerHTML = cssContent;
	const before = document.querySelector( 'head link[rel=stylesheet], head style' );
	if ( before ) {
		document.head.insertBefore( injected, before );
	} else {
		document.head.appendChild( injected );
	}
}

let stylesInjected = false;

class GUI {

	/**
	 * Creates a panel that holds controllers.
	 * @example
	 * new GUI();
	 * new GUI( { container: document.getElementById( 'custom' ) } );
	 *
	 * @param {object} [options]
	 * @param {boolean} [options.autoPlace=true]
	 * Adds the GUI to `document.body` and fixes it to the top right of the page.
	 *
	 * @param {HTMLElement} [options.container]
	 * Adds the GUI to this DOM element. Overrides `autoPlace`.
	 *
	 * @param {number} [options.width=245]
	 * Width of the GUI in pixels, usually set when name labels become too long. Note that you can make
	 * name labels wider in CSS with `.lil‑gui { ‑‑name‑width: 55% }`.
	 *
	 * @param {string} [options.title=Controls]
	 * Name to display in the title bar.
	 *
	 * @param {boolean} [options.closeFolders=false]
	 * Pass `true` to close all folders in this GUI by default.
	 *
	 * @param {boolean} [options.injectStyles=true]
	 * Injects the default stylesheet into the page if this is the first GUI.
	 * Pass `false` to use your own stylesheet.
	 *
	 * @param {number} [options.touchStyles=true]
	 * Makes controllers larger on touch devices. Pass `false` to disable touch styles.
	 *
	 * @param {GUI} [options.parent]
	 * Adds this GUI as a child in another GUI. Usually this is done for you by `addFolder()`.
	 *
	 */
	constructor( {
		parent,
		autoPlace = parent === undefined,
		container,
		width,
		title = 'Controls',
		closeFolders = false,
		injectStyles = true,
		touchStyles = true
	} = {} ) {

		/**
		 * The GUI containing this folder, or `undefined` if this is the root GUI.
		 * @type {GUI}
		 */
		this.parent = parent;

		/**
		 * The top level GUI containing this folder, or `this` if this is the root GUI.
		 * @type {GUI}
		 */
		this.root = parent ? parent.root : this;

		/**
		 * The list of controllers and folders contained by this GUI.
		 * @type {Array<GUI|Controller>}
		 */
		this.children = [];

		/**
		 * The list of controllers contained by this GUI.
		 * @type {Array<Controller>}
		 */
		this.controllers = [];

		/**
		 * The list of folders contained by this GUI.
		 * @type {Array<GUI>}
		 */
		this.folders = [];

		/**
		 * Used to determine if the GUI is closed. Use `gui.open()` or `gui.close()` to change this.
		 * @type {boolean}
		 */
		this._closed = false;

		/**
		 * Used to determine if the GUI is hidden. Use `gui.show()` or `gui.hide()` to change this.
		 * @type {boolean}
		 */
		this._hidden = false;

		/**
		 * The outermost container element.
		 * @type {HTMLElement}
		 */
		this.domElement = document.createElement( 'div' );
		this.domElement.classList.add( 'lil-gui' );

		/**
		 * The DOM element that contains the title.
		 * @type {HTMLElement}
		 */
		this.$title = document.createElement( 'div' );
		this.$title.classList.add( 'title' );
		this.$title.setAttribute( 'role', 'button' );
		this.$title.setAttribute( 'aria-expanded', true );
		this.$title.setAttribute( 'tabindex', 0 );

		this.$title.addEventListener( 'click', () => this.openAnimated( this._closed ) );
		this.$title.addEventListener( 'keydown', e => {
			if ( e.code === 'Enter' || e.code === 'Space' ) {
				e.preventDefault();
				this.$title.click();
			}
		} );

		// enables :active pseudo class on mobile
		this.$title.addEventListener( 'touchstart', () => {}, { passive: true } );

		/**
		 * The DOM element that contains children.
		 * @type {HTMLElement}
		 */
		this.$children = document.createElement( 'div' );
		this.$children.classList.add( 'children' );

		this.domElement.appendChild( this.$title );
		this.domElement.appendChild( this.$children );

		this.title( title );

		if ( this.parent ) {

			this.parent.children.push( this );
			this.parent.folders.push( this );

			this.parent.$children.appendChild( this.domElement );

			// Stop the constructor early, everything onward only applies to root GUI's
			return;

		}

		this.domElement.classList.add( 'root' );

		if ( touchStyles ) {
			this.domElement.classList.add( 'allow-touch-styles' );
		}

		// Inject stylesheet if we haven't done that yet
		if ( !stylesInjected && injectStyles ) {
			_injectStyles( stylesheet );
			stylesInjected = true;
		}

		if ( container ) {

			container.appendChild( this.domElement );

		} else if ( autoPlace ) {

			this.domElement.classList.add( 'autoPlace' );
			document.body.appendChild( this.domElement );

		}

		if ( width ) {
			this.domElement.style.setProperty( '--width', width + 'px' );
		}

		this._closeFolders = closeFolders;

	}

	/**
	 * Adds a controller to the GUI, inferring controller type using the `typeof` operator.
	 * @example
	 * gui.add( object, 'property' );
	 * gui.add( object, 'number', 0, 100, 1 );
	 * gui.add( object, 'options', [ 1, 2, 3 ] );
	 *
	 * @param {object} object The object the controller will modify.
	 * @param {string} property Name of the property to control.
	 * @param {number|object|Array} [$1] Minimum value for number controllers, or the set of
	 * selectable values for a dropdown.
	 * @param {number} [max] Maximum value for number controllers.
	 * @param {number} [step] Step value for number controllers.
	 * @returns {Controller}
	 */
	add( object, property, $1, max, step ) {

		if ( Object( $1 ) === $1 ) {

			return new OptionController( this, object, property, $1 );

		}

		const initialValue = object[ property ];

		switch ( typeof initialValue ) {

			case 'number':

				return new NumberController( this, object, property, $1, max, step );

			case 'boolean':

				return new BooleanController( this, object, property );

			case 'string':

				return new StringController( this, object, property );

			case 'function':

				return new FunctionController( this, object, property );

		}

		console.error( `gui.add failed
	property:`, property, `
	object:`, object, `
	value:`, initialValue );

	}

	/**
	 * Adds a color controller to the GUI.
	 * @example
	 * params = {
	 * 	cssColor: '#ff00ff',
	 * 	rgbColor: { r: 0, g: 0.2, b: 0.4 },
	 * 	customRange: [ 0, 127, 255 ],
	 * };
	 *
	 * gui.addColor( params, 'cssColor' );
	 * gui.addColor( params, 'rgbColor' );
	 * gui.addColor( params, 'customRange', 255 );
	 *
	 * @param {object} object The object the controller will modify.
	 * @param {string} property Name of the property to control.
	 * @param {number} rgbScale Maximum value for a color channel when using an RGB color. You may
	 * need to set this to 255 if your colors are too bright.
	 * @returns {Controller}
	 */
	addColor( object, property, rgbScale = 1 ) {
		return new ColorController( this, object, property, rgbScale );
	}

	/**
	 * Adds a folder to the GUI, which is just another GUI. This method returns
	 * the nested GUI so you can add controllers to it.
	 * @example
	 * const folder = gui.addFolder( 'Position' );
	 * folder.add( position, 'x' );
	 * folder.add( position, 'y' );
	 * folder.add( position, 'z' );
	 *
	 * @param {string} title Name to display in the folder's title bar.
	 * @returns {GUI}
	 */
	addFolder( title ) {
		const folder = new GUI( { parent: this, title } );
		if ( this.root._closeFolders ) folder.close();
		return folder;
	}

	/**
	 * Recalls values that were saved with `gui.save()`.
	 * @param {object} obj
	 * @param {boolean} recursive Pass false to exclude folders descending from this GUI.
	 * @returns {this}
	 */
	load( obj, recursive = true ) {

		if ( obj.controllers ) {

			this.controllers.forEach( c => {

				if ( c instanceof FunctionController ) return;

				if ( c._name in obj.controllers ) {
					c.load( obj.controllers[ c._name ] );
				}

			} );

		}

		if ( recursive && obj.folders ) {

			this.folders.forEach( f => {

				if ( f._title in obj.folders ) {
					f.load( obj.folders[ f._title ] );
				}

			} );

		}

		return this;

	}

	/**
	 * Returns an object mapping controller names to values. The object can be passed to `gui.load()` to
	 * recall these values.
	 * @example
	 * {
	 * 	controllers: {
	 * 		prop1: 1,
	 * 		prop2: 'value',
	 * 		...
	 * 	},
	 * 	folders: {
	 * 		folderName1: { controllers, folders },
	 * 		folderName2: { controllers, folders }
	 * 		...
	 * 	}
	 * }
	 *
	 * @param {boolean} recursive Pass false to exclude folders descending from this GUI.
	 * @returns {object}
	 */
	save( recursive = true ) {

		const obj = {
			controllers: {},
			folders: {}
		};

		this.controllers.forEach( c => {

			if ( c instanceof FunctionController ) return;

			if ( c._name in obj.controllers ) {
				throw new Error( `Cannot save GUI with duplicate property "${c._name}"` );
			}

			obj.controllers[ c._name ] = c.save();

		} );

		if ( recursive ) {

			this.folders.forEach( f => {

				if ( f._title in obj.folders ) {
					throw new Error( `Cannot save GUI with duplicate folder "${f._title}"` );
				}

				obj.folders[ f._title ] = f.save();

			} );

		}

		return obj;

	}

	/**
	 * Opens a GUI or folder. GUI and folders are open by default.
	 * @param {boolean} open Pass false to close.
	 * @returns {this}
	 * @example
	 * gui.open(); // open
	 * gui.open( false ); // close
	 * gui.open( gui._closed ); // toggle
	 */
	open( open = true ) {

		this._setClosed( !open );

		this.$title.setAttribute( 'aria-expanded', !this._closed );
		this.domElement.classList.toggle( 'closed', this._closed );

		return this;

	}

	/**
	 * Closes the GUI.
	 * @returns {this}
	 */
	close() {
		return this.open( false );
	}

	_setClosed( closed ) {
		if ( this._closed === closed ) return;
		this._closed = closed;
		this._callOnOpenClose( this );
	}

	/**
	 * Shows the GUI after it's been hidden.
	 * @param {boolean} show
	 * @returns {this}
	 * @example
	 * gui.show();
	 * gui.show( false ); // hide
	 * gui.show( gui._hidden ); // toggle
	 */
	show( show = true ) {

		this._hidden = !show;

		this.domElement.style.display = this._hidden ? 'none' : '';

		return this;

	}

	/**
	 * Hides the GUI.
	 * @returns {this}
	 */
	hide() {
		return this.show( false );
	}

	openAnimated( open = true ) {

		// set state immediately
		this._setClosed( !open );

		this.$title.setAttribute( 'aria-expanded', !this._closed );

		// wait for next frame to measure $children
		requestAnimationFrame( () => {

			// explicitly set initial height for transition
			const initialHeight = this.$children.clientHeight;
			this.$children.style.height = initialHeight + 'px';

			this.domElement.classList.add( 'transition' );

			const onTransitionEnd = e => {
				if ( e.target !== this.$children ) return;
				this.$children.style.height = '';
				this.domElement.classList.remove( 'transition' );
				this.$children.removeEventListener( 'transitionend', onTransitionEnd );
			};

			this.$children.addEventListener( 'transitionend', onTransitionEnd );

			// todo: this is wrong if children's scrollHeight makes for a gui taller than maxHeight
			const targetHeight = !open ? 0 : this.$children.scrollHeight;

			this.domElement.classList.toggle( 'closed', !open );

			requestAnimationFrame( () => {
				this.$children.style.height = targetHeight + 'px';
			} );

		} );

		return this;

	}

	/**
	 * Change the title of this GUI.
	 * @param {string} title
	 * @returns {this}
	 */
	title( title ) {
		/**
		 * Current title of the GUI. Use `gui.title( 'Title' )` to modify this value.
		 * @type {string}
		 */
		this._title = title;
		this.$title.textContent = title;
		return this;
	}

	/**
	 * Resets all controllers to their initial values.
	 * @param {boolean} recursive Pass false to exclude folders descending from this GUI.
	 * @returns {this}
	 */
	reset( recursive = true ) {
		const controllers = recursive ? this.controllersRecursive() : this.controllers;
		controllers.forEach( c => c.reset() );
		return this;
	}

	/**
	 * Pass a function to be called whenever a controller in this GUI changes.
	 * @param {function({object:object, property:string, value:any, controller:Controller})} callback
	 * @returns {this}
	 * @example
	 * gui.onChange( event => {
	 * 	event.object     // object that was modified
	 * 	event.property   // string, name of property
	 * 	event.value      // new value of controller
	 * 	event.controller // controller that was modified
	 * } );
	 */
	onChange( callback ) {
		/**
		 * Used to access the function bound to `onChange` events. Don't modify this value
		 * directly. Use the `gui.onChange( callback )` method instead.
		 * @type {Function}
		 */
		this._onChange = callback;
		return this;
	}

	_callOnChange( controller ) {

		if ( this.parent ) {
			this.parent._callOnChange( controller );
		}

		if ( this._onChange !== undefined ) {
			this._onChange.call( this, {
				object: controller.object,
				property: controller.property,
				value: controller.getValue(),
				controller
			} );
		}
	}

	/**
	 * Pass a function to be called whenever a controller in this GUI has finished changing.
	 * @param {function({object:object, property:string, value:any, controller:Controller})} callback
	 * @returns {this}
	 * @example
	 * gui.onFinishChange( event => {
	 * 	event.object     // object that was modified
	 * 	event.property   // string, name of property
	 * 	event.value      // new value of controller
	 * 	event.controller // controller that was modified
	 * } );
	 */
	onFinishChange( callback ) {
		/**
		 * Used to access the function bound to `onFinishChange` events. Don't modify this value
		 * directly. Use the `gui.onFinishChange( callback )` method instead.
		 * @type {Function}
		 */
		this._onFinishChange = callback;
		return this;
	}

	_callOnFinishChange( controller ) {

		if ( this.parent ) {
			this.parent._callOnFinishChange( controller );
		}

		if ( this._onFinishChange !== undefined ) {
			this._onFinishChange.call( this, {
				object: controller.object,
				property: controller.property,
				value: controller.getValue(),
				controller
			} );
		}
	}

	/**
	 * Pass a function to be called when this GUI or its descendants are opened or closed.
	 * @param {function(GUI)} callback
	 * @returns {this}
	 * @example
	 * gui.onOpenClose( changedGUI => {
	 * 	console.log( changedGUI._closed );
	 * } );
	 */
	onOpenClose( callback ) {
		this._onOpenClose = callback;
		return this;
	}

	_callOnOpenClose( changedGUI ) {
		if ( this.parent ) {
			this.parent._callOnOpenClose( changedGUI );
		}

		if ( this._onOpenClose !== undefined ) {
			this._onOpenClose.call( this, changedGUI );
		}
	}

	/**
	 * Destroys all DOM elements and event listeners associated with this GUI.
	 */
	destroy() {

		if ( this.parent ) {
			this.parent.children.splice( this.parent.children.indexOf( this ), 1 );
			this.parent.folders.splice( this.parent.folders.indexOf( this ), 1 );
		}

		if ( this.domElement.parentElement ) {
			this.domElement.parentElement.removeChild( this.domElement );
		}

		Array.from( this.children ).forEach( c => c.destroy() );

	}

	/**
	 * Returns an array of controllers contained by this GUI and its descendents.
	 * @returns {Controller[]}
	 */
	controllersRecursive() {
		let controllers = Array.from( this.controllers );
		this.folders.forEach( f => {
			controllers = controllers.concat( f.controllersRecursive() );
		} );
		return controllers;
	}

	/**
	 * Returns an array of folders contained by this GUI and its descendents.
	 * @returns {GUI[]}
	 */
	foldersRecursive() {
		let folders = Array.from( this.folders );
		this.folders.forEach( f => {
			folders = folders.concat( f.foldersRecursive() );
		} );
		return folders;
	}

}

/* harmony default export */ __webpack_exports__["default"] = (GUI);



/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
var collection = [{
    name: 'Waterline',
    renderer: 'waterline',
    opts: {},
    description: 'Shapes floating in water, as seen at the water level'
}, {
    name: 'Carmitron',
    renderer: 'shapestack',
    opts: {
        fancy: false,
        nest: false,
        stack: true,
        multiMask: false,
        fillStyle: 'solid'
    },
    description: 'Based on works of Eugenio Carmi'
}, {
    name: 'Carmi plus',
    renderer: 'shapestack',
    opts: {
        fancy: true,
        nest: false,
        stack: false,
        multiMask: false,
        fillStyle: null
    },
    description: 'Fancy Carmitron: shadows and gradients and nested stacks'
}, {
    name: 'Shapescape',
    renderer: 'shapescape',
    opts: {},
    description: 'Two shaded shapes placed against one another, sometimes above a ground'
}, {
    name: 'Duos',
    renderer: 'duos',
    opts: {},
    description: 'Two simple shapes, and their intersections, centers, and connections'
}, {
    name: 'Sharp curtains',
    renderer: 'lines',
    opts: {
        renderStyle: 'jagged'
    },
    description: 'Curtains of jagged lines, partitioned or masked'
}, {
    name: 'Soft curtains',
    renderer: 'lines',
    opts: {
        renderStyle: 'wave'
    },
    description: 'Curtains of wavy lines, partitioned or masked'
}, {
    name: 'Mask in place',
    renderer: 'grid',
    opts: {
        style: 'masked'
    },
    description: 'Grids of masked and rotating shapes'
}, {
    name: 'Cellophane',
    renderer: 'grid',
    opts: {
        style: 'layers'
    },
    description: 'Layers of shapes'
},

// Truchet
{
    name: 'Truchet classic',
    renderer: 'truchet',
    opts: {
        style: 'auto',
        layer: false
    },
    description: 'Classic Truchet tiles with circles and triangles'
}, {
    name: 'Truchet layers',
    renderer: 'truchet',
    opts: {
        style: 'auto',
        layer: true
    },
    description: 'Classic Truchet tiles with additional layer'
},

// Truchet Curves
{
    name: 'Truchet curves',
    renderer: 'truchet-Curves',
    opts: {},
    description: 'Layered Truchet circle segments'
},

// Grille
{
    name: 'Grilles',
    renderer: 'grille',
    opts: {},
    description: 'Based on the iron grilles on Eastern European apt houses as photographed by Troy Litten in "Safety by Design"'
},

// Circles
{
    name: 'Circles',
    renderer: 'circles',
    opts: {
        style: 'rings'
    },
    description: 'Fragments of circles and their connections'
}, {
    name: 'Snakes',
    renderer: 'circles',
    opts: {
        style: 'snakes'
    },
    description: 'Fragments of circles and their connections'
}, {
    name: 'Porcelain',
    renderer: 'circles',
    opts: {
        style: 'pattern'
    },
    description: 'Patterns of overlapping rings'
},

// Mesh
{
    name: 'Mesh',
    renderer: 'mesh',
    opts: {},
    description: 'A grid of points connecting to their neighbors'
},

// Walk

{
    name: 'Walk',
    renderer: 'walk',
    opts: {},
    description: 'Survival lines, transition points, and frames'
},

// Field

{
    name: 'Field',
    renderer: 'field',
    opts: {
        lightMode: 'normal',
        fieldNoise: 'none',
        colorMode: 'single'
    },
    description: 'Flow fields overlaid with various markers'
}, {
    name: 'Complex Field',
    renderer: 'field',
    opts: {
        lightMode: 'normal'
    },
    description: 'Flow fields overlaid with various markers, with more complex colors and variation'
}, {
    name: 'Bloom Field',
    renderer: 'field',
    opts: {
        lightMode: 'bloom'
    },
    description: 'A flow field with bloom lighting'
},

// Field Shape


// Trails

{
    name: 'Trails',
    renderer: 'trails',
    opts: {
        fieldNoise: 'none'
    },
    description: 'Tracing trails through flow fields'
}, {
    name: 'Rough Trails',
    renderer: 'trails',
    opts: {
        fieldNoise: 'med'
    },
    description: 'Tracing trails with noisy wiggles'
},

// Bands

{
    name: 'Bands',
    renderer: 'bands',
    opts: {},
    description: 'Based on a design by Erik Nitsche for a Beethoven album'
},

// Fragments

{
    name: 'Fragments',
    renderer: 'fragments',
    opts: {},
    description: 'Based on painted plywood art FF24 by @plusminusdrei / plusminus3.com'
},

// Waves

{
    name: 'Waves',
    renderer: 'waves',
    opts: {},
    description: 'Layers of waves with floating shapes'
},

// Grads

{
    name: 'Grads',
    renderer: 'grads',
    opts: {},
    description: 'Bands filled with gradients'
},

// Doodle

{
    name: 'Doodle',
    renderer: 'doodle',
    opts: {},
    description: 'Scribbled shapes fill the space, based on an illustration by Amy Goodchild'
},

// Pillars

{
    name: 'Pillars',
    renderer: 'pillars',
    opts: {},
    description: 'Pillars rise and fall'
},

// Rings

{
    name: 'Rings',
    renderer: 'rings',
    opts: {},
    description: 'Based on Camille Roux\'s Rotating Systems series'
},

// Plants

{
    name: 'Plants',
    renderer: 'plants',
    opts: {},
    description: 'Branches, buds, and flowers, with varying details'
},

// Scales

{
    name: 'Scales',
    renderer: 'scales',
    opts: {
        style: 'fields'
    },
    description: 'Overlapping scales in various patterns'
},

// Sweater

{
    name: 'Sweater',
    renderer: 'sweater',
    opts: {},
    description: 'Radial checkered rings with donegal flecks'
},

// Tricycles

{
    name: 'Tricycles',
    renderer: 'tricycles',
    opts: {},
    description: 'Linked sets of triangles define linked circles over a patterned ground'
}];

exports.default = collection;

/***/ })
/******/ ]);