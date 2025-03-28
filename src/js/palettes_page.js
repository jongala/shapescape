import '../css/style.css';

import GUI from 'lil-gui';

import noiseUtils from './noiseutils';
import palettes from './palettes';
import colorbrewer from './colorbrewer';
// renderers
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
import { tricycles } from './tricycles';

// utils
import { setAttrs, hexToRgb, scalarVec, getSolidColorFunction } from './utils';



/* ======================================
BEGIN STYLES
====================================== */

var appPalettes = Object.assign({default: null}, palettes);

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


let lastCustom = [];

let parseCustomPalette = function(e) {
    var hexPattern = /#?[0-9a-f]{3,6}/;
    var palette = e.target.value.split(',');
    palette = palette.map(s => {
        s = s.trim().replace(/['"']/g,'');
        if (hexPattern.test(s) && !s.startsWith('#')) {
            s = '#' + s;
        }
        return s;
    });
    console.log('parsed', palette.toString());
    if (lastCustom.toString() !== palette.toString()) {
        lastCustom = palette;
        document.querySelector('.customs').innerHTML += renderPalette(palette);
    }
}

var custom = document.querySelector('#customColors');
custom.addEventListener('blur', parseCustomPalette);
custom.addEventListener('keypress', function(e) {
    var kode = e.which || e.keyCode;
    if (kode === 13 || kode === 9) {
        // ENTER or TAB
        parseCustomPalette(e);
    }
});




// Generate HTML for a paltte
let renderPalette = function(palette, pname='custom') {
    let markup = '';
    markup += '<div class="palette">';
    markup +=  `<div class="palette_label">${pname}</div>`;
    palette.forEach((color)=>{
        markup += '<div class="swatch" style="background-color:' + color + '"></div>';
    });
    markup += '</div>';
    return markup;
}


// Loop through all the preset palettes, render them, add to page
let paletteMarkup = '';
var pnames = Object.keys(appPalettes);
pnames.forEach((pname) => {
    let palette = appPalettes[pname];
    if (palette && palette.length) {
        paletteMarkup += renderPalette(palette, pname);
    }
});
document.querySelector('.presets').innerHTML = paletteMarkup;


// draw one to start, take renderer from hash if it is valid

var h = window.location.hash.slice(1);
if (h && RENDERERS.hasOwnProperty(h)) {
    initRenderer = h;
}

// setRenderer(initRenderer, document.querySelector("[data-renderer='" + initRenderer + "']"));
