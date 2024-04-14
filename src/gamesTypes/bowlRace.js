import { ActionManager, ArcRotateCamera, Color3, Color4, FollowCamera, FreeCamera, HavokPlugin, HemisphericLight, InterpolateValueAction, KeyboardEventTypes, Mesh, MeshBuilder, ParticleSystem, PhysicsAggregate, PhysicsMotionType, PhysicsShapeType, Scene, SetValueAction, ShadowGenerator, SpotLight, StandardMaterial, Texture, Vector3 } from "@babylonjs/core";
import { Inspector } from '@babylonjs/inspector';
import HavokPhysics from "@babylonjs/havok";

import Player from "../players/bowl";
import Arena from "../arenas/pistCourse";

class Game {
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
    actions = {};
    #playerEntities = {};
    #player;
    #player2;
    #arena;
    #urlParams;
    #pseudo;
    #gameType;
    #idCountryFlag;

    constructor(canvas, engine, room) {

        this.#room = room
        this.#canvas = canvas;
        this.#engine = engine;
        this.#urlParams = new URLSearchParams(window.location.search);
        this.#pseudo = this.#urlParams.get('pseudo');
        this.#gameType = this.#urlParams.get('type');
        this.#idCountryFlag = this.#urlParams.get('indice');
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
        console.log(this.#room);
        this.#room.state.players.onAdd((player, sessionId) => {
            const isCurrentPlayer = (sessionId === this.#room.sessionId);
            if (isCurrentPlayer) {
                this.#player = new Player(3, 10, 3, this.#gameScene, this.#arena, this.#pseudo, this.#gameType, this.#idCountryFlag);
            }
            else {
                this.#player = new Player(3, 11, 4, this.#gameScene, this.#arena, "adversaire", this.#gameType, 6);
            }
            this.#player.init();
            this.#playerEntities[sessionId] = this.#player;
            console.log(this.#playerEntities)

        })
        this.#player2 = new Player(6, 13, 3, this.#gameScene, this.#arena, "2 eme player", this.#gameType, 5);
        await this.#player2.init();
        // this.#gameCamera.lockedTarget = this.#player.transform;
        this.#shadowGenerator.addShadowCaster(this.#player.gameObject, true);
        await this.createCamera();



        this.initInput();
        this.#arena.setCollisionZones(this.#player.gameObject);
        console.log("------------");
        console.log(this.#arena.setCollisionZones(this.#player.gameObject));

        console.log("------------");
    }
    async createCamera() {
        console.log(this.#playerEntities)
        this.#gameCamera = await new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 4, 10, this.#playerEntities[this.#room.sessionId].gameObject.position.subtract(new Vector3(0, -3, -2)), this.scene);
        this.reglageCamera(2, 10, 0.05, 1000);
        this.reglageScene();

    }

    reglageCamera(lowerRadiusLimit, upperRadiusLimit, wheelDeltaPercentage, angularSensibility) {
        this.#gameCamera.lowerRadiusLimit = lowerRadiusLimit;
        this.#gameCamera.upperRadiusLimit = upperRadiusLimit;
        this.#gameCamera.wheelDeltaPercentage = wheelDeltaPercentage;
        this.#gameCamera.angularSensibility = angularSensibility;
        console.log(this.#player.gameObject.position);
        this.#gameCamera.target = this.#playerEntities[this.#room.sessionId].gameObject;
        console.log(this.#gameCamera.target);
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
                    console.log(`KEY DOWN: ${kbInfo.event.code} / ${kbInfo.event.key}`);
                    break;
                case KeyboardEventTypes.KEYUP:
                    this.inputMap[kbInfo.event.code] = false;
                    this.actions[kbInfo.event.code] = true;
                    console.log(`KEY UP: ${kbInfo.event.code} / ${kbInfo.event.key}`);
                    break;
            }
        });
    }

    endGame() {

    }

    gameLoop() {

        const divFps = document.getElementById("fps");
        this.#engine.runRenderLoop(() => {

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

        let delta = this.#engine.getDeltaTime() / 1000.0;

        this.#playerEntities[this.#room.sessionId].update(this.inputMap, this.actions, delta, this.#gameCamera);

        //Animation
        this.#phase += this.#vitesseY * delta;
        this.#elevatorAggregate.body.setLinearVelocity(new Vector3(0, Math.sin(this.#phase)), 0);
    }
}

export default Game;