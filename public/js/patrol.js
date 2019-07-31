

var canvas = document.getElementById("preview");
var context = canvas.getContext('2d');

canvas.width = 900;
canvas.height = 700;

context.width = canvas.width;
context.height = canvas.height;

function logger(msg){
    $('#logger').text(msg);
}

function loadCamera(stream){
    try {
        video.srcObject = stream;
        } catch (error) {
     video.src = URL.createObjectURL(stream);
        }
     logger("Camera connected");
  }

  function loadFail(){
    logger("Camera not connected");
}


var video = document.getElementById("video");


  function hasGetUserMedia() {
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
      var password=1234;
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

            function viewVideo(video,context){
                socket.emit('stream',stream);
            }


            socket.on('connect', function () {
                console.log("in connect");
                socket.emit('patrol',socket.id);
                
                socket.on('watching',function(){
                    $(function(){
                        navigator.getUserMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msgGetUserMedia );
                    
                        if(navigator.getUserMedia){
                            navigator.getUserMedia({video: true, audio: false},loadCamera,loadFail);
                        }
                 
                        setInterval(function(){
                            viewVideo(video,context);
                        },.1);
                    });
                    console.log("emmiting video");
                });
                socket.on('message', function (msg) {

                });
                socket.on('disconnect', function(){
                    console.log("disconnected from server");
                });
            });
            // socket.on('watching',function(){
            //     socket.send('video',{vid: videoObj});
            //     console.log("emmiting video");
            // });
            // socket.on('connection',function(){
            //     console.log("watching");
            //     socket.emit('video',{vid: videoObj});
            // });
            

        });
  } else {
      //browser is outdated
    alert('getUserMedia() is not supported by your browser');
  }
