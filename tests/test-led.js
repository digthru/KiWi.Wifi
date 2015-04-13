var led = require('./../io/led')(26);

led.on();

setTimeout(led.blink, 3000);

process.on('SIGINT', function () {
    console.log('Turning off light...');
    led.off();
    led.free();
});