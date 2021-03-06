import { resolve, join } from 'path';
import * as fs from 'fs';
import { promisify } from 'util';
import * as globalDirs from 'global-dirs';
import * as fwalker from 'fwalker';
import { PluginFinder } from "./PluginFinder";
import { PluginData, PLUGIN_PROPERTY, PLUGIN_PREFIX } from "./PluginData";
import { PackageToPluginData } from './PackageToPluginData';

/**
 * Finds plugins based on installed NodeJS packages.
 *
 * @author Thiago Delgado Pinto
 */
export class PackageBasedPluginFinder implements PluginFinder {

    public readonly NODE_MODULES: string = 'node_modules';
    public readonly PACKAGE_FILE: string = 'package.json';

    constructor(
        private readonly _processPath: string,
        private readonly _fs: any = fs
        ) {
    }


    /** @inheritdoc */
    public async find(): Promise< PluginData[] > {

        const localPackagesDir = resolve( this._processPath, this.NODE_MODULES );
        // console.log( ' Finding at', localPackagesDir, '...' );
        const localPluginData: PluginData[] = await this.findOnDir( localPackagesDir );

        const globalPackagesDir = globalDirs.npm.packages;
        // console.log( ' Finding at', globalPackagesDir, '...' );
        const globalPluginData: PluginData[] = await this.findOnDir( globalPackagesDir );

        // console.log( 'Local', localPluginData.length, 'found. Global', globalPluginData.length, 'found.' );

        // Removes local packages from the global ones
        const globalNotInLocal: PluginData[] = globalPluginData.filter(
            globalData => ! localPluginData.find( localData => localData.name == globalData.name ) );

        return localPluginData.concat( globalNotInLocal );
    }

    /** @inheritdoc */
    public async classFileFor( pluginData: PluginData ): Promise< string > {
        // The property pluginData.file is changed when the file is loaded,
        // so it have the full path.
        return pluginData.file;
    }

    /**
     * Finds Concordia plug-ins and returns their data.
     *
     * @param dir Directory to find.
     */
    private async findOnDir( dir: string ): Promise< PluginData[] > {

        let packageDirectories: string[] = [];
        try {
            packageDirectories = await this.detectPluginPackageDirectories( dir );
        } catch ( err ) {
            if ( 'ENOENT' === err.code ) {
                return [];
            }
        }
        // console.log( 'Detected directories to analyze:', packageDirectories );
        const conversor = new PackageToPluginData( PLUGIN_PROPERTY );

        const readFile = promisify( this._fs.readFile );

        let allPluginData: PluginData[] = [];
        for ( const pkgDir of packageDirectories ) {

            const pkgFile: string = join( pkgDir, this.PACKAGE_FILE );
            // console.log( 'Reading', pkgFile, '...' );

            let content: string;
            try {
                content = await readFile( pkgFile );
            } catch ( err ) {
                if ( 'ENOENT' === err.code ) {
                    continue; // Ignores a file that does not exist
                }
                throw new Error( `Cannot read plugin data from "${pkgFile}" because the file cannot be read. Details: ` + err.message );
            }
            const pkg: any = JSON.parse( content );

            // Ignores a package that does not have the expected property,
            // because it is not supposed to be a Concordia plugin.
            if ( ! pkg[ PLUGIN_PROPERTY ] ) {
                // console.log( 'Current plug-in does not have the property "' + PLUGIN_PROPERTY + '".' );
                continue;
            }

            const pluginData = conversor.convert( pkg );
            if ( ! pluginData ) {
                // continue; // Cannot convert to plugin data
                throw new Error( `Cannot convert package file "${pkgFile}" to plugin data. ` );
            }

            // Modifies the `file` property to contain the full path
            let file: string = pluginData.file;
            if ( ! file ) {
                throw new Error( `Package file "${pkgFile}" does not have a property "${PLUGIN_PROPERTY}.file".` );
            }
            if ( file.indexOf( pluginData.name ) < 0 ) {
                file = join( dir, pluginData.name, file );
            } else {
                file = join( dir, file );
            }
            pluginData.file = file;


            allPluginData.push( pluginData );
        }

        return allPluginData;
    }


    /**
     * Detects Concordia plug-ins' directories, i.e.,  starting with `concordialang-'.
     *
     * @param dir Directory to find.
     */
    private detectPluginPackageDirectories( dir: string ): Promise< string[] > {

        return new Promise< string[] >( ( resolve, reject ) => {

            let directories: string[] = [];
            const dirRegExp = new RegExp( PLUGIN_PREFIX );

            const onDir = ( path, stats, absPath ) => {
                // Ignore directories that do not match the prefix
                if ( ! dirRegExp.test( path ) ) {
                    return;
                }
                directories.push( absPath );
            };

            const options = {
                recursive: false,
                maxAttempts: 1,
                fs: this._fs
            };

            fwalker( dir, options )
                .on( 'dir', onDir )
                .on( 'error', ( err ) => reject( err ) )
                .on( 'done', () => resolve( directories ) )
                .walk();

        } );
    }

}