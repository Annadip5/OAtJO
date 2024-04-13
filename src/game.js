import { Engine } from "@babylonjs/core";

import Game from "./gamesTypes/bowlRace";
const Colyseus = require('colyseus.js');

const client = new Colyseus.Client('ws://localhost:2567');

client.joinOrCreate("my_room", {/* options */ }).then(room => {
    console.log("joined successfully"/*, room*/);
}).catch(e => {
    console.error("join error", e);
});

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
    const game = new Game(canvas, engine);
    game.start();
});

