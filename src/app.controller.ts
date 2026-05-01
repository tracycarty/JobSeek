import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  Header,
  NotFoundException,
  Param,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Header('Content-Type', 'text/html')
  getRootPage(): string {
    return this.appService.getJobsPage();
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
  @Header('Content-Type', 'text/html')
  getJobsPage(): string {
    return this.appService.getJobsPage();
  }

  @Get('job.html')
  @Header('Content-Type', 'text/html')
  getJobPage(): string {
    return this.appService.getJobPage();
  }

  @Post('auth/register')
  register(@Body() body: { email?: string; password?: string }) {
    try {
      return this.appService.register(body.email ?? '', body.password ?? '');
    } catch (error) {
      this.throwHttpError(error);
    }
  }

  @Post('auth/login')
  login(@Body() body: { email?: string; password?: string }) {
    try {
      return this.appService.login(body.email ?? '', body.password ?? '');
    } catch (error) {
      this.throwHttpError(error);
    }
  }

  @Get('jobs/search')
  searchJobs(
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    if (!q?.trim()) {
      throw new BadRequestException("Query parameter 'q' is required");
    }

    return this.appService.listJobs(Number(page), Number(limit), q);
  }

  @Get('jobs')
  listJobs(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.appService.listJobs(Number(page), Number(limit));
  }

  @Get('jobs/:id')
  getJob(@Param('id') id: string) {
    const job = this.appService.getJob(Number(id));

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  private throwHttpError(error: unknown): never {
    if (error instanceof Error) {
      if (error.name === 'BadRequest') {
        throw new BadRequestException(error.message);
      }

      if (error.name === 'Conflict') {
        throw new ConflictException(error.message);
      }

      if (error.name === 'Unauthorized') {
        throw new UnauthorizedException(error.message);
      }
    }

    throw error;
  }
}
