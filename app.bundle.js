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
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
function addNoiseToCanvas(canvas, opacity) {
    var ctx = canvas.getContext('2d'),
        x,
        y,
        noise,
        opacity = opacity || 0.2;

    var w = canvas.width;
    var h = canvas.height;

    for (x = 0; x < w; x++) {
        for (y = 0; y < h; y++) {
            noise = Math.floor(Math.random() * 255);

            ctx.fillStyle = 'rgba(' + noise + ',' + noise + ',' + noise + ',' + opacity + ')';
            ctx.fillRect(x, y, 1, 1);
        }
    }
}

function addNoiseFromPattern(canvas, opacity, tileSize, useOverlay) {
    // create an offscreen canvas where we will generate
    // noise to use as a pattern
    var noiseCanvas = createNoiseCanvas(opacity, tileSize);
    applyNoiseCanvas(canvas, noiseCanvas, useOverlay);

    return {
        noiseCanvas: noiseCanvas,
        canvas: canvas
    };
}

function createNoiseCanvas(opacity, tileSize) {
    // create an offscreen canvas where we will generate
    // noise to use as a pattern
    tileSize = tileSize || 100;
    var noise = document.createElement('canvas');
    noise.width = tileSize;
    noise.height = tileSize;
    var noiseCtx = noise.getContext('2d');

    // add noise to the offscreen canvas
    addNoiseToCanvas(noise, opacity);

    return noise;
}

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
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.randItem = randItem;
exports.randomInRange = randomInRange;
exports.setAttrs = setAttrs;
exports.resetTransform = resetTransform;
exports.rotateCanvas = rotateCanvas;
// random Array member
function randItem(arr) {
    return arr[Math.floor(arr.length * Math.random())];
}

function randomInRange(min, max) {
    return min + (max - min) * Math.random();
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

/***/ }),
/* 2 */
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
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(4);

var _noiseutils = __webpack_require__(0);

var _noiseutils2 = _interopRequireDefault(_noiseutils);

var _colorbrewer = __webpack_require__(5);

var _colorbrewer2 = _interopRequireDefault(_colorbrewer);

var _waterline = __webpack_require__(6);

var _waterline2 = _interopRequireDefault(_waterline);

var _shapestack = __webpack_require__(7);

var _shapestack2 = _interopRequireDefault(_shapestack);

var _shapescape = __webpack_require__(8);

var _shapescape2 = _interopRequireDefault(_shapescape);

var _lines = __webpack_require__(9);

var _lines2 = _interopRequireDefault(_lines);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Renderers
var RENDERERS = {
    Waterline: _waterline2.default,
    Shapestack: _shapestack2.default,
    Shapescape: _shapescape2.default,
    Lines: _lines2.default
};
var initRenderer = 'Waterline';

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
        button.innerHTML = r;
        button['data-renderer'] = r;
        button.className = 'renderPicker';
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
    loadOpts();
}
window.setRenderer = setRenderer;

// GUI controlled opts
var visualOpts = {
    container: document.querySelector('#example'),
    clear: true,
    dust: true,
    skew: 1,
    noiseInput: _noiseutils2.default.createNoiseCanvas(0.04, 200)
};

var exampleNode = document.getElementById('example');

// @fast skips re-rendering the canvas in place as an img,
// which makes for easy saving but slows down rendering
function loadOpts(opts, fast) {
    var img = exampleNode.querySelector('img');
    img && img.remove();
    visualOpts = Object.assign(visualOpts, opts);
    Renderer(visualOpts);
}

// Handlers for redraw, batching, and manual saving

document.addEventListener('keydown', function (e) {
    var kode = e.which || e.keyCode;
    if (kode === 32) {
        // space
        removePreview();
        requestAnimationFrame(loadOpts);
        return false;
    } else if (kode === 27) {
        // ESC
        removePreview();
    }
});

