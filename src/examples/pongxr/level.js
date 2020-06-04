import Physics from "../../engine/physics/physics";
import frictionlessMat from "./frictionlessMaterial";
import { Object3D, PointLight, BoxBufferGeometry, MeshStandardMaterial, DoubleSide, MathUtils, Mesh, Vector3, Quaternion as THREEQuaternion } from "three";
import { Quaternion } from "cannon";

class Level
{
    constructor(position = new Vector3(), quaternion = new Quaternion())
    {
        console.log("creating Level");
        const levelInstance = new Object3D();
        const light = new PointLight(0xffffff, 4);
        levelInstance.add(light);

        const geometry1 = new BoxBufferGeometry(4, 2, .02);
        const material = new MeshStandardMaterial({ color: 0x222222, wireframe: false, side: DoubleSide });
        const sideLength = new Mesh(geometry1, material);

        const side1 = sideLength.clone();
        side1.name = "side1";
        side1.position.set(1, 0, 0);
        side1.rotateOnAxis(new Vector3(0, 1, 0), MathUtils.degToRad(90));
        levelInstance.add(side1);

        const side2 = sideLength.clone();
        side2.name = "side2";
        side2.position.set(-1, 0, 0);
        side2.rotateOnAxis(new Vector3(0, 1, 0), MathUtils.degToRad(90));
        levelInstance.add(side2);

        const top = sideLength.clone();
        top.name = "top";
        top.rotateOnAxis(new Vector3(1, 0, 0), MathUtils.degToRad(90));
        top.rotateOnAxis(new Vector3(0, 0, 1), MathUtils.degToRad(90));
        top.position.y -= 1;
        levelInstance.add(top);

        const bottom = sideLength.clone();
        bottom.name = "bottom";
        bottom.rotateOnAxis(new Vector3(1, 0, 0), MathUtils.degToRad(90));
        bottom.rotateOnAxis(new Vector3(0, 0, 1), MathUtils.degToRad(90));
        bottom.position.y += 1;
        levelInstance.add(bottom);

        levelInstance.name = "levelInstance";

        levelInstance.position.copy(position);
        levelInstance.quaternion.copy(quaternion);

        levelInstance.updateMatrixWorld();
        // scene.updateMatrixWorld();

        // transfer sceneCube offset directly to children
        // necessary for RigidBody alignment
        //  since mesh parent offset isn't a factor
        levelInstance.children.forEach(e =>
        {
            var wPos = new Vector3();
            var wQua = new THREEQuaternion();
            var wSca = new Vector3();
            e.matrixWorld.decompose(wPos, wQua, wSca);
            e.position.copy(wPos);
            e.quaternion.copy(wQua);
            e.scale.copy(wSca);
        });
        levelInstance.position.copy(new Vector3());
        levelInstance.quaternion.copy(new Quaternion());


        levelInstance.children.forEach(e =>
        {
            e.rb = Physics.addRigidBody(e, Physics.RigidBodyShape.Box, Physics.Body.STATIC, 0);
            if (e.rb != undefined) // not light, etc
            {
                e.rb.material = frictionlessMat;
            }
        })

        return levelInstance;
    };
}

export default Level;