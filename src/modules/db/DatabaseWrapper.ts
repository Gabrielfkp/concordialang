import { DatabaseInterface } from './DatabaseInterface';
import { Database, DatabaseProperties } from '../ast/Database';
// import { DBWrapper } from 'node-dbi';
//import * as dbjs from 'database-js2';
//import { Connection, ConnectionObject } from 'database-js2';
import dbjs = require( 'database-js2' );
//var Connection = dbjs.Connection;
//var ConnectionObject = dbjs.ConnectionObject;

/**
 * A simple database wrapper.
 * 
 * @author Thiago Delgado Pinto
 */
export class DatabaseWrapper implements DatabaseInterface {

    private _dbi: dbjs.Connection = null; // internal database interface
    private _db: Database = null;


    /** @inheritDoc */
    public isConnected = async (): Promise< boolean > => {
        return !! this._dbi;
    };


    /** @inheritDoc */
    public connect = async ( db: Database ): Promise< boolean > => {
        this._db = db;       
        this._dbi = this.createConnectionFromNode( db ); // may throw an Error
        return true;
    };


    /** @inheritDoc */     
    public disconnect = async (): Promise< boolean > => {
        if ( ! this._dbi ) {
            throw this.dbiError();
        }
        return await this._dbi.close();
    };


    /** @inheritDoc */
    public reconnect = async (): Promise< boolean > => {
        if ( ! this._dbi ) {
            throw this.dbiError();
        }
        if ( await this.isConnected() ) {
            await this.disconnect();
        }
        return await this.connect( this._db );
    };


    /** @inheritDoc */    
    public exec = async ( cmd: string, params?: any[] ): Promise< any[] > => {
        return this._dbi.prepareStatement( cmd ).execute( ... params );
    };

    /** @inheritDoc */    
    public query = async ( cmd: string, params?: any[] ): Promise< any[] > => {
        return this._dbi.prepareStatement( cmd ).query( ... params );
    };
    
    //
    // private
    //

    /**
     * Returns a database connection from the given database node.
     * 
     * @param db Database node.
     */
    private createConnectionFromNode = ( db: Database ): dbjs.Connection => {

        let dbItems = {};

        if ( db.items ) {
            for ( let item of db.items ) {
                dbItems[ item.property ] = item.value;
            }
        }

        // Tries to use the database name as the path if the path was not given
        if ( ! dbItems[ DatabaseProperties.PATH ] ) {
            dbItems[ DatabaseProperties.PATH ] = db.name;
        }

        const driverType = this.databaseTypeToDriverType( dbItems[ DatabaseProperties.TYPE ] );

        return this.makeConnection( driverType, dbItems );
    };


    /**
     * Returns a database connection from the given parameters.
     * 
     * @param driverType Database driver type
     * @param dbItems Concordia's database configuration items.
     */
    private makeConnection = ( driverType: string, dbItems: object ): dbjs.Connection => {

        /*
        const driver = undefined; // not needed

        const connObj = new dbjs.ConnectionObject(
            driverType,
            dbItems[ DatabaseProperties.USERNAME ],
            dbItems[ DatabaseProperties.PASSWORD ],
            dbItems[ DatabaseProperties.HOST ],
            dbItems[ DatabaseProperties.PORT ],
            dbItems[ DatabaseProperties.PATH ],
            dbItems[ DatabaseProperties.OPTIONS ],
            driver
        );
        */

        const connObj = {
            driverName: driverType,
            username: dbItems[ DatabaseProperties.USERNAME ],
            password: dbItems[ DatabaseProperties.PASSWORD ],
            hostname: dbItems[ DatabaseProperties.HOST ],
            port: dbItems[ DatabaseProperties.PORT ],
            database: dbItems[ DatabaseProperties.PATH ],
            parameters: dbItems[ DatabaseProperties.OPTIONS ]
        };
        
        return new dbjs.Connection( connObj );
    };


    /**
     * Returns a driver type according to the given database type.
     * 
     * @param dbType 
     */
    private databaseTypeToDriverType = ( dbType: string ): string => {
        if ( ! dbType ) {
            return 'unknown';
        }
        const t = dbType.toLowerCase();
        switch ( t ) {
            case 'postgres': return 'postgresql';
            case 'ado': return 'adodb';
            case 'xls': return 'xlsx';
            default: return t;
        }
    };

    /**
     * Return an error about DBI is not instantied.
     */
    private dbiError = () => {
        return new Error( 'Internal database interface not instantied.' );
    };

}



// export class DatabaseWrapper implements DatabaseInterface {

//     private _dbi: DBWrapper = null; // internal database interface


