class State
{
    constructor()
    {
        this.isPaused = false;
    }

};

const state = new State();


document.addEventListener('keydown', (e) =>
{
    // state.isPaused = !state.isPaused;
});

export { state }

