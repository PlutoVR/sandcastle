import { TextureLoader, RepeatWrapping, Object3D, BoxGeometry, MeshLambertMaterial, MeshNormalMaterial, Mesh } from "three";
import { physics } from '../engine/physics';


// const wood = new TextureLoader().load("./placeholderwood.jpg");
// wood.wrapS = RepeatWrapping;
// wood.wrapT = RepeatWrapping;

export default class JP 
{
    constructor(position, rotation) 
    {
        const geometry = new BoxGeometry(.5, .5, 1.5);
        // const material = new MeshLambertMaterial({ map: wood });
        const material = new MeshNormalMaterial();
        const mesh = new Mesh(geometry, material);
        if (position) mesh.position.copy(position);
        if (rotation) mesh.rotation.copy(rotation);
        mesh.hasPhysics = true;
        return (mesh);
    }
}

