// default scene loaded in src/engine/engine.js
import {
  Scene,
  TorusBufferGeometry,
  DirectionalLight,
  Mesh,
  Vector3,
  MeshStandardMaterial,
  Color,
} from "three";
const scene = new Scene();

const rings = [
  [new Vector3(1, 0, 1), new Color(0xff0000), 0.2],
  [new Vector3(1, -1, 0), new Color(0x00ff00), 0.15],
  [new Vector3(0, 1, 0), new Color(0x0000ff), 0.1],
];

rings.forEach((entry, i) => {
  const ring = new Mesh(
    new TorusBufferGeometry(1, 0.065, 64, 64),
    new MeshStandardMaterial({
      metalness: 0.5,
      roughness: 0.5,
      color: entry[1],
    })
  );
  ring.position.z -= 1;
  ring.scale.set(entry[2], entry[2], entry[2]);

  const axis = new Vector3();
  axis.copy(entry[0]);
  ring.Update = () => {
    ring.rotateOnAxis(axis, 0.0033 * (i + 1));
  };
  scene.add(ring);
});

const light = new DirectionalLight(0xffffff, 3.5);
light.position.set(0, 13, 3);
scene.add(light);

export { scene };
