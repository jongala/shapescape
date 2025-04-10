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
/******/ 	return __webpack_require__(__webpack_require__.s = 54);
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

/***/ 1:
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

    ikb: ['#070033', '#00006b', '#00187c', '#002ea7', '#0b6fff', '#5c9eff', '#e9f4ff'],

    magma: ['#000004', '#3b0f70', '#8c2981', '#de4968', '#fe9f6d', '#fcfdbf'],
    inferno: ['#000004', '#420a68', '#932667', '#dd513a', '#fca50a', '#fcffa4'],
    plasma: ['#0d0887', '#6a00a8', '#b12a90', '#e16462', '#fca636', '#f0f921'],
    viridis: ['#440154', '#414487', '#2a788e', '#22a884', '#7ad151', '#fde725']
};

exports.default = palettes;

// older palettes:

var lemon_beach = exports.lemon_beach = ['#d7d7d7', '#979797', '#cabd9d', '#e4ca49', '#89bed3', '#11758e'];

/***/ }),

/***/ 10:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.field = field;

var _noiseutils = __webpack_require__(2);

var _noiseutils2 = _interopRequireDefault(_noiseutils);

var _palettes = __webpack_require__(1);

var _palettes2 = _interopRequireDefault(_palettes);

var _hexScatter = __webpack_require__(4);

var _hexScatter2 = _interopRequireDefault(_hexScatter);

var _utils = __webpack_require__(0);

var _shapes = __webpack_require__(3);

var _fieldUtils = __webpack_require__(5);

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

/***/ 2:
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

/***/ 25:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.trails = trails;

var _noiseutils = __webpack_require__(2);

var _noiseutils2 = _interopRequireDefault(_noiseutils);

var _palettes = __webpack_require__(1);

var _palettes2 = _interopRequireDefault(_palettes);

var _hexScatter = __webpack_require__(4);

var _hexScatter2 = _interopRequireDefault(_hexScatter);

var _utils = __webpack_require__(0);

var _shapes = __webpack_require__(3);

var _fieldUtils = __webpack_require__(5);

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

    var RENDERTOSVG = opts.renderTo === 'svg';

    var container = opts.container;
    var cw = container.offsetWidth;
    var ch = container.offsetHeight;
    var SCALE = Math.min(cw, ch);
    var LONG = Math.max(cw, ch);
    var SHORT = Math.min(cw, ch);
    var AREA = cw * ch;

    // Find or create canvas child
    var svg = void 0;
    if (RENDERTOSVG) {
        svg = container.querySelector('svg');
        svg.innerHTML = '';
        svg.setAttribute('width', cw);
        svg.setAttribute('height', ch);
        svg.setAttribute('viewBox', '0 0 ' + cw + ' ' + ch);
    }
    // for RENDERTOSVG
    var allpaths = '';

    var el = container.querySelector('canvas');
    var newEl = false;
    if (!el) {
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
    if (RENDERTOSVG) {
        console.log('----> SVG rendering mode');
    }

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

        // for RENDERTOSVG
        var plotpath = '';

        // Deferred drawing
        // foreach trail, render it
        if (trail.length) {
            trailStart = trail.shift();
            trailEnd = trail[trail.length - 1];

            if (RENDERTOSVG) {
                plotpath = '<path                 stroke-width="' + weight + '"                 stroke-linecap="' + STYLE + '" ';
            }

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

            if (RENDERTOSVG) {
                plotpath += ' stroke="' + ctx.strokeStyle + '" ';
                plotpath += ' d="';
                plotpath += 'M' + trailStart[0].toPrecision(4) + ',' + trailStart[1].toPrecision(4);
            }

            if (opts.isolate) {
                rctx.beginPath();
                rctx.moveTo.apply(rctx, _toConsumableArray(trailStart));
            }

            trail.forEach(function (pt, i) {
                ctx.lineTo(pt[0], pt[1]);
                opts.isolate && rctx.lineTo(pt[0], pt[1]);
                if (RENDERTOSVG) {
                    plotpath += 'L' + pt[0].toPrecision(4) + ',' + pt[1].toPrecision(4);
                }
            });
            ctx.stroke();
            opts.isolate && rctx.stroke();
            trail = [];
            if (RENDERTOSVG) {
                plotpath += '" />';
                allpaths += plotpath;
            }
        }
    });

    if (RENDERTOSVG) {
        svg.innerHTML += allpaths;
    }

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
    if (newEl && !RENDERTOSVG) {
        container.innerHTML = '';
        container.appendChild(el);
    }
}

