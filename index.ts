const express = require('express');
const http = require('http')
const { Server } = require("socket.io")
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
});

io.on('connection', (socket) => {
    console.log('user connected')
    io.emit('join');
    socket.on('disconnect', () => {
        console.log('user disconnected')
    });
    socket.on('chat message', ({ msg, user }) => {
        io.emit('chat message', { msg, user });
        console.log('received `' + msg + "` from `" + user + "`");
    });
});

server.listen(3000, () => {
    console.log('listening on port 3000.')
});