import Node from 'nanogl-node';
import LightType from './LightType';
export default class Light extends Node {
    constructor() {
        super();
    }
}
export function lightIsShadowMappedLight(light) {
    return light._type === LightType.DIRECTIONAL || light._type === LightType.SPOT;
}
