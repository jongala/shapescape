import '../css/style.css';

import noiseUtils from './noiseutils';
import palettes from './palettes';
import colorbrewer from './colorbrewer';
import { waterline, drawWaterline } from './waterline';
import { shapestack } from './shapestack';
import { shapescape } from './shapescape';
import { duos } from './duos';
import { lines } from './lines';
import { waves } from './waves';
import { grid } from './grid';
import { truchet } from './truchet';
import { grille } from './grille';
import { circles } from './circles';
import { mesh } from './mesh';
import { walk } from './walk';
import { bands } from './bands';
import { field } from './field';
import { trails } from './trails';
import { fragments } from './fragments';
import { clouds } from './clouds';
import { grads } from './grads';
import { doodle } from './doodle';
import { pillars } from './pillars';
// utils
import { setAttrs } from './utils';
// postprocess
import roughen from './roughen';
import dither from './postprocess/dither';

// Renderers
const RENDERERS = {
    waterline: waterline,
    shapestack: shapestack,
    shapescape: shapescape,
    duos: duos,
    lines: lines,
    grid: grid,
    truchet: truchet,
    grille: grille,
    circles: circles,
    mesh: mesh,
    walk: walk,
    field: field,
    trails: trails,
    bands: bands,
    fragments: fragments,
    waves: waves,
    grads: grads,
    doodle: doodle,
    pillars: pillars,
    //clouds: clouds
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
    drawNew();
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
    roughen(canvas, 3);
}
window.roughenMain = roughenMain;



//--------------------------------------

function ditherToLuminosity(){
    var canvas = document.querySelector('#example canvas');
    let ctx = canvas.getContext('2d');
    let idata = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let dithered = dither.ditherLuminosity(idata, 'floydsteinberg');

    // apply the dithered data back
    ctx.putImageData(dithered, 0, 0);
}
window.ditherToLuminosity = ditherToLuminosity;


//--------------------------------------



function ditherToPalette(){
    var canvas = document.querySelector('#example canvas');

    // Create a basic palette of black and white if no palette exists
    let basePalette = ['#000000','#ffffff'];
    let renderPalette = [].concat(basePalette);
    if (visualOpts.palette && visualOpts.palette.length) {
        // If we have a palette, add it to the black and white, and add gray
        // for marks used in some renderers that aren't palette driven
        renderPalette = renderPalette.concat(visualOpts.palette).concat(['#7d7d7d']);
    }
    // draw directly to the active canvas with dithered data.
    let ctx = canvas.getContext('2d');
    let idata = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let dithered = dither.ditherPalette(idata, renderPalette, 'atkinson');


    // apply the dithered data back
    ctx.putImageData(dithered, 0, 0);

}

window.ditherToPalette = ditherToPalette;



/* ======================================
END POSTPROCESS
====================================== */



// GUI controlled opts
var visualOpts = {
    container: document.querySelector('#example'),
    clear: true,
    dust: true,
    skew: 1,
    addNoise: 0.04,
    noiseInput: noiseUtils.createNoiseCanvas(0.04, 200)
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
    let a = document.getElementById('downloadExample');
    a.onclick = ()=>{return doDownload(a, document.querySelector('#example canvas'))};
}

// Handlers for redraw, batching, and manual saving

function drawNew() {
    removePreview();
    requestAnimationFrame(loadOpts);
    showMain();
}
window.drawNew = drawNew;

document.addEventListener('keydown', function(e) {
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
    function filename () {
        const f = rendererName +
            '-' +
            new Date()
                .toISOString()
                .replace(/[-:]/g, '')
                .replace('T', '-')
                .replace(/\.\w+/, '');
        return f;
    }

    anchor.download = filename();

    if (el.nodeName === 'IMG') {
        anchor.href = el.src;
        anchor.onclick = () => {
            anchor.onclick = ()=>{};
            setTimeout(() => {
                window.URL.revokeObjectURL(blob);
                anchor.removeAttribute('href');
            });
        };
        anchor.click();
    } else if (el.nodeName === 'CANVAS') {
        el.toBlob((blob)=>{
            // from https://github.com/mattdesl/canvas-sketch/blob/master/lib/save.js
            anchor.href = window.URL.createObjectURL(blob);
            anchor.onclick = () => {
                anchor.onclick = ()=>{};
                setTimeout(() => {
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
    canvas.toBlob((blob)=>{
        var image = document.createElement('img');
        image.src = window.URL.createObjectURL(blob);

        var anchor = document.createElement('a');
        anchor.innerHTML = '↓';
        anchor.target = '_blank';
        anchor.onclick = function() {
            return doDownload(anchor, image);
        };

        var wrapper = document.createElement('div');
        wrapper.className = 'downloader';

        wrapper.appendChild(image);
        wrapper.appendChild(anchor);

        container.appendChild(wrapper);
    },'image/png');
}

// Create @N new renderings drawn with @opts inputs
// Then render to images with click-to-download handlers
// Append them to div#saved
function createBatch(opts, N) {
    N = N || 9;

    hideMain()

    var canvas = document.querySelector('#example canvas');
    var container = document.querySelector('#saved');

    // render the batch
    container.innerHTML = '';
    for (var i = 0; i < N; i++) {
        requestAnimationFrame(function() {
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

var appPalettes = Object.assign({default: null}, palettes);

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
if (colorbrewer) {
    var cbnames = Object.keys(colorbrewer);
    cbnames.forEach(function(pname) {
        appPalettes[pname] = colorbrewer[pname][6];
    });
}

var selectEl = document.querySelector('#paletteSelector');
var pnames = Object.keys(appPalettes);
pnames.forEach(function(pname) {
    var option = document.createElement('option');
    option.value = pname;
    option.innerHTML = pname;
    if(pname === "default") {
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
custom.addEventListener('keypress', function(e) {
    var hexPattern = /#?[0-9a-f]{3,6}/;
    var palette = e.target.value.split(',');
    palette = palette.map(s => {
        s = s.trim().replace(/['"']/g,'');
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
    anchor.onclick = function(){return doDownload(anchor, image)};
}

function removePreview() {
    var p = document.querySelector('#preview');
    p && p.remove();
}

function showMain() {
    exampleNode.className = exampleNode.className.replace(/isHidden/g,'');
}

function hideMain() {
    if (exampleNode.className.indexOf('isHidden') === -1) {
        exampleNode.className += ' isHidden ';
    }
}

function setSize(className) {
    exampleNode.className = className;
    drawNew();
}
window.setSize = setSize;

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
