const { Server, Room } = require('colyseus');
const { MyRoomState, Player } = require('./schema/myRoomState.ts')
//import { State, Player } from './schema/myRoomState';

class MyRoom extends Room {
    constructor() {
        super();
        this.players = {};
        this.readyPlayers = new Set();
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


        this.onMessage("updateMovement", (client, data) => {
            //console.log("update move received -> ", client.sessionId);
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



            }

        });
        this.onMessage("collision", (client, data) => {
            console.log("collision detected -> ");
            const colliderPlayer = this.state.players.get(client.sessionId);
            const collidedPlayer = this.state.players.get(data.collision);
            colliderPlayer.isCollider = true;
            collidedPlayer.isCollided = true;
            //this.broadcast("updatePlayerCollision",)

            console.log("between ", client.sessionId, " and ", data.collision);

        });


        this.onMessage("playerReady", (client, data) => {
            this.readyPlayers.add(client.sessionId);
            console.log("ready : ", client.sessionId)

            if (this.readyPlayers.size === this.state.players.size && this.readyPlayers.size >= 2) {
                this.broadcast("allPlayersReady", { message: "Tous les joueurs sont prêts!" });
            }
        });

    }

    onJoin(client, options) {
        console.log("Client joined!", client.sessionId);
        //const queryString = options.query || "";

        //const urlParams = new URLSearchParams(queryString);

        const pseudo = options.pseudo;   //urlParams.get('pseudo');
        const type = options.type;      //urlParams.get('type');
        const indice = options.indice;  //parseInt(urlParams.get('indice'));

        const player = new Player(client.sessionId);
        const playerIndex = this.state.players.size;
        console.log(playerIndex)
        if (playerIndex < 6) {
            const initialPosition = this.initialPositions[playerIndex];
            player.x = initialPosition.x;
            player.y = initialPosition.y;
            player.z = initialPosition.z;
            player.pseudo = pseudo;
            player.idCountryFlag = indice;
            player.type = type;


            this.state.players.set(client.sessionId, player);

            console.log("new player =>", player.toJSON());

        }
        else {
            console.log("Vous ne pouvez plus entrer");
        }

    }
    onUpdate() { }


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
