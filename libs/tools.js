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