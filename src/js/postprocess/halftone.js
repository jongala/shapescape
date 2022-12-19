import { hexToRgb, scalarVec, colorDistanceArray, closestColor } from '../utils';

// Adapted from https://gist.github.com/ucnv/249486
// Use an adaptive @dotSize, 1 is small, 2 is med,  3 is large
export function halftoneCMYK(canvas, dotSize=2, palette) {

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
    var drawColor = function(interval, colorObj, layer) {

        // console.log('drawColor', colorObj);

        // get an offscreen layer to draw to
        let layerCtx = layer.getContext('2d');

        // set transform for angle of color screen
        var rad = (colorObj.angle % 90) * Math.PI / 180;
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
        layerCtx.fillStyle = colorObj.color;

        // Loop through @interval pixels, width and height.
        // Keep a running tally of color diffs from the palette reference
        // for the whole block. At the end, divide by number of px.
        for(var y = 0; y < oh; y += interval) {
            for(var x = 0; x < ow; x += interval) {
                var pixels = scratch.getImageData(x, y, interval, interval).data;
                var sum = 0, count = 0;
                for(var i = 0; i < pixels.length; i += 4) {
                    if(pixels[i + 3] == 0) continue;
                    var r = 255 - pixels[i];
                    var g = 255 - pixels[i + 1];
                    var b = 255 - pixels[i + 2];
                    var k = Math.min(r, g, b);

                    if(colorObj.name != 'k' && k == 255) sum += 0; // avoid divide by zero
                    else if(colorObj.name == 'k') sum += k / 255;
                    else if(colorObj.name == 'c') sum += (r - k) / (255 - k);
                    else if(colorObj.name == 'm') sum += (g - k) / (255 - k);
                    else if(colorObj.name == 'y') sum += (b - k) / (255 - k);
                    count++;
                }

                if(count == 0) continue;
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
    palette.forEach((colorObj, i) => {
        drawColor(interval, colorObj, layers[i]);
    });

    // step through layers, and composite them onto the output canvas
    display.globalCompositeOperation = 'multiply';
    display.globalAlpha = 0.8086;
    layers.forEach((layer, i) => {
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
export function halftoneSpotColors(canvas, dotSize=2, palette) {
    const angles = [45, 75, 30, 85, 22.5, 62.5, 15, 0];

    // get context and dims for input/output canvas
    var display = canvas.getContext('2d');
    var w = canvas.width;
    var h = canvas.height;

    // capture and remove shadow settings
    let canvasShadowBlur = display.shadowBlur;
    let canvasShadowColor = display.shadowColor;
    display.shadowBlur = 0;
    display.shadowColor = 'transparent';


    let hexPalette = palette.map(hexToRgb);

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
                agg = agg.map(Math.round); 

                // get closest color in the palette. Includes closest.diff
                let closest = closestColor(agg, hexPalette);
                let closestNorm = closest.diff[3]/765;

                // get diff from current color and sample
                let diff = colorDistanceArray(color, agg);
                let diffNorm = diff[3]/765;

                // calc the ink rate from the distance in the current color diff
                var rate = 1 - diffNorm;// * (1 - closest.diff)/diff;

                /*let thresh = 220;
                if (agg[0] > thresh && agg[1] > thresh && agg[2] > thresh) {
                    //continue;
                    rate = 0;
                }*/

                // Renormalize the dot size based on closeness to the closest
                // This way if there is an exact match, only the close color
                // is printed, and others aren't needlessly mixed in
                if (diffNorm > 0) {
                    rate = rate * (closestNorm/diffNorm);
                } else {
                    rate = 2;
                }


                // debug
                if (x > 400 && x < 410 && y > 400 && y < 410) {
                    console.log(agg, closest, diff,
                        `closestNorm: ${closestNorm}, diffNorm: ${diffNorm}, rate: ${rate}`
                    );
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
    display.globalCompositeOperation = 'normal';

    source = null; // clear DOM element

    // re-apply shadow settings
    display.shadowBlur = canvasShadowBlur;
    display.shadowColor = canvasShadowColor;
} // halftoneCMYK()