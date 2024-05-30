import { Color3, Mesh, StandardMaterial } from "@babylonjs/core";
import { AdvancedDynamicTexture, Rectangle, TextBlock } from "@babylonjs/gui";

class LoadingScreen {
    constructor(scene) {
        this.scene = scene;
        this.createUI();
    }

    createUI() {
        // Create a box mesh as the background of the loading screen
        const box = Mesh.CreateBox("loadingScreen", 5, this.scene);
        box.position.z = -10;

        // Create a basic material for the box
        const mat = new StandardMaterial("loadingMat", this.scene);
        mat.diffuseColor = new Color3(0, 0.5, 1);

        // Apply the material to the box
        box.material = mat;

        // Create a text block to display the loading message
        const text = new GUI.TextBlock();
        text.text = "Loading...";
        text.color = "white";
        text.fontSize = 24;

        // Add the text block to the canvas
        const canvas = document.getElementById("renderCanvas");
        const advancedTexture = BABYLON.GUI.AdvancedTexture.CreateFullscreenUI("UI", true, this.scene);
        advancedTexture.addControl(text);
    }
}