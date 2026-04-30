import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { getDatabaseConfig } from './config/database.config.js';
import { loadEnv } from './config/load-env.js';
import { JobsModule } from './jobs/jobs.module.js';
import { AuthModule } from './auth.module.js';
import { User } from './user.entity.js';
import { Job } from './jobs/job.entity.js';

loadEnv();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...getDatabaseConfig(),
      entities: [Job, User],
    }),
    JobsModule,
    AuthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
