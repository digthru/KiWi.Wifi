var Gpio = require('onoff').Gpio;

var emp = function(){};

function Led(pin) {

    var led;

    try {
        pin = parseInt(pin);

        led = new Gpio(pin, 'out');
    } catch (e) {
        throw new Error('Provide valid pin number');
    }

    var blink_interval_id = 0;
    var blink_speed = 0;

    this.blink = function (speed) {
        if (blink_interval_id && speed == blink_speed) return;
	blink_speed = speed;
        clearInterval(blink_interval_id);
        blink_interval_id = setInterval(function () {
            if (led) led.write(led.readSync() === 0 ? 1 : 0, emp);
        }, speed || 500);
    }

    this.free = function () {
        if (led) {
            led.unexport();
            led = undefined;
        }
    }

    this.isOn = function () {
        if (led) return led.readSync();
        else return 0;
    }

    this.off = function () {
        clearInterval(blink_interval_id);
	blink_speed = 0;
        if (led) led.write(0, emp);
    }

    this.on = function () {
        clearInterval(blink_interval_id);
	blink_speed = 0;
        if (led) led.write(1, emp);
    }

    return this;
};

module.exports = Led;