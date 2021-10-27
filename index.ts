import express from "express";
import SocketIO from "socket.io";
import http from "http";
import faker from "faker";
import chalk from "chalk";

const app = express();
const server = http.createServer(app);
const io = new SocketIO.Server(server);

const action = chalk.bold.gray;
const data = chalk.blue;

const online = new Map<string, string>();
const typing = new Set<string>();

app.get('/', (req: express.Request, res: express.Response) => {
    res.sendFile('index.html', { root: "." })
});


io.on('connection', (socket: SocketIO.Socket) => {
    const name: string = faker.hacker.adjective() + " " + faker.hacker.noun();
    console.log(data(name) + action(' connected'))
    online.set(socket.id, name); 
    socket.emit('set name', name);
    io.emit('join', name);
    io.emit('online', Array.from(online.values()));
    socket.on('disconnect', () => {
        const name = online.get(socket.id);
        console.log(data(name) + action(' disconnected'));
        io.emit('leave', name)
        online.delete(socket.id);
        if (name) {
            typing.delete(name);
        }
        io.emit('online', Array.from(online.values()))
    });
    socket.on('chat message', ({ msg, user }) => {
        socket.broadcast.emit('chat message', { msg, user });
        online.set(socket.id, user);
        console.log(action('received ') + data(msg) + action(" from ") + data(user));
    });
    socket.on('private message', (target, msg) => {
        const from = online.get(socket.id);
        for (const [id,u] of Array.from(online.entries())) {
            if (u == target) {
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
        online.set(socket.id, new_name);
        console.log(data(old_name) + action(' changed nick to ') + data(new_name));
        socket.broadcast.emit('name change', old_name, new_name);
    });
    socket.on('typing update', ({user, status}) => {
        if (status) {
            console.log('add');
            typing.add(user);
        }
        else {
            console.log('del');
            typing.delete(user);
        }
        socket.broadcast.emit('typing', Array.from(typing));
    });
});

server.listen(3000, () => {
    console.log(action('listening on port 3000.'))
});