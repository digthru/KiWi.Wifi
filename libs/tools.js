var crypto = require('crypto');
var self = module.exports;

module.exports.crypto = {
    symmetric: {
        decrypt: function (text, algo, pass) {
            var decipher = crypto.createDecipher(algo, pass);
            return decipher.update(text, 'hex', 'utf8') + decipher.final('utf8');
        },
        encrypt: function (text, algo, pass) {
            var cipher = crypto.createCipher(algo, pass);
            return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
        }
    }
};

exports.dfire = function (callback, args) {

    if (typeof callback !== 'function') {
        return;
    }

    if (typeof args.reverse === 'undefined') {
        return;
    }

    process.nextTick(function () {
        callback.apply(this, args);
    });
};

exports.fire = function (callback) {

    if (typeof callback !== 'function') {
        return;
    }

    var args = exports.array.args(arguments);
    args.splice(0, 1);

    process.nextTick(function () {
        callback.apply(this, args);
    });
};


exports.invoke = function (c, callback) {

    if (typeof callback !== 'function') {
        return;
    }

    var args = exports.array.args(arguments);
    var sliced = args.splice(0, 2);

    process.nextTick(function () {
        callback.apply(sliced[0], args);
    });
};

module.exports.hash = function (str) {

    if (typeof str !== 'string') {
        return 0;
    }

    var hash = 0,
        i, char;

    if (str.length === 0) {
        return hash;
    }

    var l;

    for (i = 0, l = str.length; i < l; i++) {
        char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }

    return hash;
};