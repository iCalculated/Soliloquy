const express = require('express');
const http = require('http')
const { Server } = require("socket.io")
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const faker = require('faker');

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
});

const online = {};

io.on('connection', (socket) => {
    const name = faker.hacker.adjective() + " " + faker.hacker.noun();
    console.log(name + ' connected')
    online[socket.id] = name;
    console.log(online)
    io.emit('join', name);
    socket.on('disconnect', () => {
        const name = online[socket.id];
        console.log(name + ' disconnected');
        io.emit('leave', name)
        delete online[socket.id]
    });
    socket.on('chat message', ({ msg, user }) => {
        io.emit('chat message', { msg, user });
        online[socket.id] = user;
        console.log('received `' + msg + "` from `" + user + "`");
    });
});

server.listen(3000, () => {
    console.log('listening on port 3000.')
});