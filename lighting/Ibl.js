import IblBase from './IblBase';
export default class Ibl extends IblBase {
    constructor() {
        super(...arguments);
        this.iblType = 'OCTA';
    }
}
