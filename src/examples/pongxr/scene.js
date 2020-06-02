// default scene loaded in src/engine/engine.js
import { Vec3 } from "cannon";
import frictionlessMat from "./frictionlessMaterial"
import { Scene, SphereBufferGeometry, BoxBufferGeometry, PointLight, ShaderMaterial, Mesh, MathUtils, DoubleSide, Vector3, MeshStandardMaterial, Object3D, MeshBasicMaterial } from "three";
import Physics from "../../engine/physics/physics"
import XRInput from "../../engine/xrinput"
import ball from "./ball"


const scene = new Scene();

/* TODO:
- PADDLES ( & RESTART WITH BUTTON PRESS)
- PLACEHOLDER CUBE, PLACEMENT LOGIC & SESSION INIT
- NETWORKED scene.PONGCUBE & BALL


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


const createPongLevel = (position = new Vector3(0, 0, 0), rotation) =>
{
    console.log("starting pong level");

    //////////
    // REMOVEOLDGAME(){}
    //////////
    createPongCube(position, rotation);
    XRInput.controllerGrips.forEach(e => createPaddles(e));

}

const createPaddles = (e) =>
{
    console.log("creating paddles");
    const paddleGeo = new BoxBufferGeometry(.25, .25, .001);
    const paddleMat = new MeshStandardMaterial({ color: 0x222222, wireframe: false, side: DoubleSide });
    const paddle = new Mesh(paddleGeo, paddleMat);
    e.add(paddle);
    paddle.rb = Physics.addRigidBody(paddle, Physics.RigidBodyShape.Box, Physics.Body.KINEMATIC, 0);
    paddle.Update = () =>
    {
        // translate Vec3 and Vector3 back and forth
        paddle.rb.position.copy(Physics.convertPosition(e.position));
        paddle.rb.quaternion.copy(e.quaternion);
    }
    scene.add(e);
}


const createPongCube = (position, rotation) =>
{


    scene.pongCube = new Object3D();
    const light = new PointLight(0xffffff, 4);
    scene.pongCube.add(light);

    const geometry1 = new BoxBufferGeometry(4, 2, .02);
    const material = new MeshStandardMaterial({ color: 0x222222, wireframe: false, side: DoubleSide });

    const sideLength = new Mesh(geometry1, material);


    const side3 = sideLength.clone();
    side3.position.set(1, 0, 0);
    side3.rotateOnAxis(new Vector3(0, 1, 0), MathUtils.degToRad(90));
    scene.pongCube.add(side3);

    const side4 = sideLength.clone();
    side4.position.set(-1, 0, 0);
    side4.rotateOnAxis(new Vector3(0, 1, 0), MathUtils.degToRad(90));
    scene.pongCube.add(side4);

    const top = sideLength.clone();
    top.rotateOnAxis(new Vector3(1, 0, 0), MathUtils.degToRad(90));
    top.rotateOnAxis(new Vector3(0, 0, 1), MathUtils.degToRad(90));
    top.position.y -= 1;
    scene.pongCube.add(top);

    const bottom = sideLength.clone();
    bottom.rotateOnAxis(new Vector3(1, 0, 0), MathUtils.degToRad(90));
    bottom.rotateOnAxis(new Vector3(0, 0, 1), MathUtils.degToRad(90));
    bottom.position.y += 1;
    scene.pongCube.add(bottom);

    scene.add(scene.pongCube);
    scene.updateMatrixWorld();
    scene.pongCube.children.forEach(e =>
    {
        e.rb = Physics.addRigidBody(e, Physics.RigidBodyShape.Box, Physics.Body.STATIC, 0);
        if (e.rb != undefined) { e.rb.material = frictionlessMat; }
    });

    scene.pongCube.add(ball);



    // offset all rigidbodies by starting position
    scene.pongCube.children.forEach(e =>
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
