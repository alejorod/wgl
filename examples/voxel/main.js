const gl = getContext(canvas, { clear: [0.0, 0.0, 0.0, 1.0] });
const camera = new OrbitCamera(800, 600);
const shaders = new ShaderManager(gl);
const programs = new ProgramManager(gl, shaders);
const renderer = new Renderer(gl, programs);
const entities = [];

const w = new Worker('worker.js');

w.addEventListener('message', (msg) => {
    const buffers = [];
    for (let i = 0; i < msg.data.buffers.length; i++) {
        buffers[i] = fastCreateBuffer(gl, msg.data.buffers[i], 3, msg.data.buffers[i].length / 3);
    }
    const vao = createVAO(gl, buffers);
    entities.push(
        new Entity({
            vao: vao,
            program: 'phong'
        })
    );
})

let side = 16;
let x = -side / 2;
let z = -side / 2;
let y = side - 1;
let count = 0;
function addChunk() {
    if (count == side * side * side) {
        return;
    }
    
    count += 1;
    // console.log(x, y, z, count, side * side * side);

    w.postMessage({
        cmd: 'generate',
        coords: {x: 16 * x, y: y * 16, z: 16 * z}
    });

    if (y > 0) {
        y -= 1;
    } else {
        y = side - 1;
        
        if (z < side / 2 - 1) {
            z += 1;
        } else {
            z = -side / 2;
            x += 1;
        }
    }
}

for (let i = 0; i < side * side * side; i++) {
    addChunk();
}

const looper = new Looper((delta) => {
    camera.update(delta);
    renderer.draw(entities, camera);
});

gl.enable(gl.CULL_FACE);
gl.enable(gl.DEPTH_TEST);


camera.r = 32 * 3;

Promise.all([
    shaders.addVertFromPath('phong_vs', 'shaders/phong.vs'),
    shaders.addFragFromPath('phong_fs', 'shaders/phong.fs'),
]).then(_ => {
    programs.add('phong', 'phong_vs', 'phong_fs', ['u_proj', 'u_view']);
    looper.start();
});
