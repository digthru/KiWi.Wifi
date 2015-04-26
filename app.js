var power_led = require('./io/led')(21);
var conn_led = require('./io/led')(26);
var socket = require('./io/socket')();
var config = require('./config');
var xbee = require('./io/xbee.serial')(config.xbee_destination_64);
var events = require('./constants/events');
var process_end, retry_timeout;

xbee.on('error', function (err) {
    console.error(err);
    conn_led.blink(500);
});

xbee.on('close', function(){
	console.log('XBee closed');
});

xbee.on('data.serial', function (msg) {
    console.log('data.serial: ' + msg);
});

xbee.on('frame', function (frame) {
    console.log('frame: ' + JSON.stringify(frame));
});

xbee.on('open', function(){
console.log('whatsup2');
	console.log('XBee opened');
});

xbee.on('data', function (msg) {
    console.log('data: ' + msg);
	conn_led.on();
	switch(msg){
		case 'lock': return socket.send({event: events.lock_lock_command_success, locked: true}); 
		case 'unlock': return socket.send({event: events.lock_unlock_command_success, locked: false}); 
	}
});

socket.on('connect', function () {
    console.log('Socket connnected');
    socket.bounce();
    conn_led.on();
});

socket.on('disconnect', function () {
    console.log('Socket disconnnected');
    if(!process_end) {
		console.log('Socket retrying in 5 seconds');
		clearTimeout(retry_timeout);
		retry_timeout = setTimeout(socket.connect, 5000);
	}
});

socket.on('error', function (err) {
    console.error(err);
    conn_led.blink(500);
    if(!process_end) {
		console.log('Socket retrying in 5 seconds');
		clearTimeout(retry_timeout);
		retry_timeout = setTimeout(socket.connect, 5000);
	}
});

socket.on('message', function (data) {
    console.log(data);
    
    conn_led.blink(500);
    setTimeout(led.on, 1500);
    
    switch (data.event) {
        case events.lock_lock_command:
			xbee.write('lock');
            break;
        case events.lock_unlock_command:
			xbee.write('unlock');
            break;
        case events.connected:
			xbee.write('request');
            break;
    }
});

power_led.on();
socket.connect();
xbee.open();

process.on('SIGINT', function () {
	process_end = true;
    xbee.close();
    socket.disconnect();
    setTimeout(process.exit, 800);
});
