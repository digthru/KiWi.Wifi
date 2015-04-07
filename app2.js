var util = require('util');
var SerialPort = require('serialport').SerialPort;
var xbee_api = require('xbee-api');
var request = require('request');
// FIXME normalize variable names
var commands = require('./constants/commands');
var events = require('./constants/events');
var config = require('./config');
var tools = require('./libs/tools');
var WebSocket = require('ws');

var C = xbee_api.constants;
var socket;

var handleMessage = function (msg) {
    var data = JSON.parse(msg.data);

    console.log(data);

    switch (data.event) {
        case events.lock_lock_command:
            if (config.production) return serialport.write(xbeeAPI.buildFrame(commands.LOCK));
            else console.log("locked");
            socket.send(JSON.stringify({event: events.lock_lock_command_success, locked: true}));
            break;
        case events.lock_unlock_command:
            if (config.production) return serialport.write(xbeeAPI.buildFrame(commands.UNLOCK));
            else console.log("unlocked");
            socket.send(JSON.stringify({event: events.lock_unlock_command_success, locked: false}));
            break;
        case events.connected:
            socket.send(JSON.stringify({event: events.lock_manual, locked: true}));
            break;
    }
}

var createSocket = function () {
    var password = tools.crypto.symmetric.encrypt(config.registration_password, config.registration_algorithm, config.registration_symmetric_key);

    request.get({
        url: 'http://' + config.domain + '/rest/socket/open?client_id=dev&action=lock&serial=' + config.lock_serial
    }, function (err, res, body) {
        if (err) return console.error(error);
        body = JSON.parse(body);
        if (body.status) return console.error(body.msg);
        socket = new WebSocket('ws://' + config.domain + '/socket?action=lock&secret=' + body.data.secret + '&password=' + password)
        socket.onmessage = handleMessage;
    });
}

if (config.production) {
    var xbeeAPI = new xbee_api.XBeeAPI({
        api_mode: 1
    });

    var serialport = new SerialPort("/dev/ttyAMA0", {
        baudrate: 9600,
        parser: xbeeAPI.rawParser()
    });

    serialport.on("open", function () {
        var frame_obj = {
            type: 0x10,
            id: 0x01,
            destination64: "0013A20040C1B8B4",
            broadcastRadius: 0x00,
            options: 0x00,
            data: "lock"
        };

        serialport.write(xbeeAPI.buildFrame(frame_obj));

        console.log('Sent to serial port.');

        createSocket();

    });

    serialport.on('data', function (data) {
        console.log('data received: ' + data);
    });


// All frames parsed by the XBee will be emitted here
    xbeeAPI.on("frame_object", function (frame) {
        console.log(">>", frame);
    });
} else {
    createSocket();
}