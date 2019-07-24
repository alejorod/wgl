noise.seed(10);

class Terrain extends Entity {
    constructor(gl, attrs) {
        super(attrs);

        this.initVAO(gl);
    }

    noise(x, y) {
        let n = noise.simplex2(x / 20, y / 20);
        n = (n + 1) / 2;
        n = Math.pow(n, 2) * 3;
        return n;
    }

    initVAO(gl) {
        const limit = 50;
        const resolution = 25;
        const size = limit / resolution;
        const range = limit / 2;

        const data = [];

        let i = 0;
        for (let x = -range; x < range; x += size) {
            i += 1;
            for (let z = -range; z < range; z += size) {
                const n1 = this.noise(x, z);
                const n2 = this.noise(x, z + size);
                const n3 = this.noise(x + size, z + size);
                const n4 = this.noise(x + size, z);

                const p0 = [x, n1, z];
                const p1 = [x, n2, (z + size)];
                const p2 = [(x + size), n3, (z + size)];
                const p3 = [(x + size), n4, z];

                if (i % 2) {
                    data.push(p0);
                    data.push(p1);
                    data.push(p2);

                    data.push(p0);
                    data.push(p2);
                    data.push(p3);
                } else {
                    data.push(p3);
                    data.push(p0);
                    data.push(p1);

                    data.push(p3);
                    data.push(p1);
                    data.push(p2);
                }
                
                i += 1;
            }
        }

        this.vao = createVAO(gl, [
            createBuffer(gl, data)
        ]);
    }

    getUniforms() {
        return {
            u_model: glMatrix.mat4.identity([]),
            u_lights: 1,
            u_color: [0.95, 0.95, 0.95, 1.0]
        };
    }
}