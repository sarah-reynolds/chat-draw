// console.log("sanity check!!")

// WEB SOCKET SERVER

var http = require("http");
var fs = require("fs");

var server = http.createServer((req, res)=>{
	console.log("someone connected via http");
	// fs.readFile('index.html', 'utf-8', (error, fileData)=>{
	// 	if(error){
	// 		// respons with 500 error
	// 		res.writeHead(500,{'content-type':'text/html'});
	// 		res.end(error);
	// 	}else{
	// 		// the file was able to be read int
	// 		res.writeHead(200,{'content-type':'text/html'});
	// 		res.end(fileData)
	// 	}
	// })
});

// include the server version of socketio and assign it to a variabel
var socketIo = require('socket.io');
// sockets are going to listen to the server which is litening on port 8080
var io = socketIo.listen(server);

var socketUsers = [];

// handle socket connections..
io.sockets.on('connect', (socket)=>{
	
	console.log('someone connected by socket');

	socket.on('userNameToServer', (nameObject)=>{
		socketUsers.push({
			socketID: socket.id,
			name: nameObject.name

		})	
		io.sockets.emit('users', socketUsers);
	});

	socket.on('messageToServer', (messageObject)=>{
		console.log("someone sent a message. it is: ", messageObject.message);
		io.sockets.emit('messageToClient',{
			message: messageObject.message,
			name: messageObject.name,
			date: new Date()
		})

	});
	socket.on('drawingToServer', (drawingData)=>{
		if(drawingData.lastMousePosition !== null){
			io.sockets.emit('drawingToClients', drawingData);
		}
	})
});

server.listen(8080);
console.log("listening on port 8080...");