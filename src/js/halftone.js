// adapted from rcnv: https://gist.github.com/ucnv/249486

export default function halftoneCanvas(sourceCanvas, dotSize, palette) {
    var interval = dotSize || 8;
    var dotOpacity = 1;//0.66;
    var colors = [
        {
            name: 'y',
            color: `rgba(255, 255, 0, ${dotOpacity})`,
            angle: 108
        },
        {
            name: 'm',
            color: `rgba(255, 0, 255, ${dotOpacity})`,
            angle: 162
        },
        {
            name: 'c',
            color: `rgba(0, 255, 255, ${dotOpacity})`,
            angle: 90
        },
        {
            name: 'k',
            color: `rgba(0, 0, 0, ${dotOpacity})`,
            angle: 45
        }
    ];

    console.log('halftoning', interval, colors);

    var displayCanvas = document.createElement('canvas');


    var w = displayCanvas.width = sourceCanvas.width;
    var h = displayCanvas.height = sourceCanvas.height;

    var display = displayCanvas.getContext('2d');
    display.globalCompositeOperation = 'multiply';

    var drawColor = function(color) {
        var rad = (color.angle % 90) * Math.PI / 180;
        var sinr = Math.sin(rad), cosr = Math.cos(rad);
        var ow = w * cosr + h * sinr;
        var oh = h * cosr + w * sinr;
        // scratch
        var scratchCanvas = document.createElement('canvas');
        scratchCanvas.width = ow + interval;
        scratchCanvas.height = oh + interval;
        let scratch = scratchCanvas.getContext('2d');
        scratch.translate(0, w * sinr);
        scratch.rotate(-rad);
        scratch.drawImage(sourceCanvas, 0, 0);
        // positioning
        display.translate(w * sinr * sinr, -w * sinr * cosr);
        display.rotate(rad);
        display.fillStyle = color.color;
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
                    if(color.name != 'k' && k == 255) sum += 0;
                    else if(color.name == 'k') sum += k / 255;
                    else if(color.name == 'c') sum += (r - k) / (255 - k);
                    else if(color.name == 'm') sum += (g - k) / (255 - k);
                    else if(color.name == 'y') sum += (b - k) / (255 - k);
                    count++;
                }
                if(count == 0) continue;
                var rate = sum / count;
                /*display.save();
                display.beginPath();
                display.moveTo(x, y);
                display.lineTo(x + interval, y);
                display.lineTo(x + interval, y + interval);
                display.lineTo(x, y + interval);
                display.clip();*/
                display.beginPath();
                display.arc(x + (interval / 2), y + (interval / 2), Math.SQRT1_2 * interval * rate, 0, Math.PI * 2, true);
                display.fill();
                // display.restore();
            }
        }
        // reset
        display.rotate(-rad);
        display.translate(-w * sinr * sinr, w * sinr * cosr);
    }
    colors.forEach(drawColor);

    return displayCanvas;
}