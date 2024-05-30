import { ActionManager, ArcRotateCamera, Color3, ExecuteCodeAction, HighlightLayer, Matrix, Mesh, MeshBuilder, Physics6DoFConstraint, PhysicsAggregate, PhysicsConstraintAxis, PhysicsMotionType, PhysicsShapeType, Quaternion, Ray, SceneLoader, Sound, StandardMaterial, Texture, TransformNode, Vector3 } from "@babylonjs/core";
import { AdvancedDynamicTexture, Rectangle, TextBlock } from "@babylonjs/gui";
import but from "../../assets/sounds/sifflet.mp3";
import but2 from "../../assets/sounds/but2.mp3";





class Ball {
    shadowGenerator
    scene
    scoreBlue = 0;
    scoreRed = 0;

    scoreTextR;
    scoreTextB;
    mesh;
    meshAggregate;
    x = -15;
    y = 5;
    z = -21;
    room;
    constructor(scene, room, scoreTextRed, scoreTextBlue) {
        this.scene = scene;
        this.room = room;
        this.scoreTextR = scoreTextRed;
        this.scoreTextB = scoreTextBlue;

    }

    init() {
        this.mesh = this.createFootball(this.scene)
        this.createDetectionSquareBlue();
        this.createDetectionSquareRed();
        this.createrespawn([0, -1, 0], [0, 0, 0], [200, 200, 10])
    }
    createrespawn(positions, rotations, taille) {
        this.redRectangle = Mesh.CreateGround("redRectangle", taille[0], taille[1], taille[2], this.scene);
        this.redRectangle.position = new Vector3(positions[0], positions[1], positions[2]);
        this.redRectangle.scaling = new Vector3(2.1, 1, 1);
        this.redRectangle.rotation = new Vector3(rotations[0], rotations[1], rotations[2]);
        this.redRectangle.material = new StandardMaterial("redMat", this.scene);
        this.redRectangle.material.diffuseColor = new Color3(1, 0, 0); // Rouge
        this.redRectangle.checkCollisions = true;
        this.redRectangle.material.alpha = 0.5;
        this.redRectangle.isVisible = false;
        this.redRectangle.actionManager = new ActionManager(this.scene);
        this.redRectangle.actionManager.registerAction(
            new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnIntersectionEnterTrigger,
                    parameter: this.mesh
                },
                () => {
                    if (this.sifflet.isReady()) {
                        this.sifflet.play();
                    }
                    this.mesh.dispose();
                    this.mesh = this.createFootball(this.scene);
                    this.rectangle_r.dispose();
                    this.rectangle_b.dispose();
                    this.createDetectionSquareBlue();
                    this.createDetectionSquareRed();
                    this.redRectangle.dispose();
                    this.createrespawn([0, -1, 0], [0, 0, 0], [200, 200, 10])

                }
            )
        );
    }
    createFootball(scene) {
        const ball = MeshBuilder.CreateSphere("football", { diameter: 2 }, scene);
        this.sifflet = new Sound("win", but, this.scene);
        ball.position = new Vector3(this.x, this.y, this.z); // Position initiale de la balle
        const ballMaterial = new StandardMaterial("footballMaterial", scene);
        ballMaterial.diffuseTexture = new Texture("../assets/images/ballon-texture.jpg", scene);
        ball.material = ballMaterial;
        //this.shadowGenerator.addShadowCaster(ball);
        this.meshAggregate = new PhysicsAggregate(ball, PhysicsShapeType.SPHERE, { mass: 0.7, restitution: 0.8 }, scene);
        console.log(ball);
        if (this.sifflet.isReady()) {
            this.sifflet.play();
        }
        return ball;
    }
    createDetectionSquareBlue() {
        this.rectangle_b = MeshBuilder.CreatePlane("goalBlue", { width: 4, height: 3 }, this.gameScene);
        this.but = new Sound("win", but2, this.scene);

        this.rectangle_b.position = new Vector3(-15.4, 0.8, -36);
        this.rectangle_b.rotation = new Vector3(this.degreesToRadians(180), 0, 0);

        const material = new StandardMaterial("detectionRectangleMaterialBlue", this.gameScene);
        material.diffuseColor = new Color3(0, 0, 1); // bleu
        material.alpha = 0.5;

        this.rectangle_b.material = material;
        this.rectangle_b.isPickable = true;

        // Ajouter une action de collision pour le rectangle bleu
        this.rectangle_b.actionManager = new ActionManager(this.gameScene);
        this.rectangle_b.actionManager.registerAction(
            new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnIntersectionEnterTrigger,
                    parameter: this.mesh
                },
                () => {
                    if (this.but.isReady()) {
                        this.but.play();
                    }
                    if (this.sifflet.isReady()) {
                        this.sifflet.play();
                    }
                    this.scoreRed += 1;
                    this.room.send("scoreRedIncr", this.scoreRed)
                    this.mesh.dispose();
                    this.mesh = this.createFootball(this.scene);
                    this.rectangle_r.dispose();
                    this.rectangle_b.dispose();
                    this.createDetectionSquareBlue();
                    this.createDetectionSquareRed();
                    this.redRectangle.dispose();
                    this.createrespawn([0, -1, 0], [0, 0, 0], [200, 200, 10])
                    this.updateScoreText();
                }
            )
        );
    }

    createDetectionSquareRed() {
        this.rectangle_r = MeshBuilder.CreatePlane("goalRed", { width: 4, height: 3 }, this.gameScene);
        this.but = new Sound("win", but2, this.scene);
        this.rectangle_r.position = new Vector3(-15.4, 0.8, -4.2);
        this.rectangle_r.rotation = new Vector3(0, 0, 0);

        const material = new StandardMaterial("detectionRectangleMaterialRed", this.gameScene);
        material.diffuseColor = new Color3(1, 0, 0); // rouge
        material.alpha = 0.5;

        this.rectangle_r.material = material;
        this.rectangle_r.isPickable = true;

        // Ajouter une action de collision pour le rectangle rouge
        this.rectangle_r.actionManager = new ActionManager(this.gameScene);
        this.rectangle_r.actionManager.registerAction(
            new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnIntersectionEnterTrigger,
                    parameter: this.mesh
                },
                () => {
                    if (this.but.isReady()) {
                        this.but.play();
                    }
                    if (this.sifflet.isReady()) {
                        this.sifflet.play();
                    }
                    this.scoreBlue += 1;
                    this.room.send("scoreBlueIncr", this.scoreBlue)
                    this.mesh.dispose();
                    this.mesh = this.createFootball(this.scene);
                    this.rectangle_r.dispose();
                    this.rectangle_b.dispose();
                    this.createDetectionSquareBlue();
                    this.createDetectionSquareRed();
                    this.redRectangle.dispose();
                    this.createrespawn([0, -1, 0], [0, 0, 0], [200, 200, 10])
                    this.updateScoreText()



                }
            )
        );
    }


    degreesToRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    resetToCenter() {
        console.log("reset to center")
        // The position where you want to move the body to
        console.log(this.meshAggregate.body.transformNode.position)
        console.log(this.mesh.position)
        this.mesh.position = new Vector3(this.x, this.y, this.z);
        this.meshAggregate.body.transformNode.position = new Vector3(this.x, this.y, this.z);
        this.meshAggregate.body.setLinearVelocity(Vector3.Zero());

    }

    /*createScoreText() {
        const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("ScoreUI");

        this.scoreTextRed = new TextBlock();
        this.scoreTextRed.text = "Red: 0";
        this.scoreTextRed.color = "red";
        this.scoreTextRed.fontSize = 24;
        this.scoreTextRed.horizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
        this.scoreTextRed.verticalAlignment = TextBlock.VERTICAL_ALIGNMENT_TOP;
        this.scoreTextRed.top = "10px";
        this.scoreTextRed.left = "10px";

        this.scoreTextBlue = new TextBlock();
        this.scoreTextBlue.text = "Blue: 0";
        this.scoreTextBlue.color = "blue";
        this.scoreTextBlue.fontSize = 24;
        this.scoreTextBlue.horizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
        this.scoreTextBlue.verticalAlignment = TextBlock.VERTICAL_ALIGNMENT_TOP;
        this.scoreTextBlue.top = "40px";
        this.scoreTextBlue.left = "10px";

        advancedTexture.addControl(this.scoreTextRed);
        advancedTexture.addControl(this.scoreTextBlue);
    }*/
    updateScoreText() {
        this.scoreTextR.text = `Red: ${this.scoreRed}`;
        this.scoreTextB.text = `Blue: ${this.scoreBlue}`;
    }

}

export default Ball;