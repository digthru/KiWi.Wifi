var util = require('util');
var SerialPort = require('serialport').SerialPort;
var xbee_api = require('xbee-api');
var Emitter = require('./../libs/emitter');
var C = xbee_api.constants;

function XBee(dest) {
    var self = Emitter.attach(this);	
	var serialport, xbeeAPI;
	
	var getFrame = function(data){
		return {
			type: 0x10,
			id: 0x01,
			destination64: dest,
			broadcastRadius: 0x00,
			options: 0x00,
			data: new String(data)
		}
	};
	
	this.connect = function(){
		xbeeAPI = new xbee_api.XBeeAPI({
			api_mode: 2
		});

		serialport = new SerialPort("/dev/ttyAMA0", {
			baudrate: 9600,
			parser: xbeeAPI.rawParser()
		});
		
		serialport.on('open', function(){
			self.emit('open');
		});
		
		serialport.on('close', function(){
			self.emit('close');
		});
		
		serialport.on('error', function(err){
				self.close();
				self.emit('error', err);
		});
		
		serialport.on('data', function(data){
			self.emit('data.serial', data);
		});
		
		xbeeAPI.on("frame_object", function (frame) {
				self.emit('frame', frame);
				if(frame.data && frame.data.length)
					self.emit('data', frame.data.toString('utf8'));
		});
	};
	
    this.write = function (data) {
        if(serialport && xbeeAPI)
			serialport.write(xbeeAPI.buildFrame(getFrame(data)));
    };

    this.close = function () {
        if(serialport){
			serialport.close();
			serialport = undefined;
			xbeeAPI = undefined;
		}
    }
	
    return this;
};

module.exports = XBee;
