function getContext(canvas, config) {
    const gl = canvas.getContext('webgl2');
    const clear = config.clear || [0.0, 0.0, 0.0, 1.0];
    const viewport = config.viewport || [0, 0, canvas.width, canvas.height];
    updateClearColor(gl, clear[0], clear[1], clear[2], clear[3] || 0.0);
    updateViewPort(gl, viewport[0], viewport[1], viewport[2], viewport[3]);
    return gl;
}

function updateClearColor(gl, r, g, b, a) {
    gl.clearColor(r, g, b, a);
}

function updateViewPort(gl, left, top, right, bottom) {
    gl.viewport(left, top, right, bottom);
}
function clear(gl) {
    gl.clear(gl.COLOR_BUFFER_BIT);
}

const V_SHADER = 0;
const F_SHADER = 1;

function createTexture() {}
function deleteTexture(gl, texture) {}

function createShader(gl, src, type) {
    const stype = type == V_SHADER 
        ? gl.VERTEX_SHADER 
        : gl.FRAGMENT_SHADER;
    const shader = gl.createShader(stype);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }
    console.log(gl.getShaderInfoLog(shader));
    deleteShader(gl, shader);
}

function loadShader(gl, path, type) {
    return loadSrc(path).then(src => {
        return createShader(gl, src, type);
    });
}

function deleteShader(gl, shader) {
    gl.deleteShader(shader);
}

function createProgram(gl, vshader, fshader, uniforms) {
    const program = gl.createProgram();
    gl.attachShader(program, vshader);
    gl.attachShader(program, fshader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }
    
    console.log(gl.getProgramInfoLog(program));
    deleteProgram(gl, program);
}

function deleteProgram(gl, program) {
    gl.deleteProgram(program);
}

function createBuffer(gl, data) {
    const buffer = gl.createBuffer();
    const pdata = data.reduce((p, c) => {
        return p.concat(c);
    }, []);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pdata), gl.STATIC_DRAW);
    return buffer;
}

function deleteBuffer(gl, buffer) {
    gl.deleteBuffer(buffer);
}

function createVAO(gl, data) {
    const buffers = [];
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    data.forEach((d, i) => {
        buffers.push(createBuffer(gl, d));
        const vlength = d[0].length;
        gl.enableVertexAttribArray(i);
        gl.vertexAttribPointer(i, vlength, gl.FLOAT, false, 0, 0);
    });
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);
    return {id: vao, buffers: buffers};
}

function deleteVAO(gl, vao) {
    vao.buffers.forEach(b => deleteBuffer(gl, b));
    gl.deleteVertexArray(vao.id);
}

function setUniforms(gl, program, uniforms) {}

function draw(gl, program, vao, uniforms) {
    gl.useProgram(program);
    gl.bindVertexArray(vao.id);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}