import State from "../../engine/state"
import Physics from "../../engine/physics/physics";
import frictionlessMat from "./frictionlessMaterial";
import { Object3D, PointLight, BoxBufferGeometry, MeshStandardMaterial, DoubleSide, MathUtils, Mesh, Vector3, Quaternion as THREEQuaternion, PositionalAudio, AudioLoader, ShaderMaterial } from "three";
import { Quaternion } from "cannon";

const vs = require('./assets/shaders/vs_defaultVertex.glsl');
const fs_goal = require('./assets/shaders/fs_goal.glsl');

const crashAudioFile = require("./assets/audio/hitgoal.ogg");

class Level
{
    constructor(posRot)
    {
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

        const uniforms = { time: { value: 0.0 } };
        const goalGeo = new BoxBufferGeometry(4, 4, .002, 2, 2);
        const goalMat = new ShaderMaterial({
            uniforms,
            vertexShader: vs,
            fragmentShader: fs_goal,
            transparent: true
        });


        const goal = new Mesh(goalGeo, goalMat);
        goal.name = "goal";
        goal.rotateOnAxis(new Vector3(0, 0, 1), MathUtils.degToRad(90));
        goal.position.z = 3;

        const startTime = Date.now();
        goal.Update = () =>
        {
            if (goalMat.uniforms == undefined) return;
            goalMat.uniforms.time.value = 6. * (Date.now() - startTime) / 1000.;
        }


        levelInstance.add(goal);

        const goal2 = goal.clone();
        goal2.position.z = -3;
        levelInstance.add(goal2);

        levelInstance.name = "levelInstance";
        levelInstance.position.copy(posRot.position);
        levelInstance.rotation.copy(posRot.rotation);

        levelInstance.updateMatrixWorld();

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

        let crashAudio;


        setTimeout(function ()
        {
            // Audiolistener setTimeOut hack
            // it doesn't exist until after scene load time, so...
            // (also see src/engine/engine.js)
            // TODO: solve more cleanly.

            crashAudio = new PositionalAudio(State.globals.AudioListener);
            const audioLoader = new AudioLoader();
            audioLoader.load(crashAudioFile, function (buffer)
            {
                crashAudio.setBuffer(buffer);
                crashAudio.setRefDistance(20);
                //     // hitAudio.play();
            });
        }, 0);

        const endGame = () =>
        {
            if (crashAudio == undefined) return;
            if (crashAudio.isPlaying) crashAudio.stop();
            crashAudio.play();

            State.eventHandler.dispatchEvent("gameover");
        };

        levelInstance.children.forEach(e =>
        {
            e.rb = Physics.addRigidBody(e, Physics.RigidBodyShape.Box, Physics.Body.STATIC, 0);
            if (e.rb != undefined) // not light, etc
            {
                e.rb.material = frictionlessMat;
            }

            // game logic
            if (e.name == "goal")
            {
                e.rb.addEventListener("collide", endGame);
            }
        })
        return levelInstance;
    };
}

export default Level;