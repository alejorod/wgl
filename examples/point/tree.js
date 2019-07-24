const meshes = {};

function init(gl) {
    const p0 = [-0.5, 0.0, -0.5];
    const p1 = [-0.5, 0.0,  0.5];
    const p2 = [ 0.5, 0.0,  0.5];
    const p3 = [ 0.5, 0.0, -0.5];
    const p4 = [ 0.0, 0.8,  0.0];
    const data = [];

    // base
    data.push(p0);
    data.push(p3);
    data.push(p2);

    data.push(p0);
    data.push(p2);
    data.push(p1);

    // sides
    data.push(p0);
    data.push(p1);
    data.push(p4);

    data.push(p1);
    data.push(p2);
    data.push(p4);

    data.push(p2);
    data.push(p3);
    data.push(p4);

    data.push(p3);
    data.push(p0);
    data.push(p4);

    meshes.tree1 = createVAO(gl, [
        createBuffer(gl, data)
    ]);

    const data2 = [];
    const levels = 3;
    const h = 1 / levels;

    for (let l = 0; l < levels; l++) {
        const w = 0.3 + 0.1 * (levels - l);
        const ho = 0.1 * l;
        const p0 = [-w, (l * h) / 2, -w];
        const p1 = [-w, (l * h) / 2,  w];
        const p2 = [ w, (l * h) / 2,  w];
        const p3 = [ w, (l * h) / 2, -w];
        const p4 = [0.0, 1.2 - 0.2 * (levels - l) - ho, 0.0];

        // base
        data2.push(p0);
        data2.push(p3);
        data2.push(p2);

        data2.push(p0);
        data2.push(p2);
        data2.push(p1);

        // sides
        data2.push(p0);
        data2.push(p1);
        data2.push(p4);

        data2.push(p1);
        data2.push(p2);
        data2.push(p4);

        data2.push(p2);
        data2.push(p3);
        data2.push(p4);

        data2.push(p3);
        data2.push(p0);
        data2.push(p4);
    }

    meshes.tree2 = createVAO(gl, [
        createBuffer(gl, data2)
    ]);
}

class Tree extends Entity {
    constructor(gl, x, y, z, attrs) {
        super(attrs);
        this.initVAO(gl);
        this.x = x;
        this.y = y; //- Math.random() * 0.3;
        this.z = z;

        this.rx = 0;//Math.random() * Math.PI / 24;
        this.rz = 0;//Math.random() * Math.PI / 24;
        this.ry = Math.random() * Math.PI;
    }

    static init(gl) {
        init(gl);
    }

    initVAO(gl) {
        this.vao = Math.random() > 0.6 ? meshes.tree2 : meshes.tree1;
    }

    getUniforms() {
        const model = glMatrix.mat4.fromTranslation([], [this.x, this.y, this.z])
        glMatrix.mat4.rotateZ(model, model, this.rz);
        glMatrix.mat4.rotateX(model, model, this.rx);
        glMatrix.mat4.rotateY(model, model, this.ry);
        glMatrix.mat4.scale(model, model, [0.6, 3.8, 0.6]);
        return {
            u_model: model,
            u_lights: 1,
            // u_color: [0.65, 0.95, 0.75, 1.0]
            u_color: [0.95, 0.95, 0.95, 1.0]
        };
    }
}