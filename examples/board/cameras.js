class OrbitCamera {
    constructor(w, h, r) {
        this.r = r || 10;
        this.rx = Math.PI / 4;
        this.ry = Math.PI / 4;
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

    getUniforms() {
        return {
            u_view: this.view(),
            u_proj: this.projection()
        };
    }
}