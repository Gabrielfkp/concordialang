"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function toUnixPath(path) {
    return path.replace(/\\/g, '/');
}
exports.toUnixPath = toUnixPath;
function toWindowsPath(path) {
    return path.replace(/\//g, '\\\\');
}
exports.toWindowsPath = toWindowsPath;
