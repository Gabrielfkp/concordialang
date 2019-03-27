"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PackageToPluginData_1 = require("../../modules/plugin/PackageToPluginData");
describe('PackageToPluginData', () => {
    const property = 'concordiaPluginData';
    let p;
    beforeEach(() => {
        p = new PackageToPluginData_1.PackageToPluginData(property);
    });
    afterEach(() => {
        p = null;
    });
    it('converts author object with email', () => {
        const author = {
            name: 'Bob',
            email: 'bob@bobsite.com',
            url: 'www.bobsite.com'
        };
        const r = p.packageAuthorToString(author);
        expect(r).toEqual(author.name + ' <' + author.email + '>');
    });
    it('converts author object without email', () => {
        const author = {
            name: 'Bob',
            url: 'www.bobsite.com'
        };
        const r = p.packageAuthorToString(author);
        expect(r).toEqual(author.name);
    });
    it('converts author string', () => {
        const author = 'Bob <bob@bobsite.com>';
        const r = p.packageAuthorToString(author);
        expect(r).toEqual(author);
    });
    describe('convert', () => {
        it('returns undefined when package does not have the needed property', () => {
            let pkg = {};
            const r = p.convert(pkg);
            expect(r).toBeUndefined();
        });
        it('returns plugin data with the needed properties', () => {
            let pkg = {
                name: 'concordialang-fake'
            };
            pkg[property] = {
                isFake: true
            };
            const r = p.convert(pkg);
            expect(r).not.toBeUndefined();
            expect(r).toHaveProperty('name', 'concordialang-fake');
            expect(r).toHaveProperty('isFake', true);
        });
    });
});
