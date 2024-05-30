import { ArcRotateCamera, Color3, HighlightLayer, Matrix, Mesh, MeshBuilder, Physics6DoFConstraint, PhysicsAggregate, PhysicsConstraintAxis, PhysicsMotionType, PhysicsShapeType, Quaternion, Ray, SceneLoader, Sound, StandardMaterial, Texture, TransformNode, Vector3 } from "@babylonjs/core";


import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import jumpSoundUrl from "../../assets/sounds/jump.mp3"

const USE_FORCES = false;
let RUNNING_SPEED = 14;
let JUMP_IMPULSE = 6;
const PLAYER_HEIGHT = 1;
const PLAYER_RADIUS = 0.5;
const POSITION_CORRECTION_THRESHOLD = 1;

class Player {
    isSoundPlay = true;
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

    startTime = 0;
    elapsedTime = 0;

    #jumpSound;
    color = ""
    constructor(x, y, z, scene, arena, pseudo, gameType, idCountryFlag, clientId, color) {
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
        this.color = color || "";

        if (USE_FORCES) {
            RUNNING_SPEED += 2;
        }
    }

    setRunningSpeed(speed) {
        RUNNING_SPEED = speed;
    }

    getRunningSpeed() {
        return RUNNING_SPEED;
    }
    setJumpImpulse(jump) {
        JUMP_IMPULSE = jump;
    }
    sendMovementDataToServer(room, inputDevant, inputArriere, sautInput) {
        // Créer un objet contenant les attributs modifiés lors du mouvement
        const movementData = {
            position: this.transform.position.clone(), // Position du joueur
            rotation: this.gameObject.rotationQuaternion.clone(), // Rotation du joueur
            velocity: this.capsuleAggregate.body.getLinearVelocity().clone(), // Vélocité du joueur
            isWalking: this.bWalking,
            camera: this.camera.getForwardRay().direction.clone(),
            avant: inputDevant,
            arriere: inputArriere,
            saut: sautInput,
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
            data1.camera.equals(data2.camera) &&
            data1.isWalking === data2.isWalking
        );
    }

