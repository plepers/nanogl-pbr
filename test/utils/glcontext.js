export function destroyContext(gl) {

    gl.canvas.width = 1;
    gl.canvas.height = 1;
    gl.canvas.remove();

    const ext = gl.getExtension('WEBGL_lose_context');

    if (ext) {
        ext.loseContext();
    }
}

export function createContext(ctx_attributes = {}, version = 1) {
    const opt_canvas = document.createElement("canvas");
    let name;
    switch (version) {
        case 2:
            name = "webgl2";
        default:
            name = "webgl";
    }
    const context = opt_canvas.getContext(name, ctx_attributes);
    if (!context) {
        throw ("Unable to fetch WebGL rendering context for Canvas");
    }
    return context;
}