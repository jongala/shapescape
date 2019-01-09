// Waterline def schema
export const SCHEMA = {
        shapeName: '',
        shapeY: 0,
        shapeSize: 0,
        shapeMagnified: 0,
        shapeAngle: 0,
        shapeFill: {},
        underwaterShapeAlpha: 1,
        backgroundFill: {},

        surfaceLine: {
            fill: {},
            backAlpha: 1,
            backOffset: 0,
            backLine: [0, 0, 0, 0],
            frontLine: [0, 0, 0, 0]
        },
        sunBeams: {
            alpha: 1,
            beams: [0, 0]
        },

        waveSet: [
            {
                gradient: {start: [0,0], end: [0,0]},
                position: [0, 0, 0, 0],
                alpha: 1
            }
        ],

        edgeThickness: 0,
        edgeAlpha: 1,
        edgeBlendStops: [0.25, 0.75], // left half, right half

        spots: [{
            x: 0,
            y: 0,
            r: 1,
            alpha: 1
        }]

};
