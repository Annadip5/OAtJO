import { ActionManager, Axis, ExecuteCodeAction, Vector3 } from "@babylonjs/core";
let JUMP_IMPULSE = 6;
class KeyboardInputHandler {
    scene;
    hero;
    camera1;
    inputMap = {};
    jumping = false;
    jumpHeight = 4;
    jumpSpeed = 0.1;
    constructor(scene, hero, camera1) {
        this.scene = scene;
        this.hero = hero;
        this.camera1 = camera1;


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
        //let currentVelocity = this.hero.meshAggregate.body.getLinearVelocity();
        var forwardDirection = this.camera1.getForwardRay().direction;
        forwardDirection.y = 0; // Keep the character at ground level
        //forwardDirection.normalize();
        var keydown = false;
        var direction = new Vector3(forwardDirection.x, forwardDirection.y, forwardDirection.z);

        if (this.inputMap["z"]) {
            console.log("avant");
            console.log(this.hero.mesh.position);

            // Avancer
            this.hero.mesh.physicsImpostor.setLinearVelocity(forwardDirection);

            //this.hero.mesh.moveWithCollisions(forwardDirection.scale(0.1));
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

        if (this.inputMap[" "] /*&& currentVelocity.y == 0*/) {
            //console.log(currentVelocity);
            //this.hero.meshAggregate.body.applyImpulse(new Vector3(0, this.JUMP_INPULSE, 0), new Vector3(0, 0, 0));
            //this.jumping = true;
            //this.hero.jump();
            /*this.jump().then(() => {
                this.jumping = false;
            });*/
        }

        // Reset keydown state
        if (!keydown) {
            this.inputMap = {};
        }
    }

    jump() {
        return new Promise(resolve => {
            var jumpInterval = setInterval(() => {
                if (this.hero.position.y < this.jumpHeight) {
                    this.hero.position.y += this.jumpSpeed;
                } else {
                    clearInterval(jumpInterval);
                    this.fall().then(() => {
                        resolve();
                    });
                }
            }, 10);
        });
    }

    fall() {
        return new Promise(resolve => {
            var fallInterval = setInterval(() => {
                if (this.hero.position.y > 1) {
                    this.hero.position.y -= this.jumpSpeed;
                } else {
                    clearInterval(fallInterval);
                    resolve();
                }
            }, 10);
        });
    }
}
export default KeyboardInputHandler;
// Example usage:
// var keyboardInputHandler = new KeyboardInputHandler(scene, hero, camera1);
