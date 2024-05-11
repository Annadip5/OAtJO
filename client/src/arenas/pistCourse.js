import { ActionManager, Color3, ExecuteCodeAction, NativeXRFrame, PhysicsAggregate, PhysicsMotionType, PhysicsShapeType, SceneLoader, StandardMaterial, TransformNode, Vector3 } from "@babylonjs/core";

import arenaModelUrl from "../../assets/models/piste_course4.glb";

class Arena {
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
            //console.log(childMesh);
            if (childMesh.getTotalVertices() > 0) {
                if (i == 6 || i == 4)
                    childMesh.isVisible = false;
                else if (i == 5) {
                    this.zoneSable = childMesh;
                    this.zoneSable.name = "zoneSable";

                }
                /*else if (i == 3) {
                    this.zonePiste = childMesh;
                    this.zonePiste.name = "zonePiste";
                }*/
                //this.zoneSable.isVisible = false

                const meshAggregate = new PhysicsAggregate(childMesh, PhysicsShapeType.MESH, { mass: 0, friction: 0.2, restitution: 0 });
                meshAggregate.body.setMotionType(PhysicsMotionType.STATIC);
            }
        }
        this.zoneSable.isVisible = true;


        console.log("sable : ");
        console.log(this.zoneSable);
        let zoneMat = new StandardMaterial("zoneSable", this.scene);

        zoneMat.diffuseColor = Color3.Gray;
        this.zoneSable.material = zoneMat;
        /*let zoneMat2 = new StandardMaterial("zonePiste", this.scene);
        zoneMat2.diffuseColor = Color3.Blue;
        this.zonePiste.material = zoneMat2;*/

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

export default Arena;