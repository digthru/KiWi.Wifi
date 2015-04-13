var util = require('util');
var Emitter = require('./../libs/emitter');
var spawn = require('child_process').spawn;

function XBee() {
    var self = Emitter.attach(this);
    var child;
    var kill;

    var free = function () {
        clearTimeout(kill);
        if (child) {
            child.kill();
            child = undefined;
        }
    }

    this.write = function (command) {
        var stdout = '', stderr;

        free();

        child = spawn(__dirname + '/native/xbee', [command]);

        child.stdout.setEncoding('utf8');
        child.stderr.setEncoding('utf8');

        child.on('error', function (err) {
            self.emit('error', err);
        });

        child.stdout.on('data', function (data) {
            if (data.indexOf('This is router') > -1)
                self.emit('rx', data);
        });

        child.stderr.on('data', function (data) {
            self.emit('debug', data);
        });

        child.on('exit', function (code) {
            self.emit('exit', code);
        });

        kill = setTimeout(free, 10000);
    };

    this.free = free;

    return this;
};

module.exports = XBee;