function loadSrc(path) {
    return fetch(path).then(r => r.text());
}

function loadImg() {}


function loop(cb) {
    return new Looper(cb);
}

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

class Geometry {
    constructor() {
        this.vertices = [];
        this.faces = [];
        this.vao = null;
    }

    addVertex(v) {
        this.vertices.push(v);
        return this.vertices.length - 1;
    }

    addFace(f) {
        this.faces.push(f);
    }

    isEmpty() {
        return this.vertices.length == 0;
    }

    generateVAOData() {
        const bufferCount = this.vertices[0].length;
        const buffersData = new Array(bufferCount).fill(0).map(_ => []);

        for (let fi = 0; fi < this.faces.length; fi++) {
            const f = this.faces[fi];
            for (let v = 0; v < f.length; v++) {
                const vi = f[v];
                for (let i = 0; i < this.vertices[vi].length; i++) {
                    const vert = this.vertices[vi][i];
                    for (let xi = 0; xi < vert.length; xi++) {
                        buffersData[i].push(vert[xi]);
                    }
                }
            }
        }

        return buffersData;
    }

    generateVAO(gl) {
        const bufferCount = this.vertices[0].length;
        const buffersData = new Array(bufferCount).fill(0).map(_ => []);

        for (let fi = 0; fi < this.faces.length; fi++) {
            const f = this.faces[fi];
            for (let v = 0; v < f.length; v++) {
                const vi = f[v];
                for (let i = 0; i < this.vertices[vi].length; i++) {
                    const vert = this.vertices[vi][i];
                    for (let xi = 0; xi < vert.length; xi++) {
                        buffersData[i].push(vert[xi]);
                    }
                }
            }
        }

        const buffers = [];
        for (let i = 0; i < buffersData.length; i++) {
            buffers[i] = fastCreateBuffer(gl, buffersData[i], 3, buffersData[i].length / 3);
        }

        this.vao = createVAO(gl, buffers);
    }

    getVAO(gl) {
        if (!this.vao) {
            this.generateVAO(gl);
        }

        return this.vao;
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
        if (keyboard.w) {
            this.r -= delta * 30;
        }

        if (keyboard.s) {
            this.r += delta * 30;
        }

        if (keyboard.up) {
            this.rx -= Math.PI * delta;
        }

        if (keyboard.down) {
            this.rx += Math.PI * delta;
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