// const blue_color = rgb(0, 214 / 255, 224 / 255);
// const dark_side_color = rgb(226, 196, 184);
// const light_side_color = rgb(210, 214, 202);

class Renderer {
    constructor(gl, programs) {
        this.gl = gl;
        this.programs = programs;

        this.quad = createVAO(gl, [
            createBuffer(gl, [
                [-1.0,  1.0, 0.0],
                [-1.0, -1.0, 0.0],
                [ 1.0, -1.0, 0.0],
                [-1.0,  1.0, 0.0],
                [ 1.0, -1.0, 0.0],
                [ 1.0,  1.0, 0.0],
            ]),
            createBuffer(gl, [
                [0.0, 1.0],
                [0.0, 0.0],
                [1.0, 0.0],
                [0.0, 1.0],
                [1.0, 0.0],
                [1.0, 1.0]
            ]),
        ]);

        this.createFBOS();
        this.generateSSAOUniforms();
    }

    createFBOS() {
        this.buffers = createFBO({gl: this.gl, width: 800, height: 600, hdr: true, count: 3});
        this.screen = createFBO({gl: this.gl, width: 800, height: 600});
        this.tscreen = createFBO({gl: this.gl, width: 800, height: 600});
        this.bloom1 = createFBO({gl: this.gl, width: 800, height: 600, hdr: true});
        this.bloom2 = createFBO({gl: this.gl, width: 800, height: 600, hdr: true});
        this.ssao = createFBO({gl: this.gl, width: 800, height: 600});
    }

    generateSSAOUniforms() {
        // generate 4x4 noise texture
        const noiseData = [];
        for (let i = 0; i < 16; i++) {
            noiseData.push(random() * 2.0 - 1.0);
            noiseData.push(random() * 2.0 - 1.0);
            noiseData.push(0.0);
            noiseData.push(1.0);
        }

        this.noiseTexture = createTexture(gl, new Float32Array(noiseData), {
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
        
        // generate 32 sample points on a semisphere 
        // pointing to the positive z direction
        this.samples = [];
        for (let i = 0; i < 32; i++) {
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
            this.samples.push(sample);
        }
    }

    generateBuffers(entities, camera) {
        useFBO(this.gl, this.buffers);
        clear(this.gl);

        const uniforms = camera.getUniforms();

        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            const program = this.programs.get(entity.getProgram());
            const vao = entity.getVAO();
            draw(this.gl, program, vao, Object.assign({}, entity.getUniforms(), uniforms));
        }

        useFBO(this.gl, this.screen);
        clear(this.gl);
        draw(this.gl, this.programs.get('screen'), this.quad, {
            u_texture: this.buffers.colors[2]
        });
    }

    applyPostProcess(camera) {
        this.applySSAO(camera);
        this.applyFXAA();
    }

    applySSAO(camera) {
        const ssao = this.programs.get('ssao');
        const blurSSAO = this.programs.get('blur_ssao');
        const mergeSSAO = this.programs.get('merge_ssao');

        useFBO(this.gl, this.ssao);
        clear(this.gl);
        draw(this.gl, ssao, this.quad, {
            u_position: this.buffers.colors[0],
            u_normal: this.buffers.colors[1],
            u_color: this.buffers.colors[2],
            u_noise: this.noiseTexture,
            u_samples: this.samples,
            u_proj: camera.projection(),
            u_width: 800 + 0.001,
            u_height: 600 + 0.001
        });

        useFBO(this.gl, this.tscreen);
        clear(this.gl);
        draw(this.gl, blurSSAO, this.quad, {
            u_ssao_texture: this.ssao.colors[0]
        });

        useFBO(this.gl, this.screen);
        clear(this.gl);
        draw(this.gl, mergeSSAO, this.quad, {
            u_main_texture: this.buffers.colors[2],
            u_ssao_texture: this.tscreen.colors[0]
        });
    }

    applyBloom() {
        const screen = this.programs.get('screen');
        const extract = this.programs.get('extract_bloom');
        const bloom = this.programs.get('bloom');
        const mergeBloom = this.programs.get('merge_bloom');
        
        useFBO(this.gl, this.bloom1);
        clear(this.gl);
        draw(this.gl, extract, this.quad, {
            u_texture: this.buffers.colors[2]
        });

        const count = 5;
        const fbos = [this.bloom1, this.bloom2];
        let horizontal = 0;
        
        useFBO(this.gl, this.bloom2);
        clear(this.gl);
        draw(gl, bloom, this.quad, {
            u_texture: this.bloom1.colors[0],
            u_horizontal: 1
        });

        for (let i = 0; i < count * 2; i++) {
            const read = i % 2;
            const write = (i + 1) % 2;

            useFBO(this.gl, fbos[write]);
            clear(this.gl);
            draw(this.gl, bloom, this.quad, {
                u_texture: fbos[read].colors[0],
                u_horizontal: horizontal % 2
            });
            horizontal += 1;
        }
        
        useFBO(this.gl, this.tscreen);
        clear(this.gl);
        draw(this.gl, screen, this.quad, {
            u_texture: this.screen.colors[0],
        });

        useFBO(this.gl, this.screen);
        clear(this.gl);
        draw(this.gl, mergeBloom, this.quad, {
            u_main_texture: this.tscreen.colors[0],
            u_bloom_texture: this.bloom2.colors[0]
        });
    }

    applyFXAA() {
        const screen = this.programs.get('screen');
        const fxaa = this.programs.get('fxaa');

        useFBO(this.gl, this.tscreen);
        clear(this.gl);
        draw(this.gl, screen, this.quad, {
            u_texture: this.screen.colors[0]
        });

        useFBO(this.gl, this.screen);
        clear(this.gl);
        draw(this.gl, fxaa, this.quad, {
            u_colorTexture: this.tscreen.colors[0]
        });
    }

    renderToScreen() {
        useFBO(this.gl, null);
        clear(this.gl);
        const program = this.programs.get('screen');
        draw(this.gl, program, this.quad, {
            u_texture: this.screen.colors[0]
        });
    }

    draw(entities, camera) {
        this.generateBuffers(entities, camera);
        this.applyPostProcess(camera);
        this.renderToScreen();
    }
}


class Transform {
    constructor(x, y, z, h) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.h = h;
    }

    matrix() {
        const mat = glMatrix.mat4.identity([]);
        glMatrix.mat4.translate(mat, mat, [this.x, this.h / 2, this.z]);
        glMatrix.mat4.scale(mat, mat, [1.0, this.h, 1.0]);
        return mat;
    }
}

class Entity {
    constructor(vao, program, transform) {
        this.vao = vao;
        this.program = program;
        this.transform = transform;
    }

    getVAO() {
        return this.vao;
    }

    getProgram() {
        return this.program;
    }

    getUniforms() {
        return {
            u_model: this.transform.matrix()
        };
    }
}