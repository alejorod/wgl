function getContext(canvas, config={}) {
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
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function enableAlpha(gl) {
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.enable(gl.BLEND);
}

const V_SHADER = 0;
const F_SHADER = 1;

const M_POINTS = 0;
const M_TRIANGLES = 1;

const W_REPEAT          = 0;
const W_MIRRORED_REPEAT = 1;
const W_CLAMP_TO_EDGE   = 2;
const W_CLAMP_TO_BORDER = 3;
const F_NONE    = 0;
const F_LINEAR  = 1;
const F_NEAREST = 2;
const T_RGB  = 0;
const T_RGBA = 1;

const WRAP_MAP = {
    [W_REPEAT]: 'REPEAT',
    [W_MIRRORED_REPEAT]: 'MIRRORED_REPEAT',
    [W_CLAMP_TO_BORDER]: 'CLAMP_TO_BORDER',
    [W_CLAMP_TO_EDGE]: 'CLAMP_TO_EDGE'
};

const MIPMAP_MAP = {
    [F_NONE]: '',
    [F_LINEAR]: '_MIPMAP_LINEAR',
    [F_NEAREST]: '_MIPMAP_NEAREST'
};
const FILTER_MAP = {
    [F_LINEAR]: 'LINEAR',
    [F_NEAREST]: 'NEAREST'
};

function createTexture(gl, image, props) {
    const config = Object.assign({
        format: T_RGB,
        wrapS: W_REPEAT,
        wrapT: W_REPEAT,
        mipmaps: F_NONE,
        minFilter: F_LINEAR,
        maxFilter: F_LINEAR
    }, props);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const format = config.format == T_RGB ? gl.RGB : gl.RGBA;
    const wrapS = gl[WRAP_MAP[config.wrapS]];
    const wrapT = gl[WRAP_MAP[config.wrapT]];
    const minFilter = gl[`${FILTER_MAP[config.minFilter]}${MIPMAP_MAP[config.mipmaps]}`];
    const maxFilter = gl[FILTER_MAP[config.maxFilter]];

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, maxFilter);

    gl.texImage2D(gl.TEXTURE_2D, 0, format, format, gl.UNSIGNED_BYTE, image);

    if (config.mipmaps !== F_NONE) {
        gl.generateMipmap(gl.TEXTURE_2D);
    }

    return {
        id: texture
    };
}

function deleteTexture(gl, texture) {
    gl.deleteTexture(texture.id);
}

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

function createProgram(gl, vshader, fshader, uniforms=[], feedbacks=[], mode=null) {
    const program = gl.createProgram();
    gl.attachShader(program, vshader);
    gl.attachShader(program, fshader);

    if (feedbacks && feedbacks.length) {
        gl.transformFeedbackVaryings(program, feedbacks, gl.SEPARATE_ATTRIBS);
    }

    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return {
            id: program,
            locations: uniforms.reduce((p, c) => {
                p[c] = gl.getUniformLocation(program, c);
                return p;
            }, {}),
            mode: mode === M_POINTS ? gl.POINTS : gl.TRIANGLES
        };
    }
    
    console.log(gl.getProgramInfoLog(program));
    deleteProgram(gl, program);
}

function deleteProgram(gl, program) {
    gl.deleteProgram(program.id);
}

function createBuffer(gl, data) {
    const buffer = gl.createBuffer();
    const pdata = [];
    for (let i = 0; i < data.length; i++) {
        for (let idx = 0; idx < data[i].length; idx++) {
            pdata.push(data[i][idx]);
        }
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pdata), gl.STATIC_DRAW);
    return {
        id: buffer,
        elementSize: data[0].length * Float32Array.BYTES_PER_ELEMENT,
        elementLength: data[0].length,
        count: data.length,
    };
}

function updateBuffer(gl, buffer, idx, data) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.id);
    gl.bufferSubData(gl.ARRAY_BUFFER, idx * buffer.elementSize, new Float32Array(data));
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function deleteBuffer(gl, buffer) {
    gl.deleteBuffer(buffer.id);
}

