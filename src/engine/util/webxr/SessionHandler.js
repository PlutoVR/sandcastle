/**
 * @author mrdoob / http://mrdoob.com
 * @author Mugen87 / https://github.com/Mugen87
 * gently modified by MichaelHazani / https://github.com/MichaelHazani
 */

import { State } from "../../state"

class VRButton
{
    constructor(renderer, options)
    {
        this.renderer = renderer;
        const that = this;
        this.showEnterVR = this.showEnterVR.bind(this);
        if (options)
        {
            console.error('THREE.VRButton: The "options" parameter has been removed. Please set the reference space type via renderer.xr.setReferenceSpaceType() instead.');
        }
        if ('xr' in navigator)
        {
            this.button = document.createElement('this.button');
            this.button.style.display = 'none';
            this.stylizeElement(this.button);
            navigator.xr.isSessionSupported('immersive-vr').then(function (supported)
            {
                supported ? that.showEnterVR() : that.showWebXRNotFound();
            });
            return this.button;

        }
        else
        {
            const message = document.createElement('a');
            if (window.isSecureContext === false)
            {
                message.href = document.location.href.replace(/^http:/, 'https:');
                message.innerHTML = 'WEBXR NEEDS HTTPS'; // TODO Improve message
            } else
            {
                message.href = 'https://immersiveweb.dev/';
                message.innerHTML = 'WEBXR NOT AVAILABLE';
            }
            message.style.left = 'calc(50% - 90px)';
            message.style.width = '180px';
            message.style.textDecoration = 'none';
            this.stylizeElement(message);
            return message;
        }
    }
    showEnterVR( /*device*/) 
    {
        let currentSession = null;
        const onSessionStarted = (session) =>
        {
            session.addEventListener('end', onSessionEnded);
            this.renderer.xr.setSession(session);
            State.eventHandler.dispatchEvent('xrsessionstarted', session);
            this.button.textContent = 'EXIT VR';
            currentSession = session;
        }

        const onSessionEnded = ( /*event*/) =>
        {
            currentSession.removeEventListener('end', onSessionEnded);
            State.eventHandler.dispatchEvent('xrsessionended');
            this.button.textContent = 'ENTER VR';
            currentSession = null;
        }

        this.button.style.display = '';
        this.button.style.cursor = 'pointer';
        this.button.style.left = 'calc(50% - 50px)';
        this.button.style.width = '100px';
        this.button.style.background = "black";
        this.button.textContent = 'ENTER VR';

        this.button.onmouseenter = () =>
        {
            this.button.style.opacity = '1.0';
        };

        this.button.onmouseleave = () =>
        {
            this.button.style.opacity = '0.5';
        };

        this.button.onclick = () =>
        {
            if (currentSession === null)
            {
                // WebXR's requestReferenceSpace only works if the corresponding feature
                // was requested at session creation time. For simplicity, just ask for
                // the interesting ones as optional features, but be aware that the
                // requestReferenceSpace call will fail if it turns out to be unavailable.
                // ('local' is always available for immersive sessions and doesn't need to
                // be requested separately.)
                var sessionInit = { optionalFeatures: [ 'local-floor', 'bounded-floor' ] };

                navigator.xr.requestSession('immersive-vr', sessionInit).then(onSessionStarted);
                // navigator.xr.addEventListener('sessiongranted', function (evt)
                // {
                //     console.log("session granted!");
                // })

            }
            else
            {
                currentSession.end();
            }
        };
    }

    disableButton() 
    {
        this.button.style.display = '';
        this.button.style.cursor = 'auto';
        this.button.style.left = 'calc(50% - 75px)';
        this.button.style.width = '150px';
        this.button.onmouseenter = null;
        this.button.onmouseleave = null;
        this.button.onclick = null;
    }

    showWebXRNotFound()
    {
        this.disableButton();
        this.button.textContent = 'VR NOT SUPPORTED';
    }

    stylizeElement(element)
    {
        element.style.position = 'absolute';
        element.style.bottom = '20px';
        element.style.padding = '12px 6px';
        element.style.border = '1px solid #fff';
        element.style.borderRadius = '4px';
        element.style.background = 'rgba(0,0,0,0.1)';
        element.style.color = '#fff';
        element.style.font = 'normal 13px sans-serif';
        element.style.textAlign = 'center';
        element.style.opacity = '0.5';
        element.style.outline = 'none';
        element.style.zIndex = '999';
    }
}

export default VRButton; 
