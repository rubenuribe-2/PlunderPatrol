socket.on('connect', function () {
    console.log("watch connected");
    socket.emit('watching',socket.id);

    socket.on('message', function (msg) {
        console.log("in");
    });
});
