import { ActionManager, Color3, ExecuteCodeAction, NativeXRFrame, PhysicsAggregate, PhysicsMotionType, PhysicsShapeType, SceneLoader, StandardMaterial, TransformNode, Vector3 } from "@babylonjs/core";

import arenaModelUrl from "../../assets/models/lutte.glb";

class ArenaLutte {
    scene;
    x;
    y;
    z;

    gameObject;
    meshAggregate
    zoneSable;
    zonePiste;
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
        var i = 0;
        for (let childMesh of result.meshes) {
            i++;
            if (childMesh.getTotalVertices() > 0) {

                const meshAggregate = new PhysicsAggregate(childMesh, PhysicsShapeType.MESH, { mass: 0, friction: 0.2, restitution: 0 });
                meshAggregate.body.setMotionType(PhysicsMotionType.STATIC);
            }
        }

    }

    setCollisionZones(playerMesh) {
        this.zoneSable.actionManager = new ActionManager(this.scene);
        this.zoneSable.actionManager.registerAction(
            new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnIntersectionEnterTrigger,
                    parameter: playerMesh,
                },
                (actionEv) => {
                    //this.actionOnPlayer(playerMesh);
                    console.log("actionManager sable ");
                }
            )
        );
    }
    actionOnPlayer(playerMesh) {
        //console.log("collision detected");
        playerMesh.speedZ = 0;
        playerMesh.speedX = 0;
    }


    update(delta) {

    }
}

export default ArenaLutte;