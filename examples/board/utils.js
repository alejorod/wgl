function loadSrc(path) {
    return fetch(path).then(r => r.text());
}

function loadImg() {}


function loop(cb) {
    let _id = null;
    let last;
    let delta;

    function main(time) {
        _id = requestAnimationFrame(main);
        last = last || time;
        delta = time - last;
        last = time;
        cb(delta, time);
    }

    return {
        start() { _id = requestAnimationFrame(main) },
        stop() { cancelAnimationFrame(_id) }
    };
}

function random() {
    let rand = 0;
    for (let i = 0; i < 6; i += 1) {
        rand += Math.random();
    }
    return rand / 6;
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