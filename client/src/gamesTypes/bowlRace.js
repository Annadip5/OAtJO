import { ActionManager, ArcRotateCamera, Color3, Color4, ExecuteCodeAction, FollowCamera, FreeCamera, HavokPlugin, HemisphericLight, InterpolateValueAction, KeyboardEventTypes, Mesh, MeshBuilder, ParticleSystem, PhysicsAggregate, PhysicsMotionType, PhysicsShapeType, Quaternion, Scene, SetValueAction, ShadowGenerator, SpotLight, StandardMaterial, Texture, Vector3 } from "@babylonjs/core";
import { Inspector } from '@babylonjs/inspector';
import HavokPhysics from "@babylonjs/havok";

import Player from "../players/bowl";
import Arena from "../arenas/pistCourse";
import Decors from "../arenas/decors";
import WallCreator from "../managers/wallCreator";
import { AdvancedDynamicTexture, Rectangle, TextBlock } from "@babylonjs/gui";

class Game {
    canStart = false;
    canStartDecompte = false
    #room;

    #canvas;
    #engine;
    #havokInstance;
    #gameScene;
    #gameCamera;
    #shadowGenerator;
    #bInspector = false;

    #elevator;
    #elevatorAggregate;
    x

    #phase = 0.0;
    #vitesseY = 1.8;
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
    obstacle;

    startTime;
    isAllPlayerReady = false;
    #elapsedTimeText;
    isEnd = false;
    #parcourManage;

    constructor(canvas, engine, room) {

        this.#room = room
        this.#canvas = canvas;
        this.#engine = engine;


    }


    async start() {
        await this.initGame()
        this.gameLoop();
        this.endGame();
    }

