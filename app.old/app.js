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
var serialport, xbeeAPI;
var Gpio = require('onoff').Gpio;
var led = new Gpio(26, 'out');

var turnOnLED = function () {
    led.writeSync(1);
};

var freeLED = function () {
    led.unexport();
};

var turnOffLED = function () {
    led.writeSync(0);
};

var _startBlinking = 0;
var startBlinking = function (rate) {
    if (_startBlinking) return;
    _startBlinking = setInterval(function () {
        led.writeSync(led.readSync() === 0 ? 1 : 0)
    }, rate);
}

var stopBlinking = function () {
    clearTimeout(_startBlinking);
    _startBlinking = 0;
}

var _handleMessage;
var handleMessage = function (msg) {
    var data = JSON.parse(msg.data);

    console.log(data);

    startBlinking(200);
    clearTimeout(handleMessage);
    handleMessage = setTimeout(function () {
        stopBlinking();
        turnOnLED();
    }, 5000);

    switch (data.event) {
        case events.lock_lock_command:
            if (config.production && serialport) console.log('here');
            if (config.production && serialport) serialport.write(xbeeAPI.buildFrame(commands.LOCK));
            else console.log("locked");
            socket.send(JSON.stringify({event: events.lock_lock_command_success, locked: true}));
            createXBee(1);
            break;
        case events.lock_unlock_command:
            if (config.production && serialport) console.log('here');
            if (config.production && serialport) serialport.write(xbeeAPI.buildFrame(commands.UNLOCK));
            else console.log("unlocked");
            socket.send(JSON.stringify({event: events.lock_unlock_command_success, locked: false}));
            createXBee(1);
            break;
        case events.connected:
            socket.send(JSON.stringify({event: events.lock_manual, locked: true}));
            break;
    }
}

var retryConnection = function (err) {
    startBlinking(500);
    console.error(err);
    console.error('Trying again 5 seconds');
    setTimeout(createSocket, 5000);
};

var createSocket = function () {

    console.log('Creating socket');

    var password = tools.crypto.symmetric.encrypt(config.registration_password, config.registration_algorithm, config.registration_symmetric_key);

    request.get({
        url: 'http://' + config.domain + '/rest/socket/open?client_id=dev&action=lock&serial=' + config.lock_serial
    }, function (err, res, body) {
        if (err) return retryConnection(err);
        try {
            body = JSON.parse(body);
        } catch (e) {
            return retryConnection(e);
        }
        if (body.status) return console.error(body.msg);
        socket = new WebSocket('ws://' + config.domain + '/socket?action=lock&secret=' + body.data.secret + '&password=' + password)
        socket.onmessage = handleMessage;
        socket.onclose = retryConnection;
        socket.onerror = retryConnection;

        stopBlinking();
        turnOnLED();
    });
};

var createXBee = function (f) {
    xbeeAPI = new xbee_api.XBeeAPI({
        api_mode: 2
    });

    serialport = new SerialPort("/dev/ttyAMA0", {
        baudrate: 9600,
        parser: xbeeAPI.rawParser()
    });

    if (!f) serialport.on("open", createSocket);
    else serialport.on("open", function () {
        console.log('ready');
    });

    serialport.on('data', function (data) {
        console.log('data received: ' + data);
    });

    // All frames parsed by the XBee will be emitted here
    xbeeAPI.on("frame_object", function (frame) {
        console.log(">>", frame);
    });
};

turnOnLED();

if (config.production) {
    createXBee();
} else {
    createSocket();
}

process.on('SIGINT', function () {
    console.log('Terminating...');
    turnOffLED();
    freeLED();
    process.exit();
});