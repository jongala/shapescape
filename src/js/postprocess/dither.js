import {hexToRgb, scalarVec} from '../utils';


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


// Nested arrays of error coefs. Use zeroes up to the "current" px
// which means they imply forward-only propagation.
const kernelDefs = {
    atkinson: [
        [0 ,0, 1/8, 1/8],
        [1/8, 1/8, 1/8, 0],
        [0, 1/8, 0, 0]
    ],
    floydsteinberg: [
        [0, 0, 7/16],
        [3/16, 5/16, 1/16]
    ],
    burkes: [
        [0, 0, 0, 8/32, 4/32],
        [2/32, 4/32, 8/32, 4/32, 2/32]
    ],
    sierra3: [
        [0, 0, 0, 5/32, 3/32],
        [2/32, 4/32, 5/32, 4/32, 2/32],
        [0/32, 2/32, 3/32, 2/32, 0/32]
    ]
}


// use a set of arrays defining a dithering kernel as @kernel
// to propagate errors into @px pixels at index @idx, using image
// @width to set the row offsets.
// This does full color dithering so uses an @errorArray of
// r,g,b,x component errors. Where x is either alpha or, in this case,
// a scalar of r,g,b used for sorting elsewhere.
function propagate_errors(px, idx, errorArray, width, kernel){
    // get an offset based on array length
    let koffset = Math.ceil(kernel[0].length/2) - 1;
    let rowOffset = 0;
    let pxOffset = 0;
    let er, eg, eb, es;

    // index offset from half of width
    // then step through each array
    // each time add a width

    kernel.forEach((row, j)=>{
        rowOffset = j * width;
        row.forEach((weight, i)=>{
            [er, eg, eb, es] = scalarVec(errorArray, weight);

            pxOffset = idx + (rowOffset + i - koffset) * 4;

            px[pxOffset + 0] += er;
            px[pxOffset + 1] += eg;
            px[pxOffset + 2] += eb;
            px[pxOffset + 3] += 0;
        })
    });

    return px;
}


// Single pass function to dither an image using colors in @palette
// Relies on closestColor() -> colorDistanceArray() and other utils above
function ditherPalette(image, palette, kernelName='burkes') {
    let tStart = new Date().getTime();

    let kernel = kernelDefs[kernelName] || kernelDefs['burkes'];
    let width = image.width;
    let sampleColor = [0, 0, 0]; // r, g, b
    let sampleError = [0, 0, 0];
    let closest;

    let px = image.data;

    let rgbPalette = palette.map((p)=>hexToRgb(p));

    // use colorDistances to get values
    for (let i = 0; i < image.data.length; i += 4) {
        sampleColor = [px[i], px[i+1], px[i+2]];

        // check each pixel, find closest palette color. get error.
        closest = closestColor(
            sampleColor, // sample, which includes errors
            rgbPalette // … to the palette colors
        );

        // replace pixel with palette color
        px[i] = closest.color[0];
        px[i+1] = closest.color[1];
        px[i+2] = closest.color[2];
        px[i+3] = 255;

        // Add error to the neighboring pixel values.
        // Pass in the specified kernel
        px = propagate_errors(px, i, closest.diff, width, kernel);
    }

    let tFinish = new Date().getTime();
    console.log(`Dithered to palette with ${kernelName} in ${tFinish - tStart}ms`);
    return image;
}

//--------------------------------------

// from pixel data @idata at index @i return a basic rgb luminosity
// using sqrt of rando c
function flume(idata, i) {
    return Math.sqrt(
            (idata[i] * 0.299) * (idata[i] * 0.299) +
            (idata[i + 1] * 0.587) * (idata[i + 1] * 0.587) +
            (idata[i + 2] * 0.114) * (idata[i + 2] * 0.114)
        );
}


// use a set of arrays defining a dithering kernel as @kernel
// to propagate errors into @px, a SINGLE CHANNEL pixels array,
// at index @idx, using image @width to set the row offsets.
// This does luminosity dithering so uses a scalar @error
function propagate_luminosity_errors(px, idx, error, width, kernel){
    // get an offset based on array length
    let koffset = Math.ceil(kernel[0].length/2) - 1;
    let rowOffset = 0;
    let pxOffset = 0;
    let prop_error;

    // index offset from half of width
    // then step through each array
    // each time add a width

    kernel.forEach((row, j)=>{
        rowOffset = j * width;
        row.forEach((weight, i)=>{
            prop_error = error * weight;
            pxOffset = idx + (rowOffset + i - koffset);
            px[pxOffset] += prop_error;
        })
    });

    return px;
}


// Single pass function to dither an image using luminosity
function ditherLuminosity(image, kernelName='burkes') {
    let tStart = new Date().getTime();

    let kernel = kernelDefs[kernelName] || kernelDefs['burkes'];
    let width = image.width;

    let luminance = new Uint8ClampedArray(image.width * image.height);

    // populate luminance array
    for (let l = 0, i = 0; i < image.data.length; l++, i += 4) {
        luminance[l] = flume(image.data, i);
    }

    // now step through the luminance, check threshold, and
    // apply new b/w value to px. Record raw error and propagate
    // through the luminance array.
    for (let l = 0, i = 0; i < image.data.length; l++, i += 4) {
        let value = luminance[l] < 129 ? 0 : 255;
        let error = luminance[l] - value;
        image.data.fill(value, i, i + 3);

        // propagate errors into luminance
        luminance = propagate_luminosity_errors(luminance, l, error, width, kernel);
    }

    let tFinish = new Date().getTime();
    console.log(`Dithered to luminosity with ${kernelName} in ${tFinish - tStart}ms`);
    return image;
}



//--------------------------------------

export default {
    kernelDefs,
    ditherPalette,
    ditherLuminosity
}