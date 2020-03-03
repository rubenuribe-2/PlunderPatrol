const watch = new RTCPeerConnection(pcConfig);
const button = document.getElementById("watch-button");
const videoElement=document.getElementById("remote-video");
var remoteVideo = new MediaStream();

button.addEventListener('click',function(){//listen for button click
    button.style.display='none';
    videoElement.srcObject=remoteVideo;
});
socket.on('connect', function () {//once socket connection is established
    socket.emit('watching',socket.id);//let server know that watch browser has connected
    socket.on('offer',function(offer){//handle reciving an offer
        // offerJson=JSON.parse(offer);
        console.log(offer);
        watch.setRemoteDescription(offer)
        .then((offer) => {
            watch.createAnswer(offer)
            .then((answer)=>{
                watch.setLocalDescription(answer);
                socket.emit('answer',answer);
                console.log('Sent answer');
            })
        });
    });
    watch.ontrack= function(event){//handle a track being added to the stream

        remoteVideo.addTrack(event.track);

    };
    socket.on('candidate',function(message){//handle Ice candidates
        console.log('candidate ', message);
        var candidate = new RTCIceCandidate({
            sdpMLineIndex: message.label,
            candidate: message.candidate
        });
        watch.addIceCandidate(candidate);
    });
});

  
