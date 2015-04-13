var wifi;
var blueooth;
var socket;
var red_led;
var yellow_led;

var createSocket = function () {
    socket.connect(function (err) {
        if (err) {
            console.error(err);
            return red_led.blink(200);
        }

        red_led.off();
        yellow_led.on();

        socket.on('message', messageHandler);
        socket.on('disconnect', createSocket);
    });
};

bluetooth.discover(function (peripheral) {
    if (peripheral === 'mobile') {
        peripheral.connect(function (err) {
            if (err) {
                console.error(err);
                return red_led.on();
            }

            red_led.off();
            console.log('connected to peripheral: ' + peripheral.uuid);
            wifi.connect(ssid, password, function (err) {
                if (err) return;
                createSocket();
            });
        });
    }
});

if (!wifi.connected()) {
    createSocket();
}