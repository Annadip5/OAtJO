import { CannonJSPlugin, MeshBuilder, PhysicsAggregate, PhysicsImpostor, PhysicsShapeType, StandardMaterial, Texture, Vector3 } from "@babylonjs/core";
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui";

const USE_FORCES = false;
let RUNNING_SPEED = 8;
let JUMP_IMPULSE = 10;

class BowlPlayer {
    scene;

    pseudo;
    gameType;
    idCountryFlag;
    mesh;
    label;
    linkOffsetYlabel = -65;

    points = 0;
    skins = ["AfriqueSud.png", "Allemagne.png", "Angleterre.png", "Bresil.png", "Cameroun.png", "Canada.png", "Chine.png", "Espagne.png", "EtatUnis.png", "France.png", "Italie.png", "Russie.png", "Ukraine.png"];

    x = 1;
    y = 1;
    z = 0;
    constructor(scene, pseudo, gameType, idCountryFlag) {
        this.scene = scene;
        this.pseudo = pseudo;
        this.gameType = gameType;
        this.idCountryFlag = idCountryFlag;


        if (USE_FORCES) {
            RUNNING_SPEED *= 2;
        }
    }

    async init() {
        const result = await MeshBuilder.CreateSphere("sphere", { diameter: 1 }, this.scene);
        this.mesh = result;
        const meshMaterial = new StandardMaterial("mesh");
        meshMaterial.diffuseTexture = new Texture("../../assets/images/drapeaux/" + this.skins[this.idCountryFlag]);
        this.mesh.material = meshMaterial;
        this.mesh.position = new Vector3(this.x, this.y, this.z);
        // this.mesh.physicsImpostor = new PhysicsImpostor(this.mesh, PhysicsImpostor.SphereImpostor, { mass: 1, friction: 0, restitution: 0 });
        this.mesh.PhysicsAggregate = new PhysicsAggregate(this.mesh, PhysicsShapeType.SPHERE, { mass: 1, friction: 0, restitution: 0.3, linearDamping: 0.5, angularDamping: 0.5 });
        this.mesh.scaling.scaleInPlace(1);
        this.mesh.checkCollisions = true;

        await this.createLabel();

    }

    async createLabel() {
        var advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        this.label = new TextBlock();
        this.label.text = this.pseudo;
        this.label.color = "white";
        this.label.fontSize = 30;
        advancedTexture.addControl(this.label);
        this.label.linkWithMesh(this.mesh);
        this.label.linkOffsetY = this.linkOffsetYlabel;
    }

}
export default BowlPlayer