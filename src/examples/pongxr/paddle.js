import { BoxBufferGeometry, MeshStandardMaterial, ShaderMaterial, DoubleSide, Mesh } from "three";
import Physics from "../../engine/physics/physics";
import { Vec3 } from "cannon"
const vs = require('./assets/shaders/vs_defaultVertex.glsl');
const fs_puddles = require('./assets/shaders/fs_puddles.glsl');

class Paddle
{
    constructor()
    {
        console.log("creating paddle");
        const paddleGeo = new BoxBufferGeometry(.25, .25, .001);
        // const paddleMat = new MeshStandardMaterial({ color: 0x222222, wireframe: false, side: DoubleSide });
        const paddleMat = new ShaderMaterial({ uniforms: { time: { value: 0.0 } }, vertexShader: vs, fragmentShader: fs_puddles })

        const paddle = new Mesh(paddleGeo, paddleMat);
        paddle.name = "paddle";
        paddle.rb = Physics.addRigidBody(paddle, Physics.RigidBodyShape.Box, Physics.Body.KINEMATIC, 0);
        this.curPos = new Vec3();

        const startTime = Date.now();
        paddle.Update = () =>
        {
            paddle.rb.position.copy(paddle.position);
            paddle.rb.quaternion.copy(paddle.quaternion);

            // shader update
            if (paddle.material.uniforms.time == undefined) return;
            paddle.material.uniforms.time.value = 6. * (Date.now() - startTime) / 500.;

        }
        return paddle;
    }
}

export default Paddle;