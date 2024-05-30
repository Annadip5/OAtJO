import { ActionManager, ArcRotateCamera, Animation, HavokPlugin, HemisphericLight, InterpolateValueAction, KeyboardEventTypes, Mesh, MeshBuilder, ParticleSystem, PhysicsAggregate, PhysicsMotionType, PhysicsShapeType, Quaternion, Scene, SetValueAction, ShadowGenerator, SpotLight, StandardMaterial, Texture, Vector3, Sound, CubeTexture, Color3 } from "@babylonjs/core";
import { Inspector } from '@babylonjs/inspector';
import HavokPhysics from "@babylonjs/havok";

import { AdvancedDynamicTexture, Rectangle, TextBlock } from "@babylonjs/gui";

import Player from "../players/bowl";
import Arena from "../arenas/pistLutte";
import Decors from "../arenas/decors";
import WallCreator from "../managers/wallCreator";
import ArrowsManager from "../managers/arrows";

import winSoundUrl from "../../assets/sounds/win.mp3"
import decompteUrl from "../../assets/sounds/decompte.mp3"
import decompteUrl2 from "../../assets/sounds/decompte2.mp3"
import readyUrl from "../../assets/sounds/ready.mp3"
import backgroundMusicUrl from "../../assets/sounds/eyeTiger.mp3";


class Combat {
    canStart = false;
    canStartDecompte = false
    #room;

    #canvas;
    #engine;
    #havokInstance;
    #gameScene;

    #shadowGenerator;
    #bInspector = false;

    x
    inputMap = {};
    #playerInputs = {};
    actions = {};
    #playerEntities = {};
    #playerNextPosition = {};
    #player;
    #player2;
    #arena;
    #gameType;
    delta;
    #decors;

    startTime;
    isAllPlayerReady = false;
    #elapsedTimeText;
    isEnd = false;
    #parcourManage;
    #arrows;
    chronoSended = false;
    //sounds
    #winSound
    #decompteSound
    #decompteSound2
    #readySound
    #backgroundMusic

    constructor(canvas, engine, room) {

        this.#room = room
        this.#canvas = canvas;
        this.#engine = engine;


    }


    async start() {
        await this.initGame()
        this.animateCamera();
        this.gameLoop();
        this.endGame();
    }

    createScene() {
        const scene = new Scene(this.#engine);
        scene.collisionsEnabled = true;

        const hk = new HavokPlugin(true, this.#havokInstance);
        // enable physics in the scene with a gravity
        scene.enablePhysics(new Vector3(0, -9.81, 0), hk);
        //scene.debugLayer.show();

        const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
        light.intensity = 0.7;

        const sLight = new SpotLight("spot1", new Vector3(0, 20, 20), new Vector3(0, -1, -1), 2, 24, scene);
        this.#shadowGenerator = new ShadowGenerator(1024, sLight);
        this.#shadowGenerator.useBlurExponentialShadowMap = true;


        let boxDebug = MeshBuilder.CreateSphere("boxDebug", { size: 2 });
        boxDebug.position = new Vector3(5, 15, 0);
        this.#shadowGenerator.addShadowCaster(boxDebug);

        this.#winSound = new Sound("win", winSoundUrl, this.#gameScene);
        this.#decompteSound = new Sound("decompte", decompteUrl, this.#gameScene);
        this.#decompteSound2 = new Sound("decompte2", decompteUrl2, this.#gameScene);
        this.#readySound = new Sound("ready", readyUrl, this.#gameScene);

        this.#backgroundMusic = new Sound("backgroundMusic", backgroundMusicUrl, this.#gameScene, null, {
            loop: true,
            autoplay: false,
            volume: 0.5
        });


        return scene;
    }

    async getInitializedHavok() {
        return await HavokPhysics();
    }


