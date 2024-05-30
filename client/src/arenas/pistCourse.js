import { ActionManager, Color3, ExecuteCodeAction, NativeXRFrame, PhysicsAggregate, PhysicsMotionType, PhysicsShapeType, SceneLoader, StandardMaterial, Texture, TransformNode, Vector3 } from "@babylonjs/core";

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
                if (i == 6)
                    childMesh.isVisible = false;

                else if (i == 5) {
                    this.zoneSable = childMesh;
                    this.zoneSable.name = "zoneSable";

                }
                else if (i === 4) {
                    const greenMaterial = new StandardMaterial("greenMaterial", this.scene);
                    greenMaterial.specularColor = new Color3(0, 0, 0);
                    greenMaterial.diffuseTexture = new Texture("../assets/images/sable-texture.jpg", this.scene);
                    childMesh.material = greenMaterial;
                }


                const meshAggregate = new PhysicsAggregate(childMesh, PhysicsShapeType.MESH, { mass: 0, friction: 0.2, restitution: 0 });
                meshAggregate.body.setMotionType(PhysicsMotionType.STATIC);
            }
        }
        this.zoneSable.isVisible = true;


        console.log("sable : ");
        console.log(this.zoneSable);
        let zoneMat = new StandardMaterial("zoneSable", this.scene);
        zoneMat.specularColor = new Color3(0, 0, 0);
        zoneMat.diffuseTexture = new Texture("../assets/images/sable-texture.jpg");
        this.zoneSable.material = zoneMat;

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