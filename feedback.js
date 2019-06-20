Promise.all([
    loadSrc('shaders/pvsrc.glsl'),
    loadSrc('shaders/pfsrc.glsl'),
    loadSrc('shaders/vsrc.glsl'),
    loadSrc('shaders/fsrc.glsl'),
]).then(res => {
    const canvas = document.getElementById('canvas');
    canvas.width = canvas.getBoundingClientRect().width;
    canvas.height = canvas.getBoundingClientRect().height;
    const gl = getContext(canvas, {
        clear: [0.0, 0.0, 0.0, 1.0],
        viewport: [0, 0, canvas.width, canvas.height]
    });

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);

    const pvshader = createShader(gl, res[0], V_SHADER);
    const pfshader = createShader(gl, res[1], F_SHADER);
    const vshader = createShader(gl, res[2], V_SHADER);
    const fshader = createShader(gl, res[3], F_SHADER);
    const pprogram = createProgram(gl, pvshader, pfshader, ['u_delta'], ['v_center'], gl.POINTS);
    const rprogram = createProgram(gl, vshader, fshader, ['u_proj', 'u_view']);

    const tridata = [
        [0.0, 0.01, 0.0],
        [-0.01, -0.01, 0.0],
        [0.01, -0.01, 0.0]
    ];
    const initPos = [];
    const initVel = [];
    const side = 10;
    for (let rx = 0; rx < side; rx++) {
        for (let ry = 0; ry < side; ry++) {
            const ax = (Math.PI * 2 / side) * rx;
            const ay = (Math.PI * 2 / side) * ry;
            
            const x = 0.5 * Math.sin(ax) * Math.sin(ay);
            const y = 0.5 * Math.cos(ax);
            const z = 0.5 * Math.sin(ax) * Math.cos(ay);
            initPos.push([x, y, z]);
            initVel.push([x * Math.random(), y * Math.random(), z * Math.random()]);
        }
        
    }

    const bufferTri = createBuffer(gl, tridata);
    const bufferAPos = createBuffer(gl, initPos);
    const bufferBPos = createBuffer(gl, initPos);
    const bufferVel = createBuffer(gl, initVel);
    const vaoA = createVAOFromBuffers(gl, [bufferAPos, bufferVel]);
    const vaoB = createVAOFromBuffers(gl, [bufferBPos, bufferVel]);
    const vaoRA = createVAOFromBuffers(gl, [bufferTri], [bufferAPos, bufferVel]);
    const vaoRB = createVAOFromBuffers(gl, [bufferTri], [bufferBPos, bufferVel]);
    const vaos = {
        read: {
            feedback: vaoA,
            render: vaoRA
        },
        write: {
            feedback: vaoB,
            render: vaoRB
        },
    };
    const camera = new OrbitCamera();
    camera.rx = Math.PI / 4;
    camera.ry = Math.PI / 4;
    loop((delta) => {
        camera.update(delta);
        document.getElementById('fps').textContent = 1 / delta;
        clear(gl);
        drawFeedback(gl, pprogram, vaos.read.feedback, [vaos.write.feedback.buffers[0]], {
            u_delta: delta,
        });
        draw(gl, rprogram, vaos.read.render, {
            u_proj: glMatrix.mat4.perspective([], Math.PI / 3, canvas.width / canvas.height, 0.01, 1000),
            u_view: camera.matrix(),
        }, vaos.read.render.maxInstances);

        const t = vaos.read;
        vaos.read = vaos.write;
        vaos.write = t;
    });
});