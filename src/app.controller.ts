import {
  BadRequestException,
  Controller,
  Get,
  Header,
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
  @Header('Content-Type', 'text/html')
  getRootPage(): string {
    return this.appService.getLoginPage();
  }

  @Get('login.html')
  @Header('Content-Type', 'text/html')
  getLoginPage(): string {
    return this.appService.getLoginPage();
  }

  @Get('register.html')
  @Header('Content-Type', 'text/html')
  getRegisterPage(): string {
    return this.appService.getRegisterPage();
  }

  @Get('index.html')
  getIndexRedirect(@Res() response: Response) {
    return response.redirect('/login.html');
  }

  @Get('job.html')
  @Header('Content-Type', 'text/html')
  getJobPage(): string {
    return this.appService.getJobPage();
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
