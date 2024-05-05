const { Server, Room } = require('colyseus');
const { MyRoomState, Player } = require('./schema/myRoomState.ts')
//import { State, Player } from './schema/myRoomState';

class MyRoom extends Room {
    constructor() {
        super();
        this.players = {};
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
        this.onMessage("updateUrlParams", (client, data) => {
            // Mettre à jour les paramètres du joueur
            const player = this.state.players.get(client.sessionId);
            if (player) {
                player.pseudo = data.pseudo;
                player.idCountryFlag = data.indice;
                this.state.players.set(client.sessionId, player);
                this.broadcast("updatePlayerParams", { sessionId: client.sessionId, pseudo: data.pseudo, idCountryFlag: data.indice });

            }
        });
        this.onMessage("playerInput", (client, data) => {
            // Récupérer le joueur correspondant au client
            const player = this.state.players.get(client.sessionId);

            if (player) {
                player.inputMap = data.inputMap;
                player.actions = data.actions;

                this.state.players.set(client.sessionId, player);
                console.log(player.sessionId, " update Movement -> ", data);
                this.broadcast("updatePlayerInput", { sessionId: client.sessionId, input: data.inputMap, action: data.actions });
            }
        });
        this.onMessage("updateMovement", (client, data) => {
            console.log("update move received -> ", client.sessionId);
            const player = this.state.players.get(client.sessionId);

            if (player) {
                player.x = data.position._x;
                player.y = data.position._y;
                player.z = data.position._z;
                player.veloX = data.velocity._x;
                player.veloY = data.velocity._y;
                player.veloZ = data.velocity._z;
                player.quaterX = data.rotation._x;
                player.quaterY = data.rotation._y;
                player.quaterZ = data.rotation._z;
                player.quaterW = data.rotation._w;

                this.broadcast("updatePlayerMove", { sessionId: client.sessionId, position: data.position, velocity: data.velocity, rotation: data.rotation }, { except: client.sessionId });

                console.log("position : ", data.position._x, " /", data.position._y, " /", data.position._z);
                console.log("velocity : ", data.velocity._x, " /", data.velocity._y, " /", data.velocity._z);
                console.log("rotation : ", data.rotation._x, " /", data.rotation._y, " /", data.rotation._z, " /", data.rotation._w);

            }

        });

        this.onMessage("updatePosition", (client, data) => {
            console.log("update received -> ");
            console.debug(JSON.stringify(data));
            const player = this.state.players.get(client.sessionId);
            player.x = data["x"];
            player.y = data['y'];
            player.z = data["z"];
            //this.state.players.set(client.sessionId, player);
            //this.broadcast("updatePlayerPosition", { sessionId: client.sessionId, x: data.x, y: data.y, z: data.z });

        });

    }

    onJoin(client, options) {
        console.log("Client joined!", client.sessionId);
        const queryString = options.query || "";

        const urlParams = new URLSearchParams(queryString);

        const pseudo = urlParams.get('pseudo');
        const type = urlParams.get('type');
        const indice = parseInt(urlParams.get('indice'));

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

        }
        else {
            console.log("Vous ne pouvez plus entrer");
        }

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
