import mysql, { Connection, ConnectionOptions } from 'mysql2';
 

export class MySQLDriver {
    private connection: Connection;
    constructor(private dbUrl: string) {
        const connectionOptions: ConnectionOptions = this.parseDbUrl(dbUrl);
        this.connection = mysql.createConnection(connectionOptions);
    }

    private parseDbUrl(dbUrl: string): ConnectionOptions {
        const urlObj = new URL(dbUrl);
        return {
            host: urlObj.hostname,
            port: parseInt(urlObj.port, 10),
            user: urlObj.username,
            password: urlObj.password,
            database: urlObj.pathname.replace(/^\//, '') // Remove leading slash
        };
    }



    async auth(pubKey: string): Promise<boolean> {
        const [idStr, key] = pubKey.split('.');
        if (!idStr || !key) return false;

        const id = parseInt(idStr, 10);
        if (isNaN(id)) return false;

        return new Promise((resolve, reject) => {
            this.connection.query(
                'SELECT 1 FROM bot WHERE id = ? AND public_key = ? LIMIT 1',
                [id, key],
                (err, results: any[]) => {
                    if (err) return reject(err);
                    resolve(results.length > 0);
                }
            );
        });
    }
}