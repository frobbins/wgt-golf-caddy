import { Client } from 'pg';

export default class Database {
  private client: Client;

  constructor(private readonly connectionString: string) {}

  async connect() {
    this.client = new Client({
      connectionString: this.connectionString,
    });
    await this.client.connect();
  }

  async query(sql: string, params: any[] = []) {
    const { rows } = await this.client.query(sql, params);
    return rows;
  }

  async disconnect() {
    await this.client.end();
  }
}
