var config = require('./../config');
var xbee = require('./../io/xbee.serial')(config.xbee_destination_64);
var toggle = 0;

xbee.on('error', function (err) {
    console.error('error: ' + err);
});

xbee.on('data', function (msg) {
    console.log('data: ' + msg);
	setTimeout(function(){
		console.log('Sending...');
		xbee.write(toggle++ % 2 ? 'unlock' : 'lock');
	}, 4000);
});

xbee.on('data.serial', function (msg) {
    console.log('data.serial: ' + msg);
});

xbee.on('frame', function (frame) {
    console.log('frame: ' + JSON.stringify(frame));
});

xbee.on('open', function(){
	console.log('Sending...');
	xbee.write('lock');
});

xbee.on('close', function(){
	console.log('XBee connection closed');
});

xbee.open();

process.on('SIGINT', function () {
    xbee.close();
});
