// default scene loaded in src/engine/engine.js
import { Vec3, Material, ContactMaterial } from "cannon";
import { Scene, SphereBufferGeometry, BoxBufferGeometry, PointLight, ShaderMaterial, Mesh, MathUtils, DoubleSide, Vector3, MeshStandardMaterial, Object3D, MeshBasicMaterial } from "three";
import Physics from "../../engine/physics/physics"
import XRInput from "../../engine/xrinput"

const vs = require('./assets/shaders/vs_defaultVertex.glsl');
const fs_puddles = require('./assets/shaders/fs_puddles.glsl');

const scene = new Scene();

//reusable game level
let pongCube;

const createPongLevel = (position = new Vector3(0, 0, 0), rotation) =>
{
    console.log("starting pong level");

    //////////
    // REMOVEOLDGAME(){}
    //////////


    // physics materials
    // Create a slippery material (friction coefficient = 0.0)
    const frictionlessMat = new Material("frictionlessMat");

    // The ContactMaterial defines what happens when two materials meet.
    // In this case we want friction coefficient = 0.0 when the slippery material touches ground.
    const frictionlessContactMaterial = new ContactMaterial(frictionlessMat, frictionlessMat, {
        friction: 0,
        restitution: 0.3,
        contactEquationStiffness: 1e8,
        contactEquationRelaxation: 3
    });

    // We must add the contact materials to the world
    Physics.cannonWorld.addContactMaterial(frictionlessContactMaterial);

    pongCube = new Object3D();
    const light = new PointLight(0xffffff, 4);
    pongCube.add(light);

    const geometry1 = new BoxBufferGeometry(4, 2, .02);
    const material = new MeshStandardMaterial({ color: 0x222222, wireframe: false, side: DoubleSide });

    const sideLength = new Mesh(geometry1, material);


    const side3 = sideLength.clone();
    side3.position.set(1, 0, 0);
    side3.rotateOnAxis(new Vector3(0, 1, 0), MathUtils.degToRad(90));
    pongCube.add(side3);

    const side4 = sideLength.clone();
    side4.position.set(-1, 0, 0);
    side4.rotateOnAxis(new Vector3(0, 1, 0), MathUtils.degToRad(90));
    pongCube.add(side4);

    const top = sideLength.clone();
    top.rotateOnAxis(new Vector3(1, 0, 0), MathUtils.degToRad(90));
    top.rotateOnAxis(new Vector3(0, 0, 1), MathUtils.degToRad(90));
    top.position.y -= 1;
    pongCube.add(top);

    const bottom = sideLength.clone();
    bottom.rotateOnAxis(new Vector3(1, 0, 0), MathUtils.degToRad(90));
    bottom.rotateOnAxis(new Vector3(0, 0, 1), MathUtils.degToRad(90));
    bottom.position.y += 1;
    pongCube.add(bottom);

    scene.add(pongCube);
    scene.updateMatrixWorld();
    pongCube.children.forEach(e =>
    {
        e.rb = Physics.addRigidBody(e, Physics.RigidBodyShape.Box, Physics.Body.STATIC, 0);
        if (e.rb != undefined) e.rb.material = frictionlessMat;
    });


    // Ball
    const ball = new Mesh(new SphereBufferGeometry(.2, 13, 13), new ShaderMaterial({ uniforms: { time: { value: 0.0 } }, vertexShader: vs, fragmentShader: fs_puddles }));
    const startTime = Date.now();
    ball.Update = () =>
    {
        if (ball.material.uniforms.time == undefined) return;
        ball.material.uniforms.time.value = 6. * (Date.now() - startTime) / 100.;
    }
    ball.rb = Physics.addRigidBody(ball, Physics.RigidBodyShape.Sphere, Physics.Body.DYNAMIC, 1);
    ball.rb.material = frictionlessMat;
    const bLight = new PointLight(0x6a0dad, 3);
    ball.add(bLight);
    pongCube.add(ball);

    // offset all rigidbodies by starting position
    pongCube.children.forEach(e =>
    {
        if (e.rb != undefined)
        {
            e.rb.position.x += position.x;
            e.rb.position.y += position.y;
            e.rb.position.z += position.z;
        }
    });

    //TESTING
    ball.rb.applyImpulse(new Vec3(13, 4, 0), ball.rb.position);
}

scene.init = () =>
{
    Physics.enableDebugger(scene);
    createPongLevel(new Vec3(0, 0, 0));
}

scene.init();

export { scene }

/* TODO:
- PADDLES ( & RESTART WITH BUTTON PRESS)
- PLACEHOLDER CUBE, PLACEMENT LOGIC & SESSION INIT
- NETWORKED PONGCUBE & BALL


****
WHEN CORE IS WORKING:
- TEST IN THE SOCIAL PLACES
- RESPONSIVE DESIGN: PHONE
- RESPONSIVE DESIGN: MAGIC LEAP

****
STATE:
status: "placement"
status: "game"
device: "xr-enabled" / "mobile" / "desktop"

score?
*/
