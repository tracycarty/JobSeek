import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { PaginationQuery } from './dto/pagination-query.dto.js';
import { CreateJobDto } from './dto/create-job.dto.js';
import { UpdateJobDto } from './dto/update-job.dto.js';
import { Job } from './job.entity.js';
import { JobsService, type PaginatedJobs } from './jobs.service.js';
import { JwtAuthGuard } from '../jwt-auth.guard.js';

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

  @UseGuards(JwtAuthGuard)
  @Get('employer')
  employerJobs(@Req() request: Request): Promise<Job[]> {
    const user = request.user as { userId: number; role: string } | undefined;
    return this.jobsService.findEmployerJobs(user?.userId ?? 0);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Req() request: Request,
    @Body() createJobDto: CreateJobDto,
  ): Promise<Job> {
    const user = request.user as { userId: number; role: string } | undefined;
    return this.jobsService.create(createJobDto, user?.userId ?? 0);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Req() request: Request,
    @Body() updateJobDto: UpdateJobDto,
  ): Promise<Job> {
    const parsedId = Number(id);

    if (!Number.isInteger(parsedId) || parsedId < 1) {
      throw new NotFoundException('Job not found');
    }

    const user = request.user as { userId: number; role: string } | undefined;
    return this.jobsService.update(parsedId, updateJobDto, user?.userId ?? 0);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() request: Request) {
    const parsedId = Number(id);

    if (!Number.isInteger(parsedId) || parsedId < 1) {
      throw new NotFoundException('Job not found');
    }

    const user = request.user as { userId: number; role: string } | undefined;
    return this.jobsService.remove(parsedId, user?.userId ?? 0);
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
