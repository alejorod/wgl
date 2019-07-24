Promise.all([
    loadSrc('vsrc.glsl'),
    loadSrc('fsrc.glsl'),
    loadSrc('cube.obj')
]).then(res => {
    const camera = new OrbitCamera();
    const canvas = document.getElementById('canvas');
    const gl = getContext(canvas, {
        clear: [0.0, 0.0, 0.0, 1.0],
        viewport: [0, 0, 400, 400]
    });
    const vshader = createShader(gl, res[0], V_SHADER);
    const fshader = createShader(gl, res[1], F_SHADER);
    const side = 10;
    const idata = Array(side * side).fill(0).map((_, i) => {
        const x = (i % side) - side / 2;
        const z = Math.floor(i / side) - side / 2;
        const mat = glMatrix.mat4.identity([]);
        glMatrix.mat4.translate(mat, mat, [x + x * 0.5, 0, z + z * 0.5]);
        return mat;
    });
    const ivao = createVAO(gl, parseOBJ(res[2]), [idata]);
    const program = createProgram(gl, vshader, fshader, ['u_proj', 'u_view']);

    let time = 0;
    function updateCubes(delta) {
        time += delta;
        for (let i = 0; i < side * side; i++) {
            const x = (i % side) - side / 2;
            const z = Math.floor(i / side) - side / 2;
            const y = Math.sin(x + z + time);
            const mat = glMatrix.mat4.identity([]);
            glMatrix.mat4.translate(mat, mat, [x + x * 0.5, y, z + z * 0.5]);
            updateBuffer(gl, ivao.ibuffers[0], i, mat);
        }
    }

    loop((delta) => {
        camera.update(delta);
        updateCubes(delta);
        clear(gl);
        draw(gl, program, ivao, {
            u_proj: glMatrix.mat4.perspective([], Math.PI / 3, 1.0, 0.1, 100),
            u_view: camera.matrix(),
        }, side * side);
    });
});