const canvas = document.getElementById('canvas');
const {width, height} = canvas.getBoundingClientRect();
canvas.width = width;
canvas.height = height;

const gl = getContext(canvas, {
    clear: [0.2, 0.5, 0.8, 1.0]
});

const camera = new OrbitCamera();


Promise.all([
    loadSrc('shaders/main.vs'),
    loadSrc('shaders/main.fs'),
]).then(res => {

    const program = createProgram(gl,
        createShader(gl, res[0], V_SHADER),
        createShader(gl, res[1], F_SHADER),
        ['u_proj', 'u_view']
    );

    noise.seed(10);

    const limit = Math.PI / 2;
    const points = 6;
    const step = limit / points;
    const data = [];
    for (let i = 0; i < limit - step; i += step) {
        let r0 = (noise.simplex2(i / 2, 0) + 1) / 2;
        let r1 = (noise.simplex2((i + step) / 2, 0) + 1) / 2;
        
        const x0 = r0 * Math.cos(i);
        const y0 = r0 * Math.sin(i);

        const x1 = r1 * Math.cos(i + step);
        const y1 = r1 * Math.sin(i + step);

        data.push([0.0, 0.0, 0.0]);
        data.push([x0, y0, 0.0]);
        data.push([x1, y1, 0.0]);
    }

    const vao = createVAO(gl, [createBuffer(gl, data)]);

    loop(delta => {
        camera.update(delta);
        clear(gl);

        draw(gl, program, vao, {
            u_proj: glMatrix.mat4.perspective([], Math.PI / 3, width / height, 0.01, 1000),
            u_view: camera.matrix()
        });
    });
})