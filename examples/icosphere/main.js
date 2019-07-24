class Geometry {
    constructor() {
        this.points = [];
        this.faces = [];
        this.buffer = null;
    }

    addVertex(x, y, z) {
        this.points.push([x, y, z]);
        return this.points.length - 1;
    }
    
    addFace(v1, v2, v3) {
        this.faces.push([v1, v2, v3]);
    }

    getData() {
        const data = [];

        this.faces.forEach(f => {
            f.forEach(idx => {
                data.push(this.points[idx]);
            });
        });

        return data;
    }
}

class Hexagon extends Geometry {
    constructor(r, h) {
        super();

        this.r = r;
        this.h = h;

        const z = this.r * this.h;

        const bc = this.addVertex(0.0, 0.0, 0.0);
        const tc = this.addVertex(0.0, 0.0, z);

        for (let i = 0; i < 6; i++) {
            const a1 = (Math.PI / 3) * i;
            const a2 = (Math.PI / 3) * (i + 1);
            
            const b1 = [Math.cos(a1) * this.r, Math.sin(a1) * this.r, 0.0];
            const b2 = [Math.cos(a2) * this.r, Math.sin(a2) * this.r, 0.0];
            
            const t1 = [Math.cos(a1) * this.r, Math.sin(a1) * this.r, z];
            const t2 = [Math.cos(a2) * this.r, Math.sin(a2) * this.r, z];
            
            const v1 = this.addVertex(b1[0], b1[1], b1[2]);
            const v2 = this.addVertex(b2[0], b2[1], b2[2]);
            
            const v3 = this.addVertex(t1[0], t1[1], t1[2]);
            const v4 = this.addVertex(t2[0], t2[1], t2[2]);
            
            this.addFace(bc, v1, v2);
            this.addFace(tc, v4, v3);

            this.addFace(v1, v3, v2);
            this.addFace(v2, v3, v4);
        }
    }
}

class IcoSphere extends Geometry {
    constructor(r) {
        super();

        this.r = r || 1;

        const t = (1.0 + Math.sqrt(5.0)) / 2.0;

        const p0 = this.addVertex(0.0,  t,  1.0);
        const p1 = this.addVertex(0.0,  t, -1.0);
        const p2 = this.addVertex(0.0, -t,  1.0);
        const p3 = this.addVertex(0.0, -t, -1.0);;

        const p4 = this.addVertex( t, -1.0, 0.0);
        const p5 = this.addVertex( t,  1.0, 0.0);
        const p6 = this.addVertex(-t, -1.0, 0.0);
        const p7 = this.addVertex(-t,  1.0, 0.0);;

        const p8  = this.addVertex(-1.0 , 0.0, -t);
        const p9  = this.addVertex( 1.0 , 0.0, -t);
        const p10 = this.addVertex(-1.0 , 0.0,  t);
        const p11 = this.addVertex( 1.0 , 0.0,  t);

        this.addFace(p0, p11, p5);
        this.addFace(p0, p5,  p1);
        this.addFace(p0, p1,  p7);
        this.addFace(p0, p7,  p10);
        this.addFace(p0, p10, p11);

        this.addFace(p1,  p5,  p9);
        this.addFace(p5,  p11, p4);
        this.addFace(p11, p10, p2);
        this.addFace(p10, p7,  p6);
        this.addFace(p7,  p1,  p8);

        this.addFace(p3, p9, p4);
        this.addFace(p3, p4, p2);
        this.addFace(p3, p2, p6);
        this.addFace(p3, p6, p8);
        this.addFace(p3, p8, p9);

        this.addFace(p4, p9, p5);
        this.addFace(p2, p4, p11);
        this.addFace(p6, p2, p10);
        this.addFace(p8, p6, p7);
        this.addFace(p9, p8, p1);
    }
    
    getPoints() {
        const checked = {};
        const points = [];
        for (let i = 0; i < this.points.length; i++) {
            const p = this.points[i];
            const k = `${p[0]},${p[1]},${p[2]}`;
            
            if (checked[k]) {
                continue;
            }

            const m = Math.sqrt(
                p[0] * p[0] +
                p[1] * p[1] +
                p[2] * p[2]
            );

            points.push([
                (p[0] / m) * this.r,
                (p[1] / m) * this.r,
                (p[2] / m) * this.r
            ]);

            checked[k] = true;
        }

        return points;
    }

