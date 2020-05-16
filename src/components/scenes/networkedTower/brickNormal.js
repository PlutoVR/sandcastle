import { BoxGeometry, MeshNormalMaterial, Mesh } from "three";

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

