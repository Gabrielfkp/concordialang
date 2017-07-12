import path = require( 'path' );
import fs = require( 'fs' );
import glob = require( 'glob' );

export class InputFileExtractor {

    private extensions: Array< string >; // extensions without dots

    constructor( extensions?: Array< string > ) {
        this.extensions = ( extensions ? extensions : [ 'feature' ] );
    }

    /**
     * Returns true if the given directory exists.
     * 
     * @param dir Directory to check.
     */
    directoryExists( dir: string ): boolean {
        return fs.existsSync( dir );
    }

    /**
     * Returns the non existent files.
     * 
     * @param files Files to be checked.
     */
    nonExistentFiles( files: Array< string > ): Array< string > {
        let invalid: Array< string > = [];
        for ( let i in files  ) {
            if ( ! fs.existsSync( files[ i ] ) ) {
                invalid.push( files[ i ] );
            }
        }
        return invalid;
    }

    /**
     * Extract files from a directory, filtered by the configured extensions.
     * 
     * @param dir Directory
     */
    extractFilesFromDirectory( dir: string ): Array< string > {
        let ext = 1 === this.extensions.length
            ? this.extensions[ 0 ]
            : '{' + this.extensions.join( ',' ) + '}';
        let filter = dir + '/**/*.' + ext;
        return glob.sync( filter );
    }

}