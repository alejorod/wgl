function loadImg() {}

function loadSrc(path) {
    return fetch(path).then(r => r.text());
}

function createVAOfromOBJ(gl, src) {
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
    return createVAO(gl, buffers);
}

function loop(cb) {
    let last;
    let delta;

    function main(time) {
        requestAnimationFrame(main);
        last = last || time;
        delta = (time - last) / 1000;
        last = time;
        cb(delta);
    }

    requestAnimationFrame(main);
}

class OrbitCamera {
    constructor() {
        this.r = 2;
        this.rx = 0;
        this.ry = 0;
    }

    update(delta) {
    }

    matrix() {
        const y = this.r * Math.sin(this.ry) * Math.sin(this.rx);
        const z = this.r * Math.cos(this.ry);
        const x = this.r * Math.sin(this.ry) * Math.cos(this.rx);

        return glMatrix.mat4.lookAt([], [x, y, z], [0, 0, 0], [0, 1, 0]);
    }
}