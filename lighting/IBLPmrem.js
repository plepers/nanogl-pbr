import IblBase from './IblBase';
export default class IblPmrem extends IblBase {
    constructor() {
        super(...arguments);
        this.iblType = 'PMREM';
    }
}