    async initGame() {
        this.#havokInstance = await this.getInitializedHavok();
        this.#gameScene = this.createScene();
        this.#arena = new Arena(3, 10, 3, this.#gameScene);
        await this.#arena.init();
        //this.#arena.zoneSable.isVisible = false;
        this.#decors = new Decors(this.#gameScene)
        await this.#decors.initNotreDame();


        console.log(this.#room);
        this.createElapsedTimeText();
        this.createStartButton();



        this.initializePlayerEntities();
        this.setupNetworkHandlers();


        this.#player2 = new Player(10, 13, 3, this.#gameScene, this.#arena, "", this.#gameType, 5);
        await this.#player2.init();
        this.#player2.gameObject.isVisible = false;

        this.#gameScene.activeCamera = this.#player.camera;
        this.#gameScene.activeCamera.attachControl(this.#canvas, true);

        this.#arrows = new ArrowsManager(this.#gameScene, this.#player, this.#room);
        await this.#arrows.createelimground();
        console.log(this.#playerEntities)
        this.#shadowGenerator.addShadowCaster(this.#playerEntities[this.#room.sessionId].gameObject, true);



        this.initInput();


    }


    initInput() {
        this.#gameScene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.type) {
                case KeyboardEventTypes.KEYDOWN:
                    this.inputMap[kbInfo.event.code] = true;
                    this.#playerInputs[this.#room.sessionId] = this.inputMap[kbInfo.event.code];

                    //this.sendInputToServer();

                    //console.log(`KEY DOWN: ${kbInfo.event.code} / ${kbInfo.event.key}`);
                    break;
                case KeyboardEventTypes.KEYUP:
                    this.inputMap[kbInfo.event.code] = false;
                    this.#playerInputs[this.#room.sessionId] = this.inputMap[kbInfo.event.code];
                    this.actions[kbInfo.event.code] = true;
                    //console.log(`KEY UP: ${kbInfo.event.code} / ${kbInfo.event.key}`);
                    //this.sendInputToServer();


                    break;
            }
        });
    }
    sendInputToServer() {
        // Envoyer l'input de ce joueur au serveur
        this.#room.send("playerInput", { inputMap: this.inputMap, actions: this.actions });
    }

    endGame() {

    }

    gameLoop() {

        const divFps = document.getElementById("fps");

        this.#engine.runRenderLoop(() => {

            if (this.canStart && !this.isEnd) {
                this.updateElapsedTime();
            }
            else if (this.isEnd && !this.chronoSended) {
                this.#backgroundMusic.stop()
                this.#room.send("sendChrono", { chrono: this.elapsedTime });
                this.chronoSended = true;
                if (this.#winSound.isReady()) {
                    this.#winSound.play();
                }

            }
            this.updateGame();




            //Debug
            if (this.actions["KeyI"]) {
                this.#bInspector = !this.#bInspector;

                if (this.#bInspector)
                    Inspector.Show();
                else
                    Inspector.Hide();
            }

            this.actions = {};
            divFps.innerHTML = this.#engine.getFps().toFixed() + " fps";
            this.#gameScene.render();
        });
    }

    updateGame() {
        this.delta = this.#engine.getDeltaTime() / 1000.0;
        //console.log("delta : ", this.delta)
        if (this.canStart) {
            this.#playerEntities[this.#room.sessionId].update(this.inputMap, this.actions, this.delta, this.#room, this.#backgroundMusic);

        }
        this.#playerEntities[this.#room.sessionId].sendMovementDataToServer(this.#room, this.inputMap["KeyW"], this.inputMap["KeyS"], this.inputMap["Space"]);

        for (const playerId in this.#playerEntities) {

            if (playerId !== this.#room.sessionId) {
                const otherPlayer = this.#playerEntities[playerId];
                const localPlayer = this.#playerEntities[this.#room.sessionId];

                // Vérifier si le mesh du joueur local entre en collision avec le mesh de l'autre joueur
                if (localPlayer.gameObject.intersectsMesh(otherPlayer.gameObject)) {
                    console.log(`Collision entre le joueur local et ${otherPlayer.pseudo}`);

                    this.sendCollisionToServer(playerId);

                }
            }
        }
    }

    sendCollisionToServer(otherPlayerId) {
        // Envoyer l'input de ce joueur au serveur
        this.#room.send("collision", { collision: otherPlayerId });
    }
    convertSecondsToMinSec(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    }
    async startCountdown() {

        await this.delay(3000);
        if (this.#decompteSound.isReady()) {
            this.#decompteSound.play();
        }
        const countdownText = new TextBlock();
        countdownText.text = "3";
        countdownText.color = "blue";
        countdownText.fontSize = 500;

        const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("CountdownUI");
        advancedTexture.addControl(countdownText);

        await this.delay(1000);
        if (this.#decompteSound.isReady()) {
            this.#decompteSound.play();
        }
        console.log("2");
        countdownText.color = "white";
        countdownText.text = "2";
        await this.delay(1000);
        if (this.#decompteSound.isReady()) {
            this.#decompteSound.play();
        }
        console.log("1");
        countdownText.color = "red";
        countdownText.text = "1";
        await this.delay(1000);
        if (this.#decompteSound2.isReady()) {
            this.#decompteSound2.play();
        }
        console.log("GO");
        countdownText.color = "red";
        countdownText.text = "GO!";

        await this.delay(500);
        countdownText.dispose();
        this.canStart = true;
        this.startChrono()
        this.#backgroundMusic.play()


    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }



    startChrono() {

        this.startTime = Date.now();
        this.#playerEntities[this.#room.sessionId].startTime = this.startTime;
    }
    createElapsedTimeText() {
        const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");

        const rectangle = new Rectangle();
        rectangle.width = "100%";
        rectangle.height = "10%";
        rectangle.color = "black";
        rectangle.thickness = 0;
        rectangle.background = "rgba(0, 0, 0, 0.2)";
        rectangle.verticalAlignment = Rectangle.VERTICAL_ALIGNMENT_TOP;
        rectangle.horizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_LEFT;


        this.#elapsedTimeText = new TextBlock();
        this.#elapsedTimeText.text = "0s";
        this.#elapsedTimeText.color = "white";
        this.#elapsedTimeText.fontSize = 24;
        this.#elapsedTimeText.horizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_LEFT;

        rectangle.addControl(this.#elapsedTimeText);

        advancedTexture.addControl(rectangle);
    }

    updateElapsedTime() {
        this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);

        if (this.elapsedTime >= 60) {
            const minutes = Math.floor(this.elapsedTime / 60);
            const seconds = this.elapsedTime % 60;
            this.#elapsedTimeText.text = minutes + "m " + seconds + "s";
        } else {
            this.#elapsedTimeText.text = this.elapsedTime + "s";
        }
    }

    createStartButton() {
        const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");

        const startButtonRect = new Rectangle();
        startButtonRect.width = "400px";
        startButtonRect.height = "100px";
        startButtonRect.color = "white";
        startButtonRect.background = "green";
        startButtonRect.cornerRadius = 20;
        startButtonRect.verticalAlignment = Rectangle.VERTICAL_ALIGNMENT_BOTTOM;
        startButtonRect.horizontalAlignment = Rectangle.HORIZONTAL_ALIGNMENT_CENTER;

        const startButtonText = new TextBlock();
        startButtonText.text = "READY";
        startButtonText.color = "white";
        startButtonText.fontSize = 30;
        startButtonText.verticalAlignment = TextBlock.VERTICAL_ALIGNMENT_CENTER;
        startButtonText.horizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_CENTER;

        startButtonRect.addControl(startButtonText);

        startButtonRect.hoverCursor = "pointer";

        advancedTexture.addControl(startButtonRect);

        startButtonRect.onPointerClickObservable.add(() => {
            this.#room.send("playerReady", {});
            if (this.#readySound.isReady()) {
                this.#readySound.play();
            }
            startButtonRect.dispose()
        });
    }
    animateCamera() {
        const camera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 10, new Vector3(0, 0, 0), this.#gameScene);
        const keyFrames = [];

        keyFrames.push({
            frame: 0,
            value: new Vector3(10, 10, 10)
        });
        keyFrames.push({
            frame: 30,
            value: new Vector3(20, 10, 0)
        });
        keyFrames.push({
            frame: 60,
            value: new Vector3(30, 10, -10)
        });
        keyFrames.push({
            frame: 120,
            value: new Vector3(40, 10, -20)
        });
        keyFrames.push({
            frame: 150,
            value: new Vector3(30, 10, -20)
        });
        keyFrames.push({
            frame: 180,
            value: new Vector3(20, 10, -20)
        });
        keyFrames.push({
            frame: 210,
            value: new Vector3(10, 10, -20)
        });
        keyFrames.push({
            frame: 240,
            value: new Vector3(5, 10, -15)
        });

        /*keyFrames.push({
            frame: 270,
            value: new Vector3(0, 0, -10)
        });*/
        const cameraAnimation = new Animation("cameraAnimation", "position", 60, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
        cameraAnimation.setKeys(keyFrames);

        camera.animations.push(cameraAnimation);

        this.#gameScene.activeCamera = camera;
        this.#gameScene.beginAnimation(camera, 0, 240, false, 1, () => {
            this.#gameScene.activeCamera = this.#player.camera;
            this.#gameScene.activeCamera.attachControl(this.#canvas, true);
        });
    }
    createFinalResultsUI(results) {
        const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");

        const resultsRectangle = new Rectangle();
        resultsRectangle.width = "50%";
        resultsRectangle.height = "50%";
        resultsRectangle.color = "white";
        resultsRectangle.thickness = 2;
        resultsRectangle.background = "rgba(0, 0, 0, 0.8)";
        resultsRectangle.cornerRadius = 20;
        resultsRectangle.verticalAlignment = Rectangle.VERTICAL_ALIGNMENT_CENTER;
        resultsRectangle.horizontalAlignment = Rectangle.HORIZONTAL_ALIGNMENT_CENTER;

        const resultsText = new TextBlock();
        resultsText.text = "Résultats Finaux:\n";
        resultsText.color = "white";
        resultsText.fontSize = 24;
        resultsText.textWrapping = true;
        resultsText.paddingTop = 20;
        results.reverse();

        results.forEach((result, index) => {
            resultsText.text += `${index + 1}. ${this.#playerEntities[result].pseudo} \n`;
        });

        resultsRectangle.addControl(resultsText);
        advancedTexture.addControl(resultsRectangle);
    }

    setupNetworkHandlers() {
        this.#room.onMessage("removePlayer", (message) => {
            const playerId = message.sessionId;
            const playerEntity = this.#playerEntities[playerId];
            if (playerEntity) {
                playerEntity.removeFromScene();
                delete this.#playerEntities[playerId];
            }
        });

        this.#room.onMessage("updatePlayerMove", (message) => {
            const playerId = message.sessionId;
            const playerEntity = this.#playerEntities[playerId];
            if (playerId !== this.#room.sessionId && playerEntity) {
                playerEntity.updateMoveVelo(message);
            }
        });

        this.#room.onMessage("allPlayersReady", (message) => {
            console.log(message);
            this.isAllPlayerReady = true;
            this.startCountdown();
        });

        this.#room.onMessage("finalResults", (message) => {
            console.log(message);
            console.log(this.#playerEntities);
            this.createFinalResultsUI(message);
        });
        this.#room.onMessage("finalResLutte", (message) => {
            console.log(message);
            this.createFinalResultsUI(message.tableau);
        });
    }

    initializePlayerEntities() {
        this.#room.state.players.onAdd((player, sessionId) => {

            const isCurrentPlayer = (sessionId === this.#room.sessionId);
            const { x, y, z, idCountryFlag, pseudo } = player;

            // Créer un joueur

            const newPlayer = new Player(x, y, z, this.#gameScene, this.#arena, pseudo, this.#gameType, idCountryFlag, sessionId);
            newPlayer.init();

            this.#playerEntities[sessionId] = newPlayer;


            if (isCurrentPlayer) {
                this.#player = newPlayer;

            }
            //console.log(this.#playerEntities[sessionId])



        });
    }


}

export default Combat;