    updateVisualPosition(position) {
        this.transform.position = position
        //this.transform.position.set()

        //this.transform.locallyTranslate(new Vector3(position._x, position._y, position._z));


    }
    async updatePseudo(pseudo) {
        this.pseudo = pseudo;
        if (this.label) {
            this.label.text = pseudo;
        }
    }
    async updateIdCountryFlag(idCountryFlag) {
        this.idCountryFlag = idCountryFlag;

        if (this.gameObject) {
            const meshMaterial = new StandardMaterial("mesh");
            meshMaterial.diffuseTexture = new Texture("../assets/images/drapeaux/" + this.skins[this.idCountryFlag]);
            this.gameObject.material = meshMaterial;
            var hl = new HighlightLayer("hl1", this.scene);
            hl.addMesh(this.gameObject, Color3.Green());
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
        var hl = new HighlightLayer("hl1", this.scene);
        if (this.color == "blue") {
            hl.addMesh(this.gameObject, Color3.Blue());
        }
        else if (this.color == "red") {
            hl.addMesh(this.gameObject, Color3.Red());
        }

        this.capsuleAggregate = new PhysicsAggregate(this.transform, PhysicsShapeType.CAPSULE, { mass: 1, friction: 1, restitution: 0.2, inertia: 0 }, this.scene);
        this.capsuleAggregate.body.setMotionType(PhysicsMotionType.DYNAMIC);


        if (USE_FORCES) {
            this.capsuleAggregate.body.setLinearDamping(0.8);
            this.capsuleAggregate.body.setAngularDamping(10.0);

        }
        else {
            this.capsuleAggregate.body.setLinearDamping(0.5);
            this.capsuleAggregate.body.setAngularDamping(0.5);
        }


        this.gameObject.parent = this.transform;
        this.#jumpSound = new Sound("jump", jumpSoundUrl, this.scene)

        await this.createCamera();
        await this.createLabel();



    }
    async createCamera() {
        if (this.color == "white") {
            this.camera = await new ArcRotateCamera("cameraJoueur", Math.PI / 2, Math.PI / 4, 20, this.gameObject.position.subtract(new Vector3(0, -3, -2)), this.scene);
        }
        else {
            this.camera = await new ArcRotateCamera("cameraJoueur", Math.PI / 2, Math.PI / 4, 20, this.transform.position.subtract(new Vector3(0, 3, 0)), this.scene);
        }
        await this.reglageCamera(10, 50, 0.01, 1000);
        //this.reglageScene();

    }
    async reglageCamera(lowerRadiusLimit, upperRadiusLimit, wheelDeltaPercentage, angularSensibility) {
        this.camera.lowerRadiusLimit = lowerRadiusLimit;
        this.camera.upperRadiusLimit = upperRadiusLimit;
        this.camera.wheelDeltaPercentage = wheelDeltaPercentage;
        this.camera.angularSensibility = angularSensibility;
        if (this.color == "white") {
            this.camera.target = this.gameObject;

        } else {
            this.camera.target = this.transform;
        }
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

    update(inputMap, actions, delta, room, sound) {
        let currentVelocity = this.capsuleAggregate.body.getLinearVelocity();
        const camera1 = this.camera;
        var forwardDirection = camera1.getForwardRay().direction;
        //debug
        if (inputMap["KeyG"]) {
            this.grow()
        }
        else if (inputMap["KeyV"]) {
            this.shrink()
        }
        //Inputs 
        if (actions["KeyP"]) {
            if (this.isSoundPlay) {
                this.isSoundPlay = false;

                sound.stop()
            }
            else {
                this.isSoundPlay = true;

                sound.play();

            }
        }
        //q
        var cameraspeed = 2.5 * delta;
        if (inputMap["KeyA"]) {
            //this.speedX = RUNNING_SPEED;
            camera1.alpha += cameraspeed;
        }

        //d
        else if (inputMap["KeyD"]) {
            //this.speedX = -RUNNING_SPEED;
            camera1.alpha -= cameraspeed;
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

            this.speedZ = forwardDirection.z * RUNNING_SPEED;
            this.speedX = forwardDirection.x * RUNNING_SPEED;





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
            if (actions["Space"] && currentVelocity.y == 0) {
                this.capsuleAggregate.body.applyImpulse(new Vector3(0, JUMP_IMPULSE, 0), new Vector3(0, 0, 0));

            }
            this.capsuleAggregate.body.applyForce(new Vector3(this.speedX, 0, this.speedZ), new Vector3(0, 0, 0));
        }
        else {
            let impulseY = 0;
            if (actions["Space"] && this.gameObject.getAbsolutePosition().y < PLAYER_HEIGHT / 2 + 0.1) {
                //Pas de delta ici, c'est une impulsion non dépendante du temps (pas d'ajout)
                impulseY = JUMP_IMPULSE;
                if (JUMP_IMPULSE > 0) {
                    this.#jumpSound.play();

                }


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
    detectPlayerCollision(otherPlayer) {
        if (otherPlayer !== this) {
            const distance = Vector3.Distance(this.gameObject.position, otherPlayer.gameObject.position);
            if (distance < PLAYER_RADIUS * 2) {
                return true;
            }
        }

        return false;
    }



    estAuSol(sphereMesh, groundMesh, scene) {
        var ray = new Ray(sphereMesh.position, new Vector3(0, -1, 0));

        var pickInfo = scene.pickWithRay(ray, function (mesh) { return mesh === groundMesh; });

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
        if (this.camera) {
            this.camera.dispose();
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

        const currentVelocity = new Vector3(x, y, z);
        const currentPosition = new Vector3(posX, posY, posZ);

        // Check if the received position is significantly different from the current position
        const dx = Math.abs(currentPosition.x - this.transform.position.x);
        const dy = Math.abs(currentPosition.y - this.transform.position.y);
        const dz = Math.abs(currentPosition.z - this.transform.position.z);
        //console.log(dx, " ", dy, " ", dz)
        if (dx > POSITION_CORRECTION_THRESHOLD || dy > POSITION_CORRECTION_THRESHOLD || dz > POSITION_CORRECTION_THRESHOLD || dx < - POSITION_CORRECTION_THRESHOLD || dy < -POSITION_CORRECTION_THRESHOLD || dz < - POSITION_CORRECTION_THRESHOLD) {
            /*console.log("poschange")
            console.log(this.transform.position)
            console.log(currentPosition)*/
            //this.transform.position = currentPosition;
        }
        else {
            this.capsuleAggregate.body.setLinearVelocity(currentVelocity);

        }

    }
    grow() {
        console.log("Début de la croissance...");
        const scaleFactor = 2;
        this.gameObject.scaling = new Vector3(scaleFactor, scaleFactor, scaleFactor);
        const groundPosition = new Vector3(this.gameObject.position.x, 0, this.gameObject.position.z);
        const spherePosition = this.gameObject.position;
        const distanceToGround = spherePosition.y - groundPosition.y;
        const newPosition = groundPosition.add(new Vector3(0, distanceToGround, 0));
        this.gameObject.position = newPosition;
        setTimeout(() => {
            this.gameObject.scaling = new Vector3(1, 1, 1);
            this.gameObject.position = spherePosition;
            console.log("Objet a atteint sa taille maximale.");
        }, 5000); // Attendre 5 secondes (5000 millisecondes)
    }

    shrink() {
        console.log("Début du rétrécissement...");
        const scaleFactor = 0.5;
        this.gameObject.scaling = new Vector3(scaleFactor, scaleFactor, scaleFactor);
        const groundPosition = new Vector3(this.gameObject.position.x, 0, this.gameObject.position.z);
        const spherePosition = this.gameObject.position;
        const distanceToGround = spherePosition.y - groundPosition.y;
        const newPosition = groundPosition.add(new Vector3(0, distanceToGround, 0));
        this.gameObject.position = newPosition;
        setTimeout(() => {
            this.gameObject.scaling = new Vector3(1, 1, 1);
            this.gameObject.position = spherePosition;
            console.log("Objet a atteint sa taille minimale.");
        }, 5000); // Attendre 5 secondes (5000 millisecondes)
    }


}

export default Player;