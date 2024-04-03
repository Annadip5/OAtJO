import { Engine } from "@babylonjs/core";
import BowlRace from "./gamesTypes/bowlRace";

let engine;
let canvas;
let game;
window.onload = () => {
    canvas = createCanvas();
    engine = new Engine(canvas, true);
    window.addEventListener("resize", function () {
        engine.resize();
    })
    game = new BowlRace(engine, canvas);
    game.start();

}

function createCanvas() {
    var c = document.createElement("canvas");
    c.style.width = "100%";
    c.style.height = "50%";
    c.id = "gameCanvas";
    document.body.appendChild(c);
    return c;
}