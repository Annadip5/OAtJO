import { Engine } from "@babylonjs/core";

import Game from "./gamesTypes/bowlRace";
const Colyseus = require('colyseus.js');


const client = new Colyseus.Client('ws://localhost:2567');
/*await client.joinOrCreate("my_room", { name: "Race" }).then(room => {
    console.log("joined successfully", room);
}).catch(e => {
    console.error("join error", e);
});*/
let canvas;
let engine;

const babylonInit = async () => {

    canvas = document.getElementById("renderCanvas");
    engine = new Engine(canvas, false, {
        adaptToDeviceRatio: true,
    });

    window.addEventListener("resize", function () {
        engine.resize();
    });
};



babylonInit().then(() => {
    client.joinOrCreate("my_room", { name: "Race" }).then(room => {
        // Une fois la salle rejointe ou créée, créez une instance de l'objet Game en lui passant la salle.
        const game = new Game(canvas, engine, room);

        // Démarrez le jeu.
        game.start();
    }).catch(e => {
        // Gérez les erreurs de connexion à la salle.
        console.error("Erreur lors de la connexion à la salle", e);
    });
});
