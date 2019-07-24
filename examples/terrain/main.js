const canvas = document.getElementById('canvas');
const {width, height} = canvas.getBoundingClientRect();
canvas.width = width;
canvas.height = height;

const gl = getContext(canvas, {
    clear: [0.2, 0.5, 0.8, 1.0]
});


// gl.enable(gl.CULL_FACE);
gl.enable(gl.DEPTH_TEST);
enableAlpha(gl);



const gridData = [];
const resolution = 7;
const limit = 100;
const size = limit / resolution;

for (let i = 0; i <= limit + size; i += size) {
    gridData.push([-limit, 0.0, i]);
    gridData.push([ limit, 0.0, i]);

    gridData.push([i, 0.0, -limit]);
    gridData.push([i, 0.0,  limit]);

    if (i) {
        gridData.push([-limit, 0.0, -i]);
        gridData.push([ limit, 0.0, -i]);

        gridData.push([-i, 0.0, -limit]);
        gridData.push([-i, 0.0,  limit]);
    }
}

const gridVAO = createVAO(gl, [
    createBuffer(gl, gridData),
    createBuffer(gl, gridData.map(_ => [0.3, 0.3, 0.3]))
]);

const axisVAO = createVAO(gl, [
    createBuffer(gl, [
        [0.0, 0.1, 0.0],
        [limit, 0.1, 0.0],
        [0.0, 0.1, 0.0],
        [0.0, limit, 0.0],
        [0.0, 0.1, 0.0],
        [0.0, 0.1, limit]
    ]),
    createBuffer(gl, [
        [1.0, 0.0, 0.0],
        [1.0, 0.0, 0.0],
        [0.0, 1.0, 0.0],
        [0.0, 1.0, 0.0],
        [0.0, 0.0, 1.0],
        [0.0, 0.0, 1.0]
    ])
]);

const sunData = [];

for (let i = 0; i < Math.PI * 2; i += Math.PI / 18) {
    const r = limit / 4;
    const cx = 0;
    const cy = 0;
    const cz = 0;
    const x0 = cx + r * Math.cos(i);
    const y0 = cy + r * Math.sin(i);
    const x1 = cx + r * Math.cos(i + Math.PI / 18);
    const y1 = cy + r * Math.sin(i + Math.PI / 18);

    sunData.push([cx, cy, cz]);
    sunData.push([x0, y0, cz]);
    sunData.push([x1, y1, cz]);
}

const sunVAO = createVAO(gl, [
    createBuffer(gl, sunData),
    createBuffer(gl, sunData.map(_ => [1.5, 0.2, 0.3]))
]);

const camera = new OrbitCamera();
camera.r = limit * 2;
camera.rx = Math.PI / 3;
camera.ry = Math.PI / 3;

noise.seed(10);

function getHeight(x, z) {
    return Math.pow(((noise.simplex2(x / 130, z / 130) + 1) / 2), 2) * 40;
}

const noiseData = [];
let i = 0;
for (let x = -limit; x < limit; x += size) {
    i += 1;
    for (let z = limit; z > -limit; z -= size) {
        const y1 = getHeight(x, z - size);
        const y2 = getHeight(x, z);
        const y3 = getHeight(x + size, z);
        const y4 = getHeight(x + size, z - size);

        if (i % 2) {
            noiseData.push([x, y1, z - size]);
            noiseData.push([x, y2, z]);
            noiseData.push([x + size, y3, z]);

            noiseData.push([x, y1, z - size]);
            noiseData.push([x + size, y3, z]);
            noiseData.push([x + size, y4, z - size]);
        } else {
            noiseData.push([x + size, y4, z - size]);
            noiseData.push([x, y1, z - size]);
            noiseData.push([x, y2, z]);

            noiseData.push([x + size, y4, z - size]);
            noiseData.push([x, y2, z]);
            noiseData.push([x + size, y3, z]);
        }

        i += 1;
    }
}

const noiseVAO = createVAO(gl,
    [
        createBuffer(gl, noiseData),
        createBuffer(gl, noiseData.map(_ => [0.8, 0.8, 0.8]))
    ]
);

