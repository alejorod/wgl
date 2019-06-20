function loadImg() {}

function loadSrc(path) {
    return fetch(path).then(r => r.text());
}


function parseOBJ(src) {
    const vertices = [];
    const normals = [];
    const uvs = [];
    const faces = [];
    const validKeys = ['v', 'vn', 'vt', 'f'];
    const buffers = [
        [], [], []
    ];
    data = src.split('\n').map(l => l.trim().split(' '));
    data.forEach(d => {
        if (!d.length) { 
            return;
        }

        if (validKeys.indexOf(d[0]) == -1) {
            return;
        }

        if (d[0] == 'v') {
            vertices.push(d.slice(1).map(v => Number(v)));
        } else if (d[0] == 'vt') {
            uvs.push(d.slice(1).map(v => Number(v)));
        } else if (d[0] == 'vn') {
            normals.push(d.slice(1).map(v => Number(v)));
        } else {
            faces.push(d.slice(1));
        }
    });

    faces.forEach(face => {
        face.forEach(f => {
            const indexes = f.split('/');
            buffers[0].push(vertices[Number(indexes[0]) - 1]);
            buffers[1].push(normals[Number(indexes[2]) - 1]);
            buffers[2].push(uvs[Number(indexes[1]) - 1]);
        });
    });

    return buffers;
}

function createVAOfromOBJ(gl, src) {
    return createVAO(gl, parseOBJ(src));
}

function loop(cb) {
    let last = null;
    let delta;

    function main(time) {
        requestAnimationFrame(main);
        last = last == null ? time : last;
        delta = (time - last) / 1000;
        last = time;
        cb(delta, time / 1000);
    }

    requestAnimationFrame(main);
}

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

class OrbitCamera {
    constructor() {
        this.r = 2;
        this.rx = Math.PI / 2;
        this.ry = 0;
    }

    update(delta) {
        if (keyboard.right) {
            this.ry += Math.PI * delta;
        }

        if (keyboard.left) {
            this.ry -= Math.PI * delta;
        }

        if (keyboard.up) {
            this.rx -= Math.PI * delta;
        }

        if (keyboard.down) {
            this.rx += Math.PI * delta;
        }

        if (keyboard.s) {
            this.r += 2 * delta;
        }

        if (keyboard.w) {
            this.r -= 2 * delta;
        }
    }

    matrix() {
        const x = this.r * Math.sin(this.rx) * Math.sin(this.ry);
        const y = this.r * Math.cos(this.rx);
        const z = this.r * Math.sin(this.rx) * Math.cos(this.ry);

        return glMatrix.mat4.lookAt([], [x, y, z], [0, 0, 0], [0, 1, 0]);
    }
}