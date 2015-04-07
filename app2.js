var util = require('util');
var SerialPort = require('serialport').SerialPort;
var xbee_api = require('xbee-api');
var request = require('request');
var commands = require('./constants/commands');
var events = require('./constants/events');
var config = require('./config');
var tools = require('./libs/tools');
var WebSocket = require('ws');

var C = xbee_api.constants;
var socket;

var xbeeAPI = new xbee_api.XBeeAPI({
    api_mode: 1
});

var serialport = new SerialPort("/dev/ttyAMA0", {
    baudrate: 9600,
    parser: xbeeAPI.rawParser()
});

var handleMessage = function(data){	
   console.log(msg);

   switch(data.event){
   	case events.lock_lock_command: return serialport.write(xbeeAPI.buildFrame(commands.LOCK));
   	case events.lock_unlock_command: return serialport.write(xbeeAPI.buildFrame(commands.UNLOCK));
   }
}

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
	
    var password = tools.crypto.symmetric.encrypt(config.registration_password, config.registration_algorithm, config.registration_symmetric_key);

    request.get({
	url: 'http://kiwi.t.proxylocal.com/rest/lock/register?client_id=dev&serial=' + config.lock_serial + '&register=true&location[0]=0&location[1]=0&password=' + password
    }, function(err, res, body){
	if(err) return console.error(error);
	body = JSON.parse(body);
	if(body.status) return console.error(body.msg);
	request.get({
          url: 'http://kiwi.t.proxylocal.com/rest/socket/open?client_id=dev&action=lock&serial=' + config.lock_serial
        }, function(err, res, body) {
		if(err) return console.error(error);
		body = JSON.parse(body);
  		if(body.status) return console.error(body.msg);
                socket = new WebSocket('ws://kiwi.t.proxylocal.com/socket?action=lock&secret=' + body.data.secret)
		socket.onmessage = handleMessage;
        });
    });
});

serialport.on('data', function (data) {
    console.log('data received: ' + data);
});


// All frames parsed by the XBee will be emitted here
xbeeAPI.on("frame_object", function (frame) {
    console.log(">>", frame);
});