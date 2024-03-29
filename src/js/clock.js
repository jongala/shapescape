import '../css/style.css';

import noiseUtils from './noiseutils';
import palettes from './palettes';
import colorbrewer from './colorbrewer';
import { truchet } from './truchet';
import { numerals } from './numerals';
import { setAttrs } from './utils';

// Renderers
let Renderer = truchet;

// TODO: put this into a resize handler and make it smart
let COUNT = 16;

// GUI controlled opts
var visualOpts = {
    container: document.querySelector('#truchet'),
    clear: true,
    dust: true,
    skew: 1,
    addNoise: 0.04,
    noiseInput: noiseUtils.createNoiseCanvas(0.04, 200),
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
}


// @fast skips re-rendering the canvas in place as an img,
// which makes for easy saving but slows down rendering
function loadOpts(opts, fast) {
    visualOpts = Object.assign(visualOpts, opts);
    // render art
    truchet(visualOpts);
}

// Handlers for redraw, batching, and manual saving

function drawNew() {
    requestAnimationFrame(loadOpts);
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

var selectEl = document.querySelector('#paletteSelector');
var pnames = Object.keys(appPalettes);
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
        s = s.trim().replace(/['"']/g,'');
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
setInterval(()=>{
    if (new Date().getSeconds() % 10 === 0) drawNew();
    window.requestAnimationFrame(()=>{
        numerals(timeOpts);
    });
    
}, 1000);



