import { NativeXRFrame, PhysicsAggregate, PhysicsMotionType, PhysicsShapeType, SceneLoader, TransformNode, Vector3 } from "@babylonjs/core";

import arenaModelUrl from "../../assets/models/piste_course2.glb";

class Arena {
    scene;
    x;
    y;
    z;

    gameObject;
    meshAggregate

    zoneA;
    zoneB;



    constructor(x, y, z, scene) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        this.scene = scene || undefined;

        this.gameObject = new TransformNode("arena", scene);
        this.gameObject.position = new Vector3(0, 0, 0)
    }
    async init() {

        const result = await SceneLoader.ImportMeshAsync("", "", arenaModelUrl, this.scene);
        //console.log(result);
        this.gameObject = result.meshes[0];
        this.gameObject.name = "arena";
        this.gameObject.setParent(null);
        this.gameObject.scaling.scaleInPlace(1.5);

        for (let childMesh of result.meshes) {
            if (childMesh.getTotalVertices() > 0) {
                const meshAggregate = new PhysicsAggregate(childMesh, PhysicsShapeType.MESH, { mass: 0, friction: 0.2, restitution: 0 });
                meshAggregate.body.setMotionType(PhysicsMotionType.STATIC);
            }
        }
        /*
        this.#zoneA = MeshBuilder.CreateBox("zoneA", { width: 8, height: 0.2, depth: 8 }, scene);
        let zoneMat = new StandardMaterial("zoneA", scene);
        zoneMat.diffuseColor = Color3.Red();
        zoneMat.alpha = 0.5;
        this.#zoneA.material = zoneMat;
        this.#zoneA.position = new Vector3(12, 0.1, 12);


        this.#zoneB = MeshBuilder.CreateBox("zoneB", { width: 8, height: 0.2, depth: 8 }, scene);
        let zoneMatB = new StandardMaterial("zoneB", scene);
        zoneMatB.diffuseColor = Color3.Green();
        zoneMatB.alpha = 0.5;
        this.#zoneB.material = zoneMatB;
        this.#zoneB.position = new Vector3(-12, 0.1, -12);
        */
    }

    update(delta) {

    }
}

export default Arena;