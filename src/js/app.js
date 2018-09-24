import '../css/style.css';

import noiseUtils from './noiseutils';
import colorbrewer from './colorbrewer';
import { waterline } from './waterline';
import shapestack from './shapestack';
import shapescape from './shapescape';
import lines from './lines';
import { setAttrs } from './utils';

// Renderers
const RENDERERS = {
    waterline: waterline,
    shapestack: shapestack,
    shapescape: shapescape,
    lines: lines
};
let initRenderer = 'waterline';

var rendererName;
var Renderer;
var activeButton;

function showRenderPicker (renderers, el) {
    let button;
    let makeHandler = (r, button) => {
        return (e) => {
            setRenderer(r, button)
        }
    };
    for (var r in renderers) {
        button = document.createElement('button');
        setAttrs(button, {
            'data-renderer': r,
            'class': 'renderPicker'
        })
        button.innerHTML = r.slice(0,1).toUpperCase() + r.slice(1);
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
    noiseInput: noiseUtils.createNoiseCanvas(0.04, 200)
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

document.addEventListener('keydown', function(e) {
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
    anchor.download =
        rendererName +
        '-' +
        new Date()
            .toISOString()
            .replace(/[-:]/g, '')
            .replace('T', '-')
            .replace(/\.\w+/, '');
    anchor.target = '_blank';
    return false;
}

function renderCanvasToImg(canvas, container) {
    var pixels = canvas.toDataURL('image/png');

    var image = document.createElement('img');
    image.src = pixels;

    var anchor = document.createElement('a');
    anchor.innerHTML = '↓';
    anchor.onclick = function() {
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
        requestAnimationFrame(function() {
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
if (colorbrewer) {
    var cbnames = Object.keys(colorbrewer);
    cbnames.forEach(function(pname) {
        palettes[pname] = colorbrewer[pname][6];
    });
}

var selectEl = document.querySelector('#paletteSelector');
var pnames = Object.keys(palettes);
pnames.forEach(function(pname) {
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
custom.addEventListener('keypress', function(e) {
    var hexPattern = /#?[0-9a-f]{3,6}/;
    var palette = e.target.value.split(',');
    palette = palette.map(s => {
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
    preview.onclick = function(e) {
        // on click, hide if we click outside the image
        if (e.target.id === 'preview') {
            removePreview();
        }
    };
    // append the elements to display
    document.querySelector('body').appendChild(preview);
    // we must re-bind the click behavior of the download link,
    // which does not come with the cloned element
    let anchor = document.querySelector('#preview .downloader a');
    let image =  document.querySelector('#preview .downloader img');
    anchor.onclick = function(){doDownload(anchor, image.src)}
}

function removePreview() {
    var p = document.querySelector('#preview');
    p && p.remove();
}

document.querySelector('#saved').addEventListener('click', function(e) {
    if (e.target.nodeName === 'IMG') {
        // HACK: this relies on .downloader > img DOM structure
        previewImage(e.target.parentNode.cloneNode(true));
    }
});

exampleNode.addEventListener('click', function(e) {
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
