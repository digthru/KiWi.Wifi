var util = require('util');
var SerialPort = require('serialport').SerialPort;
var xbee_api = require('xbee-api');
var C = xbee_api.constants;
var EventEmitter = require('events').EventEmitter;

module.exports = function XBee() {
    var self = this;
    var xbeeAPI = new xbee_api.XBeeAPI({
        api_mode: 2
    });

    var serialport;

    this.connect = function () {
        serialport = new SerialPort("/dev/ttyAMA0", {
            baudrate: 9600,
            parser: xbeeAPI.rawParser()
        });

        serialport.on('open', function () {
            self.emit('open');
        });

        serialport.on('data', function (data) {
            self.emit('data', data);
        });

        serialport.on('error', function (data) {
            self.emit('error', data);
        });

        xbeeAPI.on("frame_object", function (frame) {
            self.emit('frame_object', frame);
        });
    };

    this.disconnect = function () {
        serialport = undefined;
    };

    this.write = function (frame) {
        if (serialport) serialport.write(xbeeAPI.buildFrame(frame));
    }
};

util.inherits(XBee, EventEmitter);