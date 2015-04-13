var yellow_led = require('./io/led')(26);
var socket = require('./io/socket')();
var xbee = require('./io/xbee')();
var commands = require('./constants/commands');
var led_on_message;

socket.on('error', function (err) {
    console.error(err);
    yellow_led.blink(500);
    setTimeout(socket.connect, 5000);
});

xbee.on('data', function (data) {
    console.log(data);
});

xbee.on('frame', function (frame) {
    console.log(frame);
});

xbee.on('error', function (err) {
    console.error(err);
    setTimeout(xbee.connect, 5000);
});

socket.on('open', function(){
    yellow_led.on();
});

socket.connect();

socket.on('message', function (data) {

    yellow_led.blink(200);
    clearTimeout(led_on_message);
    led_on_message = setTimeout(yellow_led.on, 2000);

    switch (data.event) {
        case events.lock_lock_command:
            xbee.write(commands.LOCK);
            socket.send({event: events.lock_lock_command_success, locked: true});
            break;
        case events.lock_unlock_command:
            xbee.write(commands.UNLOCK);
            socket.send({event: events.lock_unlock_command_success, locked: false});
            break;
        case events.connected:
            xbee.write(commands.STATUS);
            socket.send({event: events.lock_manual, locked: true});
            break;
    }
});

process.on('SIGINT', function () {
    console.log('Terminating...');
    yellow_led.off();
    yellow_led.free();
    process.exit();
});