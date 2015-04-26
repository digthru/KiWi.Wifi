var gpio = require("pi-gpio");

gpio.open(26, "output", function(err) {     // Open pin 16 for output
    gpio.write(26, 1, function() {          // Set pin 16 high (1)
        // gpio.close(16);                     // Close pin 16
    });
})