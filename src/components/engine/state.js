class State
{
    constructor()
    {
        this.isPaused = false;
        this.debugPhysics = false;
        this.bindDebugKeys();
    }

    bindDebugKeys()
    {
        document.addEventListener('keydown', (e) =>
        {
            if (!e.shiftKey) return;

            switch (e.keyCode)
            {
                case 68: //"d"
                    state.debugPhysics = !state.debugPhysics;
                    console.log("Physics Debug: " + state.debugPhysics);
                    break;
                case 80: //"p"
                    state.isPaused = !state.isPaused;
                    console.log("Paused: " + state.isPaused);
                    break;
                default:
                    break;
            }
        });
    }
};

const state = new State();

export { state }

