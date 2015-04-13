var noble = require('noble');


module.exports = function Blueooth() {

    var self = this;

    this.discover = function () {
        noble.on('stateChange', function (state) {
            if (state === 'poweredOn') {
                noble.startScanning();
            } else {
                noble.stopScanning();
            }
        });

        noble.on('discover', function (peripheral) {
            peripheral.connect(function(error) {
                console.log('connected to peripheral: ' + peripheral.uuid);
            });
        })
    };

    return this;
}