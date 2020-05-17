import { PerspectiveCamera, Vector3, Euler, Object3D } from "three"


const PI_2 = Math.PI / 2;
let CAM_SPEED = 0.05;
let euler = new Euler(0, 0, 0, 'YXZ');
let vec = new Vector3();
let _rcPressed = false;
let cameraForward = new Vector3();
const pressedKeyMap = {
    87: false, // w
    65: false, // a
    83: false, // s
    68: false, // d
    81: false, // q
    69: false // e
};

export class EditorCamera extends Object3D
{
    constructor(camera, canvas, params)
    {
        super(params);
        this.camera = camera;
        this.canvas = canvas;
        window.addEventListener('keydown', this.onKeyDown.bind(this), false);
        window.addEventListener('keyup', this.onKeyUp.bind(this), false);
        window.addEventListener('mousedown', this.onMouseDown.bind(this), false);
        window.addEventListener('mouseup', this.onMouseUp.bind(this), false);
        window.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        window.addEventListener('wheel', this.onMouseWheel.bind(this), false);

        //disable rClick
        document.oncontextmenu = function (e)
        {
            var evt = new Object({ keyCode: 93 });
            if (e.preventDefault != undefined)
                e.preventDefault();
            if (e.stopPropagation != undefined)
                e.stopPropagation();
        }
    }

    update()
    {
        if (pressedKeyMap[87]) this.moveForward(CAM_SPEED);
        if (pressedKeyMap[83]) this.moveForward(-CAM_SPEED);
        if (pressedKeyMap[69]) this.moveUp(CAM_SPEED);
        if (pressedKeyMap[81]) this.moveUp(-CAM_SPEED);
        if (pressedKeyMap[68]) this.moveRight(CAM_SPEED);
        if (pressedKeyMap[65]) this.moveRight(-CAM_SPEED);
    }

    onKeyDown(event)
    {
        if (event.keyCode in pressedKeyMap) pressedKeyMap[event.keyCode] = true;
    };

    onKeyUp(event)
    {
        if (event.keyCode in pressedKeyMap) pressedKeyMap[event.keyCode] = false;
    };

    onMouseDown(event)
    {
        if (event.button == 2)
        {
            _rcPressed = true;
            this.canvas.requestPointerLock = this.canvas.requestPointerLock ||
                canvas.mozRequestPointerLock;
            this.canvas.requestPointerLock()
        }
    }

    onMouseUp(event)
    {
        if (event.button == 2) { _rcPressed = false; }
        document.exitPointerLock();
    }

    moveForward(distance)
    {
        vec.setFromMatrixColumn(this.camera.matrix, 0);
        vec.crossVectors(this.camera.up, vec);
        this.camera.getWorldDirection(cameraForward);
        this.camera.position.addScaledVector(cameraForward, distance);

    };

    moveRight(distance)
    {
        vec.setFromMatrixColumn(this.camera.matrix, 0);
        this.camera.position.addScaledVector(vec, distance);
    };

    moveUp(distance)
    {
        this.camera.position.addScaledVector(this.camera.up, distance);
    };

    onMouseMove(event)
    {
        if (!_rcPressed) return;

        const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
        euler.setFromQuaternion(this.camera.quaternion);
        euler.y -= movementX * 0.002;
        euler.x -= movementY * 0.002;
        euler.x = Math.max(- PI_2, Math.min(PI_2, euler.x));
        this.camera.quaternion.setFromEuler(euler);
    };

    onMouseWheel(event)
    {
        if (_rcPressed)
        {
            CAM_SPEED -= event.deltaY * 0.0001;
        }
        else 
        {
            this.moveForward(CAM_SPEED * -event.deltaY / 10);
        }
    }
}