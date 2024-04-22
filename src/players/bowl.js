import { Matrix, Mesh, MeshBuilder, Physics6DoFConstraint, PhysicsAggregate, PhysicsConstraintAxis, PhysicsMotionType, PhysicsShapeType, Quaternion, Ray, SceneLoader, StandardMaterial, Texture, TransformNode, Vector3 } from "@babylonjs/core";

//import girlModelUrl from "../assets/models/girl1.glb";
import Arena from "../arenas/pistCourse";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
const USE_FORCES = false;
let RUNNING_SPEED = 14;
let JUMP_IMPULSE = 8;
const PLAYER_HEIGHT = 1;
const PLAYER_RADIUS = 0.5;

class Player {

    scene;
    //Position dans le monde
    transform;
    //Mesh
    gameObject;
    arena;
    //Physic
    capsuleAggregate;

    bWalking = false;
    bOnGround = false;
    bFalling = false;
    bJumping = false;

    idleAnim;
    runAnim;
    walkAnim;


    x = 0.0;
    y = 0.0;
    z = 0.0;

    speedX = 0.0;
    speedY = 0.0;
    speedZ = 0.0;

    pseudo;
    gameType;
    idCountryFlag;
    label;
    linkOffsetYlabel = -105;
    points = 0;
    skins = ["AfriqueSud.png", "Allemagne.png", "Angleterre.png", "Bresil.png", "Cameroun.png", "Canada.png", "Chine.png", "Espagne.png", "EtatUnis.png", "France.png", "Italie.png", "Russie.png", "Ukraine.png"];
    clientId;
    constructor(x, y, z, scene, arena, pseudo, gameType, idCountryFlag, clientId) {
        this.clientId = clientId;
        this.scene = scene;
        this.pseudo = pseudo;
        this.gameType = gameType;
        this.idCountryFlag = idCountryFlag;
        this.x = x || 0.0;
        this.y = y || 0.0;
        this.z = z || 0.0;
        this.arena = arena || undefined;
        this.transform = new MeshBuilder.CreateCapsule("player", { height: PLAYER_HEIGHT, radius: PLAYER_RADIUS }, this.scene);
        this.transform.visibility = 0.0;
        this.transform.position = new Vector3(this.x, this.y, this.z);
        if (USE_FORCES) {
            RUNNING_SPEED += 2;
        }
    }

    async init() {
        //On cré le mesh et on l'attache à notre parent
        const result = await MeshBuilder.CreateSphere("sphere", { diameter: 1 }, this.scene);
        this.gameObject = result;
        const meshMaterial = new StandardMaterial("mesh");
        meshMaterial.diffuseTexture = new Texture("../assets/images/drapeaux/" + this.skins[this.idCountryFlag]);
        this.gameObject.material = meshMaterial;

        this.gameObject.scaling = new Vector3(1, 1, 1);
        //this.gameObject.position = new Vector3(0, 0, 0);
        this.gameObject.rotate(Vector3.UpReadOnly, Math.PI);
        this.gameObject.bakeCurrentTransformIntoVertices();
        this.gameObject.checkCollisions = true;

        this.capsuleAggregate = new PhysicsAggregate(this.transform, PhysicsShapeType.CAPSULE, { mass: 1, friction: 1, restitution: 0.2, inertia: 0 }, this.scene);
        this.capsuleAggregate.body.setMotionType(PhysicsMotionType.DYNAMIC);

        //On bloque les rotations avec cette méthode, à vérifier.
        /*  this.capsuleAggregate.body.setMassProperties({
             inertia: new Vector3(0, 0, 0),
             centerOfMass: new Vector3(0, PLAYER_HEIGHT / 2, 0),
             mass: 1
         }); */
        if (USE_FORCES) {
            this.capsuleAggregate.body.setLinearDamping(0.8);
            this.capsuleAggregate.body.setAngularDamping(10.0);

        }
        else {
            this.capsuleAggregate.body.setLinearDamping(0.5);
            this.capsuleAggregate.body.setAngularDamping(0.5);
        }


        this.gameObject.parent = this.transform;
        await this.createLabel();


    }

    async createLabel() {
        var advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        this.label = new TextBlock();
        this.label.text = this.pseudo;
        this.label.color = "orange";
        this.label.fontSize = 30;
        advancedTexture.addControl(this.label);
        this.label.linkWithMesh(this.gameObject);
        this.label.linkOffsetY = this.linkOffsetYlabel;
    }