    getData() {
        return super.getData().map(p => {
            const m = Math.sqrt(
                p[0] * p[0] +
                p[1] * p[1] +
                p[2] * p[2]
            );
            return [
                (p[0] / m) * this.r,
                (p[1] / m) * this.r,
                (p[2] / m) * this.r
            ];
        })
    }

    subdivide() {
        const geo = new IcoSphere();
        geo.points = [];
        geo.faces = [];

        this.faces.forEach(f => {
            const v1 = this.points[f[0]];
            const v2 = this.points[f[1]];
            const v3 = this.points[f[2]];

            // v1 - v2
            const v4 = [
                (v1[0] + v2[0]) / 2,
                (v1[1] + v2[1]) / 2,
                (v1[2] + v2[2]) / 2,
            ];
            // v2 - v3
            const v5 = [
                (v2[0] + v3[0]) / 2,
                (v2[1] + v3[1]) / 2,
                (v2[2] + v3[2]) / 2,
            ];
            // v3 - v1
            const v6 = [
                (v3[0] + v1[0]) / 2,
                (v3[1] + v1[1]) / 2,
                (v3[2] + v1[2]) / 2,
            ];

            const p1 = geo.addVertex(v1[0], v1[1], v1[2]);
            const p2 = geo.addVertex(v2[0], v2[1], v2[2]);
            const p3 = geo.addVertex(v3[0], v3[1], v3[2]);
            const p4 = geo.addVertex(v4[0], v4[1], v4[2]);
            const p5 = geo.addVertex(v5[0], v5[1], v5[2]);
            const p6 = geo.addVertex(v6[0], v6[1], v6[2]);

            geo.addFace(p1, p4, p6);
            geo.addFace(p6, p4, p5);
            geo.addFace(p6, p5, p3);
            geo.addFace(p4, p2, p5);
        });

        return geo;
    }
}

const rect = canvas.getBoundingClientRect();
canvas.width = rect.width;
canvas.height= rect.height;

const resolution = 5;

let icosphere = new IcoSphere(1);
for (let i = 0; i < resolution; i++) {
    icosphere = icosphere.subdivide();
}

const icoData = icosphere.getData();
icosphere = icosphere.getPoints();

