'use strict';

const express = require('express');
const websocket = require('ws');
const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';
const stringify = (e) => { return JSON.stringify(e) };
const parse = (e) => { return JSON.parse(e) };

let USERS = {}

// Start Express Server
const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));


// Start Websocket server
const wss = new websocket.Server({server});

wss.on('connection', handlingClients);

function handlingClients(ws) {

    ws.on('message', (message) => {

      if (typeof message == 'string') {
        let data = parse(message);


        switch (data['action']) {

          case 'init':
            ws.userid = data['userid'];
            USERS[data['userid']] = {'username': data['username'], 'color': data['color']};
            console.log(`User ${USERS[data['userid']]['username']} connected`);
            wss.clients.forEach((client) => { client.send(stringify({'action': 'loadUsers', 'users': USERS})); });
            break;

          case 'changeColor':
            USERS[data['userid']]['color'] = data['color'];
            wss.clients.forEach((client) => {
              client.send(stringify(
                {
                  'action': 'changeColor',
                  'userid': data['userid'],
                  'color': data['color']
                }
              ));
              }
            );
            break;

        }

      } else {
        // work with binary array
        wss.clients.forEach((client) => { client.send(message) });
        //let x = (message[1] << 8) + message[0];
        //let y = (message[3] << 8) + message[2];
      }
    });

    ws.on('close', () => {
      wss.clients.forEach( (client) => {
        client.send(stringify(
            {
              'action': 'deleteUser',
              'userid': ws.userid
            }
          )
        )
      });
      console.log(`User ${USERS[ws.userid]['username']} (${ws.userid}) disconnected`);
      delete USERS[ws.userid];
      console.log(`Total users: ${Object.keys(USERS).length}`);
      console.log(`Total WS: ${wss.clients.size}`);
      console.log(USERS);

    });

}
