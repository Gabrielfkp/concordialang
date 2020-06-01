"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function makePackageInstallCommand(pkgName) {
    return 'npm install --save-dev ' + pkgName + ' --no-fund --no-audit --loglevel error --color=always';
}
exports.makePackageInstallCommand = makePackageInstallCommand;
function makePackageUninstallCommand(pkgName) {
    return 'npm uninstall --save-dev ' + pkgName + ' --color=always';
}
exports.makePackageUninstallCommand = makePackageUninstallCommand;