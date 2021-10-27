import express from "express";
import SocketIO from "socket.io";

const http = require('http')
const faker = require('faker');
const chalk = require('chalk');

const app = express();
const server = http.createServer(app);
const io = new SocketIO.Server(server);

const action = chalk.bold.gray;
const data = chalk.blue;

const online = {};
app.get('/', (req: express.Request, res: express.Response) => {
    res.sendFile('index.html', { root: "." })
});


io.on('connection', (socket: SocketIO.Socket) => {
    const name: string = faker.hacker.adjective() + " " + faker.hacker.noun();
    console.log(data(name) + action(' connected'))
    online[socket.id] = name;
    socket.emit('set name', name);
    io.emit('join', name);
    io.emit('online', online);
    socket.on('disconnect', () => {
        const name = online[socket.id];
        console.log(data(name) + action(' disconnected'));
        io.emit('leave', name)
        delete online[socket.id]
        io.emit('online', online)
    });
    socket.on('chat message', ({ msg, user }) => {
        socket.broadcast.emit('chat message', { msg, user });
        online[socket.id] = user;
        console.log(action('received ') + data(msg) + action(" from ") + data(user));
    });
    socket.on('private message', (target, msg) => {
        const from = online[socket.id];
        for (const u in online) {
            if (online[u] == target) {
                const id = u;
                io.to(id).emit('private message', from, msg)
                socket.emit('private received', target, msg)
                console.log(data(from) + action('->') + data(target) + action(": ") + data(msg));
                return
            }
        }
        socket.emit('private failed', target, msg)
        console.log(data(from) + action('->') + data(target) + action(" failed"));
    });
    socket.on('name change', (old_name, new_name) => {
        online[socket.id] = new_name;
        console.log(data(old_name) + action(' changed nick to ') + data(new_name));
        socket.broadcast.emit('name change', old_name, new_name);
    })
});

server.listen(3000, () => {
    console.log(action('listening on port 3000.'))
});