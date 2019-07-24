const canvas = document.getElementById('canvas');
const {width, height} = canvas.getBoundingClientRect();
canvas.width = width;
canvas.height = height;

const gl = getContext(canvas, {
    clear: [0.2, 0.5, 0.8, 1.0]
});

gl.enable(gl.CULL_FACE);
gl.enable(gl.DEPTH_TEST);

const quad = createVAO(gl, [
    createBuffer(gl, [
        [-1.0,  1.0, 0.0],
        [-1.0, -1.0, 0.0],
        [ 1.0, -1.0, 0.0],
        [-1.0,  1.0, 0.0],
        [ 1.0, -1.0, 0.0],
        [ 1.0,  1.0, 0.0]
    ]),
    createBuffer(gl, [
        [0.0, 1.0],
        [0.0, 0.0],
        [1.0, 0.0],
        [0.0, 1.0],
        [1.0, 0.0],
        [1.0, 1.0]
    ])
]);

Promise.all([
    loadSrc('shaders/main.vs'),
    loadSrc('shaders/main.fs'),
    loadSrc('shaders/screen.vs'),
    loadSrc('shaders/ssao.fs'),
    loadSrc('shaders/blur.fs'),
    loadSrc('shaders/screen.fs'),
    loadSrc('cube.obj'),
]).then(res => {
    const program = createProgram(gl,
        createShader(gl, res[0], V_SHADER),
        createShader(gl, res[1], F_SHADER),
        ['u_proj', 'u_view', 'u_model']
    );
    const ssao = createProgram(gl,
        createShader(gl, res[2], V_SHADER),
        createShader(gl, res[3], F_SHADER),
        [
            'u_position',
            'u_normal',
            'u_noise',
            'u_proj',
            'u_width',
            'u_height',
            'u_color',
            {
                name: 'u_samples',
                count: 64
            }
        ]
    );
    const blur = createProgram(gl,
        createShader(gl, res[2], V_SHADER),
        createShader(gl, res[4], F_SHADER),
        ['u_ssao']
    );
    const screen = createProgram(gl,
        createShader(gl, res[2], V_SHADER),
        createShader(gl, res[5], F_SHADER),
        ['u_color', 'u_ssao']
    );

    const cube = createVAOfromOBJ(gl, res[6]);

    const camera = new OrbitCamera();

    const proj = glMatrix.mat4.perspective([], Math.PI / 3, width / height, 0.01, 1000);
    const model1 = glMatrix.mat4.fromTranslation([], [0, 0, 0]);
    const model2 = glMatrix.mat4.fromTranslation([], [0.5, -0.5, 0.5]);

    const gFBO = createFBO({
        gl, width, height,
        rbo: false,
        hdr: true,
        count: 3
    });

    const factor = 2;
    const ssaoFBO = createFBO({
        gl,
        width: width / factor,
        height: height / factor
    });
    const blurFBO = createFBO({
        gl,
        width: width,
        height: height
    });

    const noiseData = [];
    for (let i = 0; i < 16; i++) {
        noiseData.push(random() * 2.0 - 1.0);
        noiseData.push(random() * 2.0 - 1.0);
        noiseData.push(0.0);
        noiseData.push(1.0);
    }
    const noiseTexture = createTexture(gl, new Float32Array(noiseData), {
        width: 4,
        height: 4,
        internal: T_RGBA16,
        format: T_RGBA,
        wrapS: W_REPEAT,
        wrapT: W_REPEAT
    });

    function vLength(x, y, z) {
        return Math.sqrt(x*x+y*y+z*z);
    }

    const samples = [];
    for (let i = 0; i < 64; i++) {
        const sample = [
            random() * 2.0 - 1.0, 
            random() * 2.0 - 1.0, 
            random()
        ];
        const r = random();
        const m = vLength(sample[0], sample[1], sample[2]);
        let scale = i / 16;
        scale = 0.1 + scale * scale * (1.0 - 0.1);
        sample[0] = (sample[0] / m) * r * scale;
        sample[1] = (sample[1] / m) * r * scale;
        sample[2] = (sample[2] / m) * r * scale;
        samples.push(sample);
    }

    glMatrix.mat4.rotate(model2, model2, Math.PI / 6, [0.0, 1.0, 0.0]);
    glMatrix.mat4.rotate(model1, model1, Math.PI / 3, [1.0, 0.0, 0.0]);

    loop(delta => {
        camera.update(delta);

        useFBO(gl, gFBO);
        clear(gl);
        draw(gl, program, cube, {
            u_proj: proj,
            u_view: camera.matrix(),
            u_model: model1
        });
        draw(gl, program, cube, {
            u_proj: proj,
            u_view: camera.matrix(),
            u_model: model2
        });

        useFBO(gl, ssaoFBO);
        gl.viewport(0, 0, width / factor, height / factor);
        clear(gl);
        draw(gl, ssao, quad, {
            u_position: gFBO.colors[0],
            u_normal: gFBO.colors[1],
            u_noise: noiseTexture,
            u_color: gFBO.colors[2],
            u_samples: samples,
            u_proj: proj,
            u_width: width + 0.001,
            u_height: height + 0.001
        });

        useFBO(gl, blurFBO);
        gl.viewport(0, 0, width, height);
        clear(gl);
        draw(gl, blur, quad, {
            u_ssao: ssaoFBO.colors[0]
        });

        useFBO(gl, null);
        gl.viewport(0, 0, width, height);
        clear(gl);
        draw(gl, screen, quad, {
            u_color: gFBO.colors[2],
            u_ssao: blurFBO.colors[0]
        });
    });
});