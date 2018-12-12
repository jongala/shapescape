import { randItem, randomInRange } from './utils';

/*
 * The general approach is to define fills in a generic object format,
 * which can be considered the serialized form:
 *
 * myFill = {
 *     type: ['solid', 'linear', 'radial'],
 *     params: {
 *         // whatever you need for the fill type
 *     }
 * }
 *
 * These are returned by defineFill()
 *
 * These can be deserialized by expandFill(), which dispatches to helper functions
 * for each fill type. These return an expanded fill, which is anything that
 * is valid for assignment to context.fillStyle = {}
 * e.g. a string of a hex color, or a defined canvas gradient.
 * 
 */


//--------------------------------------
// SERIALIZE
//--------------------------------------

let defineSolidFill = (palette) => {
    let f = {
        type: 'solid',
        params: {
            color: randItem(palette)
        }
    }
    return f;
}

/**
 * Define a linear fill
 * @param  {context} ctx  the canvas rendering context
 * @param {array} palette an array of color values
 * @param  {num} x    center x of shape
 * @param  {num} y    center y of shape
 * @param  {num} size       half the size of the shape (r for circle)
 * @param  {num} skew       scalar to offset endpoints left/right for angled gradient
 * @return {fillStyle}      a solid color or canvas gradient
 */
let defineLinearGradientFill = (palette, x, y, size, skew) => {
    let gradient = {
        type: 'linear',
        params: {
            coords: [],
            stops: []
        }
    };
    // 
    // pick xoffset as fraction of size to get a shallow angle
    var xoff = randomInRange(-skew / 2, skew / 2) * size;
    // build gradient, add stops
    gradient.params.coords = [x - xoff, y - size, x + xoff, y + size];
    gradient.params.stops.push([0, randItem(palette)]);
    gradient.params.stops.push([1, randItem(palette)]);
    return gradient;
} 

// generic fill definition function
/**
 * Get a fill, either in solid or gradients
 * @param  {context} ctx  the canvas rendering context
 * @param {array} palette an array of color values
 * @param  {num} x    center x of shape
 * @param  {num} y    center y of shape
 * @param  {num} size       half the size of the shape (r for circle)
 * @param  {num} skew       scalar to offset endpoints left/right for angled gradient
 * @return {fillStyle}      a solid color or canvas gradient
 */
export function defineFill(type, palette, x, y, size, skew) {
    // create a fill object
    const fillGenerators = {
        'solid': defineSolidFill,
        'linear': defineLinearGradientFill,
        'radial': defineSolidFill // FIXME
    }
    return fillGenerators[type](palette, x, y, size, skew);
}


//--------------------------------------
// DESERIALIZE
//--------------------------------------


let gradientFromLinearDef = (ctx, gradientDef) => {
    let g = ctx.createLinearGradient(...gradientDef.params.coords);
    gradientDef.params.stops.forEach(s => g.addColorStop(...s));
    return g;
}


// outer expandFill converts a fill spec to a usable 2D context fill
export function expandFill (ctx, fill) {
    const fillFuncs = {
        'linear': gradientFromLinearDef,
        'radial': (ctx, fill) => fill.params.color, // FIXME
        'solid': (ctx, fill) => fill.params.color
    }
    if (fillFuncs[fill.type]) {
        return fillFuncs[fill.type](ctx, fill);
    } else {
        console.error('Could not resolve fill', fill);
        return '#808080';
    }
}


