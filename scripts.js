
// WEBSOCKET SECTION

// console.log(io);
var socketio = io.connect('http://127.0.0.1:8080');
var currentUserSocketId;
var lastSocketUserId;
socketio.on('users', (socketUsers)=>{
	console.log(socketUsers);
	currentUserSocketId = socketUsers[0].socketID;
	var newHTML = "";
	socketUsers.map((currSocket, index)=>{
		lastSocketUserId = currSocket.socketID;
		newHTML += '<li class="user">'+currSocket.name+'</li>';
	})
	document.getElementById('userNames').innerHTML = newHTML;
	console.log('currentUserSocketId')
	console.log(currentUserSocketId)
	console.log('lastSocketUserId')
	console.log(lastSocketUserId)

})

socketio.on('messageToClient', (messageObject)=>{
	var msgString = messageObject.message;
	if(currentUserSocketId == lastSocketUserId){
	document.getElementById('userChats').innerHTML += '<div class="message"><strong id="curr-username-chat">' +messageObject.name+': </strong>'+ messageObject.message + ' (' + messageObject.date + ')</div>';
	}else{
	document.getElementById('userChats').innerHTML += '<div class="message"><strong id="last-username-chat">' +messageObject.name+': </strong>'+ messageObject.message + ' (' + messageObject.date + ')</div>';
	}
	if(msgString.includes("banana") || msgString.includes("peanut butter")){
		bananaEasterEgg();
	}
	updateScroll();
})


// CLIENT FUNCTIONS
var username;

function bananaEasterEgg(){
	document.getElementById('easter-egg').innerHTML = '<img src="http://i2.kym-cdn.com/entries/icons/original/000/000/188/DancingBannana.gif" width="100px" />'
}

function getUserName(){
	username = window.prompt("Enter your username");
	// currentUserSocketId = socketio.Socket.id
	console.log(socketio.id)
	socketio.emit('userNameToServer', {
		name: username
	})
}

function updateScroll(){
	var element = document.getElementById('userChats');
	element.scrollTop = element.scrollHeight;
}

function sendChatMessage(){
	event.preventDefault();
	var messageToSend = document.getElementById('chat-message').value;
	socketio.emit('messageToServer', {
		message: messageToSend,
		name: username
	})
	document.getElementById('chat-message').value = "";
}

// CANVAS SECTION
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

// setup base options
var color = "#000";
var thickness = 10;
var mouseDown = false;
var mousePosition = {};
var lastMousePosition = null;
var colorPick = document.getElementById('color-picker');
var thicknessPicker = document.getElementById('thickness');

colorPick.addEventListener('change', (event)=>{
	color = colorPick.value;
});

thicknessPicker.addEventListener('change', (event)=>{
	thickness = thicknessPicker.value;
});


canvas.addEventListener('mousedown', (event)=>{
	// console.log(event);
	mouseDown = true;
});

canvas.addEventListener('mouseup', (event)=>{
	// console.log(event);
	mouseDown = false;
	lastMousePosition = null;
});

canvas.addEventListener('mousemove', (event)=>{
	// console.log(event);
	if(mouseDown){
		var magicBrushX = event.pageX - canvas.offsetLeft;
		var magicBrushY = event.pageY - canvas.offsetTop;
		mousePosition = {
			x: magicBrushX,
			y: magicBrushY
		}
	// console.log(mousePosition);
		if(lastMousePosition !== null){
			context.strokeStyle = color;
			context.lineJoin = 'round';
			context.lineCap = 'round';
			context.lineWidth = thickness;
			context.beginPath();
			context.moveTo(lastMousePosition.x, lastMousePosition.y);
			context.lineTo(mousePosition.x, mousePosition.y);
			context.stroke();
			context.closePath();
		}

	// update last mouse postion
		
		var drawingDataForServer = {
			mousePosition: mousePosition,
			lastMousePosition: lastMousePosition,
			color: color,
			thickness: thickness
		}
		lastMousePosition = {
			x: mousePosition.x,
			y: mousePosition.y
		}

		socketio.emit('drawingToServer', drawingDataForServer);

		socketio.on('drawingToClients', (drawingData)=>{
			context.strokeStyle = drawingData.color;
			context.lineJoin = 'round';
			context.lineCap = 'round';
			context.lineWidth = drawingData.thickness;
			context.beginPath();
			context.moveTo(drawingData.lastMousePosition.x, drawingData.lastMousePosition.y);
			context.lineTo(drawingData.mousePosition.x, drawingData.mousePosition.y);
			context.stroke();
			context.closePath();
		})
	}
});