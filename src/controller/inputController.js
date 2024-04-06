import { ActionManager, Axis, ExecuteCodeAction, Ray, Vector3 } from "@babylonjs/core";
class KeyboardInputHandler {
    _jumpImpulse = 5;
    scene;
    arena;
    hero;
    camera1;
    inputMap = {};
    jumping = false;
    jumpHeight = 4;
    jumpSpeed = 0.1;
    constructor(scene, hero, camera1, arena) {
        this.scene = scene;
        this.hero = hero;
        this.camera1 = camera1;
        this.arena = arena


        this.registerInputActions();
        this.scene.onBeforeRenderObservable.add(() => this.handleInput());
    }

    registerInputActions() {
        this.scene.actionManager = new ActionManager(this.scene);
        this.scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt) => {
            this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));
        this.scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt) => {
            this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));
    }

    handleInput() {
        let currentVelocity = this.hero.meshAggregate.body.getLinearVelocity();
        var forwardDirection = this.camera1.getForwardRay().direction;
        forwardDirection.y = 0; // Keep the character at ground level
        //forwardDirection.normalize();
        var keydown = false;
        var direction = new Vector3(forwardDirection.x, forwardDirection.y, forwardDirection.z);

        if (this.inputMap["z"]) {
            // Avancer
            this.hero.mesh.moveWithCollisions(forwardDirection.scale(0.1));
            this.hero.mesh.rotate(new Vector3(1, 0, 0), 0.1);
            keydown = true;

            // Tourner le mesh de votre héros vers la direction de déplacement
            //this.hero.mesh.lookAt(this.hero.mesh.position.add(forwardDirection));
        }

        if (this.inputMap["s"]) {
            console.log(this.hero.mesh.position);

            // Reculer
            this.hero.mesh.position.addInPlace(forwardDirection.scale(-0.05));
            this.hero.mesh.rotate(new Vector3(-1, 0, 0), 0.1);
            keydown = true;

            // Tourner le mesh de votre héros vers la direction de déplacement inverse
        }

        if (this.inputMap["q"]) {
            // Tourner à gauche
            this.camera1.alpha += 0.05;
            this.hero.mesh.rotate(Vector3.Up(), 0.05);
            keydown = true;
            this.hero.mesh.lookAt(this.hero.mesh.position.add(forwardDirection));
        }

        if (this.inputMap["d"]) {
            // Tourner à droite
            this.camera1.alpha -= 0.05;
            this.hero.mesh.rotate(new Vector3(0, -1, 0), 0.05);
            keydown = true;
            this.hero.mesh.lookAt(this.hero.mesh.position.add(forwardDirection));
        }
        let auSol = this.estAuSol(this.hero.mesh, this.arena.gameObject, this.scene);

        if (this.inputMap[" "] && currentVelocity.y == 0 && auSol) {
            this.jump();

        }

        if (!keydown) {
            this.inputMap = {};
        }
    }
    jump() {
        return new Promise(resolve => {
            this.hero.meshAggregate.body.applyImpulse(new Vector3(0, this._jumpImpulse, 0), this.hero.mesh.position);

            resolve();
        });
    }


    estAuSol(sphereMesh, groundMesh, scene) {
        //console.log(groundMesh);
        var ray = new Ray(sphereMesh.position, new Vector3(0, -1, 0));

        var pickInfo = scene.pickWithRay(ray, function (mesh) { return mesh === groundMesh; });
        /* console.log(pickInfo);
         console.log(pickInfo.distance);
         console.log(pickInfo.distance <= sphereMesh.scaling.y);*/

        if (/*pickInfo.hit && */pickInfo.distance <= sphereMesh.scaling.y) {
            return true;
        } else {
            return false;
        }
    }

}
export default KeyboardInputHandler;

