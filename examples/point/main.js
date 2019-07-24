const canvas = document.getElementById('canvas');
const {width, height} = canvas.getBoundingClientRect();
canvas.width = width;
canvas.height = height;
const gl = getContext(canvas, {
    clear: [0.065, 0.08, 0.095, 1.0]
});

gl.enable(gl.CULL_FACE);
gl.enable(gl.DEPTH_TEST);
enableAlpha(gl);

const shaders = new ShaderManager(gl);
const programs = new ProgramManager(gl, shaders);
const renderer = new Renderer(gl, programs);
const camera = new OrbitCamera(width, height);
const terrain = new Terrain(gl, {
    program: 'phong'
});

const cursor = new Cursor(gl, camera, terrain, {
    program: 'phong'
});

const entities = [
    terrain,
    cursor
];

Tree.init(gl);

function addTree() {
    entities.push(new Tree(gl, cursor.x, cursor.y, cursor.z, {
        program: 'phong'
    }));
}

function addHouse() {
    entities.push(new House(gl, cursor.x, cursor.y, cursor.z, {
        program: 'phong'
    }));
}

let addF = addTree;

window.addEventListener('keydown', e => {
    if (e.keyCode == 32) {
        if (addF == addTree) {
            addF = addHouse;
        } else {
            addF = addTree;
        }
    }
});

canvas.onclick = (e) => {
    addF();
}

const limit = 50;
const resolution = 50;
const size = limit / resolution;
const range = limit / 2;
const R = 2;
const HR = 6;

for (let x = -range; x < range; x += size) {
    for (let z = -range; z < range; z += size) {
        
        let tmax = noise.simplex2(x, z);
        let hmax = noise.simplex2(x + 100, z + 100);
        
        for (let zn = z - R; zn <= z + R; zn++) {
            for (let xn = x - R; xn <= x + R; xn++) {
                const te = noise.simplex2(xn, zn);
                if (te > tmax) { tmax = te; }
            }
        }

        for (let zn = z - HR; zn <= z + HR; zn++) {
            for (let xn = x - HR; xn <= x + HR; xn++) {
                const he = noise.simplex2(xn + 100, zn + 100);
                if (he > hmax) { hmax = he; }
            }
        }

        if (noise.simplex2(x, z) == tmax) {
            entities.push(new Tree(gl, x, terrain.noise(x, z), z, {
                program: 'phong'
            }));
        } else if (noise.simplex2(x + 100, z + 100) == hmax) {
            entities.push(new House(gl, x, terrain.noise(x, z), z, {
                program: 'phong'
            }));
        }
    }
}

function main(delta) {
    camera.update(delta);
    cursor.update();
    renderer.draw(entities, camera);
}

Promise.all([
    shaders.addVertFromPath('phong_vs', 'shaders/phong.vs'),
    shaders.addFragFromPath('phong_fs', 'shaders/phong.fs'),
]).then(() => {
    programs.add('phong', 'phong_vs', 'phong_fs', [
        'u_proj', 'u_view', 'u_model', 'u_color', 'u_lights'
    ]);

    loop(main).start();
});