const { Server, Room } = require('colyseus');
const { MyRoomState, Player } = require('./schema/myRoomState.ts')
//import { State, Player } from './schema/myRoomState';

class MyRoom extends Room {
    constructor() {
        super();
        this.players = {}; // Tableau pour stocker les joueurs
        this.initialPositions = [
            { x: -5, y: 10, z: 20.8 },
            { x: -5, y: 10, z: 22.6 },
            { x: -5, y: 10, z: 24.4 },
            { x: -5, y: 10, z: 26.2 },
            { x: -5, y: 10, z: 28 },
            { x: -5, y: 10, z: 29.8 }
        ];
    }
    onCreate(options) {
        console.log("My room created!", options);
        this.setState(new MyRoomState)

        this.onMessage("updatePosition", (client, data) => {
            console.log("update received -> ");
            console.debug(JSON.stringify(data));
            const player = this.state.players.get(client.sessionId);
            player.x = data["x"];
            player.y = data['y'];
            player.z = data["z"];
            this.state.players.set(client.sessionId, player);
            this.broadcast("updatePlayerPosition", { sessionId: client.sessionId, x: data.x, y: data.y, z: data.z });

        });

    }

    onJoin(client) {
        console.log("Client joined!", client.sessionId);
        const player = new Player(client.sessionId);
        const playerIndex = this.state.players.size;
        console.log(playerIndex)
        if (playerIndex < 6) {
            const initialPosition = this.initialPositions[playerIndex];
            player.x = initialPosition.x;
            player.y = initialPosition.y;
            player.z = initialPosition.z;

            this.state.players.set(client.sessionId, player);

            console.log("new player =>", player.toJSON());
            console.log(player.x);
            console.log(player.y);
            console.log(player.z);
        }
        else {
            console.log("Vous ne pouvez plus entrer");
        }

    }

    onMessage(client, data) {
        console.log("Message received from", client.sessionId, ":", data);

    }

    onLeave(client) {
        console.log("Client left!", client.sessionId);
        const playerId = client.sessionId;
        const player = this.state.players.get(playerId);
        // Supprimer le joueur de la scène
        if (player) {
            this.broadcast("removePlayer", { sessionId: playerId });
            delete this.players[playerId];
        }
        this.state.players.delete(playerId);
    }

    onDispose() {
        console.log("Room disposed!");
    }
}

const server = new Server();
server.define('my_room', MyRoom);

server.listen(2567);
console.log("Server started on port 2567");
