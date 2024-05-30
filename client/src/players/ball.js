import { ActionManager, ArcRotateCamera, Color3, ExecuteCodeAction, HighlightLayer, Matrix, Mesh, MeshBuilder, Physics6DoFConstraint, PhysicsAggregate, PhysicsConstraintAxis, PhysicsMotionType, PhysicsShapeType, Quaternion, Ray, SceneLoader, Sound, StandardMaterial, Texture, TransformNode, Vector3 } from "@babylonjs/core";
import { AdvancedDynamicTexture, Rectangle, TextBlock } from "@babylonjs/gui";





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
    y = 1;
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
    }
    createFootball(scene) {
        const ball = MeshBuilder.CreateSphere("football", { diameter: 3 }, scene);
        ball.position = new Vector3(this.x, this.y, this.z); // Position initiale de la balle
        const ballMaterial = new StandardMaterial("footballMaterial", scene);
        ballMaterial.diffuseTexture = new Texture("../assets/images/anneaux-4.png", scene);
        ball.material = ballMaterial;
        //this.shadowGenerator.addShadowCaster(ball);
        this.meshAggregate = new PhysicsAggregate(ball, PhysicsShapeType.SPHERE, { mass: 1 }, scene);

        return ball;
    }
    createDetectionSquareBlue() {
        const rectangle = MeshBuilder.CreatePlane("goalBlue", { width: 3, height: 4 }, this.gameScene);
        rectangle.position = new Vector3(-15.4, 0.2, -36);
        rectangle.rotation = new Vector3(this.degreesToRadians(180), 0, 0);

        const material = new StandardMaterial("detectionRectangleMaterialBlue", this.gameScene);
        material.diffuseColor = new Color3(0, 0, 1); // bleu
        material.alpha = 0.5;

        rectangle.material = material;
        rectangle.isPickable = true;

        // Ajouter une action de collision pour le rectangle bleu
        rectangle.actionManager = new ActionManager(this.gameScene);
        rectangle.actionManager.registerAction(
            new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnIntersectionEnterTrigger,
                    parameter: this.mesh
                },
                () => {
                    this.scoreRed += 1;
                    this.room.send("scoreRedIncr", this.scoreRed)

                    //this.resetToCenter();
                    this.updateScoreText();
                }
            )
        );
    }

    createDetectionSquareRed() {
        const rectangle = MeshBuilder.CreatePlane("goalRed", { width: 3, height: 4 }, this.gameScene);
        rectangle.position = new Vector3(-15.4, 0.2, -4.2);
        rectangle.rotation = new Vector3(0, 0, 0);

        const material = new StandardMaterial("detectionRectangleMaterialRed", this.gameScene);
        material.diffuseColor = new Color3(1, 0, 0); // rouge
        material.alpha = 0.5;

        rectangle.material = material;
        rectangle.isPickable = true;

        // Ajouter une action de collision pour le rectangle rouge
        rectangle.actionManager = new ActionManager(this.gameScene);
        rectangle.actionManager.registerAction(
            new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnIntersectionEnterTrigger,
                    parameter: this.mesh
                },
                () => {
                    this.scoreBlue += 1;
                    this.room.send("scoreBlueIncr", this.scoreBlue)
                    this.resetToCenter()
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
        this.meshAggregate.body.disablePreStep = false;
        // The position where you want to move the body to
        console.log(this.meshAggregate.body.transformNode.position)
        console.log(this.mesh.position)
        this.mesh.position = new Vector3(this.x, this.y, this.z);
        this.meshAggregate.body.transformNode.position.set(this.x, this.y, this.z);
        this.meshAggregate.body.setLinearVelocity(Vector3.Zero());
        this.scene.onAfterRenderObservable.addOnce(() => {
            this.meshAggregate.body.disablePreStep = true;
        });
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