import db from "@/config/database.js";
import { PoolClient, QueryResult, QueryResultRow } from "pg";

export class TransactionManager {
  private client: PoolClient | null = null

  async begin(): Promise<void> {
    if(this.client){
      throw new Error('Transaction already started')
    }

    this.client = await db.pool.connect()

    try {
      await this.client.query('BEGIN')
    } catch (error) {
      this.client.release()
      this.client = null 
      throw error 
    }
  }

  async commit(): Promise<void>{
    if(!this.client){
      throw new Error("No active transaction");
    }

    try {
      await this.client.query('COMMIT')
    } finally {
      this.client.release();
      this.client = null 
    }
  }

  async rollback(): Promise<void>{
    if(!this.client){
      throw new Error('No active transaction')
    }

    try {
      await this.client.query('ROLLBACK')
    } finally {
      this.client.release()
      this.client = null
    }
  }

  async query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[]
  ): Promise<QueryResult<T>>{
    if(!this.client){
      throw new Error('No active transaction')
    }
    return this.client.query<T>(text, params)
  }

  async execute<T>(
    callback: (manager: TransactionManager) => Promise<T>
  ): Promise<T>{
    await this.begin()
    try {
      const result = await callback(this)
      await this.commit()
      return result
    } catch (error) {
      await this.rollback()
      throw error
    }
  }
}