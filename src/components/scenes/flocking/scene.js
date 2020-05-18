import { Scene, Object3D, PlaneBufferGeometry, DirectionalLight, TextureLoader, RepeatWrapping } from "three";
import { Boid } from "./boid";
import { ctrlArr } from '../../engine/xrinput';
import { Water } from './water';
import { Sky } from './sky.js';

const scene = new Scene();

const boids = [];
let light;
let water;

const setupFlock = (numA, numB) =>
{
    let i = 0;
    while (i < numA)
    {
        boids[i] = new Boid(1, scene);
        i++;
    }
    while (i < numA + numB)
    {
        boids[i] = new Boid(0, scene);
        i++;
    }
}

scene.init = () =>
{
    scene.traverse(e =>
    {
        scene.remove(e);
    });

    // XR Controllers
    ctrlArr.forEach((controller, i) => 
    {
        scene.add(controller);
    });

    setupFlock(200, 200);
    const data = new Object3D();
    data.update = () =>
    {
        // Run iteration for each flock
        for (var i = 0; i < boids.length; i++)
        {
            boids[i].step(boids);
        }
    };
    scene.add(data);

    light = new DirectionalLight(0xffffff, 0.8);
    scene.add(light);
    const waterGeometry = new PlaneBufferGeometry(10000, 10000);

    water = new Water(
        waterGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new TextureLoader().load('https://threejs.org/examples/textures/waternormals.jpg', function (texture)
            {
                texture.wrapS = texture.wrapT = RepeatWrapping;
            }),
            alpha: 1.0,
            sunDirection: light.position.clone().normalize(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3.7,
            fog: scene.fog !== undefined,
        }
    );
    water.rotation.x = - Math.PI / 2;
    water.position.y = -12;
    water.update = function ()
    {
        this.material.uniforms['time'].value += 1.0 / 60.0;
    }
    scene.add(water);
}

scene.init();

export { scene }

