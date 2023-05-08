import { Pool, PoolClient } from "pg";
import * as fs from "fs";

export class DataStore {
  private static dbPool: Pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || "5432")
  });

  private static cache: Map<string, any> = new Map<string, any>;

  public static async getDbConnection(): Promise<PoolClient> {
    return await this.dbPool.connect();
  }

  public static read<T>(store: string): T {
    if (!DataStore.cache.has(store)) {
      try {
        const data = fs.readFileSync(`data/${store}.json`, `utf8`);
        this.cache.set(store, JSON.parse(data));
      } catch (e) {
        this.cache.set(store, {});
      }
    }

    return <T>this.cache.get(store);
  }

  public static update<T>(store: string, value: T) {
    this.cache.set(store, value);
  }

  public static write(store: string): boolean {
    if (!DataStore.cache.has(store)) {
      return false;
    }

    if (!fs.existsSync(`data/`)) {
      fs.mkdirSync(`data`);
    }

    try {
      fs.writeFileSync(`data/${store}.json`, JSON.stringify(this.cache.get(store)));
      return true;
    } catch (e) {
      return false;
    }
  }
}