//     /** @inheritDoc */
//     isConnected = (): Promise< boolean > => {
//         return new Promise( ( resolve, reject ) => {
//             if ( ! this._dbi ) {
//                 resolve( false ); // not connected yet
//                 return;
//             }            
//             try {
//                 resolve( this._dbi.isConnected() );
//             } catch ( e ) {
//                 reject( e );
//             }
//         } );
//     };


//     /** @inheritDoc */
//     connect = ( db: Database ): Promise< boolean > => {

//         return new Promise( ( resolve, reject ) => {
//             try {
//                 if ( ! this._dbi ) {
//                     this._dbi = this.createConnectionFromNode( db ); // may throw an Error
//                 } else {
//                     const msg = 'Already connected to "' + db.name + '". Please disconnect before opening a new connection.';
//                     return reject( new Error( msg ) );
//                 }
//                 this._dbi.connect( ( err ) => {
//                     if ( err ) {
//                         return reject( err );
//                     } else {
//                         return resolve( true );
//                     }
//                 });
//             } catch ( e ) {
//                 return reject( e );
//             }
//         } );        
//     };


//     /** @inheritDoc */     
//     disconnect = (): Promise< boolean > => {
//         return new Promise( ( resolve, reject ) => {
//             if ( ! this._dbi ) {
//                 return reject( this.dbiError() );
//             }
//             this._dbi.close( ( err ) => {
//                 if ( err ) {
//                     reject( err );
//                 } else {
//                     resolve( true );
//                 }
//             } );
//         } );         
//     };


//     /** @inheritDoc */
//     reconnect = (): Promise< boolean > => {
//         return new Promise( ( resolve, reject ) => {
//             if ( ! this._dbi ) {
//                 return reject( this.dbiError() );
//             }
//             this._dbi.connect( ( err ) => {
//                 if ( err ) {
//                     reject( err );
//                 } else {
//                     resolve( true );
//                 }
//             } );
//         } );         
//     };


//     /** @inheritDoc */    
//     exec = ( cmd: string, params?: any ): Promise< any[] > => {
//         return new Promise( ( resolve, reject ) => {
//             return reject( new Error( 'Not yet implemented' ) );
//         } );        
//     };

//     /** @inheritDoc */    
//     query = ( cmd: string, params?: any ): Promise< any[] > => {
//         return new Promise( ( resolve, reject ) => {
//             if ( ! this._dbi ) {
//                 return reject( this.dbiError() );
//             }
//             this._dbi.fetchAll( cmd, params, ( err, result ) => {
//                 if ( err ) {
//                     return reject( err );
//                 }
//                 return resolve( result );
//             } );
//         } );        
//     };
    

//     // private

//     private createConnectionFromNode = ( db: Database ): DBWrapper => {

//         let dbItems = {};

//         if ( db.items ) {
//             for ( let item of db.items ) {
//                 dbItems[ item.property ] = item.value;
//             }
//         }

//         // Tries to use the database name as the path if the path was not given
//         if ( ! dbItems[ DatabaseProperties.PATH ] ) {
//             dbItems[ DatabaseProperties.PATH ] = db.name;
//         }

//         const driverType = this.databaseTypeToDriverType( dbItems[ DatabaseProperties.TYPE ] );

//         return this.makeConnection( driverType, dbItems );
//     };


//     private makeConnection = ( driverType: string, dbItems: object ): DBWrapper => {

//         const connConfig = {
//             // documented in Node-DBI
//             host        : dbItems[ DatabaseProperties.HOST ],
//             database    : dbItems[ DatabaseProperties.PATH ],
//             user        : dbItems[ DatabaseProperties.USERNAME ],
//             password    : dbItems[ DatabaseProperties.PASSWORD ],

//             // supported???
//             port        : dbItems[ DatabaseProperties.PORT ],
//             charset     : dbItems[ DatabaseProperties.CHARSET ],
//             options     : dbItems[ DatabaseProperties.OPTIONS ]
//         };
        
//         return new DBWrapper( driverType, connConfig );
//     };


//     /**
//      * Returns a driver type according to the given database type.
//      * 
//      * @param dbType 
//      */
//     private databaseTypeToDriverType = ( dbType: string ): string => {
        
//         if ( ! dbType ) {
//             return 'unknown';
//         }

//         const dbt = dbType.toLowerCase();
//         if ( DBWrapper._availableAdapters.indexOf( dbt ) >= 0 ) {
//             return dbt;
//         }

//         switch( dbType.toLowerCase() ) {
//             case 'postgree'     : return 'pg';
//             case 'postgreesql'  : return 'pg';
//             case 'mysql'        : return 'mysql';
//             case 'sqlite'       : return 'sqlite3';
//             default             : return 'unknown';
//         }
//     };

//     /**
//      * Return an error about DBI is not instantied.
//      */
//     private dbiError = () => {
//         return new Error( 'Internal database interface not instantied.' );
//     };

// }