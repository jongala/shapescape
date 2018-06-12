export function drawCircle(ctx, x, y, r, opts) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.arc(0, 0, r, 0, 2 * Math.PI, false);
    ctx.closePath();
    ctx.restore();

    ctx.fillStyle = opts.fill;
    ctx.strokeStyle = opts.stroke;
    ctx.fill();
    opts.stroke && ctx.stroke();

    return ctx;
}

export function drawRing(ctx, x, y, r, opts) {
    var inner = r * 0.5;

    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.arc(0, 0, r, 0, 2 * Math.PI, false);
    // cutout
    ctx.moveTo(inner, 0);
    ctx.arc(0, 0, inner, 0, 2 * Math.PI, true);
    ctx.closePath();
    ctx.restore();

    ctx.fillStyle = opts.fill;
    ctx.strokeStyle = opts.stroke;
    ctx.fill();
    opts.stroke && ctx.stroke();
    return ctx;
}

/*export function drawTriangle(ctx, x, y, size, opts) {
    var h = 2 * size * Math.cos(Math.PI / 6);

    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.moveTo(0, -h / 2);
    ctx.lineTo(size, h / 2);
    ctx.lineTo(-size, h / 2);
    ctx.closePath();
    ctx.restore();

    ctx.fillStyle = opts.fill || getFill(ctx, opts.palette, 0, 0 + size / 2, size, opts.skew);
    ctx.fill();

    return ctx;
}*/

export function drawSquare(ctx, x, y, d, opts) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.rect(-d, -d, d * 2, d * 2);
    ctx.closePath();
    ctx.restore();

    ctx.fillStyle = opts.fill || getFill(ctx, opts.palette, 0, 0 + d / 2, d);
    ctx.fill();

    return ctx;
}

export function drawRect(ctx, x, y, d, opts) {
    var gl = 0.6180339;
    ctx.save();
    ctx.translate(x, y);
    if (opts.angle) {
        ctx.rotate(opts.angle);
    }

    ctx.beginPath();
    ctx.rect(-d, -d * gl, d * 2, d * 2 * gl);
    ctx.closePath();
    ctx.restore();

    ctx.fillStyle = opts.fill || getFill(ctx, opts.palette, 0, 0 + d / 2, d);
    ctx.fill();
    return ctx;
}

export function drawBox(ctx, x, y, d, opts) {
    var r = d * 0.4;

    ctx.save();
    ctx.translate(x, y);
    if (opts.angle) {
        ctx.rotate(opts.angle);
    }
    ctx.beginPath();
    ctx.moveTo(-d, -d);
    ctx.lineTo(+d, -d);
    ctx.lineTo(+d, +d);
    ctx.lineTo(-d, +d);
    // cutout
    ctx.moveTo(-r, -r);
    ctx.lineTo(-r, +r);
    ctx.lineTo(+r, +r);
    ctx.lineTo(+r, -r);

    ctx.closePath();
    ctx.restore();

    ctx.fillStyle = opts.fill || getFill(ctx, opts.palette, 0, 0 + d / 2, d);
    ctx.fill();

    return ctx;
}

function _drawPolygon(SIDES, SCALE) {
    SCALE = SCALE || 1;

    return function(ctx, x, y, d, opts) {
        ctx.save();
        ctx.translate(x, y);
        if (opts.angle) {
            ctx.rotate(opts.angle);
        }

        var r = d * SCALE;
        var a = Math.PI * 2 / SIDES;
        function _x(theta) {
            return r * Math.cos(theta - Math.PI / 2);
        }
        function _y(theta) {
            return r * Math.sin(theta - Math.PI / 2);
        }

        ctx.beginPath();
        ctx.moveTo(_x(a * 0), _y(a * 0));
        for (var i = 1; i <= SIDES; i++) {
            ctx.lineTo(_x(a * i), _y(a * i));
        }
        ctx.closePath();
        ctx.restore();

        ctx.fillStyle = opts.fill || getFill(ctx, opts.palette, 0, 0 + d / 2, d);
        ctx.fill();
        ctx.strokeStyle = opts.stroke;
        opts.stroke && ctx.stroke();

        return ctx;
    };
}

export var drawTriangle = _drawPolygon(3, 1.2);
export var drawPentagon = _drawPolygon(5, 1.1);
export var drawHexagon = _drawPolygon(6, 1.05);