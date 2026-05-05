import {
  Controller,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import type { PaginationQuery } from './dto/pagination-query.dto.js';
import { Job } from './job.entity.js';
import { JobsService, type PaginatedJobs } from './jobs.service.js';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  findAll(
    @Query() query: PaginationQuery,
    @Headers('accept') accept = '',
    @Res({ passthrough: true }) response: Response,
  ): Promise<PaginatedJobs> | void {
    if (this.prefersHtml(accept)) {
      response.redirect('/applicants/jobs.html');
      return;
    }

    return this.jobsService.findAll(query);
  }

  @Get('search')
  search(
    @Query('q') q: string | undefined,
    @Query() query: PaginationQuery,
  ): Promise<PaginatedJobs> {
    if (!q || q.trim() === '') {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: "Query parameter 'q' is required",
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.jobsService.search(q, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Job> {
    const parsedId = Number(id);

    if (!Number.isInteger(parsedId) || parsedId < 1) {
      throw new NotFoundException('Job not found');
    }

    return this.jobsService.findOne(parsedId);
  }

  private prefersHtml(accept: string): boolean {
    return accept.includes('text/html') && !accept.includes('application/json');
  }
}
