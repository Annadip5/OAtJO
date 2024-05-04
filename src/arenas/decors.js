import { PhysicsAggregate, PhysicsMotionType, PhysicsShapeType, SceneLoader, TransformNode, Vector3 } from "@babylonjs/core";
import eiffelUrl from "../../assets/models/decors/toureiffel.glb";

class Decors {
    constructor(scene) {
        this.scene = scene;
        this.gameObject = null; // Initialisez gameObject à null
    }

    async init() {
        console.log("Initialisation du décor...");

        // Charger le modèle 3D
        const result = await SceneLoader.ImportMeshAsync("", "", eiffelUrl, this.scene);

        // Récupérer le premier mesh du résultat
        this.gameObject = result.meshes[0];

        // Nommer le décor
        this.gameObject.name = "eiffel";

        // Détacher le décor du parent
        this.gameObject.setParent(null);

        // Placer le décor à une position spécifique
        this.gameObject.position = new Vector3(-50, -8, -20);

        // Appliquer des transformations au décor (échelle, rotation, etc.)
        this.gameObject.scaling = new Vector3(0.1, 0.1, 0.1);


    }
}

export default Decors;