function createVAO(gl, data, instanceData=[]) {
    const buffers = [];
    const ibuffers = [];
    const vao = gl.createVertexArray();
    let count = 0;
    gl.bindVertexArray(vao);
    data.forEach((d, i) => {
        buffers.push(createBuffer(gl, d));
        const vlength = d[0].length;
        gl.enableVertexAttribArray(i);
        gl.vertexAttribPointer(i, vlength, gl.FLOAT, false, 0, 0);
        count = d.length;
    });

    let ioffset = data.length;
    let icount = 0;
    instanceData.forEach((d, i) => {
        ibuffers.push(createBuffer(gl, d));
        const vlength = d[0].length;
        
        if (!icount || d.length < icount) {
            icount = d.length;
        }

        if (vlength == 16) {
            const vec4size = 4 * Float32Array.BYTES_PER_ELEMENT;
            const strideSize = 4 * vec4size;
            gl.enableVertexAttribArray(ioffset); 
            gl.vertexAttribPointer(ioffset, 4, gl.FLOAT, false, strideSize, 0);
            gl.vertexAttribDivisor(ioffset, 1);
            ioffset += 1;
            gl.enableVertexAttribArray(ioffset); 
            gl.vertexAttribPointer(ioffset, 4, gl.FLOAT, false, strideSize, vec4size);
            gl.vertexAttribDivisor(ioffset, 1);
            ioffset += 1;
            gl.enableVertexAttribArray(ioffset); 
            gl.vertexAttribPointer(ioffset, 4, gl.FLOAT, false, strideSize, 2 * vec4size);
            gl.vertexAttribDivisor(ioffset, 1);
            ioffset += 1;
            gl.enableVertexAttribArray(ioffset); 
            gl.vertexAttribPointer(ioffset, 4, gl.FLOAT, false, strideSize, 3 * vec4size);
            gl.vertexAttribDivisor(ioffset, 1);
            ioffset += 1;
        } else if (vlength == 9) {
            const vec3size = 3 * Float32Array.BYTES_PER_ELEMENT;
            const strideSize = 3 * vec3size;
            gl.enableVertexAttribArray(ioffset); 
            gl.vertexAttribPointer(ioffset, 3, gl.FLOAT, false, strideSize, 0);
            gl.vertexAttribDivisor(ioffset, 1);
            ioffset += 1;
            gl.enableVertexAttribArray(ioffset); 
            gl.vertexAttribPointer(ioffset, 3, gl.FLOAT, false, strideSize, vec3size);
            gl.vertexAttribDivisor(ioffset, 1);
            ioffset += 1;
            gl.enableVertexAttribArray(ioffset); 
            gl.vertexAttribPointer(ioffset, 3, gl.FLOAT, false, strideSize, 2 * vec3size);
            gl.vertexAttribDivisor(ioffset, 1);
            ioffset += 1;
        } else {
            gl.enableVertexAttribArray(ioffset);
            gl.vertexAttribPointer(ioffset, vlength, gl.FLOAT, false, 0, 0);
            gl.vertexAttribDivisor(ioffset, 1);
        }
    });

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);
    return {id: vao, buffers: buffers, ibuffers: ibuffers, count: count, maxInstances: icount};
}

