


/** create connection **/ 
 
function createConnection() {
    var servers = null;

    var createConnectionSetting = {optional: [{RtpDataChannels: true}]};
    window.localPeerConnection = new RTCPeerConnection(servers, createConnectionSetting);

    trace('created local peer connection object localPeerConnection');

    try {
	// reliable data channels not yet supported in chrome
	var sendDataChannelSetting = {reliable: false};
	sendChannel = localPeerConnection.createDataChannel("sendDataChannel", sendDataChannelSetting);

	trace('created send data channel');

    } catch (e) {
	alert('failed to create data channel');
	trace('createDataChannel() failed with exception: ' + e.message);
    }
    localPeerConnection.onicecandidate = gotLocalCandidate;
    sendChannel.onopen = handleSendChannelStateChange;
    sendChannel.onclose = handleSendChannelStateChange;

    // creació de un remote peer connection desde un source a la mateixa a perque no hiha intermediari de servidors
    window.remotePeerConnection = new RTCPeerConnection(servers, createConnectionSetting);
    trace('create remote peer connection object remote peer connection');

    remotePeerConnection.onicecandidate = gotRemoteIceCandidate;
    remotePeerConnection.ondatachannel = gotReceiveChannel;

    localPeerConnection.createOffer(gotLocalDescription, handleError);
    xatBtnStart.disibled = true;
    xatBtnClose.disibled = false;
}


function sendData() {
    var data = document.getElementById("localChatBox").value;
    sendChannel.send(data);
    trace('sent data: ' + data);
}


function closeDataChannels() {
    trace('close data channels');
    sendChannel.close();
    trace('closed data channel with label: ' + sendChannel.label);
    receiveChannel.close();
    trace('closed data channel with label: ' + receiveChannel.label);
    localPeerConnection.close();
    remotePeerConnection.close();
    localPeerConnection = null;
    remotePeerConnection = null;
    trace('closed peer connection');

    // restart button status
    xatBtnStart.disabled = false;
    xatBtnSend.disabled = true;
    xatBtnClose.disabled = true;

    sendChannel.value = "";
    receiveChannel.value = "";
    sendChannel.disabled = true;
    sendChannel.placeholder = "Press start, enter some text then press send.";
}

// fins ara tot lo que forma part dels controladors de la vista


// aqui hihan dos metodes que es van autoinvocan 
function gotLocalDescription(desc) { // creació de un apropia i enviar la propia al remote
    localPeerConnection.setLocalDescription(desc);
    trace('offer from local peer connection \n' + desc.sdp);
    remotePeerConnection.setRemoteDescription(desc);
    remotePeerConnection.createAnswer(gotRemoteDescription, handleError);
}

function gotRemoteDescription(desc) { // set local then set remote without answore... dono.. :D
    remotePeerConnection.setLocalDescription(desc);
    trace('answer from remote peer connection \n ' + desc.sdp);
    localPeerConnection.setRemoteDescription(desc);
}
// fins aqui vincular sdp als contextos de peer conection de cada windows del browser independents


// 

function gotLocalCandidate(event) {
    trace('local ice callback');
    if (event.candidate) {
	remotePeerConnection.addIceCandidate(event.candidate);
	trace('local ice candidate: \n' + event.candidate.candadate);
    }
}

function gotRemoteIceCandidate(event) {
    trace('receive ice callback');
    if (event.candidate) {
	localPeerConnection.addIceCandidate(event.candidate);
	trace('Remote ICE candiadte: \n' + event.candidate.candidate);
    }
}

function gotReceiveChannel(event) {
    trace('receive channel callback');
    receiveChannel = event.channel;
    receiveChannel.onmessage = handleMessage;
    receiveChannel.onopen = handleReceiveChannelStateChange;
    receiveChannel.onclose = handleReceiveChannelStateChange;
}

function handleMessage(event) {
    trace('receive message: ' + event.data);
    document.getElementById("chatLog").value = event.data;
}

function handleSendChannelStateChange() {
    var readyState = sendChannel.readyState;
    trace('send channel state is: ' + readyState);
    if (readyState === 'open') {
	xatInputTA.disabled = false;
	xatInputTA.focus();
	xatInputTA.placeholder = "";
	xatBtnSend.disabled = false;
	xatBtnClose.disabled = false;
    } else {
	xatInputTA.disabled = true;
	xatBtnSend.disabled = true;
	xatBtnClose.disabled = true;
    }
}

function handleReceiveChannelStateChange() {
    var readyState = receiveChannel.readyState;
    trace('receive channel state is: ' + readyState);
}

function handleError() {

}



function createRoom(name) {

}

function joinRoom(name) {

} 