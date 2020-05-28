import { BoxGeometry, ShaderMaterial, MeshNormalMaterial, Mesh, Vector2 } from "three";

// glsl
const vs = require('../../shaders/vs_defaultVertex.glsl');
const fs_neon = require('../../shaders/fs_neonGrid.glsl');
const fs_matrix = require('../../shaders/fs_matrixLetters.glsl');
const fs_puddles = require('../../shaders/fs_puddles.glsl');
const fs_pastelCheckers = require('../../shaders/fs_pastelCheckers.glsl');
const fs_bloomFireflies = require('../../shaders/fs_bloomFireflies.glsl');

const geometry = new BoxGeometry(.5, .5, 1.5);
const uniforms = { time: { value: 0.0 } };
const shaderArr = [
    new ShaderMaterial({
        uniforms,
        vertexShader: vs,
        fragmentShader: fs_neon
    }),
    new ShaderMaterial({
        uniforms,
        vertexShader: vs,
        fragmentShader: fs_matrix
    }),
    new ShaderMaterial({
        uniforms,
        vertexShader: vs,
        fragmentShader: fs_puddles
    }),
    new ShaderMaterial({
        uniforms,
        vertexShader: vs,
        fragmentShader: fs_pastelCheckers
    }),
    new ShaderMaterial({
        uniforms,
        vertexShader: vs,
        fragmentShader: fs_bloomFireflies
    })
]
const selectRandomShader = () =>
{
    return shaderArr[ Math.floor(Math.random() * shaderArr.length) ];
}

export default class JP 
{
    constructor(position, material) 
    {
        const mesh = new Mesh(geometry, shaderArr[ material ]);

        //hook into render update method

        mesh.Update = () =>
        {
            if (mesh.material.uniforms == undefined) return;
            mesh.material.uniforms.time.value = 6. * (Date.now() - startTime) / 100.;
        }
        const startTime = Date.now();
        if (position) mesh.position.copy(position);
        // if (rotation) mesh.rotation.copy(rotation);
        mesh.hasPhysics = true;
        return (mesh);
    }
}

