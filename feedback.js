Promise.all([
    loadSrc('fvsrc.glsl'),
    loadSrc('ffsrc.glsl'),
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

    const vshader = createShader(gl, res[0], V_SHADER);
    const fshader = createShader(gl, res[1], F_SHADER);

    const triangle = [
        [0.0, 0.05, 0.0],
        [-0.05, -0.05, 0.0],
        [0.05, -0.05, 0.0],
    ];
    const initPos = [];
    const initVel = [];
    const side = 100;
    for (let rx = 0; rx < side; rx++) {
        for (let ry = 0; ry < side; ry++) {
            const ax = (Math.PI * 2 / side) * rx;
            const ay = (Math.PI * 2 / side) * ry;
            
            const x = Math.sin(ax) * Math.sin(ay);
            const y = Math.cos(ax);
            const z = Math.sin(ax) * Math.cos(ay);
            initPos.push([x, y, z]);
            initVel.push([x * Math.random() * 2, y * Math.random() * 2, z * Math.random() * 2]);
        }
        
    }
    const bufferTri = createBuffer(gl, triangle);
    const bufferAPos = createBuffer(gl, initPos);
    const bufferBPos = createBuffer(gl, initPos);
    const bufferVel = createBuffer(gl, initVel);
    const vaoA = createVAOFromBuffers(gl, [bufferTri], [bufferAPos, bufferVel]);
    const vaoB = createVAOFromBuffers(gl, [bufferTri], [bufferBPos, bufferVel]);
    const vaos = {
        read: vaoA,
        write: vaoB,
    };

    const program = createProgram(gl, vshader, fshader, ['u_delta', 'u_proj', 'u_view'], ['v_pos']);
    const camera = new OrbitCamera();
    camera.rx = Math.PI / 4;
    camera.ry = Math.PI / 4;
    loop((delta) => {
        camera.update(delta);

        clear(gl);
        drawFeedback(gl, program, vaos.read, [vaos.write.ibuffers[0]], {
            u_delta: delta,
            u_proj: glMatrix.mat4.perspective([], Math.PI / 3, canvas.width / canvas.height, 0.01, 1000),
            u_view: camera.matrix(),
        }, 100);
        // const t = vaos.read;
        // vaos.read = vaos.write;
        // vaos.write = t;
    });
});