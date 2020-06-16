import { Material, ContactMaterial } from "cannon";
import Physics from "../../engine/physics/physics";

// physics materials
// Create a slippery material (friction coefficient = 0.0)
const frictionlessMat = new Material("frictionlessMat");

// The ContactMaterial defines what happens when two materials meet.
// In this case we want friction coefficient = 0.0 when the slippery material touches ground.
const frictionlessContactMaterial = new ContactMaterial(
  frictionlessMat,
  frictionlessMat,
  {
    friction: 0,
    restitution: 0.3,
    contactEquationStiffness: 1e8,
    contactEquationRelaxation: 3,
  }
);

// We must add the contact materials to the world
Physics.cannonWorld.addContactMaterial(frictionlessContactMaterial);

export default frictionlessMat;
