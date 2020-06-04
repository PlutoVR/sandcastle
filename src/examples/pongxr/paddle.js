import { BoxBufferGeometry, MeshStandardMaterial, DoubleSide, Mesh } from "three";
import Physics from "../../engine/physics/physics";

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

        paddle.Update = () =>
        {
            paddle.rb.position.copy(Physics.convertPosition(paddle.position));
            paddle.rb.quaternion.copy(paddle.quaternion);
        }
        return paddle;
    }
}

export default Paddle;