import { Pool, QueryResult } from 'pg';
import dotenv from 'dotenv'
import { logger } from '@/utils/logger.js';

dotenv.config();

interface DatabaseConfig {
  user?: string | undefined;
  host?: string | undefined;
  password?: string | undefined;
  database?: string | undefined;
  port?: number | undefined;
  ssl?: boolean | undefined;
}

const poolConfig: DatabaseConfig = ({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
  ssl: false
});

const pool = new Pool(poolConfig);

pool.on('connect', ()=> {
  logger.info('Connected to PostgreSQL database')
})

pool.on('error', (err: Error)=>{
  logger.error('Error connecting to the database', err);
  process.exit(-1);
})

pool.query('SELECT NOW()', (err: Error, res:QueryResult)=> {
  if(err){
    logger.error('Error executing query', err);
  } else {
    logger.info("Fisrt connection test succeded", res.rows[0])
  }
})

export interface Database {
  query: (text: string, params?: any[]) => Promise<QueryResult>;
  pool: Pool;
}

const db: Database = {
  query: (text: string, params?: any[]) => pool.query(text, params),
  pool
}

export default db;