/***/ }),

/***/ 3:
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

/***/ 4:
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

/***/ 41:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.moire = moire;

var _noiseutils = __webpack_require__(2);

var _noiseutils2 = _interopRequireDefault(_noiseutils);

var _palettes = __webpack_require__(1);

var _palettes2 = _interopRequireDefault(_palettes);

var _utils = __webpack_require__(0);

var _shapes = __webpack_require__(3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var DEFAULTS = {
    container: 'body',
    palette: _palettes2.default.plum_sauce,
    addNoise: 0.04,
    noiseInput: null,
    clear: true
};

var PI = Math.PI;
var TWOPI = 2 * PI;

var DEBUG = false;

/*

TODO:
- multi-segment paths: when we have shared endpoints, if the control points
differ then the approaches are not parallel, so we don't get gradual divergence
We need to have shared end points and at least a control point shared.
This probably means two paths with shared end points, and the control points
must be on a line with the shared endpoints, for continuity.

*/

// Main function
function moire(options) {
    var opts = Object.assign({}, DEFAULTS, options);

    var container = opts.container;
    var cw = container.offsetWidth;
    var ch = container.offsetHeight;
    var SCALE = Math.min(cw, ch);
    var LONG = Math.max(cw, ch);
    var SHORT = Math.min(cw, ch);
    var SPAN = Math.sqrt(Math.pow(LONG, 2) + Math.pow(SHORT, 2));
    var AREA = cw * ch;
    var ASPECT = LONG / SHORT;

    var center = [cw / 2, ch / 2];

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

    var note = new _utils.Note();

    // Color funcs
    // --------------------------------------

    var getSolidFill = (0, _utils.getSolidColorFunction)(opts.palette);

    // shared colors
    var bg = getSolidFill();
    //bg = randItem(['#fcf9f0','#f3f2f1','#f4f9fb','#f6f4f2']);

    // get palette of non-bg colors
    var contrastPalette = [].concat(opts.palette);
    contrastPalette.splice(opts.palette.indexOf(bg), 1);
    var getContrastColor = (0, _utils.getSolidColorFunction)(contrastPalette);

    // shared foregrounds
    var fg = getContrastColor();
    var fg2 = getContrastColor();

    // fill background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);

    // set default stroke
    ctx.strokeStyle = fg;

    function estimateCurveLength(a, b, c1, c2) {
        var direct = (0, _utils.getVector)(a, b).length;
        var hull = 0;
        hull += (0, _utils.getVector)(a, c1).length;
        hull += (0, _utils.getVector)(c1, c2).length;
        hull += (0, _utils.getVector)(c2, b).length;
        return .6 * direct + .4 * hull;
    }

    // Draw Stuff
    // --------------------------------------


    function boundaryCurve(a, b, c1, c2, pathCount, steps, l, drift) {
        /*
         - make an array of path objects, which have points and track
            their transverse offset and active/inactive status
        - start at point a, then proceed from step 1 (vs 0)
        - step finely along the path, moving forward, adding points to
            each path as you go. At each step, drift transversely.
        - the relative rate of forward and transverse movement sets
            the angle/skew of the paths
        - for each step check transverse offset against the track width
            and deactivate when it exceeds bounds
        - track drift and when we have drifted by the spacing between paths
            add another path
        - the end is a set of path objects with their points; when complete
            plot them all via canvas or stitch into svg paths
         */

        var curveLength = estimateCurveLength(a, b, c1, c2);
        var normalizedStep = curveLength / steps;
        note.add('curve length about ' + curveLength.toPrecision(4) + 'px each step about ' + normalizedStep.toPrecision(4) + 'px');

        var spacing = l / pathCount;

        //DEBUG: directly draw the ghost of the path
        if (DEBUG) {
            var _weight = ctx.lineWidth;
            ctx.globalAlpha = 0.15;
            ctx.lineWidth = l;
            ctx.beginPath();
            ctx.moveTo.apply(ctx, _toConsumableArray(a));
            ctx.bezierCurveTo.apply(ctx, _toConsumableArray(c1).concat(_toConsumableArray(c2), _toConsumableArray(b)));
            ctx.stroke();
            ctx.globalAlpha = 1;
            ctx.lineWidth = _weight;
        }

        var paths = []; // array of arrays
        for (var i = 0; i <= pathCount; i++) {
            paths.push({
                pts: [],
                offset: l * -1 / 2 + i * spacing,
                active: true
            }); // push an array for each path
        }

        var t = 0;
        var inc = 1 / steps;

        // normalize drift input so it expresses a percentage of forward step
        drift = drift || 0;
        drift = drift / 100 * normalizedStep; // percentage

        // re-express as a fraction of the spacing, so we get there
        // in even numbers of steps
        // drift * N = spacing
        // drift = spacing / N
        // N = spacing / normalizedDrift
        var N = spacing / drift;
        note.add('DRIFT: ' + N.toPrecision(3) + ' steps for drift from ' + spacing.toPrecision(3) + ' spacing, ' + drift.toPrecision(3) + ' drift');
        //drift = spacing / N;
        //drift = spacing *  3 / 5;
        var M = Math.floor(N);

        var x = a[0];
        var y = a[1];
        var _x = x; // last x
        var _y = y; // last y

        // each point on curve
        //drawCircle(ctx, x, y, 10, {stroke:'red'});

        var v = void 0; // the vector between steps

        var insert = 0; // tracks when to insert a new path

        /*
            Either 1 or -1. Will work with the vector angle to set
            direction of drift. Keeping drift positive and switching
            direction with this allows simpler bounds checking and
            insertion of new paths.
        */
        var direction = 1;

        // step thru the bezier

        var _loop = function _loop() {
            t = i * inc;

            x = Math.pow(1 - t, 3) * a[0] + 3 * Math.pow(1 - t, 2) * t * c1[0] + 3 * (1 - t) * Math.pow(t, 2) * c2[0] + Math.pow(t, 3) * b[0];
            y = Math.pow(1 - t, 3) * a[1] + 3 * Math.pow(1 - t, 2) * t * c1[1] + 3 * (1 - t) * Math.pow(t, 2) * c2[1] + Math.pow(t, 3) * b[1];

            // get vector from last point to this point
            v = (0, _utils.getVector)([_x, _y], [x, y]);

            // path x and y
            var px = 0;
            var py = 0;

            // step through paths
            paths.forEach(function (path, j) {
                /*
                    Paths can be:
                    1. out of bounds on the negative side, drifting in
                    2. in bounds, drifting out
                    3. out of bounds on positive side, never to return
                */
                if (path.active) {
                    px = x + path.offset * Math.cos(v.angle + direction * PI / 2);
                    py = y + path.offset * Math.sin(v.angle + direction * PI / 2);

                    if (path.offset > -l / 2 && path.offset < l / 2) {
                        path.pts.push([px, py]);
                    }
                }
                // only check positive bound to deactivate; if it is below
                // negative bound it is drifting in and should stay active
                if (path.offset > l / 2) {
                    path.active = false;
                }

                path.offset += drift;
            });

            var creep = Math.floor(i * drift / spacing);
            var remainder = i * drift % spacing;
            /* total drift % spacing */

            if (creep > insert) {
                insert = creep; // reset
                paths.unshift({
                    active: true,
                    //offset: minOff - spacing,//-l/2,
                    offset: -l / 2 + remainder,
                    pts: []
                });
            }

            // update point
            _x = x;
            _y = y;
        };

        for (var i = 1; i <= steps; i++) {
            _loop();
        }

        // now go back and draw all then paths
        paths.forEach(function (path) {
            if (!path.pts.length) return;
            ctx.beginPath();
            ctx.moveTo.apply(ctx, _toConsumableArray(path.pts.shift()));
            path.pts.forEach(function (p) {
                ctx.lineTo(p[0], p[1]);
            });
            ctx.stroke();
        });
    }

    // point placement for main curves

    var theta = (0, _utils.randomInRange)(0, TWOPI); // the angle of the track axis
    var alpha = (0, _utils.randomInRange)(0, TWOPI); // angle of origin offset from center
    var originOffset = SPAN * (0, _utils.randomInRange)(0, 0.1); // radius of origin offset
    var origin = [cw / 2 + originOffset * Math.cos(alpha), ch / 2 + originOffset * Math.sin(alpha)];

    DEBUG && _shapes.drawCross.apply(undefined, [ctx].concat(origin, [20, { fill: 'black' }]));

    var start = [0, 0];
    var end = [0, 0];

    var REACH = SPAN * 0.3;

    // create start and end points
    start = [origin[0] + REACH * Math.cos(theta), origin[1] + REACH * Math.sin(theta)];
    end = [origin[0] + REACH * Math.cos(theta - PI), origin[1] + REACH * Math.sin(theta - PI)];
    // different endpoints
    var theta2 = theta - PI + PI * (0, _utils.randomInRange)(-0.3, 0.3);
    var end2 = [origin[0] + REACH * Math.cos(theta2), origin[1] + REACH * Math.sin(theta2)];

    // DEBUG
    DEBUG && _shapes.drawCircle.apply(undefined, [ctx].concat(_toConsumableArray(start), [REACH / 2, { stroke: 'red' }]));
    DEBUG && _shapes.drawCircle.apply(undefined, [ctx].concat(_toConsumableArray(end), [REACH / 2, { stroke: 'green' }]));
    DEBUG && _shapes.drawCircle.apply(undefined, [ctx].concat(end2, [REACH / 2, { stroke: 'blue' }]));

    // Set control points relative to the track axis
    var a1 = theta;
    var r1 = REACH * 0.5;
    var c1 = [origin[0] + r1 * Math.cos(a1), origin[1] + r1 * Math.sin(a1)];
    var a2 = theta - PI;
    var r2 = REACH * 0.5;
    var c2 = [origin[0] + r2 * Math.cos(a2), origin[1] + r2 * Math.sin(a2)];
    var a3 = theta + PI * (0, _utils.randomInRange)(-0.3, 0.3);
    var r3 = REACH * 0.5;
    var c3 = [origin[0] + r3 * Math.cos(a3), origin[1] + r3 * Math.sin(a3)];
    var a4 = theta - PI + PI * (0, _utils.randomInRange)(-0.3, 0.3);
    var r4 = REACH * 0.5;
    var c4 = [origin[0] + r4 * Math.cos(a4), origin[1] + r4 * Math.sin(a4)];

    // Set steps, thickness and separation of lines, skew

    var steps = Math.round(REACH * (0, _utils.randomInRange)(0.15, 0.35));
    steps *= 4;
    var trackWidth = LONG * (0, _utils.randomInRange)(0.15, 0.3);
    var skew = PI * 0.3 * (0, _utils.randomInRange)(-1, 1);
    var pathCount = (0, _utils.randomInt)(15, 30);
    var weight = trackWidth / pathCount * (0, _utils.randomInRange)(0.13, 0.33);
    ctx.lineWidth = weight;
    DEBUG && console.log(Math.round(steps) + ' steps over ' + Math.round(REACH) + 'px; ' + (REACH / steps).toPrecision(3) + 'px per interval; ' + weight.toPrecision(3) + 'px lines at ' + (trackWidth / pathCount).toPrecision(3) + 'px spacing');

    // sometimes, use the same color for both
    if (Math.random() < 0.3) {
        fg2 = fg;
    }

    // DEBUG
    // fg = 'red';
    // fg2 = 'blue';

    // for drift, 100 is 45deg, and 0 is parallel with path
    var drift1 = (0, _utils.randomInRange)(10, 120);
    var drift2 = (0, _utils.randomInRange)(10, 120);
    // usually sync drift so the angles match
    if (Math.random() < .80) drift2 = drift1;

    var renderModes = [function () {
        note.add('same endpoints, different controls');
        ctx.strokeStyle = fg;
        boundaryCurve(start, end, c1, c2, pathCount, steps, trackWidth, drift1);
        ctx.strokeStyle = fg2;
        boundaryCurve(start, end, c3, c4, pathCount, steps, trackWidth, drift2);
    }, function () {
        note.add('same start, different end, different controls');
        ctx.strokeStyle = fg;
        boundaryCurve(start, end, c1, c2, pathCount, steps, trackWidth, drift1);
        ctx.strokeStyle = fg2;
        boundaryCurve(start, end2, c3, c4, pathCount, steps, trackWidth, drift2);
    }, function () {
        note.add('same start, different end, shared control');
        ctx.strokeStyle = fg;
        boundaryCurve(start, end, c1, c2, pathCount, steps, trackWidth, drift1);
        ctx.strokeStyle = fg2;
        boundaryCurve(start, end2, c1, c4, pathCount, steps, trackWidth, drift2);
    }];

    // Finally: draw
    (0, _utils.randItem)(renderModes)();

    note.log();

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

/***/ 5:
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

/***/ 54:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(7);

var _palettes = __webpack_require__(1);

var _palettes2 = _interopRequireDefault(_palettes);

var _colorbrewer = __webpack_require__(9);

var _colorbrewer2 = _interopRequireDefault(_colorbrewer);

var _field = __webpack_require__(10);

var _trails = __webpack_require__(25);

var _moire = __webpack_require__(41);

var _utils = __webpack_require__(0);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Renderers
var RENDERERS = {
    field: _field.field,
    trails: _trails.trails,
    moire: _moire.moire
};
// utils

var initRenderer = 'trails';

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

// select a renderer to use, update the window hash, and draw it
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
    container: document.querySelector('#renderNode'),
    clear: true,
    renderTo: 'svg'
};

var renderNode = document.getElementById('renderNode');

// @fast skips re-rendering the canvas in place as an img,
// which makes for easy saving but slows down rendering
function loadOpts(opts, fast) {
    var img = renderNode.querySelector('img');
    img && img.remove();
    visualOpts = Object.assign(visualOpts, opts);
    // render art
    Renderer(visualOpts);
    // set up main download link
    var a = document.getElementById('downloadExample');
    a.onclick = function () {
        return doDownload(a, document.querySelector('#renderNode canvas'));
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

    var canvas = document.querySelector('#renderNode canvas');
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
    renderNode.className = renderNode.className.replace(/isHidden/g, '');
}

function hideMain() {
    if (renderNode.className.indexOf('isHidden') === -1) {
        renderNode.className += ' isHidden ';
    }
}

function setSize(className) {
    renderNode.className = className;
    drawNew();
}
window.setSize = setSize;

document.querySelector('#saved').addEventListener('click', function (e) {
    if (e.target.nodeName === 'IMG') {
        // HACK: this relies on .downloader > img DOM structure
        previewImage(e.target.parentNode.cloneNode(true));
    }
});

renderNode.addEventListener('click', function (e) {
    renderCanvasToImg(renderNode.querySelector('canvas'), document.querySelector('#saved'));
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

/***/ 7:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 9:
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