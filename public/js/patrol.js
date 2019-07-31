var pcConfig = {
    'iceServers': [{
      'urls': 'stun:numb.viagenie.ca'
    }]
  };
  
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
