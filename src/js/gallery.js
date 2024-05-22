import '../css/style.css';

import GUI from 'lil-gui';

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
import { truchetCurves } from './truchetCurves';
import { grille } from './grille';
import { circles } from './circles';
import { mesh } from './mesh';
import { walk } from './walk';
import { bands } from './bands';
import { field } from './field';
import { fieldShape } from './fieldShape';
import { trails } from './trails';
import { fragments } from './fragments';
import { clouds } from './clouds';
import { grads } from './grads';
import { doodle } from './doodle';
import { pillars } from './pillars';
import { rings } from './rings';
import { plants } from './plants';
import { scales } from './scales';
import { sweater } from './sweater';
// utils
import { setAttrs, hexToRgb, scalarVec, getSolidColorFunction } from './utils';
// postprocess
import dither from './postprocess/dither';
import { donegal, dapple } from './postprocess/speckle';
import { halftoneCMYK, halftoneSpotColors } from './postprocess/halftone';
import { fracture } from './postprocess/fracture';

// Renderers
const RENDERERS = {
    waterline: waterline,
    shapestack: shapestack,
    shapescape: shapescape,
    duos: duos,
    lines: lines,
    grid: grid,
    truchet: truchet,
    "truchet-Curves": truchetCurves,
    grille: grille,
    circles: circles,
    mesh: mesh,
    walk: walk,
    field: field,
    "field-Shape": fieldShape,
    trails: trails,
    bands: bands,
    fragments: fragments,
    waves: waves,
    grads: grads,
    doodle: doodle,
    pillars: pillars,
    rings: rings,
    plants: plants,
    scales: scales,
    sweater: sweater,
    //clouds: clouds
};
let initRenderer = 'waterline';

var rendererName;
var Renderer;
var activeButton;

// util to format renderer names for display
function formatRendererName (inputName) {
    let formattedName = inputName.slice(0,1).toUpperCase() + inputName.slice(1);
    formattedName = formattedName.replace('-',' ');
    return formattedName;
}

// generate a series of buttons for each renderer in @renderers
// format their names using formatRendererNAme
// append the buttons to @el
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



//======================================
// POSTPROCESS
//======================================

function roughenMain() {
    var canvas = document.querySelector('#example canvas');
    var ctx = canvas.getContext('2d');
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    dapple(canvas);
}
window.roughenMain = roughenMain;


function donegalMain() {
    var canvas = document.querySelector('#example canvas');
    donegal(canvas, 'random');
}

window.donegalMain = donegalMain;


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


function halftoneSpot() {
    var tStart = new Date().getTime();

    var canvas = document.querySelector('#example canvas');
    let palette = [];

    // use working palette, or fall back to rgb + black
    if (visualOpts.palette && visualOpts.palette.length) {
        palette = visualOpts.palette;
    } else {
        // cmyk: ['#000000', '#ff00ff', '#00ffff', '#ffff00'];
        palette = ['#ff0000', '#00ff00', '#0000ff', '#000000'];
    }

    //palette.push('#e7e7e7');

    halftoneSpotColors(canvas, 2, palette);

    var tEnd = new Date().getTime();
    console.log(`Ran halftoneSpot in ${tEnd - tStart}ms`);

}

window.halftoneSpot = halftoneSpot;


/* Fracture
-------------------------------------- */

let fractureImage = function() {
    var canvas = document.querySelector('#example canvas');
    fracture(canvas, 2);
}

window.fractureImage = fractureImage;


let shatterImage = function() {
    var canvas = document.querySelector('#example canvas');
    //fracture(canvas, 64);
    let steps = 5;
    while (steps--) {
        fracture(canvas, 4)
    }
}

window.shatterImage = shatterImage;

/* ======================================
END POSTPROCESS
====================================== */





/* ======================================
BEGIN STYLES
====================================== */


