/**
 * Make a map and return a function for checking if a key
 * is in that map.
 */
function makeMap (
    str,
    splitChar,
    expectsLowerCase,
) {
    var map = Object.create(null)
    var list = str.split(splitChar || ',')
    for (var i = 0; i < list.length; i++) {
        let [key, val] = list[i].split(':')
        map[key] = val || true
    }
    return expectsLowerCase
        ? function (val) { return map[val.toLowerCase()] }
        : function (val) { return map[val] }
}

/**
 * Check if val is a valid array index.
 */
function isValidArrayIndex(val) {
    var n = parseFloat(String(val));
    return n >= 0 && Math.floor(n) === n && isFinite(val);
}

// can we use __proto__?
var hasProto = "__proto__" in {};

/**
 * Remove an item from an array
 */
function remove(arr, item) {
    if (arr.length) {
        var index = arr.indexOf(item);
        if (index > -1) {
            return arr.splice(index, 1);
        }
    }
}

/**
 * Define a property.
 */
function def(obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
        value: val,
        enumerable: !!enumerable,
        writable: true,
        configurable: true
    });
}

/**
 * Check whether the object has the property.
 */
var hasOwnProperty = Object.prototype.hasOwnProperty;

function hasOwn(obj, key) {
    return hasOwnProperty.call(obj, key);
}

/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 */
function isObject(obj) {
    return obj !== null && typeof obj === "object";
}

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 */
var _toString = Object.prototype.toString;

function isPlainObject(obj) {
    return _toString.call(obj) === "[object Object]";
}

/**
 * Get the raw type string of a value e.g. [object Object]
 */
var _toString = Object.prototype.toString;

function toRawType(value) {
    return _toString.call(value).slice(8, -1);
}

/**
 * Mix properties into target object.
 */
function extend(to, _from) {
    for (var key in _from) {
        to[key] = _from[key];
    }
    return to;
}

export {
    def,
    makeMap,
    extend,
    remove,
    hasOwn,
    hasProto,
    isObject,
    isPlainObject,
    isValidArrayIndex
};