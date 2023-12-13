import { randItem, randomInRange, randomInt} from '../utils';

const PI = Math.PI;

// Create a function which is a periodic transform of x, y
export function createTransform (rateMin = 0, rateMax = 1) {
    let rate1 = randomInRange(0, rateMax/2);
    let rate2 = randomInRange(0, rateMax/2);
    let rate3 = randomInRange(rateMax/2, rateMax);
    let rate4 = randomInRange(rateMax/2, rateMax);

    let phase1 = randomInRange(-PI, PI);
    let phase2 = randomInRange(-PI, PI);
    let phase3 = randomInRange(-PI, PI);
    let phase4 = randomInRange(-PI, PI);

    let c1 = randomInRange(0, 1);
    let c2 = randomInRange(0, 1);
    let c3 = randomInRange(0, 1);
    let c4 = randomInRange(0, 1);
    return (xnorm, ynorm) => {
        let t1 = Math.sin(xnorm * rate1 * 2 * PI + phase1);
        let t2 = Math.sin(ynorm * rate2 * 2 * PI + phase2);
        let t3 = Math.sin(xnorm * rate3 * 2 * PI + phase3);
        let t4 = Math.sin(ynorm * rate4 * 2 * PI + phase4);
        return (c1 * t1 + c2 * t2 + c3 * t3 + c4 * t4)/(c1 + c2 + c3 + c4);
    }
}

export function createSourceSinkTransform (count = 4) {
    let sources = [];

    while(count--) {
        let src = {
            strength: randomInRange(1, 20),
            sign: 1,
            x: randomInRange(-0.25, 1.25), // add some overscan
            y: randomInRange(-0.25, 1.25)
        }
        if (Math.random() > 0.9) { // occasionally make sinks instead of sources
            src.sign *= -1;
        }
        sources.push(src);
    }

    return {
        sources: sources,
        t: (xnorm, ynorm) => {
            let v = [0, 0]; // force vector to return

            sources.forEach((source) => {
                let rmin = source.strength / 1000; // magic number


                let dx = xnorm - source.x;
                let dy = ynorm - source.y;
                let _r = (dx * dx + dy * dy); // really r squared but that's what we want

                if(_r < rmin) {
                    _r = rmin;
                }; // min r

                let scalar = source.sign * source.strength/(_r);

                let _x = scalar * (dx);
                let _y = scalar * (dy);
                v[0] += _x;
                v[1] += _y;
            });

            return v;
        }
    }
}

export function opacityTransforms(maxLen) {
	return [
	    () => 1,
	    (_x, _y) => Math.abs(_y/_x)/maxLen,
	    (_x, _y) => (1 - Math.abs(_y/_x)/maxLen),
	    (_x, _y) => Math.abs(_x/_y), // hides verticals
	    (_x, _y) => Math.abs(_y/_x), // hides horizontals
	    (_x, _y) => (_x / _y),
	    (_x, _y) => (_y / _x),
	    (_x, _y) => (_y - _x),
	    (_x, _y) => (_x - _y)
	];
}