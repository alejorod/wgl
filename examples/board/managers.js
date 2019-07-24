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