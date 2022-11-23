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
import { setAttrs, hexToRgb, scalarVec } from './utils';
// postprocess
import roughen from './roughen';
import dither from './postprocess/dither';
import { halftoneCMYK } from './postprocess/halftone';

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
    let dithered = dither.ditherLuminosity(idata, 'atkinson');

    // apply the dithered data back
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

    ctx.globalCompositeOperation = 'normal';
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

//--------------------------------------

// Halftone
function halftoneProcess() {
    var tStart = new Date().getTime();

    var canvas = document.querySelector('#example canvas');
    canvas.setAttribute('willReadFrequently', true);

    let cmyk = [
        {
            name: 'y',
            color: `rgba(255,255,0)`,
            angle: 0
        },
        {
            name: 'm',
            color: `rgba(255,0,255)`,
            angle: 75
        },
        {
            name: 'c',
            color: `rgba(0,255,255)`,
            angle: 15
        },
        {
            name: 'k',
            color: `rgba(0,0,0)`,
            angle: 45
        }
    ];

    halftoneCMYK(canvas, 2, cmyk);

    var tEnd = new Date().getTime();
    console.log(`Ran halftoneProcess in ${tEnd - tStart}ms`);
}

window.halftoneProcess = halftoneProcess;



// Supply @c1, @c2 as [r,g,b] colors.
// Return r,g,b distance components, and a scalar distance as [r,b,g,distance]
function colorDistanceArray(c1, c2) {
    let dr, dg, db;
    let _r = (c1[0] + c2[0]) / 2;
    dr = c2[0] - c1[0];
    dg = c2[1] - c1[1];
    db = c2[2] - c1[2];
    let dc = Math.sqrt(
        dr * dr * (2 + _r/256) +
        dg * dg * 4 +
        db * db  * (2 + (255 - _r)/256)
    );
    return [dr, dg, db, dc];
}


// args are rgb in 8 bit array form
// returns {diff, color}
function closestColor (sample, palette) {
    let diffs = palette.map((p)=>{
        return {
            diff: colorDistanceArray(p, sample),
            color: p
        }
    });
    diffs = diffs.sort((a, b) => {
        return (a.diff[3] - b.diff[3]);
    });
    return diffs[0];
}



function halftoneSpot() {
    var tStart = new Date().getTime();

    var canvas = document.querySelector('#example canvas');
    canvas.setAttribute('willReadFrequently', true);

    let angles = [45, 75, 30, 85, 22.5, 62.5, 15, 0];
    let cmyk = ['#000000', '#ff00ff', '#00ffff', '#ffff00'];


    function halftone(canvas, dotSize=2, palette) {

        // get context and dims for input/output canvas
        var display = canvas.getContext('2d');
        var w = canvas.width;
        var h = canvas.height;

        // capture and remove shadow settings
        let canvasShadowBlur = display.shadowBlur;
        let canvasShadowColor = display.shadowColor;
        display.shadowBlur = 0;
        display.shadowColor = 'transparent';


        let dim = Math.min(w, h);

        // calculate the actual dot size
        // add a sqrt factor normalized to an 800px canvas, to grow the dots
        // somewhat with canvas size.
        let interval = (3 + dotSize * 2) * Math.sqrt(dim/800);
        interval = Math.round(interval);
        // console.log(`dotSize = ${dotSize}, interval=${interval}`);

        // The source canvas takes a snapshot of the input/output canvas,
        // which will be re-applied to the scratch canvas at different
        // angles for each color to be applied
        let source = document.createElement('canvas');
        source.width = w;
        source.height = h;
        let sourceCtx = source.getContext('2d');
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
        let layers = palette.map((c, i) => {
            let layer = document.createElement('canvas');
            layer.width = w;
            layer.height = h;
            return layer;
        });


        // draw the color to the layer
        var drawColor = function(interval, hex, angle, layer) {

            // console.log('drawColor', colorObj);
            let color = hexToRgb(hex);

            // get an offscreen layer to draw to
            let layerCtx = layer.getContext('2d');

            // set transform for angle of color screen

            var rad = (angle % 90) * Math.PI / 180;
            var sinr = Math.sin(rad), cosr = Math.cos(rad);
            var ow = w * cosr + h * sinr;
            var oh = h * cosr + w * sinr;

            // scratch canvas
            var c = document.createElement('canvas');
            c.width = ow + interval;
            c.height = oh + interval;  // add margins to avoid getImageData's out of range errors
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
            for(var y = 0; y < oh; y += interval) {
                for(var x = 0; x < ow; x += interval) {
                    var pixels = scratch.getImageData(x, y, interval, interval).data;
                    var sum = 0, count = 0;
                    let agg = [0, 0, 0];
                    for(var i = 0; i < pixels.length; i += 4) {
                        if(pixels[i + 3] == 0) continue;

                        agg[0] += pixels[i + 0];
                        agg[1] += pixels[i + 1];
                        agg[2] += pixels[i + 2];
                        
                        count++;
                    }

                    if(count == 0) continue;
                    agg = scalarVec(agg, 1/count);

                    let closest = closestColor(agg, palette);
                    let diff = colorDistanceArray(agg, color);

                    var rate = diff[3]/255;// * (1 - closest.diff)/diff;
                    if (x > 400 && x < 410 && y > 400 && y < 410) {
                        console.log(agg, closest, diff);
                    }

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
                    layerCtx.arc(x + (interval / 2), y + (interval / 2), Math.SQRT1_2 * interval * rate, 0, Math.PI * 2, true);
                    layerCtx.fill();
                    layerCtx.restore();
                }
            }

            // reset
            layerCtx.rotate(-rad);
            layerCtx.translate(-w * sinr * sinr, w * sinr * cosr);

            // clear DOM element
            c = null;
        } // drawColor()

        // step through palette, drawing colors to layers
        palette.forEach((hex, i) => {
            drawColor(interval, hex, angles[i], layers[i]);
        });

        // step through layers, and composite them onto the output canvas
        //display.globalCompositeOperation = 'multiply';
        //display.globalAlpha = 0.8086;
        layers.forEach((layer, i) => {
            display.drawImage(layer, 0, 0);
            layer = null; // clear DOM element
        });
        //display.globalCompositeOperation = 'normal';

        source = null; // clear DOM element

        // re-apply shadow settings
        display.shadowBlur = canvasShadowBlur;
        display.shadowColor = canvasShadowColor;
    } // halftoneCMYK()

    halftone(canvas, 2, cmyk);

    var tEnd = new Date().getTime();
    console.log(`Ran halftoneSpot in ${tEnd - tStart}ms`);

}

window.halftoneSpot = halftoneSpot;


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
