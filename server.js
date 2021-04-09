// first change
// second change
// third
'use strict';

const express = require('express');
const websocket = require('ws');
const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';
const stringify = (e) => { return JSON.stringify(e) };
const parse = (e) => { return JSON.parse(e) };

// Start Express Server
const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));


// Start Websocket server
const wss = new websocket.Server({server});

wss.on('connection', handlingClients);

function handlingClients(ws) {

    console.log('Client connected');

    ws.on('message', (data) => {
      if (typeof data == 'string') {

        console.log(data);

      } else {
        // work with binary array
        wss.clients.forEach((client) => { client.send(data) });
        //let x = (message[1] << 8) + message[0];
        //let y = (message[3] << 8) + message[2];
      }
    });

    ws.on('close', () => { console.log('Client Disconnected') });

}
