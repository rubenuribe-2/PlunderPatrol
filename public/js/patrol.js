var isChannelReady = false;
var isInitiator = false;
var isStarted = false;
var localStream;
var pc;
var remoteStream;
var turnReady;
  
  // Set up audio and video regardless of what devices are present.
  var sdpConstraints = {
    offerToReceiveAudio: true,
    offerToReceiveVideo: true
  };

function logger(msg){//log to the browser
    $('#logger').text(msg);
}

function loadCamera(stream){//attatch camera to the video element in patrol.ejs
    try {
        video.srcObject = stream;
        } catch (error) {
     video.src = URL.createObjectURL(stream);
        }
     logger("Camera connected");
  }

  function loadFail(){//log that camera failed to connect
    logger("Camera not connected");
}


var video = document.getElementById("video");


  function hasGetUserMedia() {//check that browser & computer support webcam connection
    return !!(navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia);
  }
  
  if (hasGetUserMedia()) {
      //browser works
    console.log("has media");
    const constraints = {
        video: true
      };
      
      const video = document.querySelector('video');
      var password=1234;//later on beef up password sequrity
      navigator.mediaDevices.getUserMedia(constraints).
        then((stream) => {
            const videoObj={
                video: stream,
                password: password,
                id: id
            };
            video.srcObject = stream;//attach the stream  to the video tag in patrol.ejs
            //connect to server socket
            console.log(videoObj);
            console.log(id);

            var socket = io('/'+id);

            //exchange auth stuff with watch browser

            socket.on('connect', function () {
                console.log("in connect");
                socket.on('answer',function (answer){
                  //handle answer from watch
                })
                socket.on('message', function (msg) {

                });
                socket.on('disconnect', function(){
                    console.log("disconnected from server");
                });
            });
        });
  } else {
      //browser is outdated
    alert('getUserMedia() is not supported by your browser');
    //redirect to a page saying browser is outdated
  }





//   /////////  //////  ////////    //////// functions

function createPeerConnection() {
    try {
      const pc = new RTCPeerConnection(pcConfig);
      pc.onicecandidate = handleIceCandidate;
      pc.onaddstream = handleRemoteStreamAdded;
      pc.onremovestream = handleRemoteStreamRemoved;
      console.log('Created RTCPeerConnnection');
    } catch (e) {
      console.log('Failed to create PeerConnection, exception: ' + e.message);
      alert('Cannot create RTCPeerConnection object.');
      return;
    }
  }
  
  function handleIceCandidate(event) {
    console.log('icecandidate event: ', event);
    if (event.candidate) {
      sendMessage({
        type: 'candidate',
        label: event.candidate.sdpMLineIndex,
        id: event.candidate.sdpMid,
        candidate: event.candidate.candidate
      });
    } else {
      console.log('End of candidates.');
    }
  }
  
  function handleCreateOfferError(event) {
    console.log('createOffer() error: ', event);
  }
  
  function doCall() {
    console.log('Sending offer to peer');
    pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
  }
  
  function doAnswer() {
    console.log('Sending answer to peer.');
    pc.createAnswer().then(
      setLocalAndSendMessage,
      onCreateSessionDescriptionError
    );
  }
  
  function setLocalAndSendMessage(sessionDescription) {
    pc.setLocalDescription(sessionDescription);
    console.log('setLocalAndSendMessage sending message', sessionDescription);
    sendMessage(sessionDescription);
  }
  
  function onCreateSessionDescriptionError(error) {
    trace('Failed to create session description: ' + error.toString());
  }
  
  
  function handleRemoteStreamAdded(event) {
    console.log('Remote stream added.');
    remoteStream = event.stream;
    remoteVideo.srcObject = remoteStream;
  }
  
  function handleRemoteStreamRemoved(event) {
    console.log('Remote stream removed. Event: ', event);
  }
  function stop() {
    isStarted = false;
    pc.close();
    pc = null;
  }