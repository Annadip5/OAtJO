import { ActionManager, ExecuteCodeAction } from "@babylonjs/core";

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
        //let currentVelocity = this.heroRigidBody.body.getLinearVelocity();
        var forwardDirection = this.camera1.getForwardRay().direction;
        forwardDirection.y = 0; // Keep the character at ground level
        forwardDirection.normalize();
        var keydown = false;

        // Manage the movements of the character
        if (this.inputMap["z"]) {
            console.log("avant");
            console.log(this.hero.mesh.position);

            this.hero.mesh.position.addInPlace(forwardDirection.scale(0.1));
            keydown = true;
        }
        if (this.inputMap["s"]) {
            console.log(this.hero.mesh.position);

            this.hero.mesh.position.addInPlace(forwardDirection.scale(-0.05));
            keydown = true;
        }
        if (this.inputMap["q"]) {
            this.camera1.alpha += 0.05;
            keydown = true;
        }
        if (this.inputMap["d"]) {
            this.camera1.alpha -= 0.05;
            keydown = true;
        }

        if (this.inputMap[" "] && !this.jumping) {

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