function doDownload(anchor, pixels) {
    anchor.href = pixels;
    anchor.download = rendererName + '-' + new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').replace(/\.\w+/, '');
    anchor.target = '_blank';
    return false;
}

function renderCanvasToImg(canvas, container) {
    var pixels = canvas.toDataURL('image/png');

    var image = document.createElement('img');
    image.src = pixels;

    var anchor = document.createElement('a');
    anchor.innerHTML = '↓';
    anchor.onclick = function () {
        doDownload(anchor, image.src);
    };

    var wrapper = document.createElement('div');
    wrapper.className = 'downloader';

    wrapper.appendChild(image);
    wrapper.appendChild(anchor);

    container.appendChild(wrapper);
}

function createBatch(opts, N) {
    N = N || 9;
    var canvas = document.querySelector('#example canvas');
    var container = document.querySelector('#saved');
    container.innerHTML = '';
    for (var i = 0; i < N; i++) {
        requestAnimationFrame(function () {
            loadOpts(opts, true);
            renderCanvasToImg(canvas, container);
        });
    }
}
window.createBatch = createBatch;

// Option sets:

var palettes = {
    default: null,
    high_contrast: ['#111111', '#444444', '#dddddd', '#f9f9f9'],
    low_contrast: ['#333333', '#666666', '#999999', '#cccccc', '#f9f9f9'],
    black_white_red: ['#111111', '#444444', '#dddddd', '#ffffff', '#880000', '#dd0000'],
    lemon_beach: ['#d7d7d7', '#979797', '#cabd9d', '#e4ca49', '#89bed3', '#11758e'],
    magma: ['#000004', '#3b0f70', '#8c2981', '#de4968', '#fe9f6d', '#fcfdbf'],
    inferno: ['#000004', '#420a68', '#932667', '#dd513a', '#fca50a', '#fcffa4'],
    plasma: ['#0d0887', '#6a00a8', '#b12a90', '#e16462', '#fca636', '#f0f921'],
    viridis: ['#440154', '#414487', '#2a788e', '#22a884', '#7ad151', '#fde725']
};

// create a batch from a colorbrewer name
function setPalette(pname) {
    if (!palettes[pname]) {
        delete visualOpts.palette;
    } else {
        visualOpts.palette = palettes[pname];
    }
    return loadOpts({});
}
window.setPalette = setPalette;

// populate the selector for colorbrewer palettes
if (_colorbrewer2.default) {
    var cbnames = Object.keys(_colorbrewer2.default);
    cbnames.forEach(function (pname) {
        palettes[pname] = _colorbrewer2.default[pname][6];
    });
}

var selectEl = document.querySelector('#paletteSelector');
var pnames = Object.keys(palettes);
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
        s = s.trim();
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
        doDownload(anchor, image.src);
    };
}

function removePreview() {
    var p = document.querySelector('#preview');
    p && p.remove();
}

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
/* 4 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 5 */
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
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _noiseutils = __webpack_require__(0);

var _noiseutils2 = _interopRequireDefault(_noiseutils);

var _utils = __webpack_require__(1);

var _shapes = __webpack_require__(2);

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
    if (skew === undefined) {
        skew = 0;
    }
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
    ctx.moveTo(0, y1);
    ctx.bezierCurveTo(w / 3, c1, 2 * w / 3, c2, w, y2);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.clip();

    renderFunc(ctx, w, h, y1, y2);

    ctx.closePath();
    ctx.restore();
}

