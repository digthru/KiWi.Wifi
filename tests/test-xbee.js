var xbee = require('./../io/xbee')();

xbee.on('error', function (err) {
    console.error(err);
});

xbee.on('exit', function (code) {
    console.error('Terminated: ' + code);
});

xbee.on('rx', function (msg) {
    console.log(msg);
});

xbee.write('unlock');

process.on('SIGINT', function () {
    xbee.free();
});