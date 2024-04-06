import { HavokPlugin, Color3, CubeTexture, DirectionalLight, Scene, ShadowGenerator, Vector3, SceneLoader, ArcRotateCamera, HemisphericLight, CannonJSPlugin, PhysicsImpostor, MeshBuilder, PhysicsAggregate, PhysicsShapeType } from "@babylonjs/core";
import { Inspector } from "@babylonjs/inspector";
import * as CANNON from "cannon";
import Havok from "@babylonjs/havok";

import '@babylonjs/loaders';
import pisteCourseUrl from "../../assets/objets/piste_course2.glb";
import BowlPlayer from "../players/bowl";
import PistCourse from "../arenas/pistCourse";
import KeyboardInputHandler from "../controller/inputController";

class BowlRace {
    engine;
    canvas;
    scene;

    camera;
    light;
    player;
    arena;
    piste;

    urlParams;
    pseudo;
    gameType;
    idCountryFlag;

    keyboard;

    constructor(engine, canvas) {
        this.engine = engine;
        this.canvas = canvas;

        this.urlParams = new URLSearchParams(window.location.search);
        this.pseudo = this.urlParams.get('pseudo');
        this.gameType = this.urlParams.get('type');
        this.idCountryFlag = this.urlParams.get('indice');
    }

    async start() {
        console.log("start");
        await this.initGame();
        this.gameLoop();
        this.endGame();
    }
    endGame() { }
    async initGame() {
        await this.createScene();
        //this.scene.debugLayer.show();
        this.scene.enablePhysics(new Vector3(0, -9.81, 0), new CannonJSPlugin(true));

        //this.scene.enablePhysics(new Vector3(0, -9.81, 0), new HavokPlugin(undefined, await Havok()));
        this.piste = MeshBuilder.CreateGround("ground", { width: 64, height: 64 }, this.scene);
        this.piste.position = new Vector3(0, -0.1, 0);

        /*const race = await SceneLoader.ImportMeshAsync("", "", pisteCourseUrl, this.scene);
        this.piste = race.meshes[0];*/
        console.log(this.piste.checkCollisions);
        //this.piste.physicsAggregate = new PhysicsAggregate(this.piste, PhysicsShapeType.BOX, { mass: 0, friction: 0, restitution: .5 }, this.scene);

        this.piste.physicsImpostor = new PhysicsImpostor(this.piste, PhysicsImpostor.BoxImpostor, { mass: 0, friction: 0, restitution: .5 });
        this.player = new BowlPlayer(this.scene, this.pseudo, this.gameType, this.idCountryFlag);
        await this.player.init();
        //this.arena = new PistCourse(0, 1, 0, this.scene);
        //await this.arena.init();
        console.log(this.scene);
        console.log(this.player);
        await this.createCamera();
        console.log(this.camera);
        this.createLight(this.scene, 0.6);
        this.reglageScene();
        this.keyboard = new KeyboardInputHandler(this.scene, this.player, this.camera);
        console.log(this.piste);



    }
    async gameLoop() {

        this.engine.runRenderLoop(() => {

            this.scene.render();
        });
    }
    async createScene() {
        this.scene = new Scene(this.engine);
    }
    reglageScene() {
        //this.scene.enablePhysics(new Vector3(0, -9.81, 0), new CannonJSPlugin());
        this.scene.activeCamera = this.camera;
        this.scene.activeCamera.attachControl(this.canvas, true);
    }
    async createCamera() {
        this.camera = await new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 4, 10, this.player.mesh.position.subtract(new Vector3(0, -3, -2)), this.scene);
        this.reglageCamera(2, 10, 0.05, 1000);

    }

    reglageCamera(lowerRadiusLimit, upperRadiusLimit, wheelDeltaPercentage, angularSensibility) {
        this.camera.lowerRadiusLimit = lowerRadiusLimit;
        this.camera.upperRadiusLimit = upperRadiusLimit;
        this.camera.wheelDeltaPercentage = wheelDeltaPercentage;
        this.camera.angularSensibility = angularSensibility;
        console.log(this.player.mesh.position);
        this.camera.target = this.player.mesh;
        console.log(this.camera.target);
        //2, 10, 0.05, 1000
    }

    createLight(scene, lightIntensity) {
        // Lights
        var light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);
        light.intensity = lightIntensity;
        light.specular = Color3.Black();

        var light2 = new DirectionalLight("dir01", new Vector3(0, -0.5, -1.0), scene);
        light2.position = new Vector3(0, 5, 5);
    }


}
export default BowlRace;