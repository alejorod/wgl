Promise.all([
    loadSrc('vsrc.glsl'),
    loadSrc('fsrc.glsl'),
    loadSrc('svsrc.glsl'),
    loadSrc('sfsrc.glsl'),
]).then(res => {
    const gl = getContext(canvas, {
        clear: [0.0, 0.0, 0.0, 1.0]
    });

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    const camera = new OrbitCamera();
    const vshader = createShader(gl, res[0], V_SHADER);
    const fshader = createShader(gl, res[1], F_SHADER);
    const program = createProgram(gl, vshader, fshader, [
        'u_proj',
        'u_view',
        'u_model',
        'u_camera_position',
        {
            name: 'lights',
            count: 5,
            fields: [
                'position',
                'color',
                'strength'
            ]
        }
    ]);
    const quadProgram = createProgram(
        gl,
        createShader(gl, res[2], V_SHADER),
        createShader(gl, res[3], F_SHADER),
        ['u_texture', 'u_exposure']
    );

    const plane = createVAO(gl, [
        [
            [-10.0, 0.0, -25.0],
            [-10.0, 0.0,  25.0],
            [ 10.0, 0.0,  25.0],
            [-10.0, 0.0, -25.0],
            [ 10.0, 0.0,  25.0],
            [ 10.0, 0.0, -25.0],
        ],
        [
            [0.0, 1.0, 0.0],
            [0.0, 1.0, 0.0],
            [0.0, 1.0, 0.0],
            [0.0, 1.0, 0.0],
            [0.0, 1.0, 0.0],
            [0.0, 1.0, 0.0],
        ]
    ]);

    const screen = createVAO(gl, [
        [
            [-1.0,  1.0, 0.0],
            [-1.0, -1.0, 0.0],
            [ 1.0, -1.0, 0.0],
            [-1.0,  1.0, 0.0],
            [ 1.0, -1.0, 0.0],
            [ 1.0,  1.0, 0.0]
        ],
        [
            [0.0, 1.0],
            [0.0, 0.0],
            [1.0, 0.0],
            [0.0, 1.0],
            [1.0, 0.0],
            [1.0, 1.0]
        ]
    ]);

    const colors = [
        [1.0, 0.5, 0.5],
        [0.5, 1.0, 0.5],
        [0.5, 0.5, 1.0],
    ];

    const positions = [
        [5.0, 1.0, 0.0],
        [-5.0, 1.0, 0.0],
        [0.0, 1.0, -5.0]
    ]

    const lights = Array(colors.length).fill(0).map((_, i) => {
        return {
            position: positions[i],
            color: colors[i],
            strength: 1 / 10000
        };
    });

    window.exposure = 1.1;

    camera.r = 50;
    camera.rx = Math.PI / 4;
    camera.ry = Math.PI / 6;

    const fbo = createFBO({
        gl, 
        width: 800, 
        height: 600,
        hdr: true
    });

    loop(delta => {
        // camera.update(delta);

        useFBO(gl, fbo);
        clear(gl);
        draw(gl, program, plane, {
            u_proj: glMatrix.mat4.perspective([], Math.PI / 3, 800 / 600, 0.01, 1000),
            u_view: camera.matrix(),
            u_model: glMatrix.mat4.identity([]),
            u_camera_position: camera.getPosition(),
            lights: lights
        });

        useFBO(gl, null);
        clear(gl);
        draw(gl, quadProgram, screen, {
            u_texture: fbo.colors[0],
            u_exposure: window.exposure
        });
    });
});

exposureInput.onchange = (e) => {
    window.exposure = parseFloat(e.target.value);
} 