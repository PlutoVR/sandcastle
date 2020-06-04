import State from "../../engine/state"
import { SphereBufferGeometry, ShaderMaterial, PositionalAudio, AudioLoader, Mesh, PointLight, BackSide } from "three";
import Physics from "../../engine/physics/physics"
import frictionlessMat from "./frictionlessMaterial"

const hitAudioFile = require("./assets/audio/elecping.ogg");

const vs = require('./assets/shaders/vs_defaultVertex.glsl');
const fs_puddles = require('./assets/shaders/fs_puddles.glsl');

class Ball
{
    constructor(position, addRigidBody)
    {
        const ball = new Mesh(new SphereBufferGeometry(.2, 13, 13), new ShaderMaterial({ uniforms: { time: { value: 0.0 } }, vertexShader: vs, fragmentShader: fs_puddles }));
        ball.position.copy(position);
        ball.name = "ball";
        this.initPos = position;

        // physics 
        if (addRigidBody == true)
        {
            console.log("adding RB to Ball");
            ball.rb = Physics.addRigidBody(ball, Physics.RigidBodyShape.Sphere, Physics.Body.DYNAMIC, 1);

            ball.rb.material = frictionlessMat;
            setTimeout(function ()
            {
                // Audiolistener setTimeOut hack
                // it doesn't exist until after scene load time, so...
                // (also see src/engine/engine.js)
                // TODO: solve more cleanly.

                const hitAudio = new PositionalAudio(State.globals.AudioListener);
                const audioLoader = new AudioLoader();
                audioLoader.load(hitAudioFile, function (buffer)
                {
                    hitAudio.setBuffer(buffer);
                    hitAudio.setRefDistance(20);
                    //     // hitAudio.play();
                    ball.rb.addEventListener("collide", function (e)
                    {
                        if (hitAudio.isPlaying) hitAudio.stop();
                        hitAudio.play();

                    });
                });
            }, 0);
        }
        else
        {
            //quickfix for other ball?
            // ball.material.side = BackSide;
        }

        // shader update
        const startTime = Date.now();
        ball.Update = () =>
        {
            if (ball.material.uniforms.time == undefined) return;
            ball.material.uniforms.time.value = 6. * (Date.now() - startTime) / 100.;
        }

        //innerlight
        const bLight = new PointLight(0x6a0dad, 3);
        ball.add(bLight);


        ball.reset = () =>
        {
            console.log(ball.rb);
            Physics.resetRigidbody(ball.rb);
            ball.rb.position.copy(this.initPos);
        }

        return ball;
    }


}

export default Ball;