    createScene() {
        const scene = new Scene(this.#engine);
        scene.collisionsEnabled = true;

        const hk = new HavokPlugin(true, this.#havokInstance);
        // enable physics in the scene with a gravity
        scene.enablePhysics(new Vector3(0, -9.81, 0), hk);
        scene.debugLayer.show();

        const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
        light.intensity = 0.7;

        const sLight = new SpotLight("spot1", new Vector3(0, 20, 20), new Vector3(0, -1, -1), 2, 24, scene);
        this.#shadowGenerator = new ShadowGenerator(1024, sLight);
        this.#shadowGenerator.useBlurExponentialShadowMap = true;

        const elevator = MeshBuilder.CreateDisc("sphere", { diameter: 2, segments: 32 }, scene);
        elevator.rotate(Vector3.Right(), Math.PI / 2)
        elevator.position.y = 0.1;
        this.#elevator = elevator;

        const matSphere = new StandardMaterial("silver", scene);
        matSphere.diffuseColor = new Color3(0.8, 0.8, 1);
        matSphere.specularColor = new Color3(0.4, 0.4, 1);
        elevator.material = matSphere;

        this.#shadowGenerator.addShadowCaster(elevator);




        // Create a sphere shape and the associated body. Size will be determined automatically.
        this.#elevatorAggregate = new PhysicsAggregate(elevator, PhysicsShapeType.CONVEX_HULL, { mass: 1, restitution: 0.0 }, scene);
        this.#elevatorAggregate.body.setMotionType(PhysicsMotionType.ANIMATED);


        let boxDebug = MeshBuilder.CreateSphere("boxDebug", { size: 2 });
        boxDebug.position = new Vector3(5, 15, 0);
        this.#shadowGenerator.addShadowCaster(boxDebug);

        // Create a sphere shape and the associated body. Size will be determined automatically.
        const sphereAggregate = new PhysicsAggregate(boxDebug, PhysicsShapeType.SPHERE, { mass: 0.25, restitution: 0.01 }, scene);



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
        await this.#decors.init();


        console.log(this.#room);
        this.createElapsedTimeText();
        this.createStartButton();

        this.#room.state.players.onAdd((player, sessionId) => {

            const isCurrentPlayer = (sessionId === this.#room.sessionId);
            const { x, y, z, idCountryFlag, pseudo } = player;

            // Créer un joueur

            const newPlayer = new Player(x, y, z, this.#gameScene, this.#arena, pseudo, this.#gameType, idCountryFlag);
            newPlayer.init();

            this.#playerEntities[sessionId] = newPlayer;


            if (isCurrentPlayer) {
                this.#player = newPlayer;

            }
            //console.log(this.#playerEntities[sessionId])



        });


        //console.log(this.#playerNextPosition[this.#room.sessionId])
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

                //console.log(message);

            }
        });
        this.#room.onMessage("allPlayersReady", (message) => {
            console.log(message)
            this.isAllPlayerReady = true;
            this.startCountdown();
        })



        this.#player2 = new Player(6, 13, 3, this.#gameScene, this.#arena, "2 eme player", this.#gameType, 5);
        await this.#player2.init();

        this.#gameScene.activeCamera = this.#player.camera;
        this.#gameScene.activeCamera.attachControl(this.#canvas, true);
        //this.createSquareDetectionAreaFinish(this.#gameScene, this.#player.gameObject);
        this.#parcourManage = new WallCreator(this.#gameScene);
        this.#parcourManage.createSquareDetection(this.#player.gameObject)


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

            if (this.canStart && !this.#parcourManage.isEnd) {
                this.updateElapsedTime();
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
            this.#playerEntities[this.#room.sessionId].update(this.inputMap, this.actions, this.delta, this.#room);

        }
        this.#playerEntities[this.#room.sessionId].sendMovementDataToServer(this.#room, this.inputMap["KeyW"], this.inputMap["KeyS"], this.inputMap["Space"]);

        for (const playerId in this.#playerEntities) {


            if (playerId !== this.#room.sessionId) {
                const otherPlayer = this.#playerEntities[playerId];
                const localPlayer = this.#playerEntities[this.#room.sessionId];

                // Vérifier si le mesh du joueur local entre en collision avec le mesh de l'autre joueur
                if (localPlayer.gameObject.intersectsMesh(otherPlayer.gameObject)) {
                    console.log(`Collision entre le joueur local et ${otherPlayer.pseudo}`);
                    // Appliquer une vélocité de saut au joueur local
                    /*const currentVelocity = new Vector3(0, 5, 0);
                    otherPlayer.capsuleAggregate.body.setLinearVelocity(currentVelocity);*/
                    this.sendCollisionToServer(playerId);

                }
            }
        }



        //Animation
        this.#phase += this.#vitesseY * this.delta;
        this.#elevatorAggregate.body.setLinearVelocity(new Vector3(0, Math.sin(this.#phase)), 0);
    }

    sendCollisionToServer(otherPlayerId) {
        // Envoyer l'input de ce joueur au serveur
        this.#room.send("collision", { collision: otherPlayerId });
    }

    async startCountdown() {
        await this.delay(3000);
        const countdownText = new TextBlock();
        countdownText.text = "3";
        countdownText.color = "blue";
        countdownText.fontSize = 500;

        const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("CountdownUI");
        advancedTexture.addControl(countdownText);

        await this.delay(1000);
        console.log("2");
        countdownText.color = "white";
        countdownText.text = "2";
        await this.delay(1000);
        console.log("1");
        countdownText.color = "red";
        countdownText.text = "1";
        await this.delay(1000);
        console.log("GO");
        countdownText.color = "red";
        countdownText.text = "GO!";

        await this.delay(500);
        countdownText.dispose();
        this.canStart = true;
        this.startChrono()


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
        const elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);

        if (elapsedTime >= 60) {
            const minutes = Math.floor(elapsedTime / 60);
            const seconds = elapsedTime % 60;
            this.#elapsedTimeText.text = minutes + "m " + seconds + "s";
        } else {
            this.#elapsedTimeText.text = elapsedTime + "s";
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
        startButtonText.text = "PRET";
        startButtonText.color = "white";
        startButtonText.fontSize = 30;
        startButtonText.verticalAlignment = TextBlock.VERTICAL_ALIGNMENT_CENTER;
        startButtonText.horizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_CENTER;

        startButtonRect.addControl(startButtonText);

        startButtonRect.hoverCursor = "pointer";

        advancedTexture.addControl(startButtonRect);

        startButtonRect.onPointerClickObservable.add(() => {
            this.#room.send("playerReady", {});
            startButtonRect.dispose()
        });
    }

}

export default Game;