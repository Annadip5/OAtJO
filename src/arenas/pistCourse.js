import { PhysicsAggregate, PhysicsMotionType, PhysicsShape, PhysicsShapeType, SceneLoader, TransformNode, Vector3 } from "@babylonjs/core";
import pisteUrl from "../../assets/objets/piste_course2.glb";
class PistCourse {
    scene;
    x;
    y;
    z;

    gameObject;
    meshAggregate;

    constructor(x, y, z, scene) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        this.scene = scene || undefined;

        this.gameObject = new TransformNode("course", scene);
        this.gameObject.position = new Vector3(x, y, z);

    }
    async init() {
        const result = await SceneLoader.ImportMeshAsync("", "", pisteUrl, this.scene);
        console.log(result);
        this.gameObject = result.meshes[0];
        this.gameObject.name = "course";
        this.gameObject.setParent(null);
        this.gameObject.scaling.scaleInPlace(2.5);
        for (let childMesh of result.meshes) {
            if (childMesh.getTotalVertices() > 0) {
                const meshAggregate = new PhysicsAggregate(childMesh, PhysicsShapeType.MESH, { mass: 0, friction: 0, restitution: 0 });
                meshAggregate.body.setMotionType(PhysicsMotionType.STATIC);
            }
        }

    }
    update(delta) { }
}
export default PistCourse;