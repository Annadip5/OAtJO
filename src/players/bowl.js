import { MeshBuilder, PhysicsAggregate, PhysicsImpostor, PhysicsMotionType, PhysicsShapeType, Quaternion, Ray, StandardMaterial, Texture, Vector3 } from "@babylonjs/core";
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui";

const USE_FORCES = false;
let RUNNING_SPEED = 8;
let JUMP_IMPULSE = 6;

class BowlPlayer {
    scene;

    pseudo;
    gameType;
    idCountryFlag;
    mesh;
    label;
    linkOffsetYlabel = -65;
    //Position dans le monde
    transform;
    meshAggregate;

    points = 0;
    skins = ["AfriqueSud.png", "Allemagne.png", "Angleterre.png", "Bresil.png", "Cameroun.png", "Canada.png", "Chine.png", "Espagne.png", "EtatUnis.png", "France.png", "Italie.png", "Russie.png", "Ukraine.png"];
    bWalking = false;
    bOnGround = false;
    bFalling = false;
    bJumping = false;

    moveDir = Vector3.Zero();
    jumpImpulse = new Vector3(0, JUMP_IMPULSE, 0);
    directionXZ = Vector3.Zero();

    x = 0.0;
    y = 1.0;
    z = 0.0;

    speedX = 0.0;
    speedY = 0.0;
    speedZ = 0.0;
    constructor(scene, pseudo, gameType, idCountryFlag, x, y, z) {
        this.scene = scene;
        this.pseudo = pseudo;
        this.gameType = gameType;
        this.idCountryFlag = idCountryFlag;
        this.x = x || 0;
        this.y = y || 1;
        this.z = z || 0;


        /*if (USE_FORCES) {
            RUNNING_SPEED *= 2;
        }*/
    }

    async init() {
        const result = await MeshBuilder.CreateSphere("sphere", { diameter: 1 }, this.scene);
        this.mesh = result;
        const meshMaterial = new StandardMaterial("mesh");
        meshMaterial.diffuseTexture = new Texture("../../assets/images/drapeaux/" + this.skins[this.idCountryFlag]);
        this.mesh.material = meshMaterial;
        this.mesh.position = new Vector3(this.x, this.y, this.z);
        // this.mesh.physicsImpostor = new PhysicsImpostor(this.mesh, PhysicsImpostor.SphereImpostor, { mass: 1, friction: 0, restitution: 0 });

        this.meshAggregate = new PhysicsAggregate(this.mesh, PhysicsShapeType.SPHERE, { mass: 1, friction: 0, restitution: 0 });
        this.mesh.PhysicsAggregate = this.meshAggregate;
        this.meshAggregate.body.setMotionType(PhysicsMotionType.DYNAMIC);
        this.meshAggregate.body.disablePreStep = false;

        this.meshAggregate.body.setMassProperties({
            inertia: new Vector3(0, 0, 0),
            centerOfMass: new Vector3(0, 1 / 2, 0),
            mass: 1,
            inertiaOrientation: new Quaternion(0, 0, 0, 1)
        });

        console.log(this.meshAggregate);
        console.log("*************************");
        console.log("*************************");
        console.log(this.meshAggregate.body.getLinearVelocity())
        this.mesh.scaling.scaleInPlace(1);
        this.mesh.checkCollisions = true;

        await this.createLabel();

    }

    async createLabel() {
        var advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        this.label = new TextBlock();
        this.label.text = this.pseudo;
        this.label.color = "orange";
        this.label.fontSize = 30;
        advancedTexture.addControl(this.label);
        this.label.linkWithMesh(this.mesh);
        this.label.linkOffsetY = this.linkOffsetYlabel;
    }

    performSpecialMovement() {
        console.log("in function");
        this.meshAggregate.body.applyImpulse(new Vector3(0, 2, 0), this.mesh.position);
    }



}
export default BowlPlayer