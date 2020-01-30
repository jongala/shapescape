// Fast scattering of random-looking points

export default function hexScatter(spacing, w, h, loosen) {
    loosen = loosen || 1.25;

    var TWOPI = Math.PI * 2;

    var gridSize = spacing * loosen;
    var R = spacing/2;
    var cellR = gridSize - R;
    var hexW = 2 * 0.8660 * gridSize;
    var hexH = 1.5 * gridSize;
    var cols = Math.ceil(w / hexW) + 1;
    var rows = Math.ceil(h / hexH) + 1;
    var row; // current row in loops
    var col; // current col in loops

    function randomInRange(min, max) {
      return min + Math.random() * (max - min);
    }

    // Generates hexagon center-points for non-overlapping tiling
    function getTiledLayout(w, h, scale) {
        var points = [];
        var hexW = 2 * scale * 0.8660;
        var hexH = scale * 1.5;
        var rows = Math.ceil(h/hexH) + 1;
        var cols = Math.ceil(w/hexW) + 1;
        var count = rows * cols;
        var offset;
        var row;

        for (var i = 0 ; i < count ; i++) {
            row = Math.floor(i / cols);
            offset = (row % 2) ? (- scale * 0.8660 ) : 0;
            points.push([
                i % cols * hexW + offset,
                row * hexH
            ]);
        }

        return points;
    }

    function avgPoints(points) {
        var avg=[0, 0];
        avg[0] = points.reduce(function (m, v) { return m + v[0]; }, 0) / points.length;
        avg[1] = points.reduce(function (m, v) { return m + v[1]; }, 0) / points.length;
        return avg;
    }

    function isTooClose(p1, p2, d) {
        var dx = p2[0] - p1[0];
        var dy = p2[1] - p1[1];
        return ((dx * dx + dy * dy) < (d * d));
    }

    function checkSet(p, others, d) {
        var ok = true;
        others.forEach(function(o) {
            ok = ok && !isTooClose(p, o, d)
        });
        return ok;
    }

    function circumcenter(a, b, c) {
        var ax = a[0];
        var ay = a[1];
        var bx = b[0];
        var by = b[1];
        var cx = c[0];
        var cy = c[1];

        // midpoints
        var midAB = avgPoints([a, b]);
        var midAC = avgPoints([a, c]);

        // slopes
        var mAB = (by - ay) / (bx - ax);
        var mAC = (cy - ay) / (cx - ax);
        // invert for perpendicular
        mAB = -1/mAB;
        mAC = -1/mAC;

        // offsets
        var bAB = midAB[1] - mAB * midAB[0];
        var bAC = midAC[1] - mAC * midAC[0];

        var CCx;
        var CCy;

        // algebra!
        CCx = (bAC - bAB) / (mAB - mAC);
        CCy = mAB * CCx + bAB;

        var dx = CCx - ax;
        var dy = CCy - ay;
        var r = Math.sqrt(dx * dx + dy * dy);

        return {x: CCx, y: CCy, r: r};
    }



    var layout = getTiledLayout(w, h, gridSize);
    // [rows…][cols]
    var points = [];
    var topTriangles = [];

    var renderCount = rows * cols; // track points and repacking.

    var out = []; // output points

    var attempts = 0;

    // placement vars
    var cc; // circumcenter from points
    var packed = []; // coords from cc
    var tricc; // circumcenter from packed top triangles
    var tripacked; // coords from tricc

    var start = new Date().getTime();

    layout.forEach(function(p, i) {
        var x = p[0];
        var y = p[1];

        // the point
        var a = randomInRange(0, TWOPI);
        var v = randomInRange(0, cellR);
        var px = x + v * Math.cos(a);
        var py = y + v * Math.sin(a);

        points.push([px, py]);
        out.push([px, py]);

        attempts++;
    });


    // now pack points in top triangles
    var grid = points;
    for (var i = 0 ; i < grid.length - cols ; i++) {
        row = Math.floor(i / cols);

        if (i % cols >= cols - 1) {
            continue;
        }

        var nextRowColOffset = (row % 2) ? 0 : 1;
        // top triangles: get points from grid
        var p1 = grid[i];
        var p2 = grid[i + 1];
        var p3 = grid[i + cols +  nextRowColOffset];

        cc = circumcenter(p1, p2, p3);
        packed = [cc.x, cc.y];
        attempts++;

        topTriangles[i] = packed;

        if (cc.r > spacing) {
            out.push(packed);
            renderCount++;
        }
    }

    // now pack points in bottom triangles
    for (var i = cols ; i < grid.length - 1 ; i++) {
        row = Math.floor(i / cols);

        var odd = row % 2; // odd or even row
        var step = i % cols; // step within a row

        if (step >= cols - 1) {
            continue;
        }

        var colOffset = odd ? 0 : 1;

        var p1 = grid[i];
        var p2 = grid[i + 1];
        var p3 = grid[i - cols + colOffset];

        cc = circumcenter(p1, p2, p3);
        packed = [cc.x, cc.y];
        attempts++;

        var pp1;
        var pp2;
        var pp3;

        if (odd) {
            pp1 = topTriangles[i - cols - 1 ];
            pp2 = topTriangles[i - cols - 0 ];
            pp3 = topTriangles[i];
        } else {
            pp1 = topTriangles[i - cols + 0 ];
            pp2 = topTriangles[i - cols + 1 ];
            pp3 = topTriangles[i];
        }

        var hasTriangles = pp1 && pp2 && pp3;

        if (hasTriangles) {
            tricc = circumcenter(pp1, pp2, pp3);
            tripacked = [tricc.x, tricc.y];
            attempts++;
        }

        // check circumcenter against its component points
        var ccOK = (cc.r > spacing);
        // now check against the neighboring packed points
        if (ccOK && hasTriangles) {
            ccOK = checkSet(packed, [pp1, pp2, pp3], spacing);
        }

        var tripOK = false;
        if (tricc && !ccOK) {
            tripOK = (tricc.r > spacing);

            if (tripOK) {
                tripOK = checkSet(tripacked, [p1,p2,p3], spacing);
            }
        }


        if (ccOK) {
            out.push(packed);
            renderCount++;
        }

        if (tricc && !ccOK) {
            if (tripOK) {
                out.push(tripacked);
                renderCount++;
            }
        }

        if (!ccOK && !tripOK && tricc && hasTriangles) {
            packed = avgPoints([packed, tripacked]);
            attempts++;
            ccOK = checkSet(packed, [p1, p2, p3, pp1, pp2, pp3], spacing);
            if (ccOK) {
                out.push(packed);
                renderCount++;
            }
        }
    }

    var count  = out.length;

    console.log(`${count} samples from ${attempts} attempts, ` + (count/attempts * 100).toPrecision(2) + '% efficiency');

    return out;
}
