import { SphereBufferGeometry, ShaderMaterial, Mesh, PointLight } from "three";
import Physics from "../../engine/physics/physics"
import frictionlessMat from "./frictionlessMaterial"
const hitAudio = require("./assets/audio/elecping.ogg");

const vs = require('./assets/shaders/vs_defaultVertex.glsl');
const fs_puddles = require('./assets/shaders/fs_puddles.glsl');

const ball = new Mesh(new SphereBufferGeometry(.2, 13, 13), new ShaderMaterial({ uniforms: { time: { value: 0.0 } }, vertexShader: vs, fragmentShader: fs_puddles }));
const startTime = Date.now();
ball.Update = () =>
{
    if (ball.material.uniforms.time == undefined) return;
    ball.material.uniforms.time.value = 6. * (Date.now() - startTime) / 100.;
}
ball.rb = Physics.addRigidBody(ball, Physics.RigidBodyShape.Sphere, Physics.Body.DYNAMIC, 1);
ball.rb.addEventListener("collide", function (e) { console.log("ballcollided"); });
ball.rb.material = frictionlessMat;

const bLight = new PointLight(0x6a0dad, 3);
ball.add(bLight);

export default ball;