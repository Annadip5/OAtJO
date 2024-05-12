import { ActionManager, Color3, ExecuteCodeAction, Mesh, StandardMaterial, Vector3 } from "@babylonjs/core";
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui";


class ArrowsManager {
    scene;
    localPlayer;
    greenRects = [
        { position: [-100, 0.1, 23], rotation: [0, 0, 0], taille: [4, 2, 1] },
        { position: [-130, 0.1, 28], rotation: [0, 0, 0], taille: [4, 2, 1] },
        { position: [-230, 0.1, -68], rotation: [0, Math.PI / 4, 0], taille: [4, 5, 1] },
        { position: [-165, 0.1, -94], rotation: [0, 0, 0], taille: [4, 2, 1] },
        { position: [-185, 0.1, 26.3], rotation: [0, 0, 0], taille: [4, 2, 1] },

    ];
    redRects = [

        { position: [-100, 0.1, -94], rotation: [0, 0, 0], taille: [4, 2, 1] },
        { position: [-100, 0.1, 29.3], rotation: [0, 0, 0], taille: [4, 2, 1] },
        { position: [-230, 0.1, -6], rotation: [0, Math.PI / 4, 0], taille: [7, 7, 1] },
        { position: [-130, 0.1, 21], rotation: [0, 0, 0], taille: [4, 2, 1] },

        /*{ finish: "finish" }*/
    ];

    constructor(scene, localPlayer) {
        this.scene = scene;
        this.localPlayer = localPlayer;

    }
    async createGreenArrow(positions, rotations, taille) {
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
                    this.localPlayer.setRunningSpeed(28)
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
                    this.localPlayer.setRunningSpeed(14)

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
                    console.log("red !");
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


}

export default ArrowsManager;