Promise.all([
    loadSrc('shaders/lines.vs'),
    loadSrc('shaders/lines.fs'),
    loadSrc('shaders/terrain.vs'),
    loadSrc('shaders/terrain.fs'),
    loadSrc('shaders/sun.vs'),
    loadSrc('shaders/sun.fs'),
    loadSrc('shaders/screen.vs'),
    loadSrc('shaders/screen.fs'),
    loadSrc('shaders/blur.fs'),
    loadSrc('shaders/extract.fs'),
]).then(res => {
    const linesProgram = createProgram(gl,
        createShader(gl, res[0], V_SHADER),
        createShader(gl, res[1], F_SHADER),
        ['u_proj', 'u_view'],
        [], M_LINES
    );

    const triProgram = createProgram(gl, 
        createShader(gl, res[2], V_SHADER),
        createShader(gl, res[3], F_SHADER),
        ['u_proj', 'u_view'],
    );

    const sunProgram = createProgram(gl, 
        createShader(gl, res[4], V_SHADER),
        createShader(gl, res[5], F_SHADER),
        ['u_proj', 'u_view', 'u_limit'],
    );

    const screenProgram = createProgram(gl,
        createShader(gl, res[6], V_SHADER),
        createShader(gl, res[7], F_SHADER),
        ['u_texture', 'u_bloom'],
    );

    const resc = 2;//5.0;
    const sceneFBO = createFBO({
        gl: gl,
        width: canvas.width,
        height: canvas.height,
        count: 2,
        hdr: true
    });

    const blurProgram = createProgram(gl, 
        createShader(gl, res[6], V_SHADER),
        createShader(gl, res[8], F_SHADER),
        ['u_texture', 'u_horizontal']
    );

    const extractProgram = createProgram(gl, 
        createShader(gl, res[6], V_SHADER),
        createShader(gl, res[9], F_SHADER),
        ['u_texture']
    );

    const fboA = createFBO({
        gl: gl,
        width: canvas.width / resc,
        height: canvas.height / resc,
        hdr: true
    });

    const fboB = createFBO({
        gl: gl,
        width: canvas.width / resc,
        height: canvas.height / resc,
        hdr: true
    });

    const fbo0 = createFBO({
        gl: gl,
        width: canvas.width / resc,
        height: canvas.height / resc,
        hdr: true
    });

    function blurTexture(texture, fboA, fboB, steps) {
        gl.viewport(0, 0, canvas.width / resc, canvas.height / resc);
        let horizontal = 1;
        useFBO(gl, fboA);
        clear(gl);
        draw(gl, blurProgram, quadVAO, {
            u_texture: texture,
            u_horizontal: 0
        });

        const fbos = [fboA, fboB];

        for (let i = 0; i < steps * 2; i++) {
            useFBO(gl, fbos[horizontal % 2]);
            clear(gl);
            draw(gl, blurProgram, quadVAO, {
                u_texture: fbos[(horizontal + 1) % 2].colors[0],
                u_horizontal: horizontal % 2
            });
            horizontal += 1;
        }

        gl.viewport(0, 0, canvas.width, canvas.height);
        return fboB.colors[0];
    }

    const quadVAO = createVAO(gl, [
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

    loop(delta => {
        camera.update(delta);

        gl.viewport(0, 0, canvas.width, canvas.height);
        useFBO(gl, sceneFBO);
        clear(gl);
        // draw(gl, linesProgram, gridVAO, {
        //     u_proj: glMatrix.mat4.perspective([], Math.PI / 3, width / height, 0.01, 1000),
        //     u_view: camera.matrix()
        // });
        // draw(gl, linesProgram, axisVAO, {
        //     u_proj: glMatrix.mat4.perspective([], Math.PI / 3, width / height, 0.01, 1000),
        //     u_view: camera.matrix()
        // });
        draw(gl, triProgram, noiseVAO, {
            u_proj: glMatrix.mat4.perspective([], Math.PI / 3, width / height, 0.01, 1000),
            u_view: camera.matrix()
        });
        draw(gl, sunProgram, sunVAO, {
            u_proj: glMatrix.mat4.perspective([], Math.PI / 3, width / height, 0.01, 1000),
            u_view: camera.matrix(),
            u_limit: (limit + 0.01) / 2
        });

        gl.viewport(0, 0, canvas.width / resc, canvas.height / resc);
        useFBO(gl, fbo0);
        clear(gl);
        draw(gl, extractProgram, quadVAO, {
            u_texture: sceneFBO.colors[0]
        });

        const bloom = blurTexture(fbo0.colors[0], fboA, fboB, 5);

        useFBO(gl, null);
        clear(gl);
        draw(gl, screenProgram, quadVAO, {
            u_texture: sceneFBO.colors[0],
            u_bloom: bloom
        });
    });
})