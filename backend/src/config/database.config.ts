import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { Job } from "../jobs/job.entity.js";

export function getDatabaseConfig(): TypeOrmModuleOptions {
  return {
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_DATABASE || "jobseek",
    entities: [Job],
    synchronize: process.env.DB_SYNCHRONIZE !== "false",
  };
}
