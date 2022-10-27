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
import roughen from './roughen';
import { setAttrs } from './utils';

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
// DITHERING
//======================================



function flume(idata, i) {
    return Math.sqrt(
            (idata[i] * 0.299) * (idata[i] * 0.299) + 
            (idata[i + 1] * 0.587) * (idata[i + 1] * 0.587) + 
            (idata[i + 2] * 0.114) * (idata[i + 2] * 0.114)
        );
}


// TODO: I think I rewrote these from tutorials but double check these
// functions for licensing.

function atkinson(image) {
    let width = image.width;
    let luminance = new Uint8ClampedArray(image.width * image.height);

    for (let l = 0, i = 0; i < image.data.length; l++, i += 4) {
        //luminance[l] = (image.data[i] * 0.299) + (image.data[i + 1] * 0.587) + (image.data[i + 2] * 0.114);
        luminance[l] = flume(image.data, i);
    }

    for (let l = 0, i = 0; i < image.data.length; l++, i += 4) {
        let value = luminance[l] < 129 ? 0 : 255;
        let error = Math.floor((luminance[l] - value) / 8);
        image.data.fill(value, i, i + 3);

        luminance[l + 1] += error;
        luminance[l + 2] += error;
        luminance[l + width - 1] += error;
        luminance[l + width] += error;
        luminance[l + width + 1] += error;
        luminance[l + 2 * width] += error;
    }

    return image;
}

function floydsteinberg(image) {
    /*
        X   7
    3   5   1

      (1/16)
     */
    let width = image.width;
    let luminance = new Uint8ClampedArray(image.width * image.height);

    for (let l = 0, i = 0; i < image.data.length; l++, i += 4) {
        //luminance[l] = (image.data[i] * 0.299) + (image.data[i + 1] * 0.587) + (image.data[i + 2] * 0.114);
        luminance[l] = flume(image.data, i);
    }

    for (let l = 0, i = 0; i < image.data.length; l++, i += 4) {
        let value = luminance[l] < 129 ? 0 : 255;
        let error = Math.floor((luminance[l] - value) / 16);
        image.data.fill(value, i, i + 3);

        luminance[l + 1] += error * 7;
        luminance[l + width - 1] += error * 3;
        luminance[l + width] += error * 5;
        luminance[l + width + 1] += error * 1;
    }

    return image;
}


function burkes(image) {
    /*
            X   8   4 
    2   4   8   4   2

          (1/32)
     */
    let width = image.width;
    let luminance = new Uint8ClampedArray(image.width * image.height);

    for (let l = 0, i = 0; i < image.data.length; l++, i += 4) {
        //luminance[l] = (image.data[i] * 0.299) + (image.data[i + 1] * 0.587) + (image.data[i + 2] * 0.114);
        luminance[l] = flume(image.data, i);
    }

    for (let l = 0, i = 0; i < image.data.length; l++, i += 4) {
        let value = luminance[l] < 129 ? 0 : 255;
        let error = Math.floor((luminance[l] - value) / 32);
        image.data.fill(value, i, i + 3);

        luminance[l + 1] += error * 8;
        luminance[l + 2] += error * 4;

        luminance[l + width - 2] += error * 2;
        luminance[l + width - 1] += error * 4;
        luminance[l + width] += error * 8;
        luminance[l + width + 1] += error * 4;
        luminance[l + width + 2] += error * 2;
    }

    return image;
}

function sierra3(image) {
    /*
             X   5   3
     2   4   5   4   2
         2   3   2
           (1/32)
     */
    let width = image.width;
    let luminance = new Uint8ClampedArray(image.width * image.height);

    for (let l = 0, i = 0; i < image.data.length; l++, i += 4) {
        //luminance[l] = (image.data[i] * 0.299) + (image.data[i + 1] * 0.587) + (image.data[i + 2] * 0.114);
        luminance[l] = flume(image.data, i);
    }

    for (let l = 0, i = 0; i < image.data.length; l++, i += 4) {
        let value = luminance[l] < 129 ? 0 : 255;
        let error = Math.floor((luminance[l] - value) / 32);
        image.data.fill(value, i, i + 3);

        luminance[l + 1] += error * 5;
        luminance[l + 2] += error * 3;

        luminance[l + width - 2] += error * 2;
        luminance[l + width - 1] += error * 4;
        luminance[l + width] += error * 5;
        luminance[l + width + 1] += error * 4;
        luminance[l + width + 2] += error * 2;

        luminance[l + width * 2 - 1] += error * 2;
        luminance[l + width * 2] += error * 3;
        luminance[l + width * 2 + 1] += error * 2;
    }

    return image;
}

let ditherKernels = {
    atkinson,
    floydsteinberg,
    burkes,
    sierra3
}

function dither(canvas, kernelName='floydsteinberg') {
    let ctx = canvas.getContext('2d');
    let idata = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // set kernel function from map
    let kernel = ditherKernels[kernelName];    

    let dithered = kernel(idata);

    // directly draw dithered data to canvas
    //ctx.putImageData(dithered, 0, 0);

    // OR: draw dithered data to an offscreen canvas,
    // then apply that to original image via 'overlay'
    let ditherCanvas = document.createElement('canvas');
    ditherCanvas.width = canvas.width;
    ditherCanvas.height = canvas.height;
    let ditherctx = ditherCanvas.getContext('2d');
    ditherctx.putImageData(dithered, 0, 0);

    ctx.globalAlpha = 0.5;
    ctx.globalCompositeOperation = 'overlay';
    ctx.drawImage(ditherCanvas, 0, 0);
    ctx.globalAlpha = 1;
}

