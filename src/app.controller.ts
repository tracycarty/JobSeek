import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  redirectRoot(@Res() response: Response) {
    return response.redirect('/login.html');
  }

  @Get('ui/jobs/search')
  searchUiJobs(
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    if (!q?.trim()) {
      throw new BadRequestException("Query parameter 'q' is required");
    }

    return this.appService.listJobs(Number(page), Number(limit), q);
  }

  @Get('ui/jobs')
  listUiJobs(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.appService.listJobs(Number(page), Number(limit));
  }

  @Get('ui/jobs/:id')
  getUiJob(@Param('id') id: string) {
    const job = this.appService.getJob(Number(id));

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }
}
