import { BoxBufferGeometry, MeshStandardMaterial, DoubleSide, Mesh } from "three";
import Physics from "../../engine/physics/physics";
import { Vec3 } from "cannon"

class Paddle
{
    constructor()
    {
        console.log("creating paddle");
        const paddleGeo = new BoxBufferGeometry(.25, .25, .001);
        const paddleMat = new MeshStandardMaterial({ color: 0x222222, wireframe: false, side: DoubleSide });
        const paddle = new Mesh(paddleGeo, paddleMat);
        paddle.name = "paddle";
        paddle.rb = Physics.addRigidBody(paddle, Physics.RigidBodyShape.Box, Physics.Body.KINEMATIC, 0);
        this.curPos = new Vec3();
        paddle.Update = () =>
        {
            paddle.rb.position.copy(paddle.position);
            paddle.rb.quaternion.copy(paddle.quaternion);
        }
        return paddle;
    }
}

export default Paddle;