import { TextureLoader, RepeatWrapping, Object3D, BoxGeometry, MeshLambertMaterial, Mesh } from "three";
import { physics } from './engine/physics';


const wood = new TextureLoader().load("./placeholderwood.jpg");
wood.wrapS = RepeatWrapping;
wood.wrapT = RepeatWrapping;

export default class JP extends Object3D 
{

    constructor(position) 
    {
        super(position)

        const geometry = new BoxGeometry(.5, .5, 1.5);
        const material = new MeshLambertMaterial({ map: wood });
        const mesh = new Mesh(geometry, material);
        mesh.position.copy(position);
        physics.addBody(mesh);
        this.add(mesh);
    }

    // called from engine.js
    // update() 
    // {
    //     console.log("this runs every update loop");
    // }
}

