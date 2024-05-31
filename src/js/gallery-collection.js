const collection = [
    {
        name: 'Waterline',
        renderer: 'waterline',
        opts: {

        },
        description: 'Shapes floating in water, as seen at the water level'
    },
    {
        name: 'Carmitron',
        renderer: 'shapestack',
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
        renderer: 'shapestack',
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
        renderer: 'shapescape',
        opts: {

        },
        description: 'Two shaded shapes placed against one another, sometimes above a ground'
    },
    {
        name: 'Duos',
        renderer: 'duos',
        opts: {

        },
        description: 'Two simple shapes, and their intersections, centers, and connections'
    },
    {
        name: 'Sharp curtains',
        renderer: 'lines',
        opts: {
            renderStyle: 'jagged'
        },
        description: 'Curtains of jagged lines, partitioned or masked'
    },
    {
        name: 'Soft curtains',
        renderer: 'lines',
        opts: {
            renderStyle: 'wave'
        },
        description: 'Curtains of wavy lines, partitioned or masked'
    },
    {
        name: 'Mask in place',
        renderer: 'grid',
        opts: {
            style: 'masked'
        },
        description: 'Grids of masked and rotating shapes'
    },
    {
        name: 'Cellophane',
        renderer: 'grid',
        opts: {
            style: 'layers'
        },
        description: 'Layers of shapes'
    },

// Truchet
    {
        name: 'Truchet classic',
        renderer: 'truchet',
        opts: {
            style: 'auto',
            layer: false
        },
        description: 'Classic Truchet tiles with circles and triangles'
    },
    {
        name: 'Truchet layers',
        renderer: 'truchet',
        opts: {
            style: 'auto',
            layer: true
        },
        description: 'Classic Truchet tiles with additional layer'
    },

// Truchet Curves
    {
        name: 'Truchet curves',
        renderer: 'truchet-Curves',
        opts: {

        },
        description: 'Layered Truchet circle segments'
    },

// Grille
    {
        name: 'Grilles',
        renderer: 'grille',
        opts: {

        },
        description: 'Based on the iron grilles on Eastern European apt houses as photographed by Troy Litten in "Safety by Design"'
    },

// Circles
    {
        name: 'Circles',
        renderer: 'circles',
        opts: {
            style: 'rings'
        },
        description: 'Fragments of circles and their connections'
    },

    {
        name: 'Snakes',
        renderer: 'circles',
        opts: {
            style: 'snakes'
        },
        description: 'Fragments of circles and their connections'
    },

    {
        name: 'Porcelain',
        renderer: 'circles',
        opts: {
            style: 'pattern'
        },
        description: 'Patterns of overlapping rings'
    },

// Mesh
    {
        name: 'Mesh',
        renderer: 'mesh',
        opts: {

        },
        description: 'A grid of points connecting to their neighbors'
    },

// Walk

    {
        name: 'Walk',
        renderer: 'walk',
        opts: {

        },
        description: 'Survival lines, transition points, and frames'
    },


// Field

    {
        name: 'Field',
        renderer: 'field',
        opts: {
            lightMode: 'normal',
            fieldNoise: 'none',
            colorMode: 'single'
        },
        description: 'Flow fields overlaid with various markers'
    },

    {
        name: 'Complex Field',
        renderer: 'field',
        opts: {
            lightMode: 'normal'
        },
        description: 'Flow fields overlaid with various markers, with more complex colors and variation'
    },

    {
        name: 'Bloom Field',
        renderer: 'field',
        opts: {
            lightMode: 'bloom'
        },
        description: 'A flow field with bloom lighting'
    },



// Field Shape


// Trails

    {
        name: 'Trails',
        renderer: 'trails',
        opts: {
            fieldNoise: 'none'
        },
        description: 'Tracing trails through flow fields'
    },

    {
        name: 'Rough Trails',
        renderer: 'trails',
        opts: {
            fieldNoise: 'med'
        },
        description: 'Tracing trails with noisy wiggles'
    },


// Bands

    {
        name: 'Bands',
        renderer: 'bands',
        opts: {

        },
        description: 'Based on a design by Erik Nitsche for a Beethoven album'
    },

// Fragments

    {
        name: 'Fragments',
        renderer: 'fragments',
        opts: {

        },
        description: 'Based on painted plywood art FF24 by @plusminusdrei / plusminus3.com'
    },

// Waves

    {
        name: 'Waves',
        renderer: 'waves',
        opts: {

        },
        description: 'Layers of waves with floating shapes'
    },

// Grads

    {
        name: 'Grads',
        renderer: 'grads',
        opts: {

        },
        description: 'Bands filled with gradients'
    },


// Doodle

    {
        name: 'Doodle',
        renderer: 'doodle',
        opts: {

        },
        description: 'Scribbled shapes fill the space, based on an illustration by Amy Goodchild'
    },

// Pillars

    {
        name: 'Pillars',
        renderer: 'pillars',
        opts: {

        },
        description: 'Pillars rise and fall'
    },

// Rings

    {
        name: 'Rings',
        renderer: 'rings',
        opts: {

        },
        description: 'Based on Camille Roux\'s Rotating Systems series'
    },

// Plants

    {
        name: 'Plants',
        renderer: 'plants',
        opts: {

        },
        description: 'Branches, buds, and flowers, with varying details'
    },

// Scales

    {
        name: 'Scales',
        renderer: 'scales',
        opts: {
            style: 'fields'
        },
        description: 'Overlapping scales in various patterns'
    },

// Sweater

    {
        name: 'Sweater',
        renderer: 'sweater',
        opts: {

        },
        description: 'Radial checkered rings with donegal flecks'
    },

// Tricycles

    {
        name: 'Tricycles',
        renderer: 'tricycles',
        opts: {

        },
        description: 'Linked sets of triangles define linked circles over a patterned ground'
    },

// Weave




];

export default collection;