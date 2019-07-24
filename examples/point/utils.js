function loadSrc(path) {
    return fetch(path).then(r => r.text());
}

function loadImg() {}


function loop(cb) {
    return new Looper(cb);
}

const keyboard = (function() {
    const state = {};
    const mapk = {
        37: 'left',
        39: 'right',
        40: 'down',
        38: 'up',
        87: 'w',
        83: 's'
    };

    window.onkeydown = (e) => { state[mapk[e.keyCode]] = true; }
    window.onkeyup = (e) => { state[mapk[e.keyCode]] = false; }
    return state;
})();

const mouse = (function() {
    const state = {x: 0, y: 0};
    window.onmousemove = (e) => {
        state.x = e.pageX;
        state.y = e.pageY;
    };
    return state;
})();

class Looper {
    constructor(cb) {
        this.cb = cb;
        this.last = null;
        this._id = null;

        this.run = this.run.bind(this);
    }

    run(time) {
        this._id = requestAnimationFrame(this.run);
        this.last = this.last || time;
        const delta = (time - this.last) / 1000;
        this.last = time;
        this.cb(delta);
    }

    start() {
        requestAnimationFrame(this.run);
    }

    stop() {
        cancelAnimationFrame(this._id);
        this.last = null;
        this._id = null;
    }
}

class Entity {
    constructor({vao=null, program=null}) {
        this.vao = vao;
        this.program = program;
        this.uniforms = {};
    }

    getVAO() {
        return this.vao;
    }

    getProgram() {
        return this.program;
    }

    getUniforms() {
        return this.uniforms;
    }
}

class ShaderManager {
    constructor(gl) {
        this.gl = gl;
        this.shaders = {};
    }

    addVertFromPath(name, path) {
        return loadSrc(path).then(src => {
            this.addFromSrc(name, src, V_SHADER);
        });
    }

    addFragFromPath(name, path) {
        return loadSrc(path).then(src => {
            this.addFromSrc(name, src, F_SHADER);
        });
    }

    addFromSrc(name, src, type) {
        this.remove(name);
        this.shaders[name] = createShader(this.gl, src, type);
    }

    remove(name) {
        const shader = this.shaders[name];
        if (shader) {
            deleteShader(this.gl, shader);
            this.shaders[name] = undefined;
        }
    }
    get(name) {
        return this.shaders[name];
    }
}

class ProgramManager {
    constructor(gl, shaders) {
        this.gl = gl;
        this.shaders = shaders;
        this.programs = {};
    }

    add(name, vName, fName, uniforms=[], varyings=[]) {
        const vShader = this.shaders.get(vName);
        const fShader = this.shaders.get(fName);
        this.programs[name] = createProgram(this.gl, vShader, fShader, uniforms, varyings);
    }

    remove(name) {
        const program = this.programs[name];
        if (program) {
            deleteProgram(this.gl, program);
            this.program[name] = undefined;
        }
    }

    get(name) {
        return this.programs[name];
    }
}

class OrbitCamera {
    constructor(w, h) {
        this.r = 10;
        this.rx = Math.PI / 4;
        this.ry = Math.PI / 3;
        this.w = w;
        this.h = h;
        this.proj = glMatrix.mat4.perspective([], Math.PI / 3, w / h, 0.01, 1000);
    }

    update(delta) {
        if (keyboard.up) {
            this.r -= delta * 10;
        }

        if (keyboard.down) {
            this.r += delta * 10;
        }

        if (keyboard.right) {
            this.ry += Math.PI * delta;
        }

        if (keyboard.left)  {
            this.ry -= Math.PI * delta;
        }
    }

    getCoords() {
        const x = this.r * Math.sin(this.rx) * Math.sin(this.ry);
        const y = this.r * Math.cos(this.rx);
        const z = this.r * Math.sin(this.rx) * Math.cos(this.ry);
        return [x, y, z];
    }

    view() {
        
        return glMatrix.mat4.lookAt([], this.getCoords(), [0, 0, 0], [0, 1, 0]);
    }

    projection() {
        return this.proj;
    }
}

// class RenderNode {
//     constructor(renderer) {
//         this.renderer = renderer;
//         this.init();
//     }
    
//     draw(entities, camera) {}
// }

// class GBufferNode extends RenderNode {
//     init() {
//         this.fbo = createFBO({
//             gl: this.renderer.gl,
//             width: thiss.renderer.gl.canvas.width,
//             height: thiss.renderer.gl.canvas.height,
//             hrd: true,
//             count: 3
//         });
//     }

//     draw(entities, camera) {
//         clear(this.renderer.gl);
//         for (let i = 0; i < entities.length; i++) {
//             const entity = entities[i];
//             const vao = entity.getVAO();
//             const program = this.renderer.programs.get(entity.getProgram());
//             const itemUniforms = entity.getUniforms();
//             const uniforms = Object.assign({}, itemUniforms, {
//                 u_proj: camera.projection(),
//                 u_view: camera.view(),
//             });
//             draw(this.renderer.gl, program, vao, uniforms);
//         }
//     }
// }

// class SSAONode extends RenderNode {
//     init() {
//         this.fbo = createFBO({
//             gl: this.renderer.gl,
//             width: thiss.renderer.gl.canvas.width,
//             height: thiss.renderer.gl.canvas.height
//         });
//     }

//     draw(entities, camera) {
//         const program = this.renderer.programs.get('ssao');
//         draw(this.renderer.gl, program, {
//             u_gposition: this.renderer.gbuffer.colors[0],
//             u_proj: camera.projection()
//         });
//     }
// }

// class BlurNode extends RenderNode {
//     initFBO() {
//         this.fbo = createFBO({
//             gl: this.renderer.gl,
//             width: thiss.renderer.gl.canvas.width,
//             height: thiss.renderer.gl.canvas.height
//         });
//     }

//     draw(entities, camera) {
//         const program = this.renderer.programs.get('ssao');
//         draw(this.renderer.gl, program, {
//             u_texture: this.renderer.gbuffer.colors[0]
//         });
//     }
// }

class Renderer {
    constructor(gl, programs) {
        this.gl = gl;
        this.programs = programs;
    }

    draw(entities, camera) {
        clear(this.gl);
        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            const vao = entity.getVAO();
            const program = this.programs.get(entity.getProgram());
            const itemUniforms = entity.getUniforms();
            const uniforms = Object.assign({}, itemUniforms, {
                u_proj: camera.projection(),
                u_view: camera.view(),
            });
            draw(this.gl, program, vao, uniforms);
        }
    }
}