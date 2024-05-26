import { Engine } from "@babylonjs/core";

import Game from "./gamesTypes/bowlRace";
import Combat from "./gamesTypes/combat";
import Football from "./gamesTypes/football";
const Colyseus = require('colyseus.js');


const client = new Colyseus.Client('ws://localhost:2567');

let canvas;
let engine;

const babylonInit = async () => {

    canvas = document.getElementById("renderCanvas");
    engine = new Engine(canvas, true, {
        adaptToDeviceRatio: true,
    }, { stencil: true });

    window.addEventListener("resize", function () {
        engine.resize();
    });
};



babylonInit().then(() => {
    const urlParams = new URLSearchParams(window.location.search);

    const pseudo = urlParams.get('pseudo');
    const type = urlParams.get('type');
    const indice = parseInt(urlParams.get('indice'));
    const code = urlParams.get('code');


    const startGame = (gameType) => {
        let roomName;

        switch (gameType) {
            case 'race':
                roomName = 'race_room';
                break;
            case 'combat':
                roomName = 'combat_room';
                break;
            case 'football':
                roomName = 'football_room';
                break;
            default:
                console.error("Jeu non reconnu");
                return;
        }
        const options = {
            name: roomName,
            pseudo: pseudo,
            type: type,
            indice: indice

        };
        client.joinOrCreate(roomName, options).then(room => {
            let game;
            switch (gameType) {
                case 'race':
                    game = new Game(canvas, engine, room);
                    break;
                case 'combat':
                    game = new Combat(canvas, engine, room);
                    break;
                case 'football':
                    game = new Football(canvas, engine, room);
                    break;
                default:
                    console.error("Jeu non reconnu");
                    return;
            }
            game.start();
            document.getElementById('gameSelection').style.display = 'none';

        }).catch(e => {
            console.error("Erreur lors de la connexion à la salle", e);
        });
    };

    document.getElementById("raceButton").addEventListener("click", () => {
        startGame('race');
    });

    document.getElementById("combatButton").addEventListener("click", () => {
        startGame('combat');
    });

    document.getElementById("footballButton").addEventListener("click", () => {
        startGame('football');
    });
});