var util = require('util');
var Emitter = require('./../libs/emitter');
var config = require('./../config');
var tools = require('./../libs/tools');
var request = require('request');
var WebSocket = require('ws');

function Socket() {
    var self = Emitter.attach(this);
    var socket;

    this.connect = function () {
        if (socket) self.disconnect();

        var password = tools.crypto.symmetric.encrypt(config.registration_password, config.registration_algorithm, config.registration_symmetric_key);

        var _r;
        var r = request.get({
            url: 'http://' + config.domain + '/rest/socket/open?client_id=dev&action=lock&serial=' + config.lock_serial
        }, function (err, res, body) {
            clearTimeout(_r);

            if (err) return self.emit('error', err);
            try {
                body = JSON.parse(body);
            } catch (e) {
                return self.emit('error', body);
            }

            if (body.status) return self.emit('error', body.msg);

            socket = new WebSocket('ws://' + config.domain + '/socket?action=lock&secret=' + body.data.secret + '&password=' + password)

            socket.onopen = function () {
                self.emit('connect');
            }

            socket.onmessage = function (msg) {
                try {
                    var data = JSON.parse(msg.data);
                    self.emit('message', data);
                } catch (e) {
                    console.error(e);
                }
            };

            socket.onclose = function () {
                self.emit('disconnect', 'Socket closed');
                socket = undefined;
            };

            socket.onerror = function (err) {
                self.emit('error', err);
                self.disconnect();
            };
        });

        _r = setTimeout(function () {
            r.abort();
            self.emit('error', 'Network timeout');
        }, 4000);
    };

    this.send = function (data) {
        if (socket) {
            try {
                data = JSON.stringify(data);
            } catch (e) {
                console.error(e);
            }

            socket.send(data);
        }
    };

    this.disconnect = function () {
        if (socket) {
            try {
                socket.terminate();
            } catch (e) {
                console.error(e);
            }

            socket = undefined;
        }
    };

    return this;
};

module.exports = Socket;