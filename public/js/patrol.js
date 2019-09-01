var isChannelReady = false;
var isInitiator = false;
var isStarted = false;
var localStream;
var rawStream;
var patrol;
var remoteStream;
var turnReady;
var socket = io('/'+id);
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
    localStream=stream;
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
        video: true,
        audio: true
      };
      
      const video = document.querySelector('video');
      navigator.mediaDevices.getUserMedia(constraints).
        then((stream) => {
            rawStream=stream;
            remoteStream=new MediaStream();
            localStream=stream.getTracks();
            console.log(localStream);
            video.srcObject = stream;//attach the stream  to the video tag in patrol.ejs
            console.log(id);
        });
  } else {
      //browser is outdated
    alert('getUserMedia() is not supported by your browser');
    //redirect to a page saying browser is outdated
  }




  //exchange auth stuff with watch browser
  socket.on('connect', function () {
    socket.emit('patrol',socket.id);
    console.log("in connect");

    socket.on('watching',function(){
      createPeerConnection();
      patrol.addTrack(localStream[0],remoteStream);
      patrol.addTrack(localStream[1],remoteStream);
      patrol.createOffer().then(function(offer) {
        return patrol.setLocalDescription(offer);
      })
      .then(function() {
        socket.emit('offer',patrol.localDescription);
        console.log("patrol sent offer");
      })
      .catch();
    });
    socket.on('answer',function (answer){
      patrol.setRemoteDescription(answer);
      console.log('patrol recived answer');
      console.log(localStream);
      console.log(patrol.getSenders());
      if(patrol.getSenders() == []){
        patrol.addTrack(localStream[0]);
        patrol.addTrack(localStream[1]);
        console.log("added Media Stream");
      }
    })
    socket.on('message', function (msg) {

    });
    socket.on('disconnect', function(){
        console.log("disconnected from server");
    });
});





//   /////////  //////  ////////    //////// functions

function createPeerConnection() {
    try {
      patrol = new RTCPeerConnection(pcConfig);

      patrol.onicecandidate = handleICECandidateEvent;
      patrol.onnegotiationneeded = handleNegotiationNeededEvent;


      // patrol.onremovetrack = handleRemoveTrackEvent;
      // patrol.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
      // patrol.onicegatheringstatechange = handleICEGatheringStateChangeEvent;
      // patrol.onsignalingstatechange = handleSignalingStateChangeEvent;
      console.log('Created RTCPeerConnnection');
    } catch (e) {
      console.log('Failed to create PeerConnection, exception: ' + e.message);
      alert('Cannot create RTCPeerConnection object.');
      return;
    }
  }

function handleICECandidateEvent(event){
  console.log("Ice candidate event", event);
  if (event.candidate) {
    socket.emit('candidate',{
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate
    });
  } else {
    console.log('End of candidates.');
  }
};

function handleNegotiationNeededEvent() {
  patrol.createOffer().then(function(offer) {
    return patrol.setLocalDescription(offer);
  })
  .then(function() {
    socket.emit('offer',patrol.localDescription);
    console.log("patrol sent offer");
  })
  .catch();
}



// function messagePeerJson(type,msg){ //for emmiting Json
//   var msgJSON = JSON.stringify(msg);

//   socket.emit(type,msgJSON);
// }