var tools = require('./tools');

function Emitter(attachTo) {
    var listeners = {};
    var self = attachTo;
    var silent = true;
    var ignore = [];

    self.fireListeners = function (type) {
        type = type + "";
        try {
            if (typeof listeners[type] === 'undefined') {
                return;
            }
        } catch (e) {
            return;
        }
        var args = Array.prototype.splice.call(arguments, 0);
        args.splice(0, 1);
        for (var key in listeners[type]) {
            tools.dfire(listeners[type][key], args);
        }
        if (!silent && ignore.indexOf(type) < 0) {
            console.info('Listeners fired for on `%s` event.'.format(type));
        }
    };

    self.emit = self.broadcast = self.fireListeners;

    self.on = function (type, callback) {
        type = type + "";
        if (typeof listeners[type] === 'undefined') {
            listeners[type] = {};
        }
        listeners[type][tools.hash(callback.toString()) + ''] = callback;
        if (!silent) {
            console.warn('Listener add for on `%s` event.'.format(type));
        }
        return self;
    };

    self.off = function (type, callback) {
        type = type + "";
        try {
            delete listeners[type][tools.hash(callback.toString()) + ''];
            if (!silent) {
                console.info('Listener removed for on `%s` event.'.format(type));
            }
        } catch (e) {
            if (!silent) {
                console.info('Listener could not be removed for on `%s` event.'.format(type));
            }
        }

        return self;
    };

    self.silent = function (a) {
        silent = typeof a === 'boolean' ? a : false;
        return self;
    };

    self.silence = function (a) {
        if (!Array.isArray(a)) {
            return;
        }
        ignore = a;
    };

    return self;
}

exports.attach = function (a) {
    return new Emitter(a, 0);
};

exports.__call__ = function (a) {
    var e;
    try {
        e = exports.attach({});
        return e;
    } finally {
        process.nextTick(function () {
            a(e);
        });
    }
};
