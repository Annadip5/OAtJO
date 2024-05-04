import { ArcRotateCamera, Matrix, Mesh, MeshBuilder, Physics6DoFConstraint, PhysicsAggregate, PhysicsConstraintAxis, PhysicsMotionType, PhysicsShapeType, Quaternion, Ray, SceneLoader, StandardMaterial, Texture, TransformNode, Vector3 } from "@babylonjs/core";

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
    previousMovementData = null;

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

    camera;
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
    sendMovementDataToServer(room) {
        // Créer un objet contenant les attributs modifiés lors du mouvement
        const movementData = {
            position: this.transform.position.clone(), // Position du joueur
            rotation: this.gameObject.rotationQuaternion.clone(), // Rotation du joueur
            velocity: this.capsuleAggregate.body.getLinearVelocity().clone(), // Vélocité du joueur
            isWalking: this.bWalking,
        };
        if (this.previousMovementData === null || !this.areMovementDataEqual(this.previousMovementData, movementData)) {
            // Envoyer les données de mouvement au serveur
            room.send("updateMovement", movementData);
            // Mettre à jour les données de mouvement précédentes
            this.previousMovementData = movementData;
        }

        // Envoyer les données de mouvement au serveur
        //room.send("updateMovement", movementData);
    }
    areMovementDataEqual(data1, data2) {
        return (
            data1.position.equals(data2.position) &&
            data1.rotation.equals(data2.rotation) &&
            data1.velocity.equals(data2.velocity) &&
            data1.isWalking === data2.isWalking
        );
    }

    updateVisualPosition(position) {
        this.transform.position = position
        //this.transform.position.set()

        //this.transform.locallyTranslate(new Vector3(position._x, position._y, position._z));


    }
    async updatePseudo(pseudo) {
        // Mettre à jour le pseudo
        this.pseudo = pseudo;

        // Mettre à jour le texte de l'étiquette du pseudo
        if (this.label) {
            this.label.text = pseudo;
        }
    }
    async updateIdCountryFlag(idCountryFlag) {
        // Mettre à jour l'ID du drapeau
        this.idCountryFlag = idCountryFlag;

        // Mettre à jour la texture du mesh avec le nouveau drapeau
        if (this.gameObject) {
            const meshMaterial = new StandardMaterial("mesh");
            meshMaterial.diffuseTexture = new Texture("../assets/images/drapeaux/" + this.skins[this.idCountryFlag]);
            this.gameObject.material = meshMaterial;
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
        await this.createCamera();
        await this.createLabel();


    }
    async createCamera() {
        this.camera = await new ArcRotateCamera("cameraJoueur", Math.PI / 2, Math.PI / 4, 20, this.gameObject.position.subtract(new Vector3(0, -3, -2)), this.scene);
        await this.reglageCamera();
        //this.reglageScene();

    }
    async reglageCamera(lowerRadiusLimit, upperRadiusLimit, wheelDeltaPercentage, angularSensibility) {
        this.camera.lowerRadiusLimit = lowerRadiusLimit;
        this.camera.upperRadiusLimit = upperRadiusLimit;
        this.camera.wheelDeltaPercentage = wheelDeltaPercentage;
        this.camera.angularSensibility = angularSensibility;
        this.camera.target = this.gameObject;
        console.log(this.camera.target);
    }

    async createLabel() {
        var advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        this.label = new TextBlock();
        this.label.text = this.pseudo;
        this.label.color = "white";
        this.label.fontSize = 30;
        advancedTexture.addControl(this.label);
        this.label.linkWithMesh(this.gameObject);
        this.label.linkOffsetY = this.linkOffsetYlabel;
    }

    //Pour le moment on passe les events clavier ici, on utilisera un InputManager plus tard
    update(inputMap, actions, delta, room) {
        let currentVelocity = this.capsuleAggregate.body.getLinearVelocity();
        const camera1 = this.camera;
        var forwardDirection = camera1.getForwardRay().direction;

        //Inputs 
        //q
        if (inputMap["KeyA"]) {
            //this.speedX = RUNNING_SPEED;
            camera1.alpha += 0.015;
        }

        //d
        else if (inputMap["KeyD"]) {
            //this.speedX = -RUNNING_SPEED;
            camera1.alpha -= 0.015;
        }

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
            console.log(this.transform.position);
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
    updateMoveVelo(message) {
        const x = message.velocity._x;
        const y = message.velocity._y;
        const z = message.velocity._z;
        const posX = message.position._x;
        const posY = message.position._y;
        const posZ = message.position._z;
        const rotX = message.rotation._x;
        const rotY = message.rotation._y;
        const rotZ = message.rotation._z;
        const rotW = message.rotation._w;


        //const pos = this.gameObject.position.subtract(new Vector3(posX, posY, posZ));
        const currentVelocity = new Vector3(x, y, z);
        //this.gameObject.position = pos;
        //this.updateVisualPosition(message.position);

        //Position update
        this.capsuleAggregate.body.setLinearVelocity(currentVelocity);

    }


}

export default Player;