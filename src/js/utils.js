// random Array member
export function randItem(arr) {
    return arr[Math.floor(arr.length * Math.random())];
}

export function randomInRange(min, max) {
    return (min + (max - min) * Math.random());
}

export function setAttrs(el, attrs) {
    var a;
    if (el && el.setAttribute) {
        for (a in attrs) {
            if (attrs.hasOwnProperty(a)) {
                el.setAttribute(a, attrs[a]);
            }
        }
    }
}
