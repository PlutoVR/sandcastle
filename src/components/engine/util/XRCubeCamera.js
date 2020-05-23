import { Object3D, WebGLCubeRenderTarget, LinearFilter, RGBFormat, Vector3, PerspectiveCamera } from "three"
/**
 * Camera for rendering cube maps
 *	- renders scene into axis-aligned cube
 *
 * @author alteredq / http://alteredqualia.com/
 * Modified for XR per @Mugen87:
 * https://github.com/mrdoob/three.js/issues/19428#issuecomment-633009066
 */

var fov = 90, aspect = 1;

function XRCubeCamera(near, far, cubeResolution, options)
{

    Object3D.call(this);

    this.type = 'XRCubeCamera';

    var cameraPX = new PerspectiveCamera(fov, aspect, near, far);
    cameraPX.up.set(0, - 1, 0);
    cameraPX.lookAt(new Vector3(1, 0, 0));
    this.add(cameraPX);

    var cameraNX = new PerspectiveCamera(fov, aspect, near, far);
    cameraNX.up.set(0, - 1, 0);
    cameraNX.lookAt(new Vector3(- 1, 0, 0));
    this.add(cameraNX);

    var cameraPY = new PerspectiveCamera(fov, aspect, near, far);
    cameraPY.up.set(0, 0, 1);
    cameraPY.lookAt(new Vector3(0, 1, 0));
    this.add(cameraPY);

    var cameraNY = new PerspectiveCamera(fov, aspect, near, far);
    cameraNY.up.set(0, 0, - 1);
    cameraNY.lookAt(new Vector3(0, - 1, 0));
    this.add(cameraNY);

    var cameraPZ = new PerspectiveCamera(fov, aspect, near, far);
    cameraPZ.up.set(0, - 1, 0);
    cameraPZ.lookAt(new Vector3(0, 0, 1));
    this.add(cameraPZ);

    var cameraNZ = new PerspectiveCamera(fov, aspect, near, far);
    cameraNZ.up.set(0, - 1, 0);
    cameraNZ.lookAt(new Vector3(0, 0, - 1));
    this.add(cameraNZ);

    options = options || { format: RGBFormat, magFilter: LinearFilter, minFilter: LinearFilter };

    this.renderTarget = new WebGLCubeRenderTarget(cubeResolution, options);
    this.renderTarget.texture.name = "XRCubeCamera";


    // the modified function
    this.update = function (renderer, scene)
    {

        if (this.parent === null) this.updateMatrixWorld();

        var currentXrEnabled = renderer.xr.enabled;
        var currentRenderTarget = renderer.getRenderTarget();

        renderer.xr.enabled = false;

        var generateMipmaps = this.renderTarget.texture.generateMipmaps;

        this.renderTarget.texture.generateMipmaps = false;

        renderer.setRenderTarget(this.renderTarget, 0);
        renderer.render(scene, cameraPX);

        renderer.setRenderTarget(this.renderTarget, 1);
        renderer.render(scene, cameraNX);

        renderer.setRenderTarget(this.renderTarget, 2);
        renderer.render(scene, cameraPY);

        renderer.setRenderTarget(this.renderTarget, 3);
        renderer.render(scene, cameraNY);

        renderer.setRenderTarget(this.renderTarget, 4);
        renderer.render(scene, cameraPZ);

        this.renderTarget.texture.generateMipmaps = generateMipmaps;

        renderer.setRenderTarget(this.renderTarget, 5);
        renderer.render(scene, cameraNZ);

        renderer.setRenderTarget(currentRenderTarget);
        renderer.xr.enabled = currentXrEnabled;

    };

    this.clear = function (renderer, color, depth, stencil)
    {

        var currentRenderTarget = renderer.getRenderTarget();

        var renderTarget = this.renderTarget;

        for (var i = 0; i < 6; i++)
        {

            renderer.setRenderTarget(renderTarget, i);

            renderer.clear(color, depth, stencil);

        }

        renderer.setRenderTarget(currentRenderTarget);

    };

}

XRCubeCamera.prototype = Object.create(Object3D.prototype);
XRCubeCamera.prototype.constructor = XRCubeCamera;


export { XRCubeCamera };
