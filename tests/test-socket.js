var socket = require('./../io/socket')();

socket.on('connect', function(){
	console.log('Socket connnected');

	// send a message on connect
	socket.send({ event: -1 });
});

socket.on('disconnect', function(){
	console.log('Socket disconnnected');
});

socket.on('error', function(err){
	console.error(err);
});

socket.on('message', function(msg){
	console.log(msg);
});

socket.connect();

process.on('SIGINT', function(){
	socket.disconnect();
});