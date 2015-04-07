var Gpio = require('onoff').Gpio;


module.exports = function Led(pin) {
    var led = new Gpio(pin, 'out');

    var blink_interval_id = 0;
    var blink_speed = 0;

    this.blink = function (speed) {
        if (blink_interval_id && speed === blink_speed) return;
        clearInterval(blink_interval_id);
        blink_interval_id = setInterval(new function () {
            if (led) led.writeSync(led.readSync() === 0 ? 1 : 0);
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
        if (led) led.writeSync(0);
    }

    this.on = function () {
        clearInterval(blink_interval_id);
        if (led) led.writeSync(1);
    }
};