function ditherMain(){
    console.log('trigger DitherMain!');
    var canvas = document.querySelector('#example canvas');
    dither(canvas, 'floydsteinberg');
}
window.ditherMain = ditherMain;


// Palette dithering:

function colorDistance_simple(c1, c2) {
    let d;
    let dr, dg, db;
    dr = c2[0] - c1[0];
    dg = c2[1] - c1[1];
    db = c2[2] - c1[2];

    d = Math.sqrt(dr*dr + dg*dg + db*db);

    return d;
}

// Quick euclidian color distance, from wikipedia
// https://en.wikipedia.org/wiki/Color_difference
function colorDistance(c1, c2) {
    let _r = (c1[0] + c2[0]) / 2;
    let dr = c1[0] - c2[0];
    let dg = c1[1] - c2[1];
    let db = c1[2] - c2[2];
    let dc = Math.sqrt(
        dr * dr * (2 + _r/256) +
        dg * dg * 4 +
        db * db  * (2 + (255 - _r)/256)
    );
    return dc;
}

window.distances = [];

function floydsteinberg_palette(image, referenceColor) {
    /*
        X   7
    3   5   1

      (1/16)
     */
    let width = image.width;
    let colorDistances = new Uint8ClampedArray(image.width * image.height);
    let sampleColor = [0, 0, 0]; // r, g, b

    // get list of pixel distances
    for (let l = 0, i = 0; i < image.data.length; l++, i += 4) {
        sampleColor = [image.data[i], image.data[i+1], image.data[i+2]]
        //colorDistances[l] = (image.data[i] * 0.299) + (image.data[i + 1] * 0.587) + (image.data[i + 2] * 0.114);
        colorDistances[l] = colorDistance(sampleColor, referenceColor);

        // DEBUG: push nonzeros
        if (colorDistances[l] > 0) window.distances.push(colorDistances[l]);
    }

    // use colorDistances to get values
    for (let l = 0, i = 0; i < image.data.length; l++, i += 4) {
        let value = colorDistances[l] < 129 ? 0 : 255;
        let error = Math.floor((colorDistances[l] - value) / 16);
        image.data.fill(value, i, i + 3);

        colorDistances[l + 1] += error * 7;
        colorDistances[l + width - 1] += error * 3;
        colorDistances[l + width] += error * 5;
        colorDistances[l + width + 1] += error * 1;
    }

    return image;
}

function hexToRgb(hex) {
    if (hex[0] === '#') {
        hex = hex.slice(1);
    }
    if (hex.length === 3) {
        hex = '' + hex[0] + hex[0]
            + hex[1] + hex[1]
            + hex[2] + hex[2];
    }
    function toN(hexFrag) {
        return parseInt(hexFrag, 16)
    }
    return [
        toN(hex.slice(0,2)),
        toN(hex.slice(2,4)),
        toN(hex.slice(4,6))
    ]
    /*return {
        r: toN(hex.slice(0,2)),
        g: toN(hex.slice(2,4)),
        b: toN(hex.slice(4,6))
    }*/
}

function ditherColor(canvas, palette, kernelName='floydsteinberg') {
    console.log('ditherColor', palette);


    let ctx = canvas.getContext('2d');
    let idata;

    // set kernel function from map
    let kernel = floydsteinberg_palette;

    let dithered;
    let c;
    let layers = [];


    palette.forEach(function(color, idx){
        c = hexToRgb(color);

        idata = ctx.getImageData(0, 0, canvas.width, canvas.height);
        dithered = kernel(idata, c);

        // directly draw dithered data to canvas
        //ctx.putImageData(dithered, 0, 0);

        // OR: draw dithered data to an offscreen canvas,
        // then apply that to original image via 'overlay'
        let ditherCanvas = document.createElement('canvas');
        ditherCanvas.width = canvas.width;
        ditherCanvas.height = canvas.height;
        let ditherctx = ditherCanvas.getContext('2d');
        ditherctx.putImageData(dithered, 0, 0);

        /*ditherctx.globalCompositeOperation = 'exclusion';
        ditherctx.fillStyle = color;
        console.log('dither fill style ', color);
        ditherctx.rect(0, 0, canvas.width, canvas.height);
        ditherctx.fill();*/
        let ditherData = ditherctx.getImageData(0, 0, canvas.width, canvas.height);
        let ditherpx = ditherData.data;
        let n = ditherpx.length;
        let i = 0;
        while(i < n) {
            if(ditherpx[i] === 0) {
                // fill it
                ditherpx[i] = c[0];
                ditherpx[i + 1] = c[1];
                ditherpx[i + 2] = c[2];
            } else {
                // blank it
                ditherpx[i + 3] = 0; // no alpha
            }

            i += 4;
        }
        ditherctx.putImageData(ditherData, 0, 0);

        layers.push(ditherCanvas);
        document.querySelector('body').appendChild(ditherCanvas);
    });

    
    ctx.globalAlpha = 0.66; // TODO magic number
    ctx.fillStyle="white";
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fill();
    ctx.globalAlpha = 1;
    layers.forEach((ditherCanvas)=>{
        ctx.drawImage(ditherCanvas, 0, 0);
    });

    
}

function ditherColorMain(){
    console.log('Call DitherColorMain');
    var canvas = document.querySelector('#example canvas');
    ditherColor(canvas, visualOpts.palette, 'floydsteinberg');
}
window.ditherColorMain = ditherColorMain;



/* ======================================
END DITHERING
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

function roughenMain() {
    var canvas = document.querySelector('#example canvas');
    var ctx = canvas.getContext('2d');
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    roughen(canvas, 3);
}
window.roughenMain = roughenMain;

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
