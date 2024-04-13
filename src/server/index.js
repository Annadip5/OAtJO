const { Server, Room } = require('colyseus');
import Player from '../players/bowl';

class MyRoom extends Room {
    constructor() {
        super();
        this.players = {}; // Tableau pour stocker les joueurs
    }
    onCreate(options) {
        console.log("My room created!", options);
    }

    onJoin(client) {
        console.log("Client joined!", client.sessionId);
        this.players[client.sessionId] = new Player(client.sessionId);

    }

    onMessage(client, data) {
        console.log("Message received from", client.sessionId, ":", data);
    }

    onLeave(client) {
        console.log("Client left!", client.sessionId);
    }

    onDispose() {
        console.log("Room disposed!");
    }
}

const server = new Server();
server.define('my_room', MyRoom);

server.listen(2567);
console.log("Server started on port 2567");
