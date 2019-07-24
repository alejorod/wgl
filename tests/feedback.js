Promise.all([
    loadSrc('shaders/pvsrc.glsl'),
    loadSrc('shaders/pfsrc.glsl'),
    loadSrc('shaders/vsrc.glsl'),
    loadSrc('shaders/fsrc.glsl')
]).then(res => {
    const canvas = document.getElementById('canvas');
    canvas.width = canvas.getBoundingClientRect().width;
    canvas.height = canvas.getBoundingClientRect().height;
    const gl = getContext(canvas, {
        clear: [0.0, 0.0, 0.0, 1.0],
        viewport: [0, 0, canvas.width, canvas.height],
    });

    enableAlpha(gl);

    const pvshader = createShader(gl, res[0], V_SHADER);
    const pfshader = createShader(gl, res[1], F_SHADER);
    const vshader = createShader(gl, res[2], V_SHADER);
    const fshader = createShader(gl, res[3], F_SHADER);
    const pprogram = createProgram(gl, pvshader, pfshader, ['u_delta'], ['v_center'], M_POINTS);
    const rprogram = createProgram(gl, vshader, fshader, ['u_proj', 'u_view']);
    const data = [
        [-0.01, 0.01, 0.0],
        [-0.01, -0.01, 0.0],
        [0.01, -0.01, 0.0],
        [-0.01, 0.01, 0.0],
        [0.01, -0.01, 0.0],
        [0.01, 0.01, 0.0]
    ];
    const initPos = [];
    const initVel = [];
    const side = 100;
    for (let rx = 0; rx < side; rx++) {
        for (let ry = 0; ry < side; ry++) {
            const ax = (Math.PI * 2 / side) * rx;
            const ay = (Math.PI * 2 / side) * ry;
            
            const x = 0.5 * Math.sin(ax) * Math.sin(ay);
            const y = 0.5 * Math.cos(ax);
            const z = 0.5 * Math.sin(ax) * Math.cos(ay);
            initPos.push([x, y, z]);
            initVel.push([x * Math.random() * 2, y * Math.random() * 2, z * Math.random() * 2]);
        }
    }

    const camera = new OrbitCamera();
    const particles = new FeedbackParticlesSystem({
        gl: gl,
        updateProgram: pprogram,
        renderProgram: rprogram,
        mesh: createBuffer(gl, data),
        dynamicProperties: [initPos],
        fixedProperties: [initVel],
    });

    loop((delta) => {
        camera.update(delta);
        document.getElementById('fps').textContent = 1 / delta;
        clear(gl);
        particles.update(gl, {
            u_delta: delta
        });
        particles.render(gl, {
            u_proj: glMatrix.mat4.perspective([], Math.PI / 3, canvas.width / canvas.height, 0.01, 1000),
            u_view: camera.matrix()
        });
    });
});