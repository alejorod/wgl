class Cursor extends Entity {
    constructor(gl, camera, terrain, attrs) {
        super(attrs);
        this.camera = camera;
        this.terrain = terrain;
        this.x = 0;
        this.y = terrain.noise(0, 0);
        this.z = 0;

        this.initVAO(gl);
    }

    initVAO(gl) {
        const r = 1;
        const resolution = 20;
        const stepX = Math.PI / resolution;
        const stepY = (Math.PI * 2) / resolution;

        const data = [];
        for (let rx = 0; rx < Math.PI; rx += stepX) {
            for (let ry = 0; ry < Math.PI * 2; ry += stepY) {
                const p0x = r * Math.sin(rx) * Math.sin(ry);
                const p0y = r * Math.cos(rx);
                const p0z = r * Math.sin(rx) * Math.cos(ry);

                const p1x = r * Math.sin(rx) * Math.sin(ry + stepY);
                const p1y = r * Math.cos(rx);
                const p1z = r * Math.sin(rx) * Math.cos(ry + stepY);

                const p2x = r * Math.sin(rx + stepX) * Math.sin(ry + stepY);
                const p2y = r * Math.cos(rx + stepX);
                const p2z = r * Math.sin(rx + stepX) * Math.cos(ry + stepY);

                const p3x = r * Math.sin(rx + stepX) * Math.sin(ry);
                const p3y = r * Math.cos(rx + stepX);
                const p3z = r * Math.sin(rx + stepX) * Math.cos(ry);

                data.push([p0x, p0y, p0z]);
                data.push([p2x, p2y, p2z]);
                data.push([p1x, p1y, p1z]);
                

                data.push([p0x, p0y, p0z]);
                data.push([p3x, p3y, p3z]);
                data.push([p2x, p2y, p2z]);
                
            }
        }

        this.vao = createVAO(gl, [
            createBuffer(gl, data)
        ]);
    }

    getNormal(x, y, z) {
        const xOffset = [x + 0.2, this.terrain.noise(x + 0.2, z), z];
        const zOffset = [x, this.terrain.noise(x, z + 0.2), z + 0.2];

        const gradX = [xOffset[0] - x, xOffset[1] - y, xOffset[2] - z];
        const gradZ = [zOffset[0] - x, zOffset[1] - y, zOffset[2] - z];

        const normal = glMatrix.vec3.cross([], gradX, gradZ);
        glMatrix.vec3.normalize(normal, normal);

        return normal.map(v => -1 * v);
    }

    update() {
        const x = (2.0 * mouse.x) / this.camera.w - 1.0;
        const y = 1.0 - (2.0 * mouse.y) / this.camera.h;
        const iproj = glMatrix.mat4.invert([], this.camera.projection());
        const iview = glMatrix.mat4.invert([], this.camera.view());

        const ray = glMatrix.vec4.transformMat4([], [x, y, -1.0, 1.0], iproj);
        ray[2] = -1.0;
        ray[3] = 0.0;
        
        glMatrix.vec4.transformMat4(ray, ray, iview);
        glMatrix.vec4.normalize(ray, ray);

        let origin = this.camera.getCoords();
        let height = this.terrain.noise(origin[0], origin[1]);
        let steps = 0;

        while(origin[1] > height) {
            origin[0] += ray[0] / 10;
            origin[1] += ray[1] / 10;
            origin[2] += ray[2] / 10;
            height = this.terrain.noise(origin[0], origin[2]);
            steps += 1;
        }

        this.x = origin[0];
        this.y = height;
        this.z = origin[2];
    }

    getUniforms() {
        const normal = this.getNormal(this.x, this.y, this.z);
        const pos = [this.x, this.y, this.z];
        const target = [this.x + normal[0] * 2, this.y + normal[1] * 2, this.z + normal[2] * 2];

        const model = glMatrix.mat4.targetTo([], pos, target, [0, 1, 0]);
        glMatrix.mat4.scale(model, model, [0.3, 0.3, 0.3]);

        return {
            u_model: model,
            u_lights: 0,
            u_color: [0.5, 0.5, 0.95, 1.0]
        };
    }
}