import { DirectionalLight, SceneLoader, Vector3 } from "@babylonjs/core";
import eiffelUrl from "../../assets/models/decors/toureiffel2.glb";
import notreDamesUrl from "../../assets/models/decors/Notredame.glb";
import arcTriompheUrl from "../../assets/models/decors/ArcTriomphe.glb";

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
    async initNotreDame() {
        console.log("Initialisation du décor...");
        const result = await SceneLoader.ImportMeshAsync("", "", notreDamesUrl, this.scene);
        this.gameObject = result.meshes[0];
        this.gameObject.name = "notreDame";
        this.gameObject.setParent(null);
        this.gameObject.position = new Vector3(-220, -20, -10);
        this.gameObject.scaling = new Vector3(0.1, 0.1, 0.1);
        this.addDirectionalLight();
    }
    async initArcTriomphe() {
        console.log("Initialisation du décor...");
        const result = await SceneLoader.ImportMeshAsync("", "", arcTriompheUrl, this.scene);
        this.gameObject = result.meshes[0];
        this.gameObject.name = "arcTriomphe";
        this.gameObject.setParent(null);
        this.gameObject.position = new Vector3(-70, -10, -20);
        this.gameObject.scaling = new Vector3(2, 2, 2);
        this.addDirectionalLight();
    }
    addDirectionalLight() {
        this.light = new DirectionalLight("eiffelLight", new Vector3(0, -300, 0), this.scene);

        this.light.intensity = 5;
    }
}

export default Decors;