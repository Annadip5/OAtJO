import { DirectionalLight, SceneLoader, Vector3 } from "@babylonjs/core";
import eiffelUrl from "../../assets/models/decors/toureiffel.glb";

class Decors {
    constructor(scene) {
        this.scene = scene;
        this.gameObject = null;
        this.light = null;
    }

    async init() {
        console.log("Initialisation du décor...");
        const result = await SceneLoader.ImportMeshAsync("", "", eiffelUrl, this.scene);
        this.gameObject = result.meshes[0];
        this.gameObject.name = "eiffel";
        this.gameObject.setParent(null);
        this.gameObject.position = new Vector3(-80, 0, -20);
        this.gameObject.scaling = new Vector3(5, 5, 5);
        this.addDirectionalLight();

    }
    addDirectionalLight() {
        this.light = new DirectionalLight("eiffelLight", new Vector3(0, -300, 0), this.scene);

        this.light.intensity = 5;
    }
}

export default Decors;