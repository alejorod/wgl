
Promise.all([
    loadSrc('update_vsrc.glsl'),
    loadSrc('update_fsrc.glsl'),
    loadSrc('render_vsrc.glsl'),
    loadSrc('render_fsrc.glsl'),
    loadImg('image.png')
]).then(res => {
    const canvas = document.getElementById('canvas');
    const gl = getContext(canvas, {clear: [0.0, 0.0, 0.0, 1.0]});
    enableAlpha(gl);
    const updateProgram = createProgram(gl, 
        createShader(gl, res[0], V_SHADER), 
        createShader(gl, res[1], F_SHADER),
        ['u_delta'], ['v_coord'], M_POINTS);
    const renderProgram = createProgram(gl,
        createShader(gl, res[2], V_SHADER),
        createShader(gl, res[3], F_SHADER),
        ['u_proj', 'u_view', 'u_texture']);
    const p_coords = createBuffer(gl,
        [
            [-0.5,  0.5, 0.0],
            [-0.5, -0.5, 0.0],
            [ 0.5, -0.5, 0.0],
            [-0.5,  0.5, 0.0],
            [ 0.5, -0.5, 0.0],
            [ 0.5,  0.5, 0.0],
        ]
    );
    const uv_coords = createBuffer(gl,
        [
            [0.0, 1.0],
            [0.0, 0.0],
            [1.0, 0.0],
            [0.0, 1.0],
            [1.0, 0.0],
            [1.0, 1.0]
        ]
    );
    const texture = createTexture(gl, res[4], {
        format: T_RGBA
    });

    const count = 300;
    const points = [];
    const vels = [];
    function gaussianRand() {
        var rand = 0;
        
        for (var i = 0; i < 6; i += 1) {
            rand += Math.random();
        }
        
        return rand / 6;
    }
    for (let i = 0; i < count; i++) {
        points.push([0.0, 0.0, 0.0]);
        // const vx = (gaussianRand() * 2) - 1;
        // const vy = (gaussianRand() * 2) - 1;
        // const vz = (gaussianRand() * 2) - 1;
        vels.push([0.0, 0.0, 0.0]);
    }

    const system = new FeedbackParticlesSystem({
        gl: gl,
        updateProgram: updateProgram,
        renderProgram: renderProgram,
        mesh: [p_coords, uv_coords],
        dynamicProperties: [points],
        fixedProperties: [vels],
    });
    const camera = new OrbitCamera();
    camera.r = 15;
    loop(delta => {
        // camera.update(delta / 4);
        camera.ry += Math.PI * delta / 4;


        const vx = (gaussianRand() * 2) - 1;
        const vy = (gaussianRand() * 2) - 1;
        const vz = (gaussianRand() * 2) - 1;

        if (system.count < count) {
            updateBuffer(gl, system.state.read.feedback.buffers[1], system.count, [vx * 2, vy * 2, vz * 2]);
        }

        clear(gl);
        
        system.update(gl, {
            u_delta: delta
        });

        system.render(gl, {
            u_proj: glMatrix.mat4.perspective([], Math.PI / 3, 1.0, 0.01, 1000),
            u_view: camera.matrix(),
            u_texture: texture
        });
    })
})
