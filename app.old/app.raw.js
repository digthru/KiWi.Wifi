var util = require('util');
var SerialPort = require('serialport').SerialPort;
var xbee_api = require('xbee-api');

var C = xbee_api.constants;

var xbeeAPI = new xbee_api.XBeeAPI({
    api_mode: 2
});

var serialport = new SerialPort("/dev/ttyAMA0", {
    baudrate: 9600,
    parser: xbeeAPI.rawParser()
});

serialport.on("open", function () {
    var frame_obj = {
        type: 0x10, 
        id: 0x01, 
        destination64: "0013A200408A20BA",
        broadcastRadius: 0x00,
        options: 0x00, 
        data: "lock" 
    };
    
    serialport.write(xbeeAPI.buildFrame(frame_obj));

    setTimeout(function(){
     console.log('unlock');
     serialport.write(xbeeAPI.buildFrame({
        type: 0x10, 
        id: 0x01, 
        destination64: "0013A200408A20BA",
        broadcastRadius: 0x00,
        options: 0x00, 
        data: "unlock" 
    }));
    }, 10000);
    console.log('Sent to serial port.');
});

serialport.on('data', function (data) {
    console.log('data received: ' + data);
});


// All frames parsed by the XBee will be emitted here
xbeeAPI.on("frame_object", function (frame) {
    console.log(">>", frame);
});