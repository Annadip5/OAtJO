import { ActionManager, ArcRotateCamera, Color3, Color4, ExecuteCodeAction, FollowCamera, FreeCamera, HavokPlugin, HemisphericLight, InterpolateValueAction, KeyboardEventTypes, Mesh, MeshBuilder, ParticleSystem, PhysicsAggregate, PhysicsMotionType, PhysicsShapeType, Quaternion, Scene, SetValueAction, ShadowGenerator, SpotLight, StandardMaterial, Texture, Vector3 } from "@babylonjs/core";
import { Inspector } from '@babylonjs/inspector';
import HavokPhysics from "@babylonjs/havok";

import Player from "../players/bowl";
import Arena from "../arenas/pistCourse";
import Decors from "../arenas/decors";
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui";

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
    #elapsedTimeText


    constructor(canvas, engine, room) {

        this.#room = room
        this.#canvas = canvas;
        this.#engine = engine;


    }

    updatePlayerPosition(sessionId, x, y, z) {
        if (this.#playerEntities[sessionId]) {
            //console.log("update Player position");
            // Si le joueur existe dans la liste des entités
            this.#playerEntities[sessionId].transform.position = new Vector3(x, y, z);

            /*this.#playerEntities[sessionId].gameObject.position.x = x;
            this.#playerEntities[sessionId].gameObject.position.y = y;
            this.#playerEntities[sessionId].gameObject.position.z = z;*/
        }
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


    async syncUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const pseudo = urlParams.get('pseudo');
        const type = urlParams.get('type');
        const indice = parseInt(urlParams.get('indice'));

        this.#room.send("updateUrlParams", { pseudo, type, indice });
    }

    async initGame() {
        this.#havokInstance = await this.getInitializedHavok();
        this.#gameScene = this.createScene();
        this.#arena = new Arena(3, 10, 3, this.#gameScene);
        await this.#arena.init();
        this.#arena.zoneSable.isVisible = false;
        this.#decors = new Decors(this.#gameScene)
        await this.#decors.init();


        console.log(this.#room);
        await this.syncUrlParams();
        this.createElapsedTimeText();

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


        this.#room.onMessage("updatePlayerParams", (message) => {
            const { sessionId, pseudo, idCountryFlag } = message;
            this.updatePlayerParams(sessionId, pseudo, idCountryFlag);
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
        /*this.#room.onMessage("updatePlayerInput", (message) => {
            const { sessionId, input, action } = message;
            console.log(sessionId, " inputs : ", input, " action : ", action);

            this.#playerEntities[sessionId].player.update(input, action, this.delta, this.#room);

        });*/


        this.#player2 = new Player(6, 13, 3, this.#gameScene, this.#arena, "2 eme player", this.#gameType, 5);
        await this.#player2.init();

        this.#gameScene.activeCamera = this.#player.camera;
        this.#gameScene.activeCamera.attachControl(this.#canvas, true);
        this.createSquareDetectionAreaFinish(this.#gameScene, this.#player.gameObject)
        this.createSquareDetectionAreaStart(this.#gameScene, this.#player.gameObject)


        this.#shadowGenerator.addShadowCaster(this.#playerEntities[this.#room.sessionId].gameObject, true);
        //await this.createCamera();



        this.initInput();


    }
    async createCamera() {
        //console.log(this.#playerEntities)
        this.#gameCamera = await new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 4, 20, this.#playerEntities[this.#room.sessionId].gameObject.position.subtract(new Vector3(0, -3, -2)), this.scene);
        this.reglageCamera(2, 10, 0.05, 1000);
        this.reglageScene();

    }
    updatePlayerParams(sessionId, pseudo, idCountryFlag) {
        if (this.#playerEntities[sessionId]) {
            this.#playerEntities[sessionId].pseudo = pseudo;
            this.#playerEntities[sessionId].idCountryFlag = idCountryFlag;
            this.#playerEntities[sessionId].updatePseudo(pseudo);
            this.#playerEntities[sessionId].updateIdCountryFlag(idCountryFlag);

        }
    }
    reglageCamera(lowerRadiusLimit, upperRadiusLimit, wheelDeltaPercentage, angularSensibility) {
        this.#gameCamera.lowerRadiusLimit = lowerRadiusLimit;
        this.#gameCamera.upperRadiusLimit = upperRadiusLimit;
        this.#gameCamera.wheelDeltaPercentage = wheelDeltaPercentage;
        this.#gameCamera.angularSensibility = angularSensibility;
        //console.log(this.#player.gameObject.position);
        this.#gameCamera.target = this.#playerEntities[this.#room.sessionId].gameObject;
        //console.log(this.#gameCamera.target);
        //2, 10, 0.05, 1000
    }
    reglageScene() {
        //this.scene.enablePhysics(new Vector3(0, -9.81, 0), new CannonJSPlugin());
        this.#gameScene.activeCamera = this.#gameCamera;
        this.#gameScene.activeCamera.attachControl(this.#canvas, true);
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
        this.startCountdown()
        this.startChrono()

        this.#engine.runRenderLoop(() => {
            this.updateElapsedTime();
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
        await this.delay(5000);
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

    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async createSquareDetectionAreaFinish(scene, localPlayer) {
        const square = Mesh.CreateGround("square", 5, 7, 1, scene);
        //-259.4 / -20 (test)
        square.position = new Vector3(-259.4, 3, 25.3);
        square.scaling = new Vector3(2.1, 1, 1)
        square.rotation = new Vector3(276.5 * (Math.PI / 180), 270.4 * (Math.PI / 180), 0);

        square.material = new StandardMaterial("squareMat", scene);
        square.material.diffuseColor = new Color3(0, 1, 0); // Vert

        square.checkCollisions = true;

        square.actionManager = new ActionManager(scene);
        square.actionManager.registerAction(
            new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnIntersectionEnterTrigger,
                    parameter: localPlayer
                },
                () => {
                    console.log("Le joueur est entré dans le carré !");
                }
            )
        );

        square.actionManager.registerAction(
            new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnIntersectionExitTrigger,
                    parameter: localPlayer
                },
                () => {
                    console.log("Le joueur est sorti du carré !");
                }
            )
        );
        //texte de fin de course 
        const finishText = new TextBlock();
        finishText.text = "FINISH";
        finishText.color = "white";
        finishText.fontSize = 330;


        const advancedTexture = AdvancedDynamicTexture.CreateForMesh(square);
        advancedTexture.addControl(finishText);
        finishText.top = "10px";
    }
    async createSquareDetectionAreaStart(scene, localPlayer) {
        const square = Mesh.CreateGround("square", 5, 7, 1, scene);
        //-259.4 / -20 (test)
        square.position = new Vector3(-15, 3, 25.3);
        square.scaling = new Vector3(2.1, 1, 1)
        square.rotation = new Vector3(276.5 * (Math.PI / 180), 270.4 * (Math.PI / 180), 0);

        square.material = new StandardMaterial("squareMat", scene);
        square.material.diffuseColor = new Color3(0, 1, 0); // Vert

        square.checkCollisions = true;

        square.actionManager = new ActionManager(scene);
        square.actionManager.registerAction(
            new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnIntersectionEnterTrigger,
                    parameter: localPlayer
                },
                () => {
                    console.log("Le joueur est entré dans le carré !");
                }
            )
        );

        square.actionManager.registerAction(
            new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnIntersectionExitTrigger,
                    parameter: localPlayer
                },
                () => {
                    console.log("Le joueur est sorti du carré !");
                }
            )
        );
        //texte de fin de course 
        const finishText = new TextBlock();
        finishText.text = "START";
        finishText.color = "white";
        finishText.fontSize = 330;


        const advancedTexture = AdvancedDynamicTexture.CreateForMesh(square);
        advancedTexture.addControl(finishText);
        finishText.top = "10px";
    }
    startChrono() {

        this.startTime = Date.now();
        this.#playerEntities[this.#room.sessionId].startTime = this.startTime;
    }
    createElapsedTimeText() {
        const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        this.#elapsedTimeText = new TextBlock();
        this.#elapsedTimeText.text = "Time: 0s";
        this.#elapsedTimeText.color = "white";
        this.#elapsedTimeText.fontSize = 24;
        advancedTexture.addControl(this.#elapsedTimeText);
    }

    updateElapsedTime() {
        const elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);

        this.#elapsedTimeText.text = "Time: " + elapsedTime + "s";
    }

}

export default Game;