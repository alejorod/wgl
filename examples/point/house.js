class House extends Entity {
    constructor(gl, x, y, z, attrs) {
        super(attrs);
        
        this.x = x;
        this.y = y;
        this.z = z;

        this.rx = 0;
        this.rz = 0;
        this.ry = (Math.PI / 6) * Math.random();

        this.initVAO(gl);

    }

    initVAO() {
        const data = [];

        const pb0 = [-0.5, 0.0, -0.6];
        const pb1 = [-0.5, 0.0,  0.6];
        const pb2 = [ 0.5, 0.0,  0.6];
        const pb3 = [ 0.5, 0.0, -0.6];

        const pt0 = [-0.5, 0.5, -0.6];
        const pt1 = [-0.5, 0.5,  0.6];
        const pt2 = [ 0.5, 0.5,  0.6];
        const pt3 = [ 0.5, 0.5, -0.6];
        
        const pc0 = [0.0, 0.7, -0.6];
        const pc1 = [0.0, 0.7,  0.6];

        // BASE
        data.push(pb0);
        data.push(pb2);
        data.push(pb1);

        data.push(pb0);
        data.push(pb3);
        data.push(pb2);

        // FRONT SQUARE
        data.push(pt1);
        data.push(pb1);
        data.push(pb2);

        data.push(pt1);
        data.push(pb2);
        data.push(pt2);

        // FRONT TRIANGLE
        data.push(pt1);
        data.push(pt2);
        data.push(pc1);
        
        // BACK SQUARE
        data.push(pt0);
        data.push(pb3);
        data.push(pb0);

        data.push(pt0);
        data.push(pt3)
        data.push(pb3);

        // BACK TRIANGLE
        data.push(pc0);
        data.push(pt3);
        data.push(pt0);

        // RIGHT SIDE SQUARE
        data.push(pt2);
        data.push(pb2);
        data.push(pb3);

        data.push(pt2);
        data.push(pb3);
        data.push(pt3);

        // RIGHT TOP SQUARE
        data.push(pc1);
        data.push(pt2);
        data.push(pt3);

        data.push(pc1);
        data.push(pt3);
        data.push(pc0);

        // LEFT SIDE SQUARE
        data.push(pt0);
        data.push(pb0);
        data.push(pb1);

        data.push(pt0);
        data.push(pb1);
        data.push(pt1);

        // LEFT TOP SQAURE
        data.push(pc0);
        data.push(pt0);
        data.push(pt1);

        data.push(pc0);
        data.push(pt1);
        data.push(pc1);


        this.vao = createVAO(gl, [
            createBuffer(gl, data)
        ]);
    }

    getUniforms() {
        const model = glMatrix.mat4.fromTranslation([], [this.x, this.y, this.z])
        glMatrix.mat4.rotateZ(model, model, this.rz);
        glMatrix.mat4.rotateX(model, model, this.rx);
        glMatrix.mat4.rotateY(model, model, this.ry);
        glMatrix.mat4.scale(model, model, [1.5, 2.0, 1.5]);
        return {
            u_model: model,
            u_lights: 1,
            u_color: [0.95, 0.95, 0.95, 1.0]
        };
    }
}