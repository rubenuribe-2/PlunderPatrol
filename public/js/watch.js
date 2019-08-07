const watch = new RTCPeerConnection(pcConfig);
const button = document.getElementById("watch-button");
const videoElement=document.getElementById("remote-video");
var remoteVideo = new MediaStream();

button.addEventListener('click',function(){
    videoElement.srcObject=remoteVideo;
});
socket.on('connect', function () {
    console.log("watch connected");
    socket.emit('watching',socket.id);
    socket.on('offer',function(offer){
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
    watch.ontrack= function(event){
        console.log("ontrack");
        console.log(event);
        console.log("recivers",watch.getReceivers());
        remoteVideo.addTrack(event.track);
        console.log(remoteVideo.getTracks());
    };
    socket.on('message', function (msg) {
        console.log("in");
    });
    socket.on('candidate',function(message){
        console.log('candidate ', message);
        var candidate = new RTCIceCandidate({
            sdpMLineIndex: message.label,
            candidate: message.candidate
        });
        watch.addIceCandidate(candidate);
    });
});

  
