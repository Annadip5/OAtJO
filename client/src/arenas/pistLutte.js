import { ActionManager, Color3, ExecuteCodeAction, PhysicsAggregate, PhysicsMotionType, PhysicsShapeType, SceneLoader, TransformNode, Vector3 } from "@babylonjs/core";

import arenaModelUrl from "../../assets/models/lutte.glb";

class ArenaLutte {
    scene;
    x;
    y;
    z;

    gameObject;
    meshAggregate;
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
        this.gameObject.position = new Vector3(0, 0, 0);
    }

    async init() {
        // Importation du modèle de l'arène
        const result = await SceneLoader.ImportMeshAsync("", "", arenaModelUrl, this.scene);
        this.gameObject = result.meshes[0];
        this.gameObject.name = "arena";
        this.gameObject.setParent(null);
        this.gameObject.scaling.scaleInPlace(1.5);
        this.gameObject.position = new Vector3(0, -1, 0);
    
        // Création des agrégats physiques initiaux
        this.createPhysicsAggregates();
        
        // Commencer à surveiller les changements de taille de l'arène
        this.startScalingDown();
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
                    console.log("actionManager sable ");
                }
            )
        );
    }

    actionOnPlayer(playerMesh) {
        playerMesh.speedZ = 0;
        playerMesh.speedX = 0;
    }

    createPhysicsAggregates() {
        this.meshAggregates = [];
        // Créer les agrégats de physique pour chaque maillage visible de l'arène
        for (let childMesh of this.gameObject.getChildMeshes()) {
            if (childMesh.getTotalVertices() > 0) {
                const meshAggregate = new PhysicsAggregate(childMesh, PhysicsShapeType.MESH, { mass: 0, friction: 0.1, restitution: 0 });
                meshAggregate.body.setMotionType(PhysicsMotionType.STATIC);
                this.meshAggregates.push(meshAggregate);
            }
        }
    }
    
    disposePhysicsAggregates() {
        // Disposer les agrégats de physique existants
        this.meshAggregates.forEach(meshAggregate => {
            meshAggregate.dispose();
        });
    }
    
    startScalingDown() {
        this.scene.registerBeforeRender(() => {
            if (this.gameObject.scaling.x > 0.1) {
                // Diminuer la taille visuelle de l'arène (longueur et largeur)
                this.gameObject.scaling.scaleInPlace(0.9999);
    
                // Disposer les agrégats de physique existants et créer de nouveaux avec la nouvelle taille de l'arène
                this.disposePhysicsAggregates();
                this.createPhysicsAggregates();
            }
        });
    }
    update(delta) {
        // Appeler cette méthode dans une boucle de jeu
        this.startScalingDown();
    }
}

export default ArenaLutte;