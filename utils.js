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
            vertices.push(d.slice(1));
        } else if (d[0] == 'vt') {
            uvs.push(d.slice(1));
        } else if (d[0] == 'vn') {
            normals.push(d.slice(1));
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

function loop() {}