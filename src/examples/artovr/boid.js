// boids implementation adapted from https://codepen.io/coaster/pen/QpqVjP
import {
  Vector3,
  Mesh,
  MeshNormalMaterial,
  Group,
  SphereBufferGeometry,
  BoxBufferGeometry,
  MeshStandardMaterial,
} from "three";

const birdMat = new MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0,
  metalness: 1.0,
});
let t = 0;
export class Boid {
  constructor(scene, object = undefined) {
    // Initial movement vectors
    this.position = new Vector3(
      this.rrand(-80, -150),
      this.rrand(20, 40),
      this.rrand(-80, -150)
    );
    this.velocity = new Vector3(
      this.rrand(-1, 1),
      this.rrand(-1, 1),
      this.rrand(-1, 1)
    );
    this.acceleration = new Vector3(0, 0, 0);
    this.mass = 1;
    // Type determines boid geometry, home location, and starting position
    // this.obj = (type) ? new this.Box() : new this.Sphere();
    this.obj = object == undefined ? new this.Sphere() : new this.Bird(object);
    this.homeVec = new Vector3(0, 50, 0);
    this.t = 0;
    this.home = this.homeVec;

    scene.add(this.obj.mesh);
  }

  Sphere() {
    const spG = new Group();
    const sp = new Mesh(
      new SphereBufferGeometry(5, 20, 20),
      new MeshNormalMaterial({ wireframe: true })
    );
    spG.add(sp);
    this.mesh = spG;
  }

  Box() {
    const bxG = new Group();
    const bx = new Mesh(
      new BoxBufferGeometry(5, 5, 5),
      new MeshNormalMaterial({ wireframe: true })
    );
    bxG.add(bx);
    this.mesh = bxG;
  }

  Bird(object) {
    const spG = new Group();
    // const sp = object.clone();
    const sp = new Mesh(object.geometry, birdMat);
    spG.add(sp);
    this.mesh = spG;
  }

  rrand(min, max) {
    return Math.random() * (max - min) + min;
  }

  // Run an iteration of the flock
  step(flock) {
    this.accumulate(flock);

    //change target home
    t += 0.00001;
    this.homeVec.x = 500 * Math.cos(t) + 10;
    this.homeVec.z = 500 * Math.sin(t) + 10; // These to strings make it work

    this.update();
    this.obj.mesh.position.set(
      this.position.x,
      this.position.y,
      this.position.z
    );
  }

  // Apply Forces
  accumulate(flock) {
    let separation, alignment, cohesion, centering;
    separation = this.separate(flock).multiplyScalar(0.02 * this.mass);
    alignment = this.align(flock).multiplyScalar(0.05);
    cohesion = this.cohesion(flock).multiplyScalar(0.01);
    centering = this.steer(this.home).multiplyScalar(0.0001);
    centering.multiplyScalar(this.position.distanceTo(this.home) * this.mass); // stronger centering if farther away
    this.acceleration.add(separation);
    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
    this.acceleration.add(centering);
    this.acceleration.divideScalar(this.mass);
  }

  // Update Movement Vectors

  update() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.set(0, 0, 0); // reset each iteration

    // X-Boids point in their direction of travel, O-Boids point in their direction of acceleration
    // const pointAt = (this.type) ? this.position.clone() : this.velocity.clone();
    this.obj.mesh.lookAt(this.position.clone());
  }

  // Separation Function (personal space)
  separate(flock) {
    const minRange = 200;
    let currBoid;
    const total = new Vector3(0, 0, 0);
    let count = 0;
    // Find total weight of separation
    for (let i = 0; i < flock.length; i++) {
      currBoid = flock[i];
      const dist = this.position.distanceTo(currBoid.position) * 3;
      // Apply weight if too close
      if (dist < minRange && dist > 0) {
        const force = this.position.clone();
        force.sub(currBoid.position);
        force.normalize();
        force.divideScalar(dist);
        total.add(force);
        count++;
      }
    }
    // Average out total weight
    if (count > 0) {
      total.divideScalar(count);
      total.normalize();
    }
    return total;
  }

  // Alignment Function (follow neighbours)
  align(flock) {
    const neighborRange = 60;
    let currBoid;
    const total = new Vector3(0, 0, 0);
    let count = 0;
    // Find total weight for alignment
    for (let i = 0; i < flock.length; i++) {
      currBoid = flock[i];
      const dist = this.position.distanceTo(currBoid.position);
      // Apply force if near enough
      if (dist < neighborRange && dist > 0) {
        total.add(currBoid.velocity);
        count++;
      }
    }
    // Average out total weight
    if (count > 0) {
      total.divideScalar(count);
      total.limit(1);
    }
    return total;
  }

  // Cohesion Function (follow whole flock)
  cohesion(flock) {
    const neighborRange = 60;
    let currBoid;
    const total = new Vector3(0, 0, 0);
    let count = 0;
    // Find total weight for cohesion
    for (let i = 0; i < flock.length; i++) {
      currBoid = flock[i];
      const dist = this.position.distanceTo(currBoid.position);
      // Apply weight if near enough
      if (dist < neighborRange && dist > 0) {
        total.add(currBoid.position);
        count++;
      }
    }
    // Average out total weight
    if (count > 0) {
      total.divideScalar(count);
      // Find direction to steer with
      return this.steer(total);
    } else {
      return total;
    }
  }

  steer(target) {
    const steer = new Vector3(0, 0, 0);
    const des = new Vector3().subVectors(target, this.position);
    const dist = des.length();
    if (dist > 0) {
      des.normalize();
      steer.subVectors(des, this.velocity);
    }
    return steer;
  }
}
// Limit max forces
Vector3.prototype.limit = function (max) {
  if (this.length() > max) {
    this.normalize();
    this.multiplyScalar(max);
  }
};