let collection = [
    {
        name: 'Waterline',
        renderer: RENDERERS['waterline'],
        opts: {

        },
        description: 'Shapes floating in water, as seen at the water level'
    },
    {
        name: 'Carmitron',
        renderer: RENDERERS['shapestack'],
        opts: {
            fancy: false,
            nest: false,
            stack: true,
            multiMask: false,
            fillStyle: 'solid'
        },
        description: 'Based on works of Eugenio Carmi'
    },
    {
        name: 'Carmi plus',
        renderer: RENDERERS['shapestack'],
        opts: {
            fancy: true,
            nest: false,
            stack: false,
            multiMask: false,
            fillStyle: null,
        },
        description: 'Fancy Carmitron: shadows and gradients and nested stacks'
    },
    {
        name: 'Shapescape',
        renderer: RENDERERS['shapescape'],
        opts: {

        },
        description: 'Two shaded shapes placed against one another, sometimes above a ground'
    },
    {
        name: 'Duos',
        renderer: RENDERERS['duos'],
        opts: {
            
        },
        description: 'Two simple shapes, and their intersections, centers, and connections'
    },
    {
        name: 'Sharp curtains',
        renderer: RENDERERS['lines'],
        opts: {
            renderStyle: 'jagged'
        },
        description: 'Curtains of jagged lines, partitioned or masked'
    },
    {
        name: 'Soft curtains',
        renderer: RENDERERS['lines'],
        opts: {
            renderStyle: 'wave'
        },
        description: 'Curtains of wavy lines, partitioned or masked'
    },
    {
        name: 'Mask in place',
        renderer: RENDERERS['grid'],
        opts: {
            style: 'masked'  
        },
        description: 'Grids of masked and rotating shapes'
    },
    {
        name: 'Cellophane',
        renderer: RENDERERS['grid'],
        opts: {
            style: 'layers'
        },
        description: 'Layers of shapes'
    },

// Truchet
    {
        name: 'Truchet classic',
        renderer: RENDERERS['truchet'],
        opts: {
            style: 'auto',
            layer: false
        },
        description: 'Classic Truchet tiles with circles and triangles'
    },
    {
        name: 'Truchet layers',
        renderer: RENDERERS['truchet'],
        opts: {
            style: 'auto',
            layer: true
        },
        description: 'Classic Truchet tiles with additional layer'
    },

// Truchet Curves
    {
        name: 'Truchet curves',
        renderer: RENDERERS['truchet-Curves'],
        opts: {
            
        },
        description: 'Layered Truchet circle segments'
    },

// Grille
    {
        name: 'Grilles',
        renderer: RENDERERS['grille'],
        opts: {
            
        },
        description: 'Based on the iron grilles on Eastern European apt houses as photographed by Troy Litten in "Safety by Design"'
    },

// Circles
    {
        name: 'Circles',
        renderer: RENDERERS['circles'],
        opts: {
            style: 'rings'
        },
        description: 'Fragments of circles and their connections'
    },

    {
        name: 'Snakes',
        renderer: RENDERERS['circles'],
        opts: {
            style: 'snakes'
        },
        description: 'Fragments of circles and their connections'
    },

    {
        name: 'Porcelain',
        renderer: RENDERERS['circles'],
        opts: {
            style: 'pattern'
        },
        description: 'Patterns of overlapping rings'
    },

// Mesh
    {
        name: 'Mesh',
        renderer: RENDERERS['mesh'],
        opts: {
            
        },
        description: 'A grid of points connecting to their neighbors'
    },

// Walk

    {
        name: 'Walk',
        renderer: RENDERERS['walk'],
        opts: {
            
        },
        description: 'Survival lines, transition points, and frames'
    },


// Field

    {
        name: 'Field',
        renderer: RENDERERS['field'],
        opts: {
            lightMode: 'normal'
        },
        description: 'Flow fields overlaid with various markers'
    },

    {
        name: 'Bloom Field',
        renderer: RENDERERS['field'],
        opts: {
            lightMode: 'bloom'
        },
        description: 'A flow field with bloom lighting'
    },



// Field Shape


// Trails

    {
        name: 'Trails',
        renderer: RENDERERS['trails'],
        opts: {
            fieldNoise: 'none'
        },
        description: 'Tracing trails through flow fields'
    },

    {
        name: 'Rough Trails',
        renderer: RENDERERS['trails'],
        opts: {
            fieldNoise: 'med'
        },
        description: 'Tracing trails with noisy wiggles'
    },


// Bands

    {
        name: 'Bands',
        renderer: RENDERERS['bands'],
        opts: {
            
        },
        description: 'Based on a design by Erik Nitsche for a Beethoven album'
    },

// Fragments

    {
        name: 'Fragments',
        renderer: RENDERERS['fragments'],
        opts: {
            
        },
        description: 'Based on painted plywood art FF24 by @plusminusdrei / plusminus3.com'
    },

// Waves

    {
        name: 'Waves',
        renderer: RENDERERS['waves'],
        opts: {

        },
        description: 'Layers of waves with floating shapes'
    },

// Grads

    {
        name: 'Grads',
        renderer: RENDERERS['grads'],
        opts: {
            
        },
        description: 'Bands filled with gradients'
    },


// Doodle

    {
        name: 'Doodle',
        renderer: RENDERERS['doodle'],
        opts: {
            
        },
        description: 'Scribbled shapes fill the space, based on an illustration by Amy Goodchild'
    },

// Pillars

    {
        name: 'Pillars',
        renderer: RENDERERS['pillars'],
        opts: {
            
        },
        description: 'Pillars rise and fall'
    },

// Rings

    {
        name: 'Rings',
        renderer: RENDERERS['rings'],
        opts: {
            
        },
        description: 'Based on Camille Roux\'s Rotating Systems series'
    },

// Plants

    {
        name: 'Plants',
        renderer: RENDERERS['plants'],
        opts: {
            
        },
        description: 'Branches, buds, and flowers, with varying details'
    },

// Scales

    {
        name: 'Scales',
        renderer: RENDERERS['scales'],
        opts: {
            style: 'fields'  
        },
        description: 'Overlapping scales in various patterns'
    },

// Sweater

    {
        name: 'Sweater',
        renderer: RENDERERS['sweater'],
        opts: {
            
        },
        description: 'Radial checkered rings with donegal flecks'
    },


];


let works = document.getElementById('works');

let worksHTML = '';

function selectWork(div) {
    let sel = works.querySelector('.selected');
    sel && sel.classList.remove('selected');
    div.classList.add('selected');
}

collection.forEach((item) => {
    let el = document.createElement('div');
    el.setAttribute('class', 'work');
    el.innerHTML = `<strong>${item.name}</strong><span class="description">${item.description||''}</span>`;
    let handler = function(e) {
        console.log('clicked ', item);
        e.preventDefault();
        Renderer = item.renderer;
        loadOpts(Object.assign({}, visualOpts, item.opts));
        selectWork(el);
    };
    el.addEventListener('click', handler);
    works.appendChild(el);
});





/* ======================================
END STYLES
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
    option.innerHTML = pname.replace(/_/g,' ');
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

// setRenderer(initRenderer, document.querySelector("[data-renderer='" + initRenderer + "']"));