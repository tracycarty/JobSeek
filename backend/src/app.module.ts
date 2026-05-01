import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller.js";
import { getDatabaseConfig } from "./config/database.config.js";
import { loadEnv } from "./config/load-env.js";
import { JobsModule } from "./jobs/jobs.module.js";

loadEnv();

@Module({
  imports: [TypeOrmModule.forRoot(getDatabaseConfig()), JobsModule],
  controllers: [AppController],
})
export class AppModule {}
