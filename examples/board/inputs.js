const keyboard = (function() {
    const state = {};
    const mapk = {
        37: 'left',
        39: 'right',
        40: 'down',
        38: 'up',
        87: 'w',
        83: 's'
    };

    window.onkeydown = (e) => { state[mapk[e.keyCode]] = true; }
    window.onkeyup = (e) => { state[mapk[e.keyCode]] = false; }
    return state;
})();

const mouse = (function() {
    const state = {x: 0, y: 0};
    window.onmousemove = (e) => {
        state.x = e.pageX;
        state.y = e.pageY;
    };
    return state;
})();