import json
import socket
from wsserver import WSServer

server = WSServer(host="", port=3000, cert=None, key=None)

USERS = {}


def onmessage(client, message, message_type):
    if message_type == "text":
        message = json.loads(message)
        action = message["action"]

        if action == "init":
            USERS[message["userid"]] = {
                "userid": message["userid"],
                "username": message["username"],
                "color": message["color"],
                "width": message["width"],
            }
            print(f"User {message['username']} connected")
            server.sendall(json.dumps({"action": "loadUsers", "users": USERS}))

        if action == "changeColor":
            USERS[message["userid"]]["color"] = message["color"]
            USERS[message["userid"]]["width"] = message["width"]
            message = {
                "action": "changeColor",
                "userid": message["userid"],
                "color": message["color"],
                "width": message["width"],
            }
            server.sendall(json.dumps(message))

    if message_type == "binary":
        server.sendall(bytes(message))


def onopen(client: socket.socket) -> None:
    print(f"Client connected: {client.getpeername()}")


def onclose(client: socket.socket) -> None:
    print(f"Client disconnected: {client.getpeername()}")


server.onmessage(onmessage)
server.onopen(onopen)
server.onclose(onclose)
server.run()