const modelData = [];
const uvData = [];
for (let i = 0; i < icosphere.length; i++) {
    let [x, y, z] = icosphere[i];
    const model = glMatrix.mat4.targetTo([], [x, y, z], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
    const length = Math.sqrt(x*x + y*y + z*z);
    x = x / length;
    y = y / length;
    z = z / length;
    const uv = [
        (Math.atan2(x, z) + Math.PI) / Math.PI / 2,
        (Math.acos(y) + Math.PI) / Math.PI - 1
    ];

    modelData.push(model);
    uvData.push(uv);
}

Promise.all([
    loadImg('textureC.jpg'),
    loadImg('textureH.jpg'),
    loadSrc('vsrc.glsl'),
    loadSrc('fsrc.glsl'),
    loadSrc('blur.vs'),
    loadSrc('blur.fs'),
    loadSrc('ico.vs'),
    loadSrc('ico.fs'),
]).then(res => {
    const gl = getContext(canvas, {
        clear: [0.0, 0.0, 0.0, 1.0]
    });

    gl.enable(gl.DEPTH_TEST);

    const textureC = createTexture(gl, res[0]);
    const textureH = createTexture(gl, res[1]);

    const vshader = createShader(gl, res[2], V_SHADER);
    const fshader = createShader(gl, res[3], F_SHADER);
    const program = createProgram(gl, vshader, fshader, [
        'u_proj', 'u_view', 
        'u_height', 'u_texture_c', 'u_texture_h'
    ]);
    const icoprogram = createProgram(gl, 
        createShader(gl, res[6], V_SHADER),
        createShader(gl, res[7], F_SHADER),
        ['u_proj', 'u_view']
    );

    const camera = new OrbitCamera();
    camera.r = 3.0;
    camera.ry = -Math.PI / 2;
    camera.rx = Math.PI / 2.5;

    const modelBuffer = createBuffer(gl, modelData);
    const uvBuffer = createBuffer(gl, uvData);
    //1 / Math.pow(10, resolution / 2)
    const hex = new Hexagon(0.005, 1);
    const hexagon = createBuffer(gl, hex.getData());
    const core = createBuffer(gl, icoData);

    const vao = createVAO(gl, [hexagon], [uvBuffer, modelBuffer]);
    const corevao = createVAO(gl, [core]);

    const fbo = createFBO({
        gl: gl, 
        width: canvas.width,
        height: canvas.height,
        count: 2,
        hdr: true
    });

    const quad = createVAO(gl,
        [
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
        ]
    );

    const sProgram = createProgram(gl,
        createShader(gl, `#version 300 es
        layout(location=0) in vec3 a_coord;
        layout(location=1) in vec2 a_uv;
        out vec2 v_uv;
        void main() { gl_Position = vec4(a_coord, 1.0); v_uv = a_uv; }
        `, V_SHADER),
        createShader(gl, `#version 300 es
        precision mediump float;
        in vec2 v_uv;
        uniform sampler2D u_base;
        uniform sampler2D u_bloom;
        out vec4 color;
        void main() {
            const float gamma = 2.2;
            vec3 hdr_color = texture(u_base, v_uv).rgb;
            color = vec4(hdr_color, 1.0);
            vec3 bloom_color = texture(u_bloom, v_uv).rgb;
            // color = vec4(bloom_color, 1.0);
            color = vec4(hdr_color + bloom_color, 1.0);

            color = vec4(1.0) - exp(color * 0.5);
            color = pow(color, vec4(1.0 / gamma));
            color.a = 1.0;
        }
        `, F_SHADER),
        ['u_base', 'u_bloom']
    );

    const factor = 2;
    const blurFBOA = createFBO({
        gl: gl,
        width: canvas.width / factor,
        height: canvas.height / factor,
        hdr: true
    });

    const blurFBOB = createFBO({
        gl: gl,
        width: canvas.width / factor,
        height: canvas.height / factor,
        hdr: true
    });

    const blurProgram = createProgram(gl,
        createShader(gl, res[4], V_SHADER),
        createShader(gl, res[5], F_SHADER),
        ['u_texture', 'u_horizontal']
    );

    function blurTexutre(texture, fboA, fboB, count) { 
        gl.viewport(0, 0, canvas.width / factor, canvas.height / factor);
        let horizontal = 0;
        useFBO(gl, fboA);
        clear(gl);
        draw(gl, blurProgram, quad, {
            u_texture: texture,
            u_horizontal: 1
        });

        const fbos = [fboA, fboB];

        for (let i = 0; i < count * 2; i++) {
            const read = i % 2;
            const write = (i + 1) % 2;

            useFBO(gl, fbos[write]);
            clear(gl);
            draw(gl, blurProgram, quad, {
                u_texture: fbos[read].colors[0],
                u_horizontal: horizontal % 2
            });
            horizontal += 1;
        }

        gl.viewport(0, 0, canvas.width, canvas.height);
    }

    loop((delta, time) => {
        camera.update(delta);
        camera.ry += Math.PI * delta / 6;
        useFBO(gl, fbo);
        clear(gl);
        draw(gl, icoprogram, corevao, {
            u_proj: glMatrix.mat4.perspective([], Math.PI / 3, canvas.width / canvas.height, 0.01, 1000),
            u_view: camera.matrix()
        });
        draw(gl, program, vao, {
            u_proj: glMatrix.mat4.perspective([], Math.PI / 3, canvas.width / canvas.height, 0.01, 1000),
            u_view: camera.matrix(),
            u_height: 20.3,
            u_texture_c: textureC,
            u_texture_h: textureH
        }, vao.maxInstances);


        blurTexutre(fbo.colors[1], blurFBOA, blurFBOB, 2);

        useFBO(gl, null);
        clear(gl);
        draw(gl, sProgram, quad, {
            u_base: fbo.colors[0],
            u_bloom: blurFBOA.colors[0]
        });
    });
})
