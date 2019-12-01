import NGLProgram from 'nanogl/program';
class Program extends NGLProgram {
    constructor(gl, vert, frag, defs) {
        super(gl, vert, frag, defs);
        this._usage = 0;
        this._currentMaterial = null;
    }
    setupInputs(material) {
        var params = material.inputs._setups;
        var forceUpdate = true;
        for (var i = 0; i < params.length; i++) {
            if (params[i]._invalid || forceUpdate) {
                params[i].setup(this);
            }
        }
        this._currentMaterial = material;
    }
}
export default Program;
