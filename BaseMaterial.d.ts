import GLConfig from 'nanogl-state/config';
export default class BaseMaterial {
    name: string;
    mask: number;
    glconfig: GLConfig;
    _vertSrc: string;
    _fragSrc: string;
    _passMap: Map<string, BaseMaterial>;
    _passes: BaseMaterial[];
    constructor(name?: string);
    addPass(id: string, pass: BaseMaterial): void;
    removePass(id: string): void;
    getPass(id: string): BaseMaterial | undefined;
    hasPass(id: string): boolean;
    getAllPasses(): BaseMaterial[];
    addModifier(mod: any): void;
    getModifier(modid: string): any;
}
