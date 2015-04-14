var socket = require('./io/socket')();
var xbee = require('./io/xbee')();
var events = require('./constants/events');
// var led = require('./io/led')(26);
var process_end, retry_timeout;

xbee.on('error', function (err) {
    console.error(err);
	// led.blink(200);
});

xbee.on('exit', function (code) {
    console.error('Terminated: ' + code);
	// led.on();
});

xbee.on('debug', function (msg) {
    console.log(msg);
});

xbee.on('rx', function (msg) {
    console.log(msg);
	// led.on();
});

socket.on('connect', function () {
    console.log('Socket connnected');
    socket.bounce();
	// led.on();
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
    // console.error(err);
	// led.blink(200);
    if(!process_end) {
		console.log('Socket retrying in 5 seconds');
		clearTimeout(retry_timeout);
		retry_timeout = setTimeout(socket.connect, 5000);
	}
});

socket.on('message', function (data) {
    console.log(data);
    
    // led.blink(200);
    // setTimeout(led.on, 1500);
    
    switch (data.event) {
        case events.lock_lock_command:
			xbee.write('lock');
            socket.send({event: events.lock_lock_command_success, locked: true});
            break;
        case events.lock_unlock_command:
			xbee.write('unlock');
            socket.send({event: events.lock_unlock_command_success, locked: false});
            break;
        case events.connected:
            socket.send({event: events.lock_manual, locked: true});
            break;
    }
});

setTimeout(socket.connect, 10000);

process.on('SIGINT', function () {
	process_end = true;
    xbee.free();
    socket.disconnect();
});