function createVAOFromBuffers(gl, buffers, instanceBuffers=[]) {
    const vao = gl.createVertexArray();
    let count = 0;
    gl.bindVertexArray(vao);
    buffers.forEach((b, i) => {
        gl.bindBuffer(gl.ARRAY_BUFFER, b.id)
        gl.enableVertexAttribArray(i);
        gl.vertexAttribPointer(i, b.elementLength, gl.FLOAT, false, 0, 0);
        count = b.count;
    });

    let ioffset = buffers.length;
    let icount = 0;
    instanceBuffers.forEach(b => {
        gl.bindBuffer(gl.ARRAY_BUFFER, b.id);
        const vlength = b.elementLength;
        
        if (!icount || b.count < icount) {
            icount = b.count;
        }

        if (vlength == 16) {
            const vec4size = 4 * Float32Array.BYTES_PER_ELEMENT;
            const strideSize = 4 * vec4size;
            gl.enableVertexAttribArray(ioffset); 
            gl.vertexAttribPointer(ioffset, 4, gl.FLOAT, false, strideSize, 0);
            gl.vertexAttribDivisor(ioffset, 1);
            ioffset += 1;
            gl.enableVertexAttribArray(ioffset); 
            gl.vertexAttribPointer(ioffset, 4, gl.FLOAT, false, strideSize, vec4size);
            gl.vertexAttribDivisor(ioffset, 1);
            ioffset += 1;
            gl.enableVertexAttribArray(ioffset); 
            gl.vertexAttribPointer(ioffset, 4, gl.FLOAT, false, strideSize, 2 * vec4size);
            gl.vertexAttribDivisor(ioffset, 1);
            ioffset += 1;
            gl.enableVertexAttribArray(ioffset); 
            gl.vertexAttribPointer(ioffset, 4, gl.FLOAT, false, strideSize, 3 * vec4size);
            gl.vertexAttribDivisor(ioffset, 1);
            ioffset += 1;
        } else if (vlength == 9) {
            const vec3size = 3 * Float32Array.BYTES_PER_ELEMENT;
            const strideSize = 3 * vec3size;
            gl.enableVertexAttribArray(ioffset); 
            gl.vertexAttribPointer(ioffset, 3, gl.FLOAT, false, strideSize, 0);
            gl.vertexAttribDivisor(ioffset, 1);
            ioffset += 1;
            gl.enableVertexAttribArray(ioffset); 
            gl.vertexAttribPointer(ioffset, 3, gl.FLOAT, false, strideSize, vec3size);
            gl.vertexAttribDivisor(ioffset, 1);
            ioffset += 1;
            gl.enableVertexAttribArray(ioffset); 
            gl.vertexAttribPointer(ioffset, 3, gl.FLOAT, false, strideSize, 2 * vec3size);
            gl.vertexAttribDivisor(ioffset, 1);
            ioffset += 1;
        } else {
            gl.enableVertexAttribArray(ioffset);
            gl.vertexAttribPointer(ioffset, vlength, gl.FLOAT, false, 0, 0);
            gl.vertexAttribDivisor(ioffset, 1);
            ioffset += 1;
        }
    });

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);
    return {id: vao, buffers: buffers, ibuffers: instanceBuffers, count: count, maxInstances: icount};
}

function deleteVAO(gl, vao) {
    vao.buffers.forEach(b => deleteBuffer(gl, b));
    vao.ibuffers.forEach(b => deleteBuffer(gl, b));
    gl.deleteVertexArray(vao.id);
}

function setUniforms(gl, program, uniforms) {
    let unit = 0;
    Object.keys(program.locations).forEach(k => {
        const data = uniforms[k];
        const loc = program.locations[k];
        if (data != undefined) {
            if (data.id) {
                gl.activeTexture(gl.TEXTURE0 + unit);
                gl.bindTexture(gl.TEXTURE_2D, data.id);
                gl.uniform1i(loc, unit);
                unit += 1;
            } else if (data.length && data.length == 16) {
                gl.uniformMatrix4fv(loc, false, data);
            } else {
                gl.uniform1f(loc, data);
            }
        }
    });
}

function draw(gl, program, vao, uniforms, count=0) {
    gl.useProgram(program.id);
    setUniforms(gl, program, uniforms);
    gl.bindVertexArray(vao.id);

    if (vao.maxInstances && count) {
        gl.drawArraysInstanced(program.mode, 0, vao.count, Math.min(vao.maxInstances, count));
    } else {
        gl.drawArrays(program.mode, 0, vao.count);
    }
}

function drawFeedback(gl, program, vao, targets, uniforms) {
    gl.useProgram(program.id);
    setUniforms(gl, program, uniforms);
    gl.bindVertexArray(vao.id);
    targets.forEach((t, i) => {
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, i, t.id);
    });
    gl.beginTransformFeedback(program.mode);
    gl.drawArrays(program.mode, 0, vao.count);
    gl.endTransformFeedback();
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
}