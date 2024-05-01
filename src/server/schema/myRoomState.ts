const { Schema, MapSchema, type } = require("@colyseus/schema");

class Player extends Schema {

    constructor(sessionId) {
        super();
        this.sessionId = sessionId;
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.pseudo = "";
        this.idCountryFlag = 0;

    }
}
type("string")(Player.prototype, "sessionId");
type("number")(Player.prototype, "x");
type("number")(Player.prototype, "y");
type("number")(Player.prototype, "z");
type("string")(Player.prototype, "pseudo");
type("number")(Player.prototype, "idCountryFlag");

class MyRoomState extends Schema {
    constructor() {
        super();
        this.players = new MapSchema();
    }
}

type({ map: Player })(MyRoomState.prototype, "players");

module.exports = { Player, MyRoomState };
