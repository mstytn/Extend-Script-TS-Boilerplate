// source/polyfills.ts

// Array.prototype.indexOf
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement: any, fromIndex?: number): number {
        if (this == null) throw new TypeError('"this" null veya undefined olamaz');
        var obj = Object(this);
        var len = obj.length >>> 0;
        if (len === 0) return -1;
        var n = (fromIndex == null) ? 0 : (fromIndex | 0);
        if (n >= len) return -1;
        var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
        while (k < len) {
            if (k in obj && obj[k] === searchElement) return k;
            k++;
        }
        return -1;
    };
}

// String.prototype.trim
if (!String.prototype.trim) {
    String.prototype.trim = function (): string {
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
}

// Object.keys
if (!Object.keys) {
    Object.keys = function (obj: any): string[] {
        var keys: string[] = [];
        for (var i in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, i)) {
                keys.push(i);
            }
        }
        return keys;
    };
}



export {};