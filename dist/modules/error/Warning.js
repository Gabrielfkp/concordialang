"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LocatedException_1 = require("./LocatedException");
/**
 * Warning
 *
 * @author Thiago Delgado Pinto
 */
class Warning extends LocatedException_1.LocatedException {
    constructor() {
        super(...arguments);
        this.name = 'Warning';
    }
}
exports.Warning = Warning;
