var config = require('./../config');
var xbee = require('./../io/xbee.serial')(config.xbee_destination_64);

xbee.on('error', function (err) {
    console.error('error: ' + err);
});

xbee.on('data', function (msg) {
    console.log('data: ' + msg);
	xbee.write('unlock');
});

xbee.on('data.serial', function (msg) {
    console.log('data.serial: ' + msg);
});

xbee.on('frame', function (frame) {
    console.log('frame: ' + JSON.stringify(frame));
});

xbee.on('open', function(){
	xbee.write('unlock');
});

xbee.on('close', function(){
	console.log('XBee connection closed');
});

xbee.connect();

process.on('SIGINT', function () {
    xbee.close();
});
