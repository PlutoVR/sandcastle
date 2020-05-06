import { Scene, DirectionalLight, AxesHelper, Vector3 } from "three";
import piece from './jengapiece';

export const scene = new Scene();

for (let y = 0; y < 3; y++)
{
    for (let x = 0; x < 3; x++)
    {
        for (let z = 0; z < 3; z++)
        {
            const a = scene.add(new piece(new Vector3(x, y + 2, z)));
        }

    }

}

var axesHelper = new AxesHelper(5);
scene.add(axesHelper)
var light = new DirectionalLight(0xffffff, 1.0);
scene.add(light);


