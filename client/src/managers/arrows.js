import { ActionManager, Color3, ExecuteCodeAction, Mesh, Sound, StandardMaterial, Vector3 } from "@babylonjs/core";
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui";
import arrowSoundUrl from "../../assets/sounds/checkpoint.mp3"

class ArrowsManager {
    scene;
    localPlayer;
    room
    greenRects = [
        { position: [-100, 0.1, 23], rotation: [0, 0, 0], taille: [4, 2, 1] },
        { position: [-130, 0.1, 28], rotation: [0, 0, 0], taille: [4, 2, 1] },
        { position: [-230, 0.1, -68], rotation: [0, Math.PI / 4, 0], taille: [4, 5, 1] },
        { position: [-165, 0.1, -94], rotation: [0, 0, 0], taille: [4, 2, 1] },
        { position: [-185, 0.1, 26.3], rotation: [0, 0, 0], taille: [7, 2, 1] },

    ];
    redRects = [

        { position: [-100, 0.1, -94], rotation: [0, 0, 0], taille: [4, 2, 1] },
        { position: [-100, 0.1, 29.3], rotation: [0, 0, 0], taille: [4, 2, 1] },
        { position: [-230, 0.1, -6], rotation: [0, Math.PI / 4, 0], taille: [3, 7, 1] },
        { position: [-130, 0.1, 21], rotation: [0, 0, 0], taille: [4, 2, 1] },

        /*{ finish: "finish" }*/
    ];

    constructor(scene, localPlayer, room) {
        this.scene = scene;
        this.localPlayer = localPlayer;
        this.room = room || null;

    }
    async createGreenArrow(positions, rotations, taille) {
        this.arrowSound = new Sound("checkpoint", arrowSoundUrl, this.scene);
        const greenRectangle = Mesh.CreateGround("greenRectangle", taille[0], taille[1], taille[2], this.scene);
        greenRectangle.position = new Vector3(positions[0], positions[1], positions[2]);
        greenRectangle.scaling = new Vector3(2.1, 1, 1);
        greenRectangle.rotation = new Vector3(rotations[0], rotations[1], rotations[2]);
        greenRectangle.material = new StandardMaterial("greenMat", this.scene);
        greenRectangle.material.diffuseColor = new Color3(0, 1, 0); // Vert
        greenRectangle.checkCollisions = true;
        greenRectangle.material.alpha = 0.5;
        greenRectangle.actionManager = new ActionManager(this.scene);

        greenRectangle.actionManager.registerAction(
            new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnIntersectionEnterTrigger,
                    parameter: this.localPlayer.gameObject
                },
                () => {
                    console.log("vert !");
                    this.localPlayer.setRunningSpeed(24);
                    if (this.arrowSound.isReady()) {
                        this.arrowSound.play();
                    }
                    setTimeout(() => {
                        this.localPlayer.setRunningSpeed(14);

                    }, 3000); // Reset speed after 3 seconds
                }
            )
        );

        greenRectangle.actionManager.registerAction(
            new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnIntersectionExitTrigger,
                    parameter: this.localPlayer.gameObject
                },
                () => {
                    console.log("vert ");
                    // Ensure the speed is reset when exiting the rectangle
                    //this.localPlayer.setRunningSpeed(14);
                }
            )
        );
    }
    async createRedArrow(positions, rotations, taille) {
        const redRectangle = Mesh.CreateGround("redRectangle", taille[0], taille[1], taille[2], this.scene);
        redRectangle.position = new Vector3(positions[0], positions[1], positions[2]);
        redRectangle.scaling = new Vector3(2.1, 1, 1);
        redRectangle.rotation = new Vector3(rotations[0], rotations[1], rotations[2]);
        redRectangle.material = new StandardMaterial("redMat", this.scene);
        redRectangle.material.diffuseColor = new Color3(1, 0, 0); // Rouge
        redRectangle.checkCollisions = true;
        redRectangle.material.alpha = 0.5;
        redRectangle.actionManager = new ActionManager(this.scene);
        redRectangle.actionManager.registerAction(
            new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnIntersectionEnterTrigger,
                    parameter: this.localPlayer.gameObject
                },
                () => {
                    this.localPlayer.setRunningSpeed(5);
                    this.localPlayer.setJumpImpulse(0);

                }
            )
        );

        redRectangle.actionManager.registerAction(
            new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnIntersectionExitTrigger,
                    parameter: this.localPlayer.gameObject
                },
                () => {
                    console.log("red ");
                    this.localPlayer.setRunningSpeed(14);
                    this.localPlayer.setJumpImpulse(6);


                }
            )
        );
    }

    async createArrows() {
        for (const greenPosition of this.greenRects) {
            await this.createGreenArrow(greenPosition.position, greenPosition.rotation, greenPosition.taille);
        }

        for (const redPosition of this.redRects) {
            await this.createRedArrow(redPosition.position, redPosition.rotation, redPosition.taille);
        }
    }

    async createelimground() {
        await this.createelim([0, -1, 0], [0, 0, 0], [100, 100, 10])
    }
    async createelim(positions, rotations, taille) {
        const greenRectangle = Mesh.CreateGround("greenRectangle", taille[0], taille[1], taille[2], this.scene);
        greenRectangle.position = new Vector3(positions[0], positions[1], positions[2]);
        greenRectangle.scaling = new Vector3(2.1, 1, 1);
        greenRectangle.rotation = new Vector3(rotations[0], rotations[1], rotations[2]);
        greenRectangle.material = new StandardMaterial("greenMat", this.scene);
        greenRectangle.material.diffuseColor = new Color3(0, 0, 1);
        greenRectangle.checkCollisions = true;
        greenRectangle.material.alpha = 0.5;
        greenRectangle.actionManager = new ActionManager(this.scene);
        greenRectangle.isVisible = false;
        greenRectangle.actionManager.registerAction(
            new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnIntersectionEnterTrigger,
                    parameter: this.localPlayer.gameObject
                },
                () => {
                    console.log("Éliminer !");
                    this.localPlayer.setRunningSpeed(0);
                    this.localPlayer.setJumpImpulse(0);

                    // Afficher le texte "Éliminer"
                    const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
                    const countdownText = new TextBlock();
                    countdownText.text = "Éliminer";
                    countdownText.color = "red";
                    countdownText.fontSize = 100;
                    countdownText.horizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_CENTER;
                    countdownText.verticalAlignment = TextBlock.VERTICAL_ALIGNMENT_CENTER;
                    advancedTexture.addControl(countdownText);
                    this.room.send("elimination");

                    // Immobiliser la caméra et passer à une vue de haut
                    const camera = this.scene.activeCamera;
                    if (camera) {
                        camera.position = new Vector3(this.localPlayer.gameObject.position.x, 50, this.localPlayer.gameObject.position.z);
                        camera.setTarget(this.localPlayer.gameObject.position);
                    }
                    setTimeout(() => {
                        advancedTexture.removeControl(countdownText);
                        this.localPlayer.label.dispose();


                    }, 5000);
                }
            )
        );
    }
}


export default ArrowsManager;
