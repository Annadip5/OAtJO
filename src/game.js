import { Engine } from "@babylonjs/core";

import Game from "./gamesTypes/bowlRace";

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

