socket.on('connect', function () {
    console.log("in connect");

    socket.emit('watching',socket.id);

    socket.on('stream',function(image){
        console.log("streaming");
        $('#play').attr('src',image);
    });

    socket.on('message', function (msg) {
        console.log("in");
    });
});

// socket.on('video',function(obj){
//     console.log("ben");
//     console.log(obj);
//     video.srcObject = obj.video;
// });

//video.srcObject = stream;