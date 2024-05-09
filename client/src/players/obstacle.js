import { ArcRotateCamera, Matrix, Mesh, MeshBuilder, Physics6DoFConstraint, PhysicsAggregate, PhysicsConstraintAxis, PhysicsMotionType, PhysicsShapeType, Quaternion, Ray, SceneLoader, Space, StandardMaterial, Texture, TransformNode, Vector3 } from "@babylonjs/core";

import obstacleUrl from "../../assets/models/Obstacle01.glb";



const PLAYER_HEIGHT = 1;
const PLAYER_RADIUS = 0.5;

class Obstacle {
    previousMovementData = null;

    scene;
    //Position dans le monde
    transform;
    //Mesh
    gameObject;
    arena;
    //Physic
    capsuleAggregate;



    x = 0.0;
    y = 0.0;
    z = 0.0;

    speedX = 0.0;
    speedY = 0.0;
    speedZ = 0.0;

    constructor(x, y, z, scene) {
        this.scene = scene;

        this.x = x || 0.0;
        this.y = y || 0.0;
        this.z = z || 0.0;
        this.transform = new MeshBuilder.CreateCapsule("obstacle", { height: PLAYER_HEIGHT, radius: PLAYER_RADIUS }, this.scene);
        this.transform.visibility = 0.0;
        this.transform.position = new Vector3(this.x, this.y, this.z);

    }


    async init() {
        const result = await SceneLoader.ImportMeshAsync("", "", obstacleUrl, this.scene);
        this.gameObject = result.meshes[0];
        this.gameObject.name = "obstacle";
        this.gameObject.setParent(null);
        //this.gameObject.position = new Vector3(-80, 0, -20);

        /*const newDirection = new Vector3(0, 0, -10); // Exemple de nouvelle direction
        this.gameObject.lookAt(this.gameObject.position.add(newDirection));*/
        this.gameObject.scaling = new Vector3(2, 2, 2);

        this.gameObject.bakeCurrentTransformIntoVertices();
        //this.gameObject.checkCollisions = true;
        var i = 0;
        for (let childMesh of result.meshes) {
            i++;
            //console.log(childMesh);
            if (childMesh.getTotalVertices() > 0) {

                const capsuleAggregate = new PhysicsAggregate(childMesh, PhysicsShapeType.MESH, { mass: 0, friction: 1, restitution: 0.2, inertia: 0 }, this.scene);
                capsuleAggregate.body.setMotionType(PhysicsMotionType.DYNAMIC);
            }
        }

        //this.capsuleAggregate = new PhysicsAggregate(this.transform, PhysicsShapeType.CAPSULE, { mass: 1, friction: 1, restitution: 0.2, inertia: 0 }, this.scene);
        //this.capsuleAggregate.body.setMotionType(PhysicsMotionType.DYNAMIC);


        /*if (USE_FORCES) {
            this.capsuleAggregate.body.setLinearDamping(0.8);
            this.capsuleAggregate.body.setAngularDamping(10.0);

        }
        else {
            this.capsuleAggregate.body.setLinearDamping(0.5);
            this.capsuleAggregate.body.setAngularDamping(0.5);
        }*/


        this.gameObject.parent = this.transform;



    }






}

export default Obstacle;