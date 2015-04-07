var config = require('./../config');

function getCommand(command) {
    return {
        type: 0x10,
        id: 0x01,
        destination64: config.xbee_destination_64,
        broadcastRadius: 0x00,
        options: 0x00,
        data: command
    };
};

module.exports.LOCK = getCommand('lock');
module.exports.UNLOCK = getCommand('unlock');
module.exports.STATUS = getCommand('status');