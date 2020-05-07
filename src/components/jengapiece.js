import { TextureLoader, RepeatWrapping, Object3D, BoxGeometry, MeshLambertMaterial, MeshNormalMaterial, Mesh } from "three";
import { physics } from './engine/physics';


const wood = new TextureLoader().load("./placeholderwood.jpg");
wood.wrapS = RepeatWrapping;
wood.wrapT = RepeatWrapping;

export default class JP extends Object3D 
{

    constructor(position, rotation) 
    {
        super(position, rotation)

        const geometry = new BoxGeometry(.5, .5, 1.5);
        // const material = new MeshLambertMaterial({ map: wood });
        const material = new MeshNormalMaterial();
        const mesh = new Mesh(geometry, material);
        mesh.position.copy(position);
        mesh.hasPhysics = true;

        this.add(mesh);
    }

    // called from engine.js
    // update() 
    // {
    //     console.log("this runs every update loop");
    // }
}

