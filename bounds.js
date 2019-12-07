export default class Bounds {
    constructor() {
        this.min = new Float32Array(3);
        this.max = new Float32Array(3);
        this.center = new Float32Array(3);
        this.radius = new Float32Array(3);
    }
    fromMinMax(min, max) {
        this.min.set(min);
        this.max.set(max);
        this._updateSphere();
    }
    addMinMax(min, max) {
        for (var i = 0; i < 3; i++) {
            this.min[i] = Math.min(min[i], min[i]);
            this.max[i] = Math.max(max[i], max[i]);
        }
        this._updateSphere();
    }
    addBounds(b) {
        this.addMinMax(b.min, b.max);
    }
    _updateSphere() {
        this.center[0] = 0.5 * (this.min[0] + this.max[0]);
        this.center[1] = 0.5 * (this.min[1] + this.max[1]);
        this.center[2] = 0.5 * (this.min[2] + this.max[2]);
        this.radius[0] = this.max[0] - this.center[0];
        this.radius[1] = this.max[1] - this.center[1];
        this.radius[2] = this.max[2] - this.center[2];
    }
}
