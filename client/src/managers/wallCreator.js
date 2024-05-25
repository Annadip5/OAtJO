import { ActionManager, Color3, DiscBuilder, ExecuteCodeAction, Mesh, Sound, StandardMaterial, Vector3 } from "@babylonjs/core";
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui";
import checkpointSoundUrl from "../../assets/sounds/checkpoint.mp3"


class WallCreator {
    wallPositions = [
        { position: [-100, 3, 25.3], rotation: [276.5 * (Math.PI / 180), 270.4 * (Math.PI / 180), 0] },
        { position: [-160, 3, 25.3], rotation: [276.5 * (Math.PI / 180), 270.4 * (Math.PI / 180), 0] },
        { position: [-225, 3, 2], rotation: [276.5 * (Math.PI / 180), 228.3 * (Math.PI / 180), 0] },
        { position: [-165, 3, -94], rotation: [276.5 * (Math.PI), 270.4 * (Math.PI / 180), 0] },
        { position: [-100, 3, -94], rotation: [276.5 * (Math.PI), 270.4 * (Math.PI / 180), 0] },
        { position: [-100, 3, 25.3], rotation: [276.5 * (Math.PI / 180), 270.4 * (Math.PI / 180), 0] },
        { position: [-160, 3, 25.3], rotation: [276.5 * (Math.PI / 180), 270.4 * (Math.PI / 180), 0] },

    ];
    olympicColors = [
        "blue",
        "red",
        "green",
        "yellow",
        "black"
    ];

    constructor(scene) {
        this.scene = scene;
        this.currentWallIndex = 0;
        this.nextWallIndex = 1;
        this.walls = [];
        this.wallsToRemove = [];
        this.isRemovingWalls = false;
    }

    async createSquareDetection(localPlayer) {
        this.checkpointSound = new Sound("checkpoint", checkpointSoundUrl, this.scene);

        await this.createWall(this.wallPositions[this.currentWallIndex], localPlayer);
        await this.createWall(this.wallPositions[this.nextWallIndex], localPlayer);

    }

    async createWall(wallPosition, localPlayer) {
        const { position, rotation } = wallPosition;

        const wall = Mesh.CreateGround("wall", 10, 20, 3, this.scene);
        wall.position = new Vector3(position[0], position[1], position[2]);
        wall.scaling = new Vector3(2.1, 1, 1);
        wall.rotation = new Vector3(rotation[0], rotation[1], rotation[2]);
        wall.material = new StandardMaterial("wallMat", this.scene);
        wall.material.diffuseColor = new Color3(0, 1, 0); // Vert
        wall.checkCollisions = true;

        wall.actionManager = new ActionManager(this.scene);
        const enterAction = new ExecuteCodeAction(
            {
                trigger: ActionManager.OnIntersectionEnterTrigger,
                parameter: localPlayer
            },
            () => {
                if (this.checkpointSound.isReady()) {
                    this.checkpointSound.play();
                }

            }
        );

        wall.actionManager.registerAction(enterAction);
        const exitAction = new ExecuteCodeAction(
            {
                trigger: ActionManager.OnIntersectionExitTrigger,
                parameter: localPlayer
            },
            () => {

                this.moveToNextWall(localPlayer);
                this.markWallToRemove(wall);
                if (this.currentWallIndex === this.wallPositions.length - 1) {

                    this.createSquareDetectionAreaFinish2(this.scene, localPlayer);
                }
            }
        );

        wall.actionManager.registerAction(exitAction);

        const finishText = new TextBlock();
        finishText.text = "O";
        finishText.color = this.randomColor();
        finishText.fontSize = 1200;
        finishText.alpha = 0.3; // Transparence du texte



        const advancedTexture = AdvancedDynamicTexture.CreateForMesh(wall);
        advancedTexture.addControl(finishText);
        finishText.top = "-20px";

        this.walls.push(wall); // Ajoute le mur à la liste des murs
    }
    randomColor() {
        const randomColorIndex = Math.floor(Math.random() * this.olympicColors.length);
        return this.olympicColors[randomColorIndex];
    }


    markWallToRemove(wall) {
        if (!this.isRemovingWalls) {
            this.wallsToRemove.push(wall);
            this.startRemovingWalls();
        }
    }

    startRemovingWalls() {
        if (!this.isRemovingWalls) {
            this.isRemovingWalls = true;
            this.scene.registerAfterRender(() => {
                this.removeMarkedWalls();
            });
        }
    }

    removeMarkedWalls() {
        this.wallsToRemove.forEach(wall => {
            const index = this.walls.indexOf(wall);
            if (index !== -1) {
                this.walls.splice(index, 1);
                wall.dispose();
            }
        });
        this.wallsToRemove = [];
        this.isRemovingWalls = false;
    }

    moveToNextWall(localPlayer) {
        this.currentWallIndex += 1;
        this.nextWallIndex += 1;

        if (this.nextWallIndex < this.wallPositions.length) {
            this.createWall(this.wallPositions[this.nextWallIndex], localPlayer);
        }
    }

    async createSquareDetectionAreaFinish2(scene, localPlayer) {
        const square = Mesh.CreateGround("square", 5, 7, 1, this.scene);
        //-259.4 / -20 (test)
        square.position = new Vector3(-259.4, 3, 25.3);
        square.scaling = new Vector3(2.1, 1, 1)
        square.rotation = new Vector3(276.5 * (Math.PI / 180), 270.4 * (Math.PI / 180), 0);

        square.material = new StandardMaterial("squareMat", this.scene);
        square.material.diffuseColor = new Color3(0, 1, 0); // Vert

        square.checkCollisions = true;

        square.actionManager = new ActionManager(this.scene);
        square.actionManager.registerAction(
            new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnIntersectionEnterTrigger,
                    parameter: localPlayer
                },
                () => {
                    this.isEnd = true
                    if (this.checkpointSound.isReady()) {
                        this.checkpointSound.play();
                    }
                }
            )
        );

        square.actionManager.registerAction(
            new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnIntersectionExitTrigger,
                    parameter: localPlayer
                },
                () => {
                    console.log("Le joueur est sorti du carré !");
                }
            )
        );
        //texte de fin de course 
        const finishText = new TextBlock();
        finishText.text = "FINISH";
        finishText.color = "white";
        finishText.fontSize = 330;


        const advancedTexture = AdvancedDynamicTexture.CreateForMesh(square);
        advancedTexture.addControl(finishText);
        finishText.top = "10px";
        this.finalWall()
    }

    async finalWall() {

        const wall = Mesh.CreateGround("wall", 10, 20, 3, this.scene);
        wall.position = new Vector3(-259.4, 3, 25.3);
        wall.scaling = new Vector3(2.1, 1, 1)
        wall.rotation = new Vector3(276.5 * (Math.PI / 180), 270.4 * (Math.PI / 180), 0);
        wall.material = new StandardMaterial("wallMat", this.scene);
        wall.material.diffuseColor = new Color3(0, 1, 0); // Vert
        wall.checkCollisions = true;

        const finishText = new TextBlock();
        finishText.text = "O";
        finishText.color = this.randomColor();
        finishText.fontSize = 1200;
        finishText.alpha = 0.3; // Transparence du texte
        const advancedTexture = AdvancedDynamicTexture.CreateForMesh(wall);
        advancedTexture.addControl(finishText);
        finishText.top = "-20px";

    }
}

export default WallCreator;