// draw it!
function waterline(options) {
    var defaults = {
        container: 'body',
        palette: ['#222222', '#fae1f6', '#b966d3', '#8ED2EE', '#362599', '#fff9de', '#FFC874'],
        drawShadows: true,
        addNoise: 0.04,
        noiseInput: null,
        dust: false,
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
        (0, _utils.setAttrs)(el, {
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

    // BEGIN RENDERING

    if (opts.drawShadows) {
        addShadow(ctx, w, h);
    }

    // draw background/sky
    ctx.fillStyle = getFill(ctx, opts.palette, 0, 0, h, opts.skew);
    ctx.fillRect(0, 0, w, h);

    // shuffle shape list and pick a shape
    shapes.sort(function (a, b) {
        return (0, _utils.randomInRange)(-1, 1);
    });
    renderer = renderMap[shapes[0]];

    // pick centerpoint for shape
    var shapeX = w / 2;
    var shapeY = h * (0, _utils.randomInRange)(0.4, 0.6);
    var shapeSize = Math.min(w, h) * (0, _utils.randomInRange)(0.25, 0.4);
    if (shapes[0] === 'rect') {
        // bump up size of rectangles
        shapeSize *= 1.2;
    }
    var shapeMagnified = shapeSize + Math.min(w, h) / (0, _utils.randomInRange)(50, 80);
    // Rotate shape. Not all renderers will use this.
    var shapeAngle = (0, _utils.randomInRange)(-Math.PI / 12, Math.PI / 12);

    // Create a fill we will reuse for both renderings of the shape
    var shapeFill = getFill(ctx, opts.palette, shapeX, shapeY, shapeSize, 0);

    // Prepare main waterlines
    var wl; // left waterline
    var wc1; // control point
    var wc2; // control point
    var wr; // right waterline
    var wtop; // the min of the waterline heights
    var wfill; // main waterline fill
    var bgOffset; // offset of background waterline

    // Set waterline params for background renderin, and common fill
    wl = (0, _utils.randomInRange)(0.49, 0.51) * h;
    wc1 = (0, _utils.randomInRange)(0.48, 0.52) * h;
    wc2 = (0, _utils.randomInRange)(0.48, 0.52) * h;
    wr = (0, _utils.randomInRange)(0.49, 0.51) * h;
    wtop = Math.min(wl, wr);
    wfill = getFill(ctx, opts.palette, 0, wtop, h - wtop, 0);

    // Draw background waterline at low opacity, slightly offset upward
    ctx.globalAlpha = (0, _utils.randomInRange)(0.2, 0.6);
    bgOffset = h / (0, _utils.randomInRange)(40, 100);
    drawWave(ctx, wr - bgOffset, wc2 - bgOffset, wc1 - bgOffset, wl - bgOffset, w, h, Object.assign({ fill: wfill }, opts));
    ctx.globalAlpha = 1;

    // Draw the shape above waterline
    renderer(ctx, shapeX, shapeY, shapeSize, {
        fill: shapeFill,
        angle: shapeAngle
    });

    // Draw main foreground waterline. We will reuse these params
    // for clipping the underwater elements
    wl = (0, _utils.randomInRange)(0.47, 0.52) * h;
    wc1 = (0, _utils.randomInRange)(0.45, 0.55) * h;
    wc2 = (0, _utils.randomInRange)(0.45, 0.55) * h;
    wr = (0, _utils.randomInRange)(0.47, 0.52) * h;
    wtop = Math.min(wl, wr);
    drawWave(ctx, wl, wc1, wc2, wr, w, h, Object.assign({
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
        ctx.globalAlpha = (0, _utils.randomInRange)(0.2, 1);
        addShadow(ctx, w, h);
        renderer(ctx, shapeX, shapeY, shapeMagnified, {
            fill: shapeFill,
            angle: shapeAngle
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
        var edgeThickness = h * 0.005 * Math.random() + 1.5;
        var edgeFill = ctx.createLinearGradient(0, 0, w, 0);
        edgeFill.addColorStop(0, '#808080');
        edgeFill.addColorStop((0, _utils.randomInRange)(0, 0.5), '#fff');
        edgeFill.addColorStop((0, _utils.randomInRange)(0.5, 1), '#fff');
        edgeFill.addColorStop(1, '#808080');

        ctx.fillStyle = edgeFill;
        ctx.globalCompositeOperation = 'overlay';
        ctx.globalAlpha = (0, _utils.randomInRange)(0.1, 0.75);

        ctx.beginPath();
        ctx.moveTo(0, wl);
        ctx.bezierCurveTo(w / 3, wc1 - 1, 2 * w / 3, wc2 - 1, w, wr);
        ctx.lineTo(w, wr + 3);
        ctx.bezierCurveTo(2 * w / 3, wc2 + edgeThickness, w / 3, wc1 + edgeThickness, 0, wl + 2);
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
    clipInWaterline(ctx, wl, wc1, wc2, wr, w, h, underwater);

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

// export
exports.default = waterline;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _noiseutils = __webpack_require__(0);

var _noiseutils2 = _interopRequireDefault(_noiseutils);

var _utils = __webpack_require__(1);

var _shapes = __webpack_require__(2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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

var getGradientFunction = function getGradientFunction(palette) {
    var p = [].concat(palette);
    return function (ctx, w, h) {
        var bias = Math.random() - 0.5;
        var coords = [];
        if (bias) {
            coords = [(0, _utils.randomInRange)(0, w * 0.25), 0, (0, _utils.randomInRange)(w * 0.75, w), h];
        } else {
            coords = [0, (0, _utils.randomInRange)(0, h * 0.5), w, (0, _utils.randomInRange)(h * 0.75, h)];
        }
        var grad = ctx.createLinearGradient.apply(ctx, _toConsumableArray(coords));
        grad.addColorStop(0, (0, _utils.randItem)(p));
        grad.addColorStop(1, (0, _utils.randItem)(p));
        return grad;
    };
};

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
        (0, _utils.setAttrs)(el, {
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

    // rendering styles
    var fancy = opts.fancy;
    var fillStyle = opts.fillStyle;
    var drawShadows = opts.drawShadows;

    // Fancy directive: forces fillStyle and drawShadows options
    // Default behavior is to randomly choose fancy
    if (fancy === null || fancy === undefined) {
        fancy = Math.random() > 0.5;
        if (fancy) {
            drawShadows = true;
            fillStyle = 'gradient';
        } else {
            drawShadows = false;
            fillStyle = 'solid';
        }
    }

    // Set up color fill style
    // map of color function generators
    var colorFuncs = {
        'gradient': getGradientFunction,
        'solid': getSolidColorFunction
        // if no valid fill style is passed, assign one randomly
    };if (!['gradient', 'solid'].includes(fillStyle)) {
        fillStyle = Math.random() > 0.5 ? 'gradient' : 'solid';
    }
    // generate the fill function based on the palette
    opts.getColor = colorFuncs[fillStyle](opts.palette);

    // BEGIN RENDERING

    // draw background/sky
    var sky = Math.round((0, _utils.randomInRange)(204, 245)).toString(16);
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
        tilt = (0, _utils.randomInRange)(0, 6.28);
    }

    // pick depth of stack
    var stackSize = (0, _utils.randomInRange)(1, 4);
    var heightA = h * (0, _utils.randomInRange)(0.4, 0.7);
    var heightB = heightA * (0, _utils.randomInRange)(0.95, 1.05);

    var stackA = [];
    var stackB = [];

    var levelA = h - heightA;
    var levelB = h - heightB;

    var block;

    var i = 1;
    var blockH;
    while (i++ <= stackSize) {
        blockH = heightA / stackSize;
        block = [levelA, levelA + (0, _utils.randomInRange)(0.25 * blockH, blockH)];
        levelA = block[1];
        stackA.push(block);

        blockH = heightB / stackSize;
        block = [levelB, levelB + (0, _utils.randomInRange)(0.25 * blockH, blockH)];
        levelB = block[1];
        stackB.push(block);
    }
    stackA.push([levelA, h * 1.5]);
    stackB.push([levelB, h * 1.5]);

    var gray;
    function drawStack(stack, x, palette) {
        stack.forEach(function (y, i) {
            if (palette === 'gray') {
                gray = (0, _utils.randomInRange)(0.55, 0.85);
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

    var nestDefaults = {
        x: 0,
        y: 0,
        minSize: 200,
        maxSize: 400,
        steps: 4,
        jitter: 0.1,
        angle: 0
    };
    var nestRenderDefaults = {
        palette: ['#000', '#333', '#666', '#999'],
        alpha: 1,
        blendMode: 'normal'
    };
    var defineNest = function defineNest(o) {
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
    };
    var drawNest = function drawNest(ctx, nest, palette, o) {
        o = Object.assign(nestRenderDefaults, o);
        (0, _utils.resetTransform)(ctx);
        var getColor = colorFuncs[fillStyle](palette);
        var ctxBlend = ctx.globalCompositeOperation;
        var ctxAlpha = ctx.globalAlpha;

        ctx.globalCompositeOperation = o.blendMode;
        ctx.globalAlpha = o.alpha;

        nest.forEach(function (n) {
            nestRenderer(ctx, n.x, n.y, n.size, {
                fill: getColor(ctx, n.size, n.size),
                angle: n.angle
            });
        });

        ctx.globalCompositeOperation = ctxBlend;
        ctx.globalAlpha = ctxAlpha;

        (0, _utils.resetTransform)(ctx);
    };

    var nestOpts = {
        x: (0, _utils.randomInRange)(w * 0.1, w * 0.9),
        y: (0, _utils.randomInRange)(w * 0.1, w * 0.9),
        maxSize: scale * (0, _utils.randomInRange)(1, 2),
        minSize: scale * (0, _utils.randomInRange)(0.25, 0.75),
        steps: Math.floor((0, _utils.randomInRange)(3, 7)),
        angle: (0, _utils.randomInRange)(0, Math.PI / 4)
    };

    var nest = defineNest(nestOpts);

    if (willDrawStack) {
        // rotate the canvas before drawing stacks
        (0, _utils.rotateCanvas)(ctx, w, h, tilt);

        // Draw stacks with gray
        drawStack(stackA, -w / 4, 'gray');
        drawStack(stackB, w / 2, 'gray');

        // un-rotate to draw main shape
        (0, _utils.resetTransform)(ctx);
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
        getRandomRenderer()(ctx, w / 4, h / 4, scale * (0, _utils.randomInRange)(0.2, 0.25), { fill: '#ffffff', continue: true });
        (0, _utils.resetTransform)(ctx);
        getRandomRenderer()(ctx, w / 4 * 3, h / 4, scale * (0, _utils.randomInRange)(0.2, 0.25), { fill: '#ffffff', continue: true });
        (0, _utils.resetTransform)(ctx);
        getRandomRenderer()(ctx, w / 4, h / 4 * 3, scale * (0, _utils.randomInRange)(0.2, 0.25), { fill: '#ffffff', continue: true });
        (0, _utils.resetTransform)(ctx);
        getRandomRenderer()(ctx, w / 4 * 3, h / 4 * 3, scale * (0, _utils.randomInRange)(0.2, 0.25), { fill: '#ffffff', continue: true });
        (0, _utils.resetTransform)(ctx);
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
        (0, _utils.rotateCanvas)(ctx, w, h, tilt);
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
        var m = (nestOpts.y - maskY) / (nestOpts.x - maskX);
        var theta = Math.atan(m);
        if (nestOpts.x > maskX) {
            theta += Math.PI;
        }
        // oughtta be enough
        var R = w + h;

        ctx.beginPath();
        ctx.moveTo(nestOpts.x, nestOpts.y);
        ctx.lineTo(nestOpts.x + R * Math.cos(theta), nestOpts.y + R * Math.sin(theta));
        ctx.closePath();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.33)';
        ctx.stroke();
    }

    // unclip
    ctx.restore();

    // reset transform
    (0, _utils.resetTransform)(ctx);

    // add a pin shadow if it's an open shape or nest
    if (!drawShadows && (nest || ['box', 'ring'].indexOf(shape) >= 0)) {
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

// export
exports.default = shapestack;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _noiseutils = __webpack_require__(0);

var _noiseutils2 = _interopRequireDefault(_noiseutils);

var _utils = __webpack_require__(1);

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
        palette: ['#222222', '#fae1f6', '#b966d3', '#8ED2EE', '#362599', '#fff9de', '#FFC874'],
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
        (0, _utils.setAttrs)(el, {
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

// export
//window.shapescape = shapescape;
exports.default = shapescape;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _noiseutils = __webpack_require__(0);

var _noiseutils2 = _interopRequireDefault(_noiseutils);

var _utils = __webpack_require__(1);

var _shapes = __webpack_require__(2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULTS = {
    container: 'body',
    palette: ['#d7d7d7', '#979797', '#cabd9d', '#e4ca49', '#89bed3', '#11758e'],
    bg: '#fff',
    drawShadows: false,
    addNoise: 0.04,
    noiseInput: null,
    dust: false,
    skew: 1, // normalized skew
    clear: true

    // draw it!
};function lines(options) {
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
        (0, _utils.setAttrs)(el, {
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

    if (opts.bg === 'auto') {
        ctx.fillStyle = (0, _utils.randItem)(opts.palette);
    } else {
        ctx.fillStyle = opts.bg;
    }
    ctx.fillRect(0, 0, w, h);

    var stops = Math.ceil((0, _utils.randomInRange)(2, 30));
    var lines = Math.floor((0, _utils.randomInRange)(10, 40));

    var stopInterval = w / (stops - 1);
    var lineInterval = h / lines;

    ctx.translate(-stopInterval / 2, -lineInterval / 2);

    console.log(lines + ' (' + lineInterval + 'px) X ' + stops + ' (' + stopInterval + 'px)');

    // Create point transform (x, y) to create progressive transform from
    // line to line
    // Create color transform (x, y) to blend segments

    var pts = [];
    // create array of zeroes
    for (var i = 0; i <= stops; i++) {
        pts.push([i * stopInterval, 0]);
    }
    var pt = void 0;

    ctx.lineWidth = lineInterval * (0, _utils.randomInRange)(0.4, 0.5);
    ctx.strokeStyle = (0, _utils.randItem)(opts.palette);

    // component pt transform func
    var _xScale = (0, _utils.randomInRange)(1.8, 2.2) / (lines * stops); // a small number
    var xDrift = function xDrift(x, line, stop) {
        return x *= (0, _utils.randomInRange)(1 - _xScale, 1 + _xScale);
    };

    // component pt transform func
    var _yScale = (0, _utils.randomInRange)(0.08, 0.12) + (0, _utils.randomInRange)(17, 23) / (lines * stops);
    var yDrift = function yDrift(y, line, stop) {
        return y + (0, _utils.randomInRange)(-_yScale * lineInterval, _yScale * lineInterval);
    };

    // sample pt transform func
    var drift = function drift(pt, line, stop) {
        return [xDrift(pt[0], line, stop), yDrift(pt[1], line, stop)];
    };

    // assign pt transform func
    var ptTransform = drift;

    // pick a line transform function
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

    // Overlay a shape
    (0, _utils.resetTransform)(ctx);
    var renderMap = {
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
    var renderer = getRandomRenderer();
    ctx.globalCompositeOperation = 'color';
    renderer(ctx, w / 2, h / 2, Math.min(w, h) * (0, _utils.randomInRange)(0.3, 0.45), { fill: (0, _utils.randItem)(opts.palette) });
    ctx.globalCompositeOperation = 'normal';

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

// export
exports.default = lines;

/***/ })
/******/ ]);