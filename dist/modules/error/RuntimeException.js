"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuntimeException = void 0;
const LocatedException_1 = require("./LocatedException");
/**
 * Runtime exception
 *
 * @author Thiago Delgado Pinto
 */
class RuntimeException extends LocatedException_1.LocatedException {
    constructor() {
        super(...arguments);
        this.name = 'RuntimeError';
    }
}
exports.RuntimeException = RuntimeException;