    //Pour le moment on passe les events clavier ici, on utilisera un InputManager plus tard
    update(inputMap, actions, delta, camera1) {
        let currentVelocity = this.capsuleAggregate.body.getLinearVelocity();
        var forwardDirection = camera1.getForwardRay().direction;

        //Inputs 
        //q
        if (inputMap["KeyA"])
            //this.speedX = RUNNING_SPEED;
            camera1.alpha += 0.015;
        //d
        else if (inputMap["KeyD"])
            //this.speedX = -RUNNING_SPEED;
            camera1.alpha -= 0.015;

        else {
            if (USE_FORCES)
                this.speedX = 0;
            else
                //Frottements
                this.speedX += (-12.0 * this.speedX * delta);
        }

        //z
        if (inputMap["KeyW"]) {
            //this.speedZ = -RUNNING_SPEED;
            console.log(this.arena.zoneSable);
            console.log(this.estAuSol(this.gameObject, this.arena.zoneSable, this.scene));
            this.arena.setCollisionZones(this.gameObject)
            if (this.arena.zoneSable.intersectsMesh(this.transform)) {
                /*this.speedZ = 0;
                this.speedX = 0;*/
                console.log("collision detected");
            }

            this.speedZ = forwardDirection.z * RUNNING_SPEED;
            this.speedX = forwardDirection.x * RUNNING_SPEED;
            //console.log(currentVelocity.y);





            //this.gameObject.rotate(new Vector3(1, 0, 0), 0.1);

        }
        //s
        else if (inputMap["KeyS"]) {
            //this.speedZ = RUNNING_SPEED;

            this.speedZ = -forwardDirection.z * RUNNING_SPEED * 0.7;
            this.speedX = -forwardDirection.x * RUNNING_SPEED * 0.7;
            //this.gameObject.rotate(new Vector3(-1, 0, 0), 0.1);

        }
        else {
            if (USE_FORCES)
                this.speedZ = 0;
            else
                //Frottements
                this.speedZ += (-12.0 * this.speedZ * delta);
        }
        if (USE_FORCES) {
            //console.log(currentVelocity.y);
            if (actions["Space"] && currentVelocity.y == 0) {
                //Pas de delta ici, c'est une impulsion non dépendante du temps (pas d'ajout)
                this.capsuleAggregate.body.applyImpulse(new Vector3(0, JUMP_IMPULSE, 0), new Vector3(0, 0, 0));

            }
            this.capsuleAggregate.body.applyForce(new Vector3(this.speedX, 0, this.speedZ), new Vector3(0, 0, 0));
        }
        else {
            let impulseY = 0;
            if (actions["Space"] && this.gameObject.getAbsolutePosition().y < PLAYER_HEIGHT / 2 + 0.1) {
                //Pas de delta ici, c'est une impulsion non dépendante du temps (pas d'ajout)
                impulseY = JUMP_IMPULSE;
            }
            //Gravity 
            currentVelocity = new Vector3(this.speedX, impulseY + currentVelocity.y, this.speedZ);

            //Position update
            this.capsuleAggregate.body.setLinearVelocity(currentVelocity);
        }



        //Orientation
        let directionXZ = new Vector3(this.speedX, 0, this.speedZ);


        //Animations
        if (directionXZ.length() > 2.5) {
            /* Autre tentative de  rotation autour de l'axe Z uniquement
                const lookAt = Matrix.LookAtLH(
                Vector3.Zero,
                directionXZ,
                Vector3.UpReadOnly
            ).invert();
            this.gameObject.rotationQuaternion = Quaternion.FromRotationMatrix( lookAt );*/

            this.gameObject.lookAt(directionXZ.normalize());

            if (!this.bWalking) {
                //this.runAnim.start(true, 1.0, this.runAnim.from, this.runAnim.to, false);
                this.bWalking = true;
            }
        }
        else {
            if (this.bWalking) {
                //    this.runAnim.stop();
                //this.idleAnim.start(true, 1.0, this.idleAnim.from, this.idleAnim.to, false);
                this.bWalking = false;
            }
        }
    }



    estAuSol(sphereMesh, groundMesh, scene) {
        console.log(groundMesh);
        var ray = new Ray(sphereMesh.position, new Vector3(0, -1, 0));

        var pickInfo = scene.pickWithRay(ray, function (mesh) { return mesh === groundMesh; });
        /* console.log(pickInfo);
         console.log(pickInfo.distance);
         console.log(pickInfo.distance <= sphereMesh.scaling.y);*/

        if (/*pickInfo.hit && */pickInfo.distance <= sphereMesh.scaling.y) {
            return true;
        } else {
            return false;
        }
    }
    async removeFromScene() {
        // Supprimer le gameObject du joueur de la scène
        if (this.gameObject) {
            this.gameObject.dispose();
        }

        // Supprimer le label du joueur de la scène
        if (this.label) {
            this.label.dispose();
        }

        // Supprimer le transform du joueur de la scène
        if (this.transform) {
            this.transform.dispose();
        }

        // Supprimer toutes les références
        this.scene = null;
        this.arena = null;
        this.capsuleAggregate = null;
        this.idleAnim = null;
        this.runAnim = null;
        this.walkAnim = null;
    }


}

export default Player;