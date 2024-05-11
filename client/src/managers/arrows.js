import { ActionManager, Color3, ExecuteCodeAction, Mesh, StandardMaterial, Vector3 } from "@babylonjs/core";
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui";


class ArrowsManager {
    scene;
    localPlayer;
    greenRects = [
        { position: [-100, 0.1, 25.3], rotation: [276.5 * (Math.PI / 180), 270.4 * (Math.PI / 180), 0] },
        { position: [-160, 0.1, 25.3], rotation: [276.5 * (Math.PI / 180), 270.4 * (Math.PI / 180), 0] },
        { position: [-225, 0.1, 2], rotation: [276.5 * (Math.PI / 180), 228.3 * (Math.PI / 180), 0] },
        { position: [-165, 0.1, -94], rotation: [276.5 * (Math.PI), 270.4 * (Math.PI / 180), 0] },


        /*{ finish: "finish" }*/
    ];
    redRects = [

        { position: [-100, 0.1, -94], rotation: [276.5 * (Math.PI), 270.4 * (Math.PI / 180), 0] },
        { position: [-100, 0.1, 25.3], rotation: [276.5 * (Math.PI / 180), 270.4 * (Math.PI / 180), 0] },
        { position: [-160, 0.1, 25.3], rotation: [276.5 * (Math.PI / 180), 270.4 * (Math.PI / 180), 0] },

        /*{ finish: "finish" }*/
    ];

    constructor(scene, localPlayer) {
        this.scene = scene;
        this.localPlaye = localPlayer;

    }
    async createGreenArrow(positions) {
        const greenRectangle = Mesh.CreateGround("greenRectangle", 2, 3, 1, this.scene);
        greenRectangle.position = new Vector3(positions[0], positions[1], positions[2]);
        greenRectangle.scaling = new Vector3(2.1, 1, 1);
        greenRectangle.rotation = new Vector3(0, Math.PI / 2, 0);
        greenRectangle.material = new StandardMaterial("greenMat", this.scene);
        greenRectangle.material.diffuseColor = new Color3(0, 1, 0); // Vert
        greenRectangle.checkCollisions = true;
    }
    async createRedArrow(positions) {
        const redRectangle = Mesh.CreateGround("redRectangle", 2, 3, 1, this.scene);
        redRectangle.position = new Vector3(positions[0], positions[1], positions[2]);
        redRectangle.scaling = new Vector3(2.1, 1, 1);
        redRectangle.rotation = new Vector3(0, Math.PI / 2, 0);
        redRectangle.material = new StandardMaterial("redMat", this.scene);
        redRectangle.material.diffuseColor = new Color3(1, 0, 0); // Rouge
        redRectangle.checkCollisions = true;
    }

    async createArrows() {
        for (const greenPosition of this.greenRects) {
            await this.createGreenArrow(greenPosition.position);
        }

        for (const redPosition of this.redRects) {
            await this.createRedArrow(redPosition.position);
        }
    }


}

export default ArrowsManager;
