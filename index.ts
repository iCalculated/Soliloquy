const express = require('express');
const http = require('http')

const app = express();
const server = http.createServer(app);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
});

server.listen(3000, () => {
    console.log('listening on port 3000.')
});