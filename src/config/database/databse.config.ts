export type DatabaseConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  schema: string;
  synchronize: boolean;
  dropSchema: boolean;
};
