import { Controller, Get, Header } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Header('Content-Type', 'text/html')
  getRootPage(): string {
    return this.appService.getJobsPage();
  }

  @Get('index.html')
  @Header('Content-Type', 'text/html')
  getJobsPage(): string {
    return this.appService.getJobsPage();
  }

  @Get('job.html')
  @Header('Content-Type', 'text/html')
  getJobPage(): string {
    return this.appService.getJobPage();
